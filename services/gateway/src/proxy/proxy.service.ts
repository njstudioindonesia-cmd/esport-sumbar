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

  createServiceProxy(targetUrl: string, serviceName: string): RequestHandler {
    return createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: (_path, req: any) => {
        const url = req.originalUrl;
        if (url.startsWith('/api/public/')) {
          return url.replace(/^\/api\/public/, '');
        }
        if (url.startsWith('/api/admin/instagram')) {
          return url.replace(/^\/api\/admin/, '');
        }
        return url.replace(/^\/api/, '');
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          const correlationId = getOrGenerateCorrelationId(req.headers[CORRELATION_HEADER]);
          proxyReq.setHeader(CORRELATION_HEADER, correlationId);
          if (req.headers.authorization) {
            proxyReq.setHeader('authorization', req.headers.authorization);
          }
          if (req.headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
          }
          if (req.headers['x-user-role']) {
            proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
          }
          this.logger.debug(
            `Proxying ${req.method} ${req.originalUrl} -> ${targetUrl}${proxyReq.path}`,
            'ProxyService',
            undefined,
            correlationId,
          );
        },
        error: (err, req: any, res: any) => {
          const correlationId = (req as any).correlationId;
          this.logger.error(
            `Proxy error connecting to ${serviceName} at ${targetUrl}`,
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
                message: `Tidak dapat terhubung ke upstream ${serviceName}`,
              },
              correlationId,
              timestamp: new Date().toISOString(),
            });
          }
        },
      },
    });
  }

  createIdentityProxy(): RequestHandler {
    return this.createServiceProxy(this.config.IDENTITY_SERVICE_URL, 'Identity Service');
  }

  createNewsProxy(): RequestHandler {
    return this.createServiceProxy(this.config.NEWS_SERVICE_URL, 'News Service');
  }

  createAiProxy(): RequestHandler {
    return this.createServiceProxy(this.config.AI_SERVICE_URL, 'AI Service');
  }

  createIngestorProxy(): RequestHandler {
    return this.createServiceProxy(this.config.NEWS_INGESTOR_URL, 'News Ingestor');
  }

  createCommunityProxy(): RequestHandler {
    return this.createServiceProxy(this.config.COMMUNITY_SERVICE_URL, 'Community Service');
  }

  createEventProxy(): RequestHandler {
    return this.createServiceProxy(this.config.EVENT_SERVICE_URL, 'Event Service');
  }

  createMediaProxy(): RequestHandler {
    return this.createServiceProxy(this.config.MEDIA_SERVICE_URL, 'Media Service');
  }

  createBracketProxy(): RequestHandler {
    return this.createServiceProxy(this.config.BRACKET_SERVICE_URL, 'Bracket Service');
  }

  createNotificationProxy(): RequestHandler {
    return this.createServiceProxy(this.config.NOTIFICATION_SERVICE_URL, 'Notification Service');
  }
}

