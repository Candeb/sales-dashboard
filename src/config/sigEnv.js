/**
 * Configuración de la API SIG leída desde variables de entorno (Vite).
 */
function trimSlash(s) {
  return s.replace(/\/+$/, '');
}

/**
 * @returns {{ baseUrl: string, token: string, useProxy: boolean, salesGoal: number | null }}
 */
export function getSigApiEnv() {
  const useProxy = import.meta.env.VITE_SIG_API_USE_PROXY === 'true';

  const baseUrl = useProxy
    ? trimSlash(`${globalThis.location.origin}/sigma-api`)
    : trimSlash(import.meta.env.VITE_SIG_API_BASE_URL ?? '');

  const token = import.meta.env.VITE_ERP_API_KEY ?? '';

  const goalRaw = import.meta.env.VITE_SALES_GOAL;
  const salesGoal = goalRaw != null && goalRaw !== '' ? Number(goalRaw) : null;

  return {
    baseUrl,
    token,
    useProxy,
    salesGoal: Number.isFinite(salesGoal) ? salesGoal : null,
  };
}

export function assertSigApiConfigured(env = getSigApiEnv()) {
  if (!env.baseUrl) {
    throw new Error(
      'Falta VITE_SIG_API_BASE_URL (o activá VITE_SIG_API_USE_PROXY=true con proxy en Vite).',
    );
  }
  if (!env.token) {
    throw new Error('Falta VITE_ERP_API_KEY para el header X-Auth-Token.');
  }
}
