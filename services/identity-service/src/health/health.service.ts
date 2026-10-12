import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(@Inject(ENV_CONFIG_TOKEN) private readonly config: EnvConfig) {}

  check() {
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      service: this.config.SERVICE_NAME,
      version: this.config.SERVICE_VERSION,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      memoryUsageMb: {
        rss: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
