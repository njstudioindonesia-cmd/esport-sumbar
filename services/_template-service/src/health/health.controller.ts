import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService, HealthCheckResult } from './health.service';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    @Inject(ENV_CONFIG_TOKEN) private readonly envConfig: EnvConfig,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness & readiness health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and running',
    schema: {
      example: {
        status: 'ok',
        service: 'template-service',
        version: '0.1.0',
        uptimeSeconds: 120,
        timestamp: '2026-10-13T03:30:00.000Z',
        memoryUsageMb: { rss: 42.1, heapTotal: 25.4, heapUsed: 18.2 },
      },
    },
  })
  check(): HealthCheckResult {
    return this.healthService.check(this.envConfig);
  }
}
