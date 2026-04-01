import { useEffect, useState } from 'react';
import { SigApiError } from '../api/errors.js';
import { fetchExportVendedoresJson } from '../api/vendedores/exportVendedores.js';
import {
  mapVendedoresToUi,
  normalizeVendedoresPayload,
} from '../api/vendedores/normalizeVendedores.js';
import { recordApiRequestCompleted } from '../api/requestSpacing.js';
import { readVendedoresCache, writeVendedoresCache } from '../lib/vendedoresCache.js';

function errorMessage(e) {
  if (e instanceof SigApiError && e.status === 429) {
    return 'Demasiadas solicitudes (429).';
  }
  return e instanceof SigApiError ? e.message : e instanceof Error ? e.message : String(e);
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
        }
      } catch (e) {
        console.log('[ExportVendedores] Error al consultar API:', e);
        if (!cancelled) {
          setItems([]);
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
  }, []);

  return { items, updatedAt, loading, error };
}
