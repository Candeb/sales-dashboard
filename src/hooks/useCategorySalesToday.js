import { useCallback, useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import {
  fetchExportArticulosVendidosJson,
  getTodayYmdLocal,
} from '../api/articulosVendidos/exportArticulosVendidos.js';
import {
  normalizeArticulosVendidosPayload,
  pickArticuloVendidoAmount,
} from '../api/articulosVendidos/normalizeArticulosVendidos.js';
import {
  getMsUntilNextRequestAllowed,
  recordApiRequestCompleted,
} from '../api/requestSpacing.js';
import { readCategorySalesCache, writeCategorySalesCache } from '../lib/categorySalesCache.js';

const REQUEST_SCOPE = 'category-sales-today';

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429).';
  }
  return e instanceof Error ? e.message : String(e);
}

function normalizeName(row) {
  function toSentenceCase(value) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    const lower = text.toLocaleLowerCase('es-AR');
    return lower.charAt(0).toLocaleUpperCase('es-AR') + lower.slice(1);
  }

  const line = String(row.itemLinea ?? '').trim();
  if (line) return toSentenceCase(line);
  const rubro = String(row.itemRubroDescripcion ?? '').trim();
  if (rubro) return toSentenceCase(rubro);
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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  void tick;
  const secondsUntilAllowed = Math.ceil(getMsUntilNextRequestAllowed(REQUEST_SCOPE) / 1000);

  const fetchAndPersist = useCallback(async () => {
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
    setCategories(grouped);
    setUpdatedAt(Date.now());
    writeCategorySalesCache(today, grouped);
  }, [today]);

  useEffect(() => {
    const cache = readCategorySalesCache(today);
    if (cache) {
      setCategories(cache.categories);
      setUpdatedAt(cache.updatedAt);
      setLoading(false);
      setError(null);
      return;
    }

    const wait = getMsUntilNextRequestAllowed(REQUEST_SCOPE);
    if (wait > 0) {
      setLoading(false);
      setError(`Esperá ${Math.ceil(wait / 1000)} segundos para consultar categorías.`);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await fetchAndPersist();
        if (!cancelled) {
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setCategories([]);
          setUpdatedAt(null);
          setError(errorMessage(e));
        }
      } finally {
        recordApiRequestCompleted(REQUEST_SCOPE);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [today, fetchAndPersist]);

  const refreshFromApi = useCallback(async () => {
    const wait = getMsUntilNextRequestAllowed(REQUEST_SCOPE);
    if (wait > 0) {
      const waitSeconds = Math.ceil(wait / 1000);
      setError(`Esperá ${waitSeconds} segundos para consultar categorías.`);
      return { ok: false, reason: 'cooldown', waitMs: wait };
    }

    setLoading(true);
    setError(null);

    try {
      await fetchAndPersist();
      return { ok: true };
    } catch (e) {
      setError(errorMessage(e));
      return { ok: false, reason: 'error' };
    } finally {
      recordApiRequestCompleted(REQUEST_SCOPE);
      setLoading(false);
    }
  }, [fetchAndPersist]);

  return { categories, updatedAt, loading, error, today, secondsUntilAllowed, refreshFromApi };
}
