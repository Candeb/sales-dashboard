import { sigFetch } from '../client.js';

/**
 * GET ExportVendedores (sin filtros).
 * @returns {Promise<unknown>}
 */
export async function fetchExportVendedoresJson() {
  const res = await sigFetch('ExportVendedores');
  const ct = res.headers.get('content-type') ?? '';

  if (ct.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'ExportVendedores no devolvió un JSON reconocible. Tipo de contenido: ' +
        ct +
        '. Primeros caracteres: ' +
        text.slice(0, 120),
    );
  }
}
