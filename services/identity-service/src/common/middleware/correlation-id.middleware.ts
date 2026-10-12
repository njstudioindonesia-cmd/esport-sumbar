import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_HEADER, getOrGenerateCorrelationId } from '@esport-sumbar/utils';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = getOrGenerateCorrelationId(req.headers[CORRELATION_HEADER]);
    (req as any).correlationId = correlationId;
    res.setHeader(CORRELATION_HEADER, correlationId);
    next();
  }
}
