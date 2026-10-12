import { HealthService } from './health.service';
import { EnvConfig } from '../config/env.config';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return valid health status and metrics', () => {
    const mockConfig: EnvConfig = {
      NODE_ENV: 'test',
      PORT: 4000,
      SERVICE_NAME: 'test-service',
      SERVICE_VERSION: '1.0.0',
      CORS_ORIGIN: '*',
    };

    const result = service.check(mockConfig);

    expect(result.status).toBe('ok');
    expect(result.service).toBe('test-service');
    expect(result.version).toBe('1.0.0');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(result.memoryUsageMb.rss).toBeGreaterThan(0);
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
  });
});
