import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dispatchApiRequest } from './backend/dispatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const rawPath = req.url.split('?')[0];

  // ==========================================
  // ROUTE TO BACKEND MICROSERVICES DISPATCHER
  // ==========================================
  if (rawPath === '/api' || rawPath.startsWith('/api/')) {
    try {
      await dispatchApiRequest(req, res);
    } catch (apiErr) {
      console.error('[Server Microservices Error]:', apiErr);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: false,
        error: "Internal Server Error in Microsystem Dispatcher",
        details: apiErr.message
      }));
    }
    return;
  }

  // ==========================================
  // STATIC FRONTEND FILE SERVING
  // ==========================================
  let reqUrl = rawPath;
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
  
  let finalPath = path.join(__dirname, 'public', reqUrl);
  
  // Check if adding .html resolves the request (e.g. /about -> /about.html)
  if (!fs.existsSync(finalPath)) {
    if (fs.existsSync(finalPath + '.html')) {
      finalPath = finalPath + '.html';
    } else {
      finalPath = path.join(__dirname, 'public', 'index.html');
    }
  }

  const ext = path.extname(finalPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(finalPath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Server Error: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 ESPORT SUMBAR Server & Microservices AKTIF!`);
  console.log(`👉 Web Frontend: http://localhost:${PORT}/`);
  console.log(`👉 API Health:   http://localhost:${PORT}/api/health`);
  console.log(`👉 API Stats:    http://localhost:${PORT}/api/stats`);
  console.log(`👉 API Katalog:  http://localhost:${PORT}/api/katalog`);
  console.log(`=======================================================`);
});
