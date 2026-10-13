/**
 * Observability, Prometheus Metrics, & OpenTelemetry Context Helpers
 */

export interface ServiceMetricsSnapshot {
  service: string;
  uptimeSeconds: number;
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  avgLatencyMs: number;
  activeSockets: number;
  timestamp: string;
}

export class ServiceMetricsCollector {
  private readonly startTime = Date.now();
  private totalRequests = 0;
  private successRequests = 0;
  private errorRequests = 0;
  private totalLatencyMs = 0;
  private activeSockets = 0;

  constructor(private readonly serviceName: string) {}

  recordRequest(latencyMs: number, statusCode: number): void {
    this.totalRequests++;
    this.totalLatencyMs += latencyMs;
    if (statusCode >= 400) {
      this.errorRequests++;
    } else {
      this.successRequests++;
    }
  }

  incrementActiveSockets(): void {
    this.activeSockets++;
  }

  decrementActiveSockets(): void {
    this.activeSockets = Math.max(0, this.activeSockets - 1);
  }

  getSnapshot(): ServiceMetricsSnapshot {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgLatencyMs =
      this.totalRequests > 0 ? Math.round((this.totalLatencyMs / this.totalRequests) * 100) / 100 : 0;

    return {
      service: this.serviceName,
      uptimeSeconds,
      totalRequests: this.totalRequests,
      successRequests: this.successRequests,
      errorRequests: this.errorRequests,
      avgLatencyMs,
      activeSockets: this.activeSockets,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Export in Prometheus exposition text format
   */
  toPrometheusString(): string {
    const snap = this.getSnapshot();
    const serviceTag = `{service="${snap.service}"}`;
    return [
      `# HELP esport_service_uptime_seconds Total service uptime in seconds`,
      `# TYPE esport_service_uptime_seconds gauge`,
      `esport_service_uptime_seconds${serviceTag} ${snap.uptimeSeconds}`,
      `# HELP esport_http_requests_total Total HTTP requests handled`,
      `# TYPE esport_http_requests_total counter`,
      `esport_http_requests_total${serviceTag} ${snap.totalRequests}`,
      `# HELP esport_http_errors_total Total HTTP error requests (status >= 400)`,
      `# TYPE esport_http_errors_total counter`,
      `esport_http_errors_total${serviceTag} ${snap.errorRequests}`,
      `# HELP esport_http_avg_latency_ms Average request latency in milliseconds`,
      `# TYPE esport_http_avg_latency_ms gauge`,
      `esport_http_avg_latency_ms${serviceTag} ${snap.avgLatencyMs}`,
      `# HELP esport_active_connections Current active SSE/WebSocket connections`,
      `# TYPE esport_active_connections gauge`,
      `esport_active_connections${serviceTag} ${snap.activeSockets}`,
    ].join('\n');
  }
}
