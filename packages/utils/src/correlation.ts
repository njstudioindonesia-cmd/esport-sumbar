import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_HEADER = 'x-correlation-id';

export function generateCorrelationId(): string {
  return uuidv4();
}

export function getOrGenerateCorrelationId(existing?: string | string[]): string {
  if (typeof existing === 'string' && existing.trim().length > 0) {
    return existing;
  }
  if (Array.isArray(existing) && existing[0] && existing[0].trim().length > 0) {
    return existing[0];
  }
  return generateCorrelationId();
}
