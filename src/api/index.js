/** Punto de entrada para llamadas a la API SIG (reexportaciones). */
export { sigFetch } from './client.js';
export { SigApiError } from './errors.js';
export {
  getMinRequestIntervalMs,
  getMsUntilNextRequestAllowed,
  recordApiRequestCompleted,
} from './requestSpacing.js';
export {
  fetchExportArticulosVendidosJson,
  getTodayYmdLocal,
} from './articulosVendidos/exportArticulosVendidos.js';
export {
  normalizeArticulosVendidosPayload,
  pickArticuloVendidoAmount,
  sumArticulosVendidosTotal,
} from './articulosVendidos/normalizeArticulosVendidos.js';
export { buildExportPedidosQuery, fetchExportPedidosJson } from './pedidos/exportPedidos.js';
export { normalizePedidosPayload, pickPedidoAmount, sumPedidosTotal } from './pedidos/normalizePedidos.js';
export { fetchExportVendedoresJson } from './vendedores/exportVendedores.js';
export { mapVendedoresToUi, normalizeVendedoresPayload } from './vendedores/normalizeVendedores.js';
