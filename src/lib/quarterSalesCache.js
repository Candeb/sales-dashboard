/**
 * Cache local para ventas trimestrales por año.
 */
function storageKey(year) {
  return `sig-dashboard:quarter-sales:v1:${year}`;
}

/**
 * @param {number} year
 * @returns {{ quarters: { id: string, label: string, amount: number }[], updatedAt: number } | null}
 */
export function readQuarterSalesCache(year) {
  try {
    const raw = localStorage.getItem(storageKey(year));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.quarters)) return null;
    if (typeof data.updatedAt !== 'number' || !Number.isFinite(data.updatedAt)) return null;
    return { quarters: data.quarters, updatedAt: data.updatedAt };
  } catch {
    return null;
  }
}

/**
 * @param {number} year
 * @param {{ id: string, label: string, amount: number }[]} quarters
 */
export function writeQuarterSalesCache(year, quarters) {
  try {
    localStorage.setItem(
      storageKey(year),
      JSON.stringify({
        quarters,
        updatedAt: Date.now(),
      }),
    );
  } catch {
    /* cuota/localStorage no disponible */
  }
}
