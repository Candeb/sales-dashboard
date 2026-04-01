/**
 * Evita ráfagas de peticiones contra la API SIG (p. ej. error 429).
 * El intervalo mínimo cuenta desde que terminó la última petición.
 */
const LS_LAST_COMPLETED = 'sig-api:last-request-completed-at';

export function getMinRequestIntervalMs() {
  const raw = import.meta.env.VITE_SIG_API_MIN_INTERVAL_MS;
  const n = raw != null && raw !== '' ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

/** Milisegundos que faltan para poder iniciar otra petición (0 si ya se puede). */
export function getMsUntilNextRequestAllowed() {
  let last = 0;
  try {
    last = Number(localStorage.getItem(LS_LAST_COMPLETED));
  } catch {
    return 0;
  }
  if (!Number.isFinite(last) || last <= 0) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, getMinRequestIntervalMs() - elapsed);
}

/** Llamar al finalizar una petición (éxito o error): el servidor ya fue golpeado. */
export function recordApiRequestCompleted() {
  try {
    localStorage.setItem(LS_LAST_COMPLETED, String(Date.now()));
  } catch {
    /* modo privado / sin espacio */
  }
}
