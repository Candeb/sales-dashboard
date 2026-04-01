/**
 * Caché local para ventas por categoría (línea) del día.
 */

function storageKey(dateYmd) {
  return `sig-dashboard:category-sales:v1:${dateYmd}`;
}

/**
 * @param {string} dateYmd
 * @returns {{ categories: { id: string, name: string, amount: number }[], updatedAt: number } | null}
 */
export function readCategorySalesCache(dateYmd) {
  try {
    const raw = localStorage.getItem(storageKey(dateYmd));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.categories)) return null;
    if (typeof data.updatedAt !== 'number' || !Number.isFinite(data.updatedAt)) return null;
    return { categories: data.categories, updatedAt: data.updatedAt };
  } catch {
    return null;
  }
}

/**
 * @param {string} dateYmd
 * @param {{ id: string, name: string, amount: number }[]} categories
 */
export function writeCategorySalesCache(dateYmd, categories) {
  try {
    localStorage.setItem(
      storageKey(dateYmd),
      JSON.stringify({
        categories,
        updatedAt: Date.now(),
      }),
    );
  } catch {
    /* cuota/localStorage no disponible */
  }
}
