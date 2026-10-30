import { dispatchApiRequest } from '../backend/dispatcher.js';

/**
 * VERCEL CATCH-ALL SERVERLESS MICROSYSTEM HANDLER
 * Menangkap seluruh sub-rute /api/* (misal: /api/stats, /api/auth/login, /api/katalog, dll.)
 */
export default async function handler(req, res) {
  return dispatchApiRequest(req, res);
}
