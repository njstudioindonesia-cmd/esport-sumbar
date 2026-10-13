/**
 * Security & Data Sanitization Utilities (OWASP & UU PDP Compliant)
 */

export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers (onerror=, onclick=, etc)
    .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: pseudo-protocol
    .replace(/javascript\s*:/gi, '')
    // Remove data: URLs that might execute scripts
    .replace(/data\s*:\s*text\/html/gi, '')
    // Strip iframe, object, embed tags
    .replace(/<(?:iframe|object|embed|base)\b[^>]*\/?>/gi, '')
    .trim();
}

export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    return sanitizeText(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (typeof input === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(input)) {
      sanitized[key] = sanitizeObject(val);
    }
    return sanitized as T;
  }
  return input;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
  'apikey',
  'anthropic_api_key',
  'ktp',
  'nik',
]);

export function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);
  if (typeof data === 'object') {
    const masked: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        masked[key] = '***REDACTED***';
      } else if (typeof val === 'object') {
        masked[key] = maskSensitiveData(val);
      } else {
        masked[key] = val;
      }
    }
    return masked;
  }
  return data;
}

export interface AuditLogEntry {
  actorId: string;
  actorRole: 'USER' | 'ORGANIZER' | 'ADMIN' | 'SYSTEM';
  action: string;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  ipAddress?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class AuditLogger {
  constructor(private readonly serviceName: string) {}

  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      details: entry.details ? (maskSensitiveData(entry.details) as Record<string, unknown>) : undefined,
      timestamp: new Date().toISOString(),
    };

    console.info(
      JSON.stringify({
        type: 'SECURITY_AUDIT',
        service: this.serviceName,
        ...fullEntry,
      }),
    );
  }
}
