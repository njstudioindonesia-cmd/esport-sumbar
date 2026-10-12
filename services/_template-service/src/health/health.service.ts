import { Injectable } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  check(config: EnvConfig): HealthCheckResult {
    const memory = process.memoryUsage();
    return {
      status: 'ok',
      service: config.SERVICE_NAME,
      version: config.SERVICE_VERSION,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      memoryUsageMb: {
        rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
