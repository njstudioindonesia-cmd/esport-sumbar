import { dispatchApiRequest } from '../backend/dispatcher.js';

/**
 * VERCEL SERVERLESS MICROSYSTEM ENTRYPOINT
 * Mengarahkan seluruh request /api/* ke Unified Microservices Dispatcher
 */
export default async function handler(req, res) {
  return dispatchApiRequest(req, res);
}
