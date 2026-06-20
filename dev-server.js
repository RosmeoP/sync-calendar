// Local dev server — mirrors the Netlify functions environment.
// Usage: FOOTBALL_DATA_API_KEY=your_key node dev-server.js
// Or:    create a .env file with FOOTBALL_DATA_API_KEY=your_key

const http = require('http');
const fs   = require('fs');
const path = require('path');

// Read .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
}

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const PORT    = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.ico':  'image/x-icon',
};

const BASE = 'https://api.football-data.org/v4';

async function proxyAPI(endpoint, res) {
  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing FOOTBALL_DATA_API_KEY in .env' }));
    return;
  }
  const r    = await fetch(`${BASE}${endpoint}`, { headers: { 'X-Auth-Token': API_KEY } });
  const data = await r.json();
  res.writeHead(r.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/.netlify/functions/matches') {
      return await proxyAPI('/competitions/WC/matches', res);
    }
    if (req.url === '/.netlify/functions/standings') {
      return await proxyAPI('/competitions/WC/standings', res);
    }

    // Static files
    let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    filePath = path.join(__dirname, filePath);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404); res.end('Not found'); return;
    }

    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);

  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✅  Dev server running → http://localhost:${PORT}\n`);
  if (!API_KEY) console.warn('  ⚠️  No API key found — add FOOTBALL_DATA_API_KEY to .env\n');
});
