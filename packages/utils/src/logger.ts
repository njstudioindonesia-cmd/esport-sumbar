export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  service: string;
  correlationId?: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class StructuredLogger {
  constructor(private readonly serviceName: string) {}

  private format(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
    correlationId?: string,
    err?: Error,
  ): string {
    const entry: LogEntry = {
      level,
      message,
      service: this.serviceName,
      correlationId,
      timestamp: new Date().toISOString(),
      context,
      data,
      error: err
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
          }
        : undefined,
    };
    return JSON.stringify(entry);
  }

  debug(message: string, context?: string, data?: unknown, correlationId?: string): void {
    if (process.env['NODE_ENV'] !== 'production') {
      console.debug(this.format('debug', message, context, data, correlationId));
    }
  }

  info(message: string, context?: string, data?: unknown, correlationId?: string): void {
    console.info(this.format('info', message, context, data, correlationId));
  }

  warn(message: string, context?: string, data?: unknown, correlationId?: string): void {
    console.warn(this.format('warn', message, context, data, correlationId));
  }

  error(message: string, err?: Error, context?: string, data?: unknown, correlationId?: string): void {
    console.error(this.format('error', message, context, data, correlationId, err));
  }
}
