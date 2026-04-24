import { useEffect, useMemo, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import {
  fetchExportArticulosVendidosJson,
  getTodayYmdLocal,
} from '../api/articulosVendidos/exportArticulosVendidos.js';
import {
  normalizeArticulosVendidosPayload,
  pickArticuloVendidoAmount,
} from '../api/articulosVendidos/normalizeArticulosVendidos.js';

const RETRY_429_MS = 15 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) return null;
  return e instanceof SigApiError ? e.message : e instanceof Error ? e.message : String(e);
}

export function useVendorDailySales(vendorId) {
  const today = getTodayYmdLocal();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(vendorId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendorId) {
      setItems([]);
      setLoading(false);
      setError('Vendedor no informado.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);

    (async () => {
      while (!cancelled) {
        try {
          const raw = await fetchExportArticulosVendidosJson({ dde: today, hta: today });
          const rows = normalizeArticulosVendidosPayload(raw);
          const filtered = rows.filter((row) => String(row?.vendedor ?? '').trim() === String(vendorId));
          const mapped = filtered
            .map((row, idx) => ({
              id: String(row?.id ?? `${vendorId}-${idx}`),
              articuloId: String(row?.itemArticuloId ?? ''),
              descripcion: String(row?.itemDescripcion ?? 'Sin descripción').trim(),
              cantidad: Number(row?.itemCantidad ?? 0) || 0,
              monto: Math.max(0, Math.abs(pickArticuloVendidoAmount(row))),
            }))
            .filter((row) => row.descripcion !== '');

          if (!cancelled) {
            setItems(mapped);
            setError(null);
            setLoading(false);
          }
          return;
        } catch (e) {
          if (cancelled) return;
          const err = errorMessage(e);
          if (err == null) {
            setLoading(true);
            setError(null);
            await sleep(RETRY_429_MS);
            continue;
          }
          setItems([]);
          setLoading(false);
          setError(err);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [vendorId, today]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalMonto += item.monto;
        acc.totalCantidad += item.cantidad;
        return acc;
      },
      { totalMonto: 0, totalCantidad: 0 },
    );
  }, [items]);

  return { today, items, loading, error, summary };
}
