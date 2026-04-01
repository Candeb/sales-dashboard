/**
 * @typedef {Object} PedidoExport
 * @property {number} [id]
 * @property {string} [fecha]
 * @property {number} [subtotal]
 * @property {number} [totalIva]
 * @property {number} [totalImpuestosInternos]
 * @property {number} [totaPedido] - Total del pedido (nombre tal cual en la API SIG)
 * @property {number} [totalPedido] - Por si en el futuro corrigen el nombre del campo
 * @property {string} [vendedor]
 * @property {string} [clienteNombre]
 * @property {string} [estado]
 */

/**
 * Normaliza la respuesta de ExportPedidos a un array de pedidos.
 */
export function normalizePedidosPayload(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return [];

  const candidates = ['Pedidos', 'pedidos', 'Data', 'data', 'Items', 'items', 'Result', 'result'];
  for (const key of candidates) {
    const v = raw[key];
    if (Array.isArray(v)) return v;
  }

  return [];
}

/** Orden: primero el total oficial del pedido en SIG, luego respaldo por si falta. */
const AMOUNT_KEYS = [
  'totaPedido',
  'totalPedido',
  'Total',
  'total',
  'Importe',
  'importe',
  'Monto',
  'monto',
  'ValorTotal',
  'valorTotal',
  'PrecioTotal',
  'precioTotal',
  'subtotal',
  'SubTotal',
];

/**
 * @param {PedidoExport | number | null | undefined} row
 */
export function pickPedidoAmount(row) {
  if (typeof row === 'number' && Number.isFinite(row)) return row;
  if (!row || typeof row !== 'object') return 0;

  for (const k of AMOUNT_KEYS) {
    const v = row[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number.parseFloat(v.replace(',', '.').replace(/[^\d.-]/g, ''));
      if (Number.isFinite(n)) return n;
    }
  }

  return 0;
}

/**
 * Suma `totaPedido` (u otro campo reconocido) de cada pedido.
 * @param {PedidoExport[]} pedidos
 */
export function sumPedidosTotal(pedidos) {
  return pedidos.reduce((acc, p) => acc + pickPedidoAmount(p), 0);
}
