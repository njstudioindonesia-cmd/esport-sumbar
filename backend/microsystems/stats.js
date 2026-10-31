import { db } from '../store/db.js';

/**
 * MICROSERVICES: PLATFORM TELEMETRY & HEALTH CHECK
 * Mengukur performa sistem, ketersediaan microservices, dan metrik pangkalan data.
 */
export const MicroStats = {
  name: "stats",

  async getPlatformTelemetry() {
    const stats = await db.getPlatformStatsAsync();
    return {
      success: true,
      statusCode: 200,
      system: "ESPORT SUMBAR Platform Backend",
      architecture: "Modular Microsystem v2.5 (Supabase Hybrid)",
      status: "OPERATIONAL",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseMode: stats.source || "hybrid-store",
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
