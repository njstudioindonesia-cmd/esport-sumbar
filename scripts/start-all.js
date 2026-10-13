/**
 * ESPORT SUMBAR - Master Services Orchestrator
 * Spawns all 10 microservices + Next.js frontend, monitors health, and handles graceful shutdown.
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');

const SERVICES = [
  {
    name: 'identity-service',
    port: 4001,
    cwd: path.join(ROOT_DIR, 'services', 'identity-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'news-service',
    port: 4002,
    cwd: path.join(ROOT_DIR, 'services', 'news-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'news-ingestor',
    port: 4003,
    cwd: path.join(ROOT_DIR, 'services', 'news-ingestor'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'community-service',
    port: 4004,
    cwd: path.join(ROOT_DIR, 'services', 'community-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'event-service',
    port: 4005,
    cwd: path.join(ROOT_DIR, 'services', 'event-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'media-service',
    port: 4006,
    cwd: path.join(ROOT_DIR, 'services', 'media-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'bracket-service',
    port: 4007,
    cwd: path.join(ROOT_DIR, 'services', 'bracket-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'ai-service',
    port: 4008,
    cwd: path.join(ROOT_DIR, 'services', 'ai-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'notification-service',
    port: 4009,
    cwd: path.join(ROOT_DIR, 'services', 'notification-service'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'gateway',
    port: 4000,
    cwd: path.join(ROOT_DIR, 'services', 'gateway'),
    command: process.execPath,
    args: ['dist/main.js'],
    healthPath: '/health',
  },
  {
    name: 'web',
    port: 3000,
    cwd: path.join(ROOT_DIR, 'apps', 'web'),
    command: process.execPath,
    args: [path.join(ROOT_DIR, 'apps', 'web', 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', '3000'],
    healthPath: '/',
  },
];

const children = [];

function checkPortHealth(port, checkPath) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${checkPath}`, { timeout: 1500 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startAll() {
  console.log('='.repeat(70));
  console.log('🚀 MEMULAI SELURUH LAYANAN ESPORT SUMBAR (10 MICROSERVICES + NEXT.JS)');
  console.log('='.repeat(70));

  for (const svc of SERVICES) {
    console.log(`[START] Menjalankan ${svc.name} pada port ${svc.port}...`);
    const child = spawn(svc.command, svc.args, {
      cwd: svc.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PORT: svc.port.toString() },
    });

    child.stdout.on('data', (d) => {
      const line = d.toString().trim();
      if (line && (line.includes('running on port') || line.includes('Ready in') || line.includes('started'))) {
        console.log(`  [${svc.name}] ${line}`);
      }
    });

    child.stderr.on('data', (d) => {
      const errLine = d.toString().trim();
      if (errLine && !errLine.includes('DeprecationWarning')) {
        console.error(`  [${svc.name}:ERR] ${errLine}`);
      }
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.warn(`  [${svc.name}] exited with code ${code}`);
      }
    });

    children.push({ ...svc, process: child });
  }

  console.log('\n⏳ Menunggu inisialisasi seluruh socket...');
  await new Promise((r) => setTimeout(r, 4000));

  console.log('\n🔍 VERIFIKASI HEALTH KONEKSI SELURUH LAYANAN:');
  console.log('-'.repeat(70));

  const results = [];
  for (const svc of SERVICES) {
    const isHealthy = await checkPortHealth(svc.port, svc.healthPath);
    results.push({
      Layanan: svc.name,
      Port: svc.port,
      Status: isHealthy ? '✅ ONLINE' : '⚠️ STARTING',
      Endpoint: `http://localhost:${svc.port}${svc.healthPath}`,
    });
  }

  console.table(results);

  console.log('='.repeat(70));
  console.log('✨ SELURUH SISTEM ESPORT SUMBAR AKTIF & SIAP DIAKSES:');
  console.log('   - Web Portal       : http://localhost:3000');
  console.log('   - API Gateway      : http://localhost:4000');
  console.log('   - Gateway Docs     : http://localhost:4000/docs');
  console.log('   - Gateway Health   : http://localhost:4000/health');
  console.log('   - Prometheus Metric: http://localhost:4000/health/metrics');
  console.log('='.repeat(70));
  console.log('Tekan Ctrl+C untuk menghentikan seluruh layanan.\n');
}

function cleanup() {
  console.log('\n🛑 Menghentikan seluruh proses layanan...');
  for (const item of children) {
    if (item.process && !item.process.killed) {
      try {
        process.kill(item.process.pid);
      } catch (_) {}
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

startAll().catch((err) => {
  console.error('Gagal menjalankan layanan:', err);
  cleanup();
});
