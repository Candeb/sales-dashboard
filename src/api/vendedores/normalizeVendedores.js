/**
 * @typedef {Object} VendedorExport
 * @property {string} [id]
 * @property {string} [nombre]
 * @property {string} [desactivado] - "S" o "N"
 */

/**
 * Convierte la respuesta de ExportVendedores en un array.
 * Acepta array directo o envoltorios típicos.
 *
 * @param {unknown} raw
 * @returns {VendedorExport[]}
 */
export function normalizeVendedoresPayload(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return [];

  const obj = /** @type {Record<string, unknown>} */ (raw);
  const candidates = ['Vendedores', 'vendedores', 'Data', 'data', 'Items', 'items', 'Result', 'result'];
  for (const key of candidates) {
    const v = obj[key];
    if (Array.isArray(v)) return v;
  }

  return [];
}

function initialsFromName(name) {
  const clean = String(name ?? '').trim();
  if (!clean) return '??';
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join('').toUpperCase();
}

const PALETTE = [
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-amber-100 text-amber-900',
  'bg-emerald-100 text-emerald-800',
  'bg-rose-100 text-rose-800',
  'bg-indigo-100 text-indigo-800',
  'bg-cyan-100 text-cyan-800',
];

/**
 * Mapea vendedores activos para UI de lista.
 *
 * @param {VendedorExport[]} rows
 * @param {number} [limit]
 * @returns {{ id: string, name: string, initials: string, color: string }[]}
 */
export function mapVendedoresToUi(rows, limit = Number.POSITIVE_INFINITY) {
  const normalized = rows
    .filter((v) => String(v?.desactivado ?? '').toUpperCase() !== 'S')
    .filter((v) => typeof v?.nombre === 'string' && v.nombre.trim() !== '')
    .sort((a, b) => String(a?.id ?? '').localeCompare(String(b?.id ?? ''), 'es'))
    .map((v, i) => ({
      id: String(v.id ?? `vend-${i}`),
      name: String(v.nombre).trim(),
      initials: initialsFromName(v.nombre),
      color: PALETTE[i % PALETTE.length],
    }));

  return Number.isFinite(limit) ? normalized.slice(0, Math.max(0, limit)) : normalized;
}
