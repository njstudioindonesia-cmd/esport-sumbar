import { db } from '../store/db.js';

/**
 * MICROSERVICES: PLATFORM TELEMETRY & HEALTH CHECK
 * Mengukur performa sistem, ketersediaan microservices, dan metrik pangkalan data.
 */
export const MicroStats = {
  name: "stats",

  async getPlatformTelemetry() {
    const stats = db.getPlatformStats();
    return {
      success: true,
      statusCode: 200,
      system: "ESPORT SUMBAR Platform Backend",
      architecture: "Modular Microsystem v2.4",
      status: "OPERATIONAL",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      metrics: stats,
      activeMicrosystems: [
        "micro_auth",
        "micro_registrasi",
        "micro_paspor",
        "micro_katalog",
        "micro_search",
        "micro_bursa",
        "micro_pengprov",
        "micro_pengcab",
        "micro_stats"
      ]
    };
  },

  async healthCheck() {
    return {
      status: "UP",
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      timestamp: new Date().toISOString()
    };
  }
};
