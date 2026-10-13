import * as crypto from 'crypto';
import {
  sanitizeText,
  sanitizeObject,
  maskSensitiveData,
  AuditLogger,
  ServiceMetricsCollector,
} from '@esport-sumbar/utils';
import {
  createPortalGuardMiddleware,
  DecodedToken,
} from './middleware/portal-guard.middleware';

function createMockToken(payload: Partial<DecodedToken>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    sub: 'usr-test-123',
    email: 'test@esportsumbar.id',
    role: 'USER',
    nickname: 'TestUser',
    aud: 'public',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

describe('Security & Observability Utilities', () => {
  const testSecret = 'test_gateway_super_secret_jwt_key_12345';

  describe('sanitizeText & sanitizeObject', () => {
    it('strips script tags and inline event handlers to prevent XSS', () => {
      const malicious = '<script>alert("hacked")</script>Padang Slayers <img src=x onerror=alert(1)>';
      const clean = sanitizeText(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('onerror=');
      expect(clean).toContain('Padang Slayers');
    });

    it('strips javascript: pseudo-protocols', () => {
      const link = 'javascript:alert(document.cookie)';
      const clean = sanitizeText(link);
      expect(clean).not.toContain('javascript:');
    });

    it('recursively sanitizes complex objects', () => {
      const payload = {
        title: 'Turnamen <script>steal()</script>MLBB',
        nested: {
          description: 'Ayo join <iframe src="evil.com"></iframe> sekarang',
          tags: ['esport', '<b onclick=evil()>padang</b>'],
        },
      };

      const sanitized = sanitizeObject(payload);
      expect(sanitized.title).toBe('Turnamen MLBB');
      expect(sanitized.nested.description).not.toContain('<iframe');
      expect(sanitized.nested.tags[1]).not.toContain('onclick=');
    });
  });

  describe('maskSensitiveData', () => {
    it('redacts sensitive fields like passwords, tokens, API keys, and KTP', () => {
      const data = {
        userId: 'usr-123',
        password: 'mySuperSecretPassword123!',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        ktp: '1371012345670001',
        nickname: 'MinangSniper',
      };

      const masked = maskSensitiveData(data) as any;
      expect(masked.password).toBe('***REDACTED***');
      expect(masked.accessToken).toBe('***REDACTED***');
      expect(masked.ktp).toBe('***REDACTED***');
      expect(masked.nickname).toBe('MinangSniper');
    });
  });

  describe('AuditLogger & ServiceMetricsCollector', () => {
    it('creates and records security audit logs without errors', () => {
      const audit = new AuditLogger('identity-service');
      expect(() => {
        audit.log({
          actorId: 'admin-1',
          actorRole: 'ADMIN',
          action: 'VERIFY_ORGANIZER',
          resource: 'OrganizerProfile',
          resourceId: 'org-456',
          status: 'SUCCESS',
          details: { orgName: 'Minang Esports Hub' },
        });
      }).not.toThrow();
    });

    it('collects request metrics and formats them in Prometheus exposition format', () => {
      const metrics = new ServiceMetricsCollector('gateway');
      metrics.recordRequest(45, 200);
      metrics.recordRequest(65, 200);
      metrics.recordRequest(120, 500);
      metrics.incrementActiveSockets();

      const snapshot = metrics.getSnapshot();
      expect(snapshot.totalRequests).toBe(3);
      expect(snapshot.successRequests).toBe(2);
      expect(snapshot.errorRequests).toBe(1);
      expect(snapshot.activeSockets).toBe(1);

      const promStr = metrics.toPrometheusString();
      expect(promStr).toContain('esport_http_requests_total{service="gateway"} 3');
      expect(promStr).toContain('esport_http_errors_total{service="gateway"} 1');
      expect(promStr).toContain('esport_active_connections{service="gateway"} 1');
    });
  });

  describe('Gateway Portal Isolation Middleware', () => {
    const middleware = createPortalGuardMiddleware(testSecret);

    const createMockReqRes = (path: string, authHeader?: string) => {
      const req: any = {
        path,
        url: path,
        headers: authHeader ? { authorization: authHeader } : {},
      };
      let statusValue = 200;
      let jsonValue: any = null;
      const res: any = {
        status: (code: number) => {
          statusValue = code;
          return res;
        },
        json: (val: any) => {
          jsonValue = val;
          return res;
        },
      };
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      return { req, res, next, getStatus: () => statusValue, getJson: () => jsonValue, isNextCalled: () => nextCalled };
    };

    it('allows public route without auth token', () => {
      const { req, res, next, isNextCalled } = createMockReqRes('/api/public/events');
      middleware(req, res, next);
      expect(isNextCalled()).toBe(true);
    });

    it('rejects unauthenticated request to admin route with 401', () => {
      const { req, res, next, getStatus, getJson, isNextCalled } = createMockReqRes('/api/admin/news/review');
      middleware(req, res, next);
      expect(isNextCalled()).toBe(false);
      expect(getStatus()).toBe(401);
      expect(getJson().error.code).toBe('UNAUTHORIZED');
    });

    it('rejects normal user token from accessing admin portal with 403', () => {
      const token = createMockToken({ role: 'USER', aud: 'public' }, testSecret);
      const { req, res, next, getStatus, getJson, isNextCalled } = createMockReqRes(
        '/api/admin/news/review',
        `Bearer ${token}`,
      );
      middleware(req, res, next);
      expect(isNextCalled()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getJson().error.code).toBe('FORBIDDEN_PORTAL_ACCESS');
    });

    it('rejects admin user with public token from accessing admin portal with 403', () => {
      const token = createMockToken({ role: 'ADMIN', aud: 'public' }, testSecret);
      const { req, res, next, getStatus, getJson, isNextCalled } = createMockReqRes(
        '/api/admin/news/review',
        `Bearer ${token}`,
      );
      middleware(req, res, next);
      expect(isNextCalled()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getJson().error.code).toBe('INVALID_AUDIENCE');
    });

    it('allows valid admin token with admin audience to access admin portal', () => {
      const token = createMockToken({ role: 'ADMIN', aud: 'admin' }, testSecret);
      const { req, res, next, isNextCalled } = createMockReqRes(
        '/api/admin/news/review',
        `Bearer ${token}`,
      );
      middleware(req, res, next);
      expect(isNextCalled()).toBe(true);
      expect(req.headers['x-user-role']).toBe('ADMIN');
      expect(req.headers['x-portal-audience']).toBe('admin');
    });

    it('rejects regular user from accessing EO portal with 403', () => {
      const token = createMockToken({ role: 'USER', aud: 'public' }, testSecret);
      const { req, res, next, getStatus, getJson, isNextCalled } = createMockReqRes(
        '/api/eo/dashboard',
        `Bearer ${token}`,
      );
      middleware(req, res, next);
      expect(isNextCalled()).toBe(false);
      expect(getStatus()).toBe(403);
      expect(getJson().error.code).toBe('FORBIDDEN_PORTAL_ACCESS');
    });

    it('allows organizer with eo audience to access EO portal', () => {
      const token = createMockToken({ role: 'ORGANIZER', aud: 'eo' }, testSecret);
      const { req, res, next, isNextCalled } = createMockReqRes(
        '/api/eo/dashboard',
        `Bearer ${token}`,
      );
      middleware(req, res, next);
      expect(isNextCalled()).toBe(true);
      expect(req.headers['x-user-role']).toBe('ORGANIZER');
      expect(req.headers['x-portal-audience']).toBe('eo');
    });
  });
});
