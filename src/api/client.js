import { assertSigApiConfigured, getSigApiEnv } from '../config/sigEnv.js';
import { SigApiError } from './errors.js';

const JSON_ACCEPT = 'application/json, text/plain;q=0.9, */*;q=0.8';

/**
 * GET/POST genérico contra la API SIG (header X-Auth-Token).
 *
 * @param {string} path - Ej: "ExportPedidos" o "ExportPedidos?items=S"
 * @param {RequestInit} [init]
 */
export async function sigFetch(path, init = {}) {
  const env = getSigApiEnv();
  assertSigApiConfigured(env);

  const url = path.startsWith('http')
    ? path
    : `${env.baseUrl}/${path.replace(/^\//, '')}`;

  const headers = new Headers(init.headers);
  headers.set('X-Auth-Token', env.token);
  if (!headers.has('Accept')) {
    headers.set('Accept', JSON_ACCEPT);
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new SigApiError(`Error de API SIG: ${res.status} ${res.statusText}`, {
      status: res.status,
      url,
      body: body.slice(0, 2000),
    });
  }

  return res;
}
