import { useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import { fetchExportVendedoresJson } from '../api/vendedores/exportVendedores.js';
import {
  mapVendedoresToUi,
  normalizeVendedoresPayload,
} from '../api/vendedores/normalizeVendedores.js';
import { getMsUntilNextRequestAllowed, recordApiRequestCompleted } from '../api/requestSpacing.js';
import { readVendedoresCache, writeVendedoresCache } from '../lib/vendedoresCache.js';

const REQUEST_SCOPE = 'export-vendedores';
const RETRY_429_MS = 2 * 60 * 1000;

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429).';
  }
  return e instanceof SigApiError ? e.message : e instanceof Error ? e.message : String(e);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Carga vendedores una sola vez y persiste en localStorage.
 */
export function useExportVendedores() {
  const cached = readVendedoresCache();
  const [items, setItems] = useState(() => cached?.items ?? []);
  const [updatedAt, setUpdatedAt] = useState(() => cached?.updatedAt ?? null);
  const [loading, setLoading] = useState(() => cached == null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cache = readVendedoresCache();
    if (cache) {
      console.log('[ExportVendedores] Usando caché local:', cache);
      setItems(cache.items);
      setUpdatedAt(cache.updatedAt);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      while (!cancelled) {
        const waitBeforeTry = getMsUntilNextRequestAllowed(REQUEST_SCOPE);
        if (waitBeforeTry > 0) {
          await sleep(waitBeforeTry);
          if (cancelled) return;
        }

        try {
          const raw = await fetchExportVendedoresJson();
          const rows = normalizeVendedoresPayload(raw);
          const mapped = mapVendedoresToUi(rows);
          console.log('[ExportVendedores] Respuesta cruda:', raw);
          console.log('[ExportVendedores] Filas normalizadas:', rows);
          console.log('[ExportVendedores] Cantidad recibida:', rows.length);
          console.log('[ExportVendedores] Filas mapeadas para UI:', mapped);
          console.log('[ExportVendedores] Cantidad mostrada:', mapped.length);
          if (!cancelled) {
            setItems(mapped);
            setUpdatedAt(Date.now());
            writeVendedoresCache(mapped);
            setError(null);
            setLoading(false);
          }
          recordApiRequestCompleted(REQUEST_SCOPE);
          return;
        } catch (e) {
          console.log('[ExportVendedores] Error al consultar API:', e);
          recordApiRequestCompleted(REQUEST_SCOPE);
          if (cancelled) return;

          if (e instanceof SigApiError && e.status === 429) {
            // Mantener loader y reintentar más tarde sin mostrar error en pantalla.
            setItems([]);
            setUpdatedAt(null);
            setError(null);
            setLoading(true);
            await sleep(RETRY_429_MS);
            continue;
          }

          setItems([]);
          setUpdatedAt(null);
          setError(errorMessage(e));
          setLoading(false);
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, updatedAt, loading, error };
}
