import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { validateEnv, EnvConfig } from './config/env.config';

@Module({
  imports: [HealthModule],
  providers: [
    {
      provide: 'ENV_CONFIG',
      useFactory: (): EnvConfig => validateEnv(process.env),
    },
  ],
  exports: ['ENV_CONFIG'],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
