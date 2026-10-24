// Static file server — binds 0.0.0.0 for LAN access
// Usage: node server.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.argv[2]) || 8888;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const server = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  // Handle Chinese filenames in URL
  try { urlPath = decodeURIComponent(urlPath); } catch(e) {}
  let filePath = path.join(ROOT, urlPath);
  filePath = path.normalize(filePath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

  console.log('[' + new Date().toLocaleTimeString() + '] ' + req.socket.remoteAddress + ' - ' + req.url);
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('='.repeat(55));
  console.log('  Gallery Server');
  console.log('='.repeat(55));
  console.log('');
  console.log('  Local:    http://localhost:' + PORT);
  console.log('  Network:  http://' + ip + ':' + PORT);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('='.repeat(55));
});
