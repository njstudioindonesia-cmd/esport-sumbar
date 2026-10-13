import {
  sanitizeText,
  sanitizeObject,
  maskSensitiveData,
  AuditLogger,
  ServiceMetricsCollector,
} from '@esport-sumbar/utils';

describe('Security & Observability Utilities', () => {
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
});
