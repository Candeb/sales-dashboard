import { sigFetch } from '../client.js';
import { getSigApiEnv } from '../../config/sigEnv.js';

function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Devuelve fecha local de hoy en formato YYYY-MM-DD. */
export function getTodayYmdLocal() {
  return toYmd(new Date());
}

/**
 * GET ExportArticulosVendidos por rango de fechas.
 * @param {{ dde: string, hta: string }} params
 * @returns {Promise<unknown>}
 */
export async function fetchExportArticulosVendidosJson(params) {
  const q = new URLSearchParams();
  q.set('dde', params.dde);
  q.set('hta', params.hta);
  const path = `ExportArticulosVendidos?${q.toString()}`;
  const { baseUrl, useProxy } = getSigApiEnv();
  const directBase = (import.meta.env.VITE_SIG_API_BASE_URL ?? '').replace(/\/+$/, '');
  const realBase = useProxy && directBase ? directBase : baseUrl;
  console.log('[ExportArticulosVendidos] Consulta (app):', `${baseUrl}/${path}`);
  console.log('[ExportArticulosVendidos] Destino API real:', `${realBase}/${path}`);
  const res = await sigFetch(path);
  const ct = res.headers.get('content-type') ?? '';

  if (ct.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'ExportArticulosVendidos no devolvió un JSON reconocible. Tipo de contenido: ' +
        ct +
        '. Primeros caracteres: ' +
        text.slice(0, 120),
    );
  }
}
