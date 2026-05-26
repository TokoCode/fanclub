// Bellevue Gardens · Loyalty Card Server
// Node.js · No framework needed · ~150 lines
//
// Routes:
//   GET  /                         → card.html
//   GET  /admin                    → admin.html
//   GET  /card.html?t=TOKEN        → customer card
//   GET  /api/member?t=TOKEN       → member JSON (public, token-gated)
//   POST /api/admin/login          → { ok: true/false }
//   GET  /api/admin/members        → all members (auth required)
//   POST /api/admin/members        → add member, returns { member }
//   DEL  /api/admin/members/:id    → remove member

const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

// ── Config ──────────────────────────────────────────────────────────────────
const PORT          = process.env.PORT || 3000;
const ADMIN_PASSWORD= process.env.ADMIN_PASSWORD || 'bellevue2024';   // change this!
const DATA_FILE     = path.join(__dirname, 'data', 'members.json');
const PUBLIC_DIR    = path.join(__dirname, 'public');
// ────────────────────────────────────────────────────────────────────────────

// ── Data helpers ─────────────────────────────────────────────────────────────
function loadMembers() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveMembers(members) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

function nextBarcode(members) {
  const nums = members.map(m => parseInt(m.barcode, 10)).filter(Boolean);
  const max  = nums.length ? Math.max(...nums) : 1000;
  return String(max + 1).padStart(6, '0');
}

function joinedNow() {
  return new Date().toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });
}
// ────────────────────────────────────────────────────────────────────────────

// ── Admin session tokens (in-memory, resets on restart) ──────────────────────
const sessions = new Set();

function makeSession() {
  const tok = crypto.randomBytes(24).toString('hex');
  sessions.add(tok);
  return tok;
}

function isAuthed(req) {
  const auth = req.headers['x-admin-token'] || '';
  return sessions.has(auth);
}
// ────────────────────────────────────────────────────────────────────────────

// ── Tiny helpers ─────────────────────────────────────────────────────────────
function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function serveFile(res, filePath) {
  const ext   = path.extname(filePath);
  const types = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.json':'application/json' };
  const mime  = types[ext] || 'text/plain';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}
// ────────────────────────────────────────────────────────────────────────────

// ── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url, `http://localhost`);
  const method = req.method;
  const p      = url.pathname;

  // CORS preflight
  if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*', 'Access-Control-Allow-Methods':'*' }); return res.end(); }

  // ── Static files ──
  if (p === '/' || p === '/card.html') return serveFile(res, path.join(PUBLIC_DIR, 'card.html'));
  if (p === '/admin' || p === '/admin.html') return serveFile(res, path.join(PUBLIC_DIR, 'admin.html'));

  // ── Public API: get member by token ──
  if (p === '/api/member' && method === 'GET') {
    const token   = url.searchParams.get('t');
    const members = loadMembers();
    const member  = members.find(m => m.token === token);
    if (!member) return json(res, { error: 'not found' }, 404);
    // Return only public fields
    return json(res, { name: member.name, joined: member.joined, barcode: member.barcode });
  }

  // ── Admin: login ──
  if (p === '/api/admin/login' && method === 'POST') {
    const body = await readBody(req);
    if (body.password === ADMIN_PASSWORD) {
      const tok = makeSession();
      return json(res, { ok: true, token: tok });
    }
    return json(res, { ok: false }, 401);
  }

  // ── Admin: protected routes ──
  if (p.startsWith('/api/admin/') && !isAuthed(req)) {
    return json(res, { error: 'unauthorized' }, 401);
  }

  if (p === '/api/admin/members' && method === 'GET') {
    return json(res, loadMembers());
  }

  if (p === '/api/admin/members' && method === 'POST') {
    const body    = await readBody(req);
    const members = loadMembers();
    const member  = {
      id:      crypto.randomUUID(),
      token:   crypto.randomBytes(16).toString('hex'),
      name:    body.name || 'Unknown',
      email:   body.email || '',
      barcode: nextBarcode(members),
      joined:  joinedNow()
    };
    members.unshift(member);
    saveMembers(members);
    return json(res, { member });
  }

  if (p.startsWith('/api/admin/members/') && method === 'DELETE') {
    const id      = p.split('/').pop();
    let members   = loadMembers();
    members       = members.filter(m => m.id !== id);
    saveMembers(members);
    return json(res, { ok: true });
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🌿 Bellevue Gardens Loyalty Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   Admin password: ${ADMIN_PASSWORD}\n`);
});
