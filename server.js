// Multi-Venue Loyalty Card Server
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const VENUES = require('./venues');

const PORT           = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bellevue2024';
const DATA_DIR       = path.join(__dirname, 'data');
const PUBLIC_DIR     = path.join(__dirname, 'public');

// ── Data helpers ─────────────────────────────────────────────────────────────
function dataFile(venueId) {
  return path.join(DATA_DIR, `${venueId}.json`);
}

function loadMembers(venueId) {
  try { return JSON.parse(fs.readFileSync(dataFile(venueId), 'utf8')); }
  catch { return []; }
}

function saveMembers(venueId, members) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(dataFile(venueId), JSON.stringify(members, null, 2));
}

function nextBarcode(members) {
  const nums = members.map(m => parseInt(m.barcode, 10)).filter(Boolean);
  const max  = nums.length ? Math.max(...nums) : 1000;
  return String(max + 1).padStart(6, '0');
}

function joinedNow() {
  return new Date().toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });
}

function getVenue(id) {
  return VENUES.find(v => v.id === id);
}

// ── Sessions ──────────────────────────────────────────────────────────────────
const sessions = new Set();
function makeSession() { const t = crypto.randomBytes(24).toString('hex'); sessions.add(t); return t; }
function isAuthed(req) { return sessions.has(req.headers['x-admin-token'] || ''); }

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve({}); } });
  });
}

function serveFile(res, filePath) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
  const mime  = types[path.extname(filePath)] || 'text/plain';
  try { const d = fs.readFileSync(filePath); res.writeHead(200, { 'Content-Type': mime }); res.end(d); }
  catch { res.writeHead(404); res.end('Not found'); }
}

// ── Server ────────────────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const url    = new URL(req.url, 'http://localhost');
  const method = req.method;
  const p      = url.pathname;

  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' });
    return res.end();
  }

  // ── Static pages ──
  if (p === '/' || p === '/card.html')  return serveFile(res, path.join(PUBLIC_DIR, 'card.html'));
  if (p === '/admin' || p === '/admin.html') return serveFile(res, path.join(PUBLIC_DIR, 'admin.html'));

  // ── Public: venues list (for card page to know venue branding) ──
  if (p === '/api/venues' && method === 'GET') {
    return json(res, VENUES.map(v => ({ id: v.id, name: v.name, colors: v.colors, tagline: v.tagline, address: v.address, phone: v.phone, discounts: v.discounts, prefix: v.prefix })));
  }

  // ── Public: get member by token ──
  if (p === '/api/member' && method === 'GET') {
    const token = url.searchParams.get('t');
    for (const venue of VENUES) {
      const members = loadMembers(venue.id);
      const member  = members.find(m => m.token === token);
      if (member) {
        return json(res, { name: member.name, joined: member.joined, barcode: member.barcode, venueId: venue.id });
      }
    }
    return json(res, { error: 'not found' }, 404);
  }

  // ── Admin: login ──
  if (p === '/api/admin/login' && method === 'POST') {
    const body = await readBody(req);
    if (body.password === ADMIN_PASSWORD) return json(res, { ok: true, token: makeSession() });
    return json(res, { ok: false }, 401);
  }

  // ── Admin: protected ──
  if (p.startsWith('/api/admin/') && !isAuthed(req)) return json(res, { error: 'unauthorized' }, 401);

  // GET all members for a venue
  if (p.startsWith('/api/admin/members/') && method === 'GET' && !p.split('/').pop().includes('-')) {
    const venueId = p.split('/')[4];
    if (!getVenue(venueId)) return json(res, { error: 'unknown venue' }, 404);
    return json(res, loadMembers(venueId));
  }

  // POST add member to a venue
  if (p.startsWith('/api/admin/members/') && method === 'POST') {
    const venueId = p.split('/')[4];
    const venue   = getVenue(venueId);
    if (!venue) return json(res, { error: 'unknown venue' }, 404);
    const body    = await readBody(req);
    const members = loadMembers(venueId);
    const member  = {
      id:      crypto.randomUUID(),
      token:   crypto.randomBytes(16).toString('hex'),
      name:    body.name || 'Unknown',
      email:   body.email || '',
      barcode: nextBarcode(members),
      joined:  joinedNow()
    };
    members.unshift(member);
    saveMembers(venueId, members);
    return json(res, { member });
  }

  // DELETE member
  if (p.startsWith('/api/admin/members/') && method === 'DELETE') {
    const parts   = p.split('/');
    const venueId = parts[4];
    const memberId= parts[5];
    let members   = loadMembers(venueId);
    members       = members.filter(m => m.id !== memberId);
    saveMembers(venueId, members);
    return json(res, { ok: true });
  }

  res.writeHead(404); res.end('Not found');

}).listen(PORT, () => {
  console.log(`\n🌿 Multi-Venue Loyalty Server`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
  console.log(`   Venues: ${VENUES.map(v => v.name).join(', ')}\n`);
});
