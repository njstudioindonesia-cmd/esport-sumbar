import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness & readiness check for media-service' })
  check() {
    return {
      status: 'ok',
      service: 'media-service',
      timestamp: new Date().toISOString(),
    };
  }
}
