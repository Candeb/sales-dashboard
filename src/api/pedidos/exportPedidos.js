import { sigFetch } from '../client.js';

/**
 * @typedef {Object} ExportPedidosParams
 * @property {string | number} [id] - Número de pedido
 * @property {string | number} [cta] - Id de cliente
 * @property {'pendientes' | 'todos' | 'anulados'} [estado]
 * @property {'S' | 'N'} [items] - Por defecto N
 * @property {string} [fecha] - Para anulados de un día distinto al actual
 */

/**
 * Construye query string sin valores vacíos.
 * @param {ExportPedidosParams} [params]
 */
export function buildExportPedidosQuery(params = {}) {
  const q = new URLSearchParams();
  if (params.id != null && params.id !== '') q.set('id', String(params.id));
  if (params.cta != null && params.cta !== '') q.set('cta', String(params.cta));
  if (params.estado) q.set('estado', params.estado);
  if (params.items) q.set('items', params.items);
  if (params.fecha) q.set('fecha', params.fecha);
  const s = q.toString();
  return s ? `?${s}` : '';
}

/**
 * GET ExportPedidos
 * @param {ExportPedidosParams} [params]
 * @returns {Promise<unknown>}
 */
export async function fetchExportPedidosJson(params = {}) {
  const qs = buildExportPedidosQuery(params);
  const res = await sigFetch(`ExportPedidos${qs}`);
  const ct = res.headers.get('content-type') ?? '';

  if (ct.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'ExportPedidos no devolvió un JSON reconocible. Tipo de contenido: ' +
        ct +
        '. Primeros caracteres: ' +
        text.slice(0, 120),
    );
  }
}
