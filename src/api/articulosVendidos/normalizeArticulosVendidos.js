/**
 * Normaliza payload de ExportArticulosVendidos a array.
 * @param {unknown} raw
 * @returns {Array<Record<string, unknown>>}
 */
export function normalizeArticulosVendidosPayload(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return [];

  const obj = /** @type {Record<string, unknown>} */ (raw);
  const candidates = ['ArticulosVendidos', 'articulosVendidos', 'Data', 'data', 'Items', 'items'];
  for (const key of candidates) {
    const v = obj[key];
    if (Array.isArray(v)) return v;
  }
  return [];
}

const AMOUNT_KEYS = [
  'itemTotal',
  'itemImporte',
  'itemNeto',
  'itemSubtotal',
  'total',
  'Total',
  'importe',
  'Importe',
  'monto',
  'Monto',
  'subtotal',
  'SubTotal',
  'precioTotal',
  'PrecioTotal',
  'neto',
  'Neto',
];

function parseNumeric(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number.parseFloat(v.replace(',', '.').replace(/[^\d.-]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Extrae monto de una fila de artículo vendido.
 * @param {Record<string, unknown>} row
 */
export function pickArticuloVendidoAmount(row) {
  for (const k of AMOUNT_KEYS) {
    const n = parseNumeric(row[k]);
    if (n != null) return n;
  }

  // Fallback principal para ExportArticulosVendidos: itemCantidad * itemPrecioUnitario
  const qty = parseNumeric(row.itemCantidad ?? row.cantidad);
  const price = parseNumeric(
    row.itemPrecioUnitario ?? row.precioUnitario ?? row.precio ?? row.importeUnitario,
  );
  if (qty != null && price != null) {
    const line = qty * price;
    const discountPct = parseNumeric(row.itemDescuento);
    if (discountPct != null && discountPct >= -100 && discountPct <= 100) {
      return line * (1 - discountPct / 100);
    }
    return line;
  }

  return 0;
}

/**
 * Suma total de artículos vendidos.
 * @param {Array<Record<string, unknown>>} rows
 */
export function sumArticulosVendidosTotal(rows) {
  return rows.reduce((acc, r) => acc + pickArticuloVendidoAmount(r), 0);
}
