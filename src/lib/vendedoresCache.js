/**
 * Caché local de vendedores para evitar nuevas consultas al recargar.
 */

const STORAGE_KEY = 'sig-dashboard:vendedores:v2';

/**
 * @returns {{ items: { id: string, name: string, initials: string, color: string }[], updatedAt: number } | null}
 */
export function readVendedoresCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.items)) return null;
    if (typeof data.updatedAt !== 'number' || !Number.isFinite(data.updatedAt)) return null;
    return { items: data.items, updatedAt: data.updatedAt };
  } catch {
    return null;
  }
}

/**
 * @param {{ id: string, name: string, initials: string, color: string }[]} items
 */
export function writeVendedoresCache(items) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items,
        updatedAt: Date.now(),
      }),
    );
  } catch {
    /* cuota o modo privado */
  }
}
