import { useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import {
  fetchExportArticulosVendidosJson,
  getTodayYmdLocal,
} from '../api/articulosVendidos/exportArticulosVendidos.js';
import {
  normalizeArticulosVendidosPayload,
  pickArticuloVendidoAmount,
} from '../api/articulosVendidos/normalizeArticulosVendidos.js';
import { recordApiRequestCompleted } from '../api/requestSpacing.js';
import { readCategorySalesCache, writeCategorySalesCache } from '../lib/categorySalesCache.js';

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429).';
  }
  return e instanceof Error ? e.message : String(e);
}

function normalizeName(row) {
  const line = String(row.itemLinea ?? '').trim();
  if (line) return line;
  const rubro = String(row.itemRubroDescripcion ?? '').trim();
  if (rubro) return rubro;
  return 'Sin categoría';
}

/**
 * Agrupa ventas del día por `itemLinea` usando montos reales (valor absoluto por ítem).
 */
export function useCategorySalesToday() {
  const today = getTodayYmdLocal();
  const cached = readCategorySalesCache(today);
  const [categories, setCategories] = useState(() => cached?.categories ?? []);
  const [updatedAt, setUpdatedAt] = useState(() => cached?.updatedAt ?? null);
  const [loading, setLoading] = useState(() => cached == null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cache = readCategorySalesCache(today);
    if (cache) {
      setCategories(cache.categories);
      setUpdatedAt(cache.updatedAt);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const raw = await fetchExportArticulosVendidosJson({ dde: today, hta: today });
        const rows = normalizeArticulosVendidosPayload(raw);
        /** @type {Map<string, { id: string, name: string, amount: number }>} */
        const map = new Map();

        for (const row of rows) {
          const name = normalizeName(row);
          // En esta API puede haber signos invertidos según tipo de comprobante.
          // Usamos valor absoluto para representar volumen vendido por línea.
          const amount = Math.abs(pickArticuloVendidoAmount(row));
          const key = name.toLowerCase();
          const prev = map.get(key);
          if (prev) {
            prev.amount += amount;
          } else {
            map.set(key, { id: key, name, amount });
          }
        }

        const grouped = [...map.values()].sort((a, b) => b.amount - a.amount);
        if (!cancelled) {
          setCategories(grouped);
          setUpdatedAt(Date.now());
          writeCategorySalesCache(today, grouped);
        }
      } catch (e) {
        if (!cancelled) {
          setCategories([]);
          setUpdatedAt(null);
          setError(errorMessage(e));
        }
      } finally {
        recordApiRequestCompleted();
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  return { categories, updatedAt, loading, error, today };
}
