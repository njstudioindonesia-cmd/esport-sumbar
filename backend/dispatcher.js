import { MicroAuth } from './microsystems/auth.js';
import { MicroRegistrasi } from './microsystems/registrasi.js';
import { MicroPaspor } from './microsystems/paspor.js';
import { MicroKatalog } from './microsystems/katalog.js';
import { MicroSearch } from './microsystems/search.js';
import { MicroBursa } from './microsystems/bursa.js';
import { MicroPengprov } from './microsystems/pengprov.js';
import { MicroPengcab } from './microsystems/pengcab.js';
import { MicroStats } from './microsystems/stats.js';

/**
 * UNIFIED MICROSYSTEM DISPATCHER & GATEWAY
 * Menghubungkan seluruh request /api/* ke modul microsystem terkait
 * dengan isolasi kesalahan (fault tolerance) & circuit breaker.
 * Kompatibel 100% dengan Node.js lokal dan Vercel Serverless Runtime.
 */
export async function dispatchApiRequest(req, res) {
  // 1. Set Security & CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // 2. Preflight OPTIONS handling
  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.status(204).end();
    } else {
      res.writeHead(204);
      res.end();
    }
    return;
  }

  // 3. Parse URL & Query string
  const fullUrl = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
  const pathname = fullUrl.pathname.replace(/\/+$/, '') || '/api';
  const query = Object.assign({}, Object.fromEntries(fullUrl.searchParams.entries()), req.query || {});

  // 4. Parse Body (supports pre-parsed Vercel req.body and raw node stream)
  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await parseRequestBody(req);
    } catch (parseErr) {
      sendJson(res, 400, {
        success: false,
        error: "Bad Request: JSON tidak valid",
        details: parseErr.message
      });
      return;
    }
  }

  // 5. Router Matcher with Circuit Breaker
  try {
    // HEALTH & STATS
    if (pathname === '/api/health' || pathname === '/api') {
      const result = await MicroStats.healthCheck();
      sendJson(res, 200, result);
      return;
    }

    if (pathname === '/api/stats') {
      const result = await MicroStats.getPlatformTelemetry();
      sendJson(res, 200, result);
      return;
    }

    // AUTH
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const result = await MicroAuth.login(body);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
      const result = await MicroAuth.forgotPassword(body);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // REGISTRASI
    if (pathname === '/api/registrasi/antrean' && req.method === 'GET') {
      const result = await MicroRegistrasi.getQueue(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    const matchRegSubmit = pathname.match(/^\/api\/registrasi\/([a-zA-Z0-9_-]+)$/);
    if (matchRegSubmit && req.method === 'POST') {
      const bidang = matchRegSubmit[1];
      const result = await MicroRegistrasi.submit(bidang, body);
      sendJson(res, result.statusCode || 201, result);
      return;
    }

    const matchRegStatus = pathname.match(/^\/api\/registrasi\/([a-zA-Z0-9_-]+)\/status$/);
    if (matchRegStatus && ['PUT', 'POST'].includes(req.method)) {
      const id = matchRegStatus[1];
      const result = await MicroRegistrasi.updateStatus(id, body);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // PASPOR DIGITAL ATLET
    const matchPaspor = pathname.match(/^\/api\/paspor\/([a-zA-Z0-9_-]+)$/);
    if (matchPaspor && req.method === 'GET') {
      const idOrPaspor = matchPaspor[1];
      const result = await MicroPaspor.getDetail(idOrPaspor);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // KATALOG EKOSISTEM
    if (pathname === '/api/katalog' && req.method === 'GET') {
      const result = await MicroKatalog.getList(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // SEARCH ENGINE
    if (pathname === '/api/search' && req.method === 'GET') {
      const result = await MicroSearch.query(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // BURSA TRANSFER & LFT
    if (pathname === '/api/bursa/lft' && req.method === 'GET') {
      const result = await MicroBursa.getLFT(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/bursa/scout' && req.method === 'POST') {
      const result = await MicroBursa.submitScoutProposal(body);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/tim' && req.method === 'GET') {
      const result = await MicroBursa.getTeams(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // PENGPROV ESI SUMBAR (REGULATOR TINGKAT I)
    if (pathname === '/api/pengprov/summary' && req.method === 'GET') {
      const result = await MicroPengprov.getPengcabSummary();
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/pengprov/pelatda' && req.method === 'GET') {
      const result = await MicroPengprov.getPelatdaRoster();
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/pengprov/events' && req.method === 'GET') {
      const result = await MicroPengprov.getEvents();
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/pengprov/events' && req.method === 'POST') {
      const result = await MicroPengprov.createEvent(body);
      sendJson(res, result.statusCode || 201, result);
      return;
    }

    // PENGCAB ESI KAB/KOTA (REGULATOR TINGKAT II)
    if (pathname === '/api/pengcab/data' && req.method === 'GET') {
      const result = await MicroPengcab.getRegionalData(query);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    if (pathname === '/api/pengcab/rekomendasi' && req.method === 'POST') {
      const result = await MicroPengcab.issueRekomendasi(body);
      sendJson(res, result.statusCode || 201, result);
      return;
    }

    if (pathname === '/api/pengcab/domisili-verify' && ['PUT', 'POST'].includes(req.method)) {
      const result = await MicroPengcab.verifyDomisili(body);
      sendJson(res, result.statusCode || 200, result);
      return;
    }

    // WILAYAH MASTER
    if (pathname === '/api/wilayah' && req.method === 'GET') {
      const districts = (await import('./store/db.js')).db.getWilayahList();
      sendJson(res, 200, { success: true, total: districts.length, data: districts });
      return;
    }

    // 404 NOT FOUND FOR UNMATCHED /api ROUTE
    sendJson(res, 404, {
      success: false,
      statusCode: 404,
      error: `Endpoint API '${pathname}' tidak ditemukan pada sistem backend.`
    });

  } catch (criticalErr) {
    // CIRCUIT BREAKER ISOLATION
    console.error(`[MicroGateway Error] On ${pathname}:`, criticalErr);
    sendJson(res, 500, {
      success: false,
      statusCode: 500,
      error: "Internal Microsystem Error",
      message: criticalErr.message || "Terjadi kesalahan internal pada microsystem terkait.",
      isolatedMicrosystem: pathname.split('/')[2] || "gateway"
    });
  }
}

// Universal Send JSON Helper (Works with both native http and Vercel Serverless)
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

// Universal Request Body Parser
function parseRequestBody(req) {
  // 1. If Vercel already parsed the body into an object
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  // 2. If Vercel passed body as string
  if (req.body && typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      try {
        const p = new URLSearchParams(req.body);
        return Promise.resolve(Object.fromEntries(p.entries()));
      } catch {
        return Promise.resolve({});
      }
    }
  }

  // 3. Fallback to streaming read for standard Node.js http
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error("Request payload terlalu besar (Max 5MB)"));
      }
    });
    req.on('end', () => {
      if (!raw || raw.trim() === '') {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        try {
          const params = new URLSearchParams(raw);
          resolve(Object.fromEntries(params.entries()));
        } catch {
          reject(e);
        }
      }
    });
    req.on('error', reject);
  });
}
