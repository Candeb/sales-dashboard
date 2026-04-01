/**
 * Persiste totales agregados de ventas para no volver a consultar al recargar la página.
 */

export function pedidosTotalStorageKey(paramsKey) {
  return `sig-dashboard:pedidos-total:v2:${paramsKey}`;
}

/**
 * @returns {{ total: number, rawCount: number | null, updatedAt: number } | null}
 */
export function readPedidosTotalCache(paramsKey) {
  try {
    const raw = localStorage.getItem(pedidosTotalStorageKey(paramsKey));
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (typeof o.total !== 'number' || !Number.isFinite(o.total)) return null;
    if (typeof o.updatedAt !== 'number' || !Number.isFinite(o.updatedAt)) return null;
    return {
      total: o.total,
      rawCount: typeof o.rawCount === 'number' && Number.isFinite(o.rawCount) ? o.rawCount : null,
      updatedAt: o.updatedAt,
    };
  } catch {
    return null;
  }
}

/**
 * @param {{ total: number, rawCount: number | null }} data
 */
export function writePedidosTotalCache(paramsKey, data) {
  try {
    localStorage.setItem(
      pedidosTotalStorageKey(paramsKey),
      JSON.stringify({
        total: data.total,
        rawCount: data.rawCount,
        updatedAt: Date.now(),
      }),
    );
  } catch {
    /* cuota o privado */
  }
}
