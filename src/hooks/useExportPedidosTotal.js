import { useCallback, useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import { fetchExportPedidosJson } from '../api/pedidos/exportPedidos.js';
import { normalizePedidosPayload, sumPedidosTotal } from '../api/pedidos/normalizePedidos.js';
import {
  getMsUntilNextRequestAllowed,
  recordApiRequestCompleted,
} from '../api/requestSpacing.js';
import { readPedidosTotalCache, writePedidosTotalCache } from '../lib/pedidosTotalCache.js';

function getTodayYmdLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429). Esperá unos minutos antes de volver a actualizar.';
  }
  return e instanceof SigApiError ? e.message : e instanceof Error ? e.message : String(e);
}

/**
 * Ventas del día (ExportPedidos?fecha=YYYY-MM-DD): primero usa caché local.
 * `refreshFromApi` respeta el intervalo mínimo entre peticiones (VITE_SIG_API_MIN_INTERVAL_MS).
 */
export function useExportPedidosTotal() {
  const today = getTodayYmdLocal();
  const paramsKey = `exportPedidos:${today}`;

  const [total, setTotal] = useState(null);
  const [rawCount, setRawCount] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(() => readPedidosTotalCache(paramsKey) == null);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  void tick;
  const secondsUntilAllowed = Math.ceil(getMsUntilNextRequestAllowed() / 1000);

  const fetchAndPersist = useCallback(async (pk) => {
    const date = pk.split(':')[1];
    const raw = await fetchExportPedidosJson({ fecha: date });
    const pedidos = normalizePedidosPayload(raw);
    const sum = sumPedidosTotal(pedidos);
    const count = pedidos.length;
    const at = Date.now();
    setTotal(sum);
    setRawCount(count);
    setUpdatedAt(at);
    writePedidosTotalCache(pk, { total: sum, rawCount: count });
  }, []);

  useEffect(() => {
    const cached = readPedidosTotalCache(paramsKey);
    if (cached) {
      setTotal(cached.total);
      setRawCount(cached.rawCount);
      setUpdatedAt(cached.updatedAt);
      setLoading(false);
      setError(null);
      return;
    }

    setTotal(null);
    setRawCount(null);
    setUpdatedAt(null);
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await fetchAndPersist(paramsKey);
      } catch (e) {
        if (!cancelled) {
          setError(errorMessage(e));
          setTotal(null);
          setRawCount(null);
          setUpdatedAt(null);
        }
      } finally {
        recordApiRequestCompleted();
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paramsKey, fetchAndPersist]);

  const refreshFromApi = useCallback(async () => {
    const wait = getMsUntilNextRequestAllowed();
    if (wait > 0) {
      return { ok: false, reason: 'cooldown', waitMs: wait };
    }

    setLoading(true);
    setError(null);

    try {
      await fetchAndPersist(paramsKey);
      return { ok: true };
    } catch (e) {
      setError(errorMessage(e));
      return { ok: false, reason: 'error' };
    } finally {
      recordApiRequestCompleted();
      setLoading(false);
    }
  }, [paramsKey, fetchAndPersist]);

  return {
    total,
    rawCount,
    today,
    updatedAt,
    loading,
    error,
    secondsUntilAllowed,
    refreshFromApi,
    retry: refreshFromApi,
  };
}
