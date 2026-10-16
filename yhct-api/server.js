/**
 * YHCT Schedule API – server local cho app chia-gio-yhct.html
 * Base URL đúng: http://localhost:3000
 *
 * Chạy:  node server.js
 * (hoặc: npm start)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_FILE = path.join(__dirname, 'data', 'workspace.json');
const TOKEN = process.env.API_TOKEN || ''; // nếu set, bắt buộc Bearer token

function readWorkspace() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { version: 1, savedAt: null, dsbnData: [], scheduleData: [] };
  }
}

function writeWorkspace(obj) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User, Accept',
    'Access-Control-Max-Age': '86400'
  });
  res.end(body);
}

function checkAuth(req) {
  if (!TOKEN) return true; // không cấu hình token → mở
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m && m[1] === TOKEN;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(null);
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(new Error('JSON không hợp lệ')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = u.pathname.replace(/\/+$/, '') || '/';

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return send(res, 204, '');
  }

  // Auth (nếu có API_TOKEN)
  if (pathname.startsWith('/api/') && !checkAuth(req)) {
    return send(res, 401, { error: 'Unauthorized', message: 'Token Bearer không hợp lệ hoặc thiếu' });
  }

  try {
    // Health
    if (req.method === 'GET' && (pathname === '/api/v1/health' || pathname === '/health')) {
      return send(res, 200, {
        ok: true,
        service: 'yhct-schedule-api',
        time: new Date().toISOString(),
        baseUrl: `http://localhost:${PORT}`
      });
    }

    // Workspace
    if (pathname === '/api/v1/workspace') {
      if (req.method === 'GET') {
        return send(res, 200, readWorkspace());
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await readBody(req);
        if (!body || typeof body !== 'object') {
          return send(res, 400, { error: 'Bad Request', message: 'Body JSON workspace bắt buộc' });
        }
        body.savedAt = body.savedAt || new Date().toISOString();
        body.version = body.version || 1;
        writeWorkspace(body);
        return send(res, 200, { ok: true, savedAt: body.savedAt, message: 'Đã lưu workspace' });
      }
    }

    // Schedule only
    if (pathname === '/api/v1/schedule') {
      const ws = readWorkspace();
      if (req.method === 'GET') {
        return send(res, 200, { items: ws.scheduleData || [], savedAt: ws.savedAt });
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await readBody(req);
        ws.scheduleData = (body && body.items) ? body.items : (Array.isArray(body) ? body : []);
        ws.savedAt = (body && body.savedAt) || new Date().toISOString();
        writeWorkspace(ws);
        return send(res, 200, { ok: true, count: ws.scheduleData.length, savedAt: ws.savedAt });
      }
    }

    // Patients (DSBN)
    if (pathname === '/api/v1/patients') {
      const ws = readWorkspace();
      if (req.method === 'GET') {
        return send(res, 200, { items: ws.dsbnData || [], savedAt: ws.savedAt });
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await readBody(req);
        ws.dsbnData = (body && body.items) ? body.items : (Array.isArray(body) ? body : []);
        ws.savedAt = (body && body.savedAt) || new Date().toISOString();
        writeWorkspace(ws);
        return send(res, 200, { ok: true, count: ws.dsbnData.length, savedAt: ws.savedAt });
      }
    }

    // Trang hướng dẫn nhanh
    if (req.method === 'GET' && (pathname === '/' || pathname === '')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>YHCT Schedule API</title>
<style>body{font-family:system-ui;max-width:640px;margin:2rem auto;padding:0 1rem;line-height:1.5}
code{background:#f1f5f9;padding:2px 6px;border-radius:4px}</style></head><body>
<h1>YHCT Schedule API</h1>
<p><strong>Base URL đúng (dán vào app):</strong></p>
<p style="font-size:1.25rem"><code>http://localhost:${PORT}</code></p>
<ul>
<li><code>GET /api/v1/health</code></li>
<li><code>GET|PUT /api/v1/workspace</code></li>
<li><code>GET|PUT /api/v1/schedule</code></li>
<li><code>GET|PUT /api/v1/patients</code></li>
</ul>
<p>Token: ${TOKEN ? 'Đang BẮT BUỘC (Bearer)' : 'Không bắt buộc (để trống trong app)'}</p>
</body></html>`);
      return;
    }

    send(res, 404, { error: 'Not Found', path: pathname });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Internal Error', message: e.message || String(e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  YHCT Schedule API đang chạy');
  console.log('  ─────────────────────────────────');
  console.log('  Base URL đúng:  http://localhost:' + PORT);
  console.log('  Health:         http://localhost:' + PORT + '/api/v1/health');
  console.log('  Workspace:      http://localhost:' + PORT + '/api/v1/workspace');
  if (TOKEN) console.log('  Token Bearer:   (đã bật API_TOKEN)');
  else console.log('  Token:          không bắt buộc');
  console.log('  ─────────────────────────────────');
  console.log('');
});
