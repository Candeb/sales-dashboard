import { useCallback, useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import { fetchExportPedidosJson } from '../api/pedidos/exportPedidos.js';
import { normalizePedidosPayload, sumPedidosTotal } from '../api/pedidos/normalizePedidos.js';
import { getMsUntilNextRequestAllowed, recordApiRequestCompleted } from '../api/requestSpacing.js';
import { readQuarterSalesCache, writeQuarterSalesCache } from '../lib/quarterSalesCache.js';

const REQUEST_SCOPE = 'sales-by-quarter';
const QUARTER_REQUEST_SPACING_MS = 2 * 60 * 1000; // 2 minutos entre trimestres

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuarterRanges(year) {
  return [
    { id: 'q1', label: `T1 ${year}`, dde: `${year}-01-01`, hta: `${year}-03-31` },
    { id: 'q2', label: `T2 ${year}`, dde: `${year}-04-01`, hta: `${year}-06-30` },
    { id: 'q3', label: `T3 ${year}`, dde: `${year}-07-01`, hta: `${year}-09-30` },
    { id: 'q4', label: `T4 ${year}`, dde: `${year}-10-01`, hta: `${year}-12-31` },
  ];
}

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429). Esperá antes de reintentar.';
  }
  return e instanceof SigApiError ? e.message : e instanceof Error ? e.message : String(e);
}

export function useQuarterSales() {
  const year = new Date().getFullYear();
  const cached = readQuarterSalesCache(year);
  const [quarters, setQuarters] = useState(() => cached?.quarters ?? []);
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
    const ranges = buildQuarterRanges(year);
    const items = [];

    for (const q of ranges) {
      const raw = await fetchExportPedidosJson({ dde: q.dde, hta: q.hta });
      const rows = normalizePedidosPayload(raw);
      const amount = sumPedidosTotal(rows);
      items.push({ id: q.id, label: q.label, amount: Math.max(0, amount) });
      if (q.id !== 'q4') {
        await sleep(QUARTER_REQUEST_SPACING_MS);
      }
    }

    setQuarters(items);
    setUpdatedAt(Date.now());
    writeQuarterSalesCache(year, items);
  }, [year]);

  useEffect(() => {
    const cache = readQuarterSalesCache(year);
    if (cache) {
      setQuarters(cache.quarters);
      setUpdatedAt(cache.updatedAt);
      setLoading(false);
      setError(null);
      return;
    }

    const wait = getMsUntilNextRequestAllowed(REQUEST_SCOPE);
    if (wait > 0) {
      setLoading(false);
      setError(`Esperá ${Math.ceil(wait / 1000)} segundos para consultar trimestres.`);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await fetchAndPersist();
      } catch (e) {
        if (!cancelled) {
          setQuarters([]);
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
  }, [year, fetchAndPersist]);

  const refreshFromApi = useCallback(async () => {
    const wait = getMsUntilNextRequestAllowed(REQUEST_SCOPE);
    if (wait > 0) {
      const waitSeconds = Math.ceil(wait / 1000);
      setError(`Esperá ${waitSeconds} segundos para consultar trimestres.`);
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

  return { year, quarters, updatedAt, loading, error, secondsUntilAllowed, refreshFromApi };
}
