import { Injectable, Inject } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestHandler } from 'express';
import { EnvConfig } from '../config/env.config';
import { ENV_CONFIG_TOKEN } from '../config/config.module';
import { CORRELATION_HEADER, getOrGenerateCorrelationId, StructuredLogger } from '@esport-sumbar/utils';

@Injectable()
export class ProxyService {
  private readonly logger = new StructuredLogger('gateway-proxy');

  constructor(@Inject(ENV_CONFIG_TOKEN) private readonly config: EnvConfig) {}

  createIdentityProxy(): RequestHandler {
    return createProxyMiddleware({
      target: this.config.IDENTITY_SERVICE_URL,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req: any) => {
          const correlationId = getOrGenerateCorrelationId(req.headers[CORRELATION_HEADER]);
          proxyReq.setHeader(CORRELATION_HEADER, correlationId);
          if (req.headers.authorization) {
            proxyReq.setHeader('authorization', req.headers.authorization);
          }
          this.logger.debug(
            `Proxying ${req.method} ${req.originalUrl} -> ${this.config.IDENTITY_SERVICE_URL}${proxyReq.path}`,
            'ProxyService',
            undefined,
            correlationId,
          );
        },
        error: (err, req: any, res: any) => {
          const correlationId = (req as any).correlationId;
          this.logger.error(
            `Proxy error connecting to Identity Service at ${this.config.IDENTITY_SERVICE_URL}`,
            err as Error,
            'ProxyService',
            undefined,
            correlationId,
          );
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              error: {
                code: 'BAD_GATEWAY',
                message: 'Tidak dapat terhubung ke upstream Identity Service',
              },
              correlationId,
              timestamp: new Date().toISOString(),
            });
          }
        },
      },
    });
  }
}
