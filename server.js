import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
  
  let finalPath = path.join(__dirname, 'public', reqUrl);
  
  // Check if adding .html resolves the request (e.g. /about -> /about.html, /atlet -> /atlet.html)
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
    res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 ESPORT SUMBAR Server Multi-Halaman AKTIF!`);
  console.log(`👉 Beranda: http://localhost:${PORT}/`);
  console.log(`👉 About:   http://localhost:${PORT}/about`);
  console.log(`👉 Atlet:   http://localhost:${PORT}/atlet`);
  console.log(`=======================================================`);
});
