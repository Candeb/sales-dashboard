export class SigApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, url?: string, body?: string }} [detail]
   */
  constructor(message, detail = {}) {
    super(message);
    this.name = 'SigApiError';
    this.status = detail.status;
    this.url = detail.url;
    this.body = detail.body;
  }
}
