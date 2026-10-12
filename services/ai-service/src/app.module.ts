import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_HEADER, getOrGenerateCorrelationId } from '@esport-sumbar/utils';

@Module({
  imports: [ConfigModule, HealthModule, AiModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const correlationId = getOrGenerateCorrelationId(req.headers[CORRELATION_HEADER]);
        (req as any).correlationId = correlationId;
        res.setHeader(CORRELATION_HEADER, correlationId);
        next();
      })
      .forRoutes('*');
  }
}
