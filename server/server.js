/**
 * Zero-Knowledge WebSocket Relay & Static Preview Server for Dudu & Bubu
 * Strictly relays opaque encrypted payloads between the two connected clients.
 * Plaintext is NEVER seen, parsed, or stored by this server.
 */

// Load .env with zero-dependency fallback
try {
  require('dotenv').config();
} catch (_) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[k]) process.env[k] = v;
          }
        }
      });
    }
  } catch (e) {}
}
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fs = require('fs');
const path = require('path');
const db = require('./db');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOBS_DIR = process.env.BLOBS_DIR || path.resolve(__dirname, 'data', 'blobs');
if (!fs.existsSync(BLOBS_DIR)) {
  fs.mkdirSync(BLOBS_DIR, { recursive: true });
}

const RELAY_AUTH_TOKEN = (process.env.RELAY_AUTH_TOKEN || '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a').trim();
const TUNNEL_SECRET = (process.env.TUNNEL_SECRET || '').trim();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

/**
 * Layer 1 Security: Application-level Auth Verification
 * Validates requests against RELAY_AUTH_TOKEN via query param (?token=), custom header, or Bearer auth.
 */
function isAuthorized(req, url) {
  if (!RELAY_AUTH_TOKEN) return true; // Open in development if no token configured

  // 1. Query parameter ?token=... or ?auth=...
  if (url) {
    const qToken = url.searchParams.get('token') || url.searchParams.get('auth');
    if (qToken && qToken.trim() === RELAY_AUTH_TOKEN) return true;
  }

  // 2. Custom headers
  const headerToken = req.headers['x-relay-token'] || req.headers['x-dudu-auth'];
  if (headerToken && headerToken.trim() === RELAY_AUTH_TOKEN) return true;

  // 3. Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (bearer === RELAY_AUTH_TOKEN) return true;
  }

  return false;
}

// 1. Create HTTP Server for Health Checks, Static App Preview, Blob Storage & WebSocket Upgrade
const server = http.createServer((req, res) => {
  // Cloudflare Tunnel Secret Guard
  if (TUNNEL_SECRET && req.headers['x-tunnel-secret'] !== TUNNEL_SECRET) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden: Invalid tunnel secret' }));
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // CORS Headers for zero-knowledge blob transfer & REST API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Chunk-Index, X-Total-Chunks, X-Relay-Token, X-Dudu-Auth, X-Tunnel-Secret, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint (minimal for monitoring, zero data leak)
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Serve Static Frontend Assets for non-API GET/HEAD requests
  if ((req.method === 'GET' || req.method === 'HEAD') && !url.pathname.startsWith('/api/')) {
    let decodedPath = '/index.html';
    try {
      decodedPath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    } catch (_) {
      decodedPath = url.pathname;
    }

    const ext = path.extname(decodedPath).toLowerCase();
    const isHidden = decodedPath.split('/').some(p => p.startsWith('.'));
    const safePath = path.normalize(path.join(PROJECT_ROOT, decodedPath));
    const rel = path.relative(PROJECT_ROOT, safePath);

    // Prevent hidden files, server/ source files, and unapproved extensions (.md, .json, .db, etc.)
    if (!isHidden && MIME_TYPES[ext] && !rel.startsWith('..') && !rel.startsWith('server') && !safePath.startsWith(__dirname) && fs.existsSync(safePath)) {
      try {
        const stat = fs.statSync(safePath);
        if (stat.isFile()) {
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] });
          if (req.method === 'HEAD') {
            res.end();
          } else {
            fs.createReadStream(safePath).pipe(res);
          }
          return;
        }
      } catch (_) {}
    }

    // Fallback: If root '/' requested on standalone VPS relay (where static index.html is absent),
    // serve clean relay status info without leaking DB stats
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (url.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Enforce Layer 1 Security Token on all API endpoints
  if (!isAuthorized(req, url)) {
    const clientIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.warn(`[Security] Unauthorized HTTP ${req.method} ${url.pathname} rejected from ${clientIp}`);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized: Valid RELAY_AUTH_TOKEN required' }));
    return;
  }

  // Authenticated server and DB statistics
  if (url.pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      ...db.getStats(),
      activeClients: wss.clients.size,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Push Notification Device Token Registration (FCM)
  if (url.pathname === '/api/register-push' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.token) {
          const ident = json.identity || 'dudu';
          db.savePushToken(ident, json.token);
          console.log(`[Push] Device registered push token for ${ident}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', registered: ident }));
          return;
        }
      } catch (e) {}
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid payload' }));
    });
    return;
  }

  // --- Helper for parsing JSON body ---
  function parseBody(cb) {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        cb(null, raw ? JSON.parse(raw) : {});
      } catch (err) {
        cb(err);
      }
    });
    req.on('error', cb);
  }

  // --- Calendar REST Endpoints ---
  if (url.pathname === '/api/calendar' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', events: db.getAllCalendarEvents() }));
    return;
  }

  if (url.pathname === '/api/calendar' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      const saved = db.saveCalendarEvent(json);
      broadcastToOthers(null, JSON.stringify({ type: 'calendar_event_saved', event: saved }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', event: saved }));
    });
    return;
  }

  const calMatch = url.pathname.match(/^\/api\/calendar\/([^/]+)$/);
  if (calMatch && req.method === 'DELETE') {
    const id = calMatch[1];
    db.deleteCalendarEvent(id);
    broadcastToOthers(null, JSON.stringify({ type: 'calendar_event_deleted', id }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: id }));
    return;
  }

  // --- Planner / Bucket List REST Endpoints ---
  if (url.pathname === '/api/planner' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', items: db.getAllPlannerItems() }));
    return;
  }

  if (url.pathname === '/api/planner' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      const saved = db.savePlannerItem(json);
      broadcastToOthers(null, JSON.stringify({ type: 'planner_item_saved', item: saved }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', item: saved }));
    });
    return;
  }

  const plannerMatch = url.pathname.match(/^\/api\/planner\/([^/]+)$/);
  if (plannerMatch && req.method === 'DELETE') {
    const id = plannerMatch[1];
    db.deletePlannerItem(id);
    broadcastToOthers(null, JSON.stringify({ type: 'planner_item_deleted', id }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: id }));
    return;
  }

  // --- Love Notes REST Endpoints ---
  if (url.pathname === '/api/notes' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', notes: db.getAllNotes() }));
    return;
  }

  if (url.pathname === '/api/notes' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      const saved = db.saveNote(json);
      broadcastToOthers(null, JSON.stringify({ type: 'note_saved', note: saved }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', note: saved }));
    });
    return;
  }

  const noteMatch = url.pathname.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch && req.method === 'DELETE') {
    const id = noteMatch[1];
    db.deleteNote(id);
    broadcastToOthers(null, JSON.stringify({ type: 'note_deleted', id }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: id }));
    return;
  }

  // --- Memories REST Endpoints ---
  if (url.pathname === '/api/memories' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      polaroids: db.getAllPolaroids(),
      milestones: db.getAllMilestones()
    }));
    return;
  }

  if (url.pathname === '/api/memories/polaroids' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      polaroids: db.getAllPolaroids()
    }));
    return;
  }

  if (url.pathname === '/api/memories/milestones' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      milestones: db.getAllMilestones()
    }));
    return;
  }

  if (url.pathname === '/api/memories/polaroids' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      const saved = db.savePolaroid(json);
      broadcastToOthers(null, JSON.stringify({ type: 'polaroid_saved', polaroid: saved }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', polaroid: saved }));
    });
    return;
  }

  const polMatch = url.pathname.match(/^\/api\/memories\/polaroids\/([^/]+)$/);
  if (polMatch && req.method === 'DELETE') {
    const id = polMatch[1];
    db.deletePolaroid(id);
    broadcastToOthers(null, JSON.stringify({ type: 'polaroid_deleted', id }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: id }));
    return;
  }

  if (url.pathname === '/api/memories/milestones' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      const saved = db.saveMilestone(json);
      broadcastToOthers(null, JSON.stringify({ type: 'milestone_saved', milestone: saved }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', milestone: saved }));
    });
    return;
  }

  const msMatch = url.pathname.match(/^\/api\/memories\/milestones\/([^/]+)$/);
  if (msMatch && req.method === 'DELETE') {
    const id = msMatch[1];
    db.deleteMilestone(id);
    broadcastToOthers(null, JSON.stringify({ type: 'milestone_deleted', id }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: id }));
    return;
  }

  // --- Couple Space REST Endpoints ---
  if (url.pathname === '/api/couple-space' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', data: db.getCoupleSpace() }));
    return;
  }

  if (url.pathname === '/api/couple-space' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      db.saveCoupleSpace(json);
      const updated = db.getCoupleSpace();
      broadcastToOthers(null, JSON.stringify({ type: 'couple_space_updated', data: updated }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: updated }));
    });
    return;
  }

  // --- Wardrobe / Couple Closet REST Endpoints ---
  if (url.pathname === '/api/wardrobe' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', data: db.getWardrobe() }));
    return;
  }

  if (url.pathname === '/api/wardrobe' && req.method === 'POST') {
    parseBody((err, json) => {
      if (err || !json) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
        return;
      }
      db.saveWardrobe(json);
      const updated = db.getWardrobe();
      broadcastToOthers(null, JSON.stringify({
        type: 'wardrobe_updated',
        data: updated,
        updatedBy: json.updatedBy || null
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: updated }));
    });
    return;
  }

  // --- Encrypted Blob Chunked Storage Endpoints ---

  // 1. Upload chunk: POST /api/blobs/:blobId/chunk/:chunkIndex
  const chunkMatch = url.pathname.match(/^\/api\/blobs\/([^/]+)\/chunk\/(\d+)$/);
  if (chunkMatch && req.method === 'POST') {
    const blobId = chunkMatch[1].replace(/[^a-zA-Z0-9_-]/g, '');
    const chunkIndex = parseInt(chunkMatch[2], 10);
    const blobDir = path.join(BLOBS_DIR, blobId);
    fs.mkdirSync(blobDir, { recursive: true });

    const chunkPath = path.join(blobDir, `${chunkIndex}.bin`);
    const fileStream = fs.createWriteStream(chunkPath);
    req.pipe(fileStream);

    fileStream.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', blobId, chunkIndex }));
    });
    fileStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 2. Download chunk: GET /api/blobs/:blobId/chunk/:chunkIndex
  if (chunkMatch && req.method === 'GET') {
    const blobId = chunkMatch[1].replace(/[^a-zA-Z0-9_-]/g, '');
    const chunkIndex = parseInt(chunkMatch[2], 10);
    const chunkPath = path.join(BLOBS_DIR, blobId, `${chunkIndex}.bin`);

    if (!fs.existsSync(chunkPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Chunk not found' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400'
    });
    fs.createReadStream(chunkPath).pipe(res);
    return;
  }

  // 3. Blob metadata: GET /api/blobs/:blobId/meta
  const metaMatch = url.pathname.match(/^\/api\/blobs\/([^/]+)\/meta$/);
  if (metaMatch && req.method === 'GET') {
    const blobId = metaMatch[1].replace(/[^a-zA-Z0-9_-]/g, '');
    const blobDir = path.join(BLOBS_DIR, blobId);

    if (!fs.existsSync(blobDir)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Blob not found' }));
      return;
    }

    const files = fs.readdirSync(blobDir).filter(f => f.endsWith('.bin'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', blobId, totalChunks: files.length }));
    return;
  }

  // 4. Delete blob: DELETE /api/blobs/:blobId
  const deleteBlobMatch = url.pathname.match(/^\/api\/blobs\/([^/]+)$/);
  if (deleteBlobMatch && req.method === 'DELETE') {
    const blobId = deleteBlobMatch[1].replace(/[^a-zA-Z0-9_-]/g, '');
    const blobDir = path.join(BLOBS_DIR, blobId);
    if (fs.existsSync(blobDir)) {
      fs.rmSync(blobDir, { recursive: true, force: true });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deleted: blobId }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// 2. Attach WebSocket Server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  // Cloudflare Tunnel Secret Guard
  if (TUNNEL_SECRET && request.headers['x-tunnel-secret'] !== TUNNEL_SECRET) {
    socket.write('HTTP/1.1 403 Forbidden\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nForbidden: Invalid tunnel secret\n');
    socket.destroy();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  // Accept /chat-socket, /ws, or root WebSocket connections
  if (url.pathname === '/chat-socket' || url.pathname === '/ws' || url.pathname === '/') {
    if (!isAuthorized(request, url)) {
      const clientIp = request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      console.warn(`[Security] Unauthorized WebSocket upgrade rejected from ${clientIp}`);
      socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nUnauthorized: Invalid or missing token\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// 3. Client Connection Handling & Dumb Relay Logic
wss.on('connection', (ws, request) => {
  ws.isAlive = true;
  ws.clientIdentity = null;
  const clientIp = request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  console.log(`[Relay] Client connected from ${clientIp}. Total active: ${wss.clients.size}`);

  // Send current presence state and peer count to newly connected client
  broadcastPresence();
  broadcastPresenceState();

  // Send current topics to newly connected client for synchronization
  try {
    ws.send(JSON.stringify({
      type: 'topic_sync',
      topics: db.getAllTopics()
    }));
  } catch (e) {}

  // Send current tummy logs to newly connected client for synchronization
  try {
    ws.send(JSON.stringify({
      type: 'tummy_log_sync',
      logs: db.getAllTummyLogs()
    }));
  } catch (e) {}

  // Send current calendar events
  try {
    ws.send(JSON.stringify({
      type: 'calendar_sync',
      events: db.getAllCalendarEvents()
    }));
  } catch (e) {}

  // Send current planner items
  try {
    ws.send(JSON.stringify({
      type: 'planner_sync',
      items: db.getAllPlannerItems()
    }));
  } catch (e) {}

  // Send current love notes
  try {
    ws.send(JSON.stringify({
      type: 'notes_sync',
      notes: db.getAllNotes()
    }));
  } catch (e) {}

  // Send current memories (polaroids and milestones)
  try {
    ws.send(JSON.stringify({
      type: 'memories_sync',
      polaroids: db.getAllPolaroids(),
      milestones: db.getAllMilestones()
    }));
  } catch (e) {}

  // Send current couple space & wardrobe
  try {
    ws.send(JSON.stringify({
      type: 'couple_space_sync',
      data: db.getCoupleSpace()
    }));
    ws.send(JSON.stringify({
      type: 'wardrobe_sync',
      data: db.getWardrobe()
    }));
  } catch (e) {}

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data, isBinary) => {
    ws.isAlive = true;

    // Check if this is a raw ping string to answer immediately
    if (!isBinary) {
      const text = data.toString();
      if (text === 'ping' || text === '{"type":"ping"}') {
        try {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        } catch (e) {}
        return;
      }

      try {
        const parsed = JSON.parse(text);

        // Presence announcement (online / offline)
        if (parsed.type === 'presence_announce') {
          const rawIdent = parsed.identity || '';
          const ident = rawIdent.toLowerCase().includes('dudu') || rawIdent.toLowerCase().includes('kevin') ? 'dudu' : 'bubu';
          ws.clientIdentity = ident;
          const isOnline = parsed.status === 'online';

          // When client comes online, auto-push missed messages saved while they were offline
          if (isOnline) {
            const lastPresence = db.getPresence(ident);
            const sinceTs = lastPresence && lastPresence.lastSeen ? (lastPresence.lastSeen - 5000) : 0;
            const missed = db.getMessagesSince(sinceTs, 500);
            if (missed && missed.length > 0) {
              try {
                ws.send(JSON.stringify({
                  type: 'sync_response',
                  sinceTimestamp: sinceTs,
                  messages: missed
                }));
              } catch (e) {}
            }
          }

          db.setPresence(ident, isOnline);
          broadcastPresenceState();
          return;
        }

        // Read receipt routing
        if (parsed.type === 'read') {
          broadcastToOthers(ws, data, isBinary);
          return;
        }

        // Sync request from client catching up on missed offline messages
        if (parsed.type === 'sync') {
          const since = parsed.sinceTimestamp || 0;
          const missed = db.getMessagesSince(since, 500);
          ws.send(JSON.stringify({
            type: 'sync_response',
            sinceTimestamp: since,
            messages: missed
          }));
          return;
        }

        // Topic creation synchronization (Dudu creates -> Bubu sees)
        if (parsed.type === 'create_topic' && parsed.topic) {
          db.saveTopic(parsed.topic);
          broadcastToOthers(ws, JSON.stringify({
            type: 'topic_created',
            topic: parsed.topic
          }));
          return;
        }

        // Delete topic synchronization
        if (parsed.type === 'delete_topic') {
          if (parsed.sessionId) {
            db.deleteTopic(parsed.sessionId);
          }
          broadcastToOthers(ws, JSON.stringify({
            type: 'topic_deleted',
            sessionId: parsed.sessionId
          }));
          return;
        }

        // Tummy log synchronization (Spicy / Junk food history)
        if (parsed.type === 'create_tummy_log' && parsed.log) {
          db.saveTummyLog(parsed.log);
          broadcastToOthers(ws, JSON.stringify({
            type: 'tummy_log_created',
            log: parsed.log
          }));
          return;
        }

        if (parsed.type === 'delete_tummy_log' && parsed.logId) {
          db.deleteTummyLog(parsed.logId);
          broadcastToOthers(ws, JSON.stringify({
            type: 'tummy_log_deleted',
            logId: parsed.logId
          }));
          return;
        }

        // Delete single message synchronization
        if (parsed.type === 'delete_message') {
          if (parsed.messageId) {
            db.deleteMessage(parsed.messageId);
          }
          if (parsed.blobId) {
            const blobDir = path.join(BLOBS_DIR, String(parsed.blobId).replace(/[^a-zA-Z0-9_-]/g, ''));
            if (fs.existsSync(blobDir)) {
              fs.rmSync(blobDir, { recursive: true, force: true });
            }
          }
          broadcastToOthers(ws, data, isBinary);
          return;
        }

        // Delete all topics synchronization
        if (parsed.type === 'delete_all_topics') {
          db.clearAllTopics();
          broadcastToOthers(ws, JSON.stringify({
            type: 'delete_all_topics'
          }));
          return;
        }

        // Calendar synchronization
        if ((parsed.type === 'create_calendar_event' || parsed.type === 'save_calendar_event') && parsed.event) {
          const saved = db.saveCalendarEvent(parsed.event);
          broadcastToOthers(ws, JSON.stringify({
            type: 'calendar_event_saved',
            event: saved || parsed.event
          }));
          return;
        }

        if (parsed.type === 'delete_calendar_event' && (parsed.id || parsed.eventId)) {
          const id = parsed.id || parsed.eventId;
          db.deleteCalendarEvent(id);
          broadcastToOthers(ws, JSON.stringify({
            type: 'calendar_event_deleted',
            id
          }));
          return;
        }

        // Planner / Bucket List synchronization
        if ((parsed.type === 'create_planner_item' || parsed.type === 'save_planner_item') && parsed.item) {
          const saved = db.savePlannerItem(parsed.item);
          broadcastToOthers(ws, JSON.stringify({
            type: 'planner_item_saved',
            item: saved || parsed.item
          }));
          return;
        }

        if (parsed.type === 'delete_planner_item' && (parsed.id || parsed.itemId)) {
          const id = parsed.id || parsed.itemId;
          db.deletePlannerItem(id);
          broadcastToOthers(ws, JSON.stringify({
            type: 'planner_item_deleted',
            id
          }));
          return;
        }

        // Love Notes synchronization
        if ((parsed.type === 'create_note' || parsed.type === 'save_note') && parsed.note) {
          const saved = db.saveNote(parsed.note);
          broadcastToOthers(ws, JSON.stringify({
            type: 'note_saved',
            note: saved || parsed.note
          }));
          return;
        }

        if (parsed.type === 'delete_note' && (parsed.id || parsed.noteId)) {
          const id = parsed.id || parsed.noteId;
          db.deleteNote(id);
          broadcastToOthers(ws, JSON.stringify({
            type: 'note_deleted',
            id
          }));
          return;
        }

        // Memories synchronization (Polaroids & Milestones)
        if ((parsed.type === 'create_polaroid' || parsed.type === 'save_polaroid') && parsed.polaroid) {
          const saved = db.savePolaroid(parsed.polaroid);
          broadcastToOthers(ws, JSON.stringify({
            type: 'polaroid_saved',
            polaroid: saved || parsed.polaroid
          }));
          return;
        }

        if (parsed.type === 'delete_polaroid' && (parsed.id || parsed.polaroidId)) {
          const id = parsed.id || parsed.polaroidId;
          db.deletePolaroid(id);
          broadcastToOthers(ws, JSON.stringify({
            type: 'polaroid_deleted',
            id
          }));
          return;
        }

        if ((parsed.type === 'create_milestone' || parsed.type === 'save_milestone') && parsed.milestone) {
          const saved = db.saveMilestone(parsed.milestone);
          broadcastToOthers(ws, JSON.stringify({
            type: 'milestone_saved',
            milestone: saved || parsed.milestone
          }));
          return;
        }

        if (parsed.type === 'delete_milestone' && (parsed.id || parsed.milestoneId)) {
          const id = parsed.id || parsed.milestoneId;
          db.deleteMilestone(id);
          broadcastToOthers(ws, JSON.stringify({
            type: 'milestone_deleted',
            id
          }));
          return;
        }

        // Couple Space synchronization
        if (parsed.type === 'update_couple_space' && parsed.data) {
          db.saveCoupleSpace(parsed.data);
          broadcastToOthers(ws, JSON.stringify({
            type: 'couple_space_updated',
            data: db.getCoupleSpace()
          }));
          return;
        }

        // Wardrobe / Couple Closet synchronization
        if (parsed.type === 'update_wardrobe' && parsed.data) {
          db.saveWardrobe(parsed.data);
          broadcastToOthers(ws, JSON.stringify({
            type: 'wardrobe_updated',
            data: db.getWardrobe(),
            updatedBy: parsed.data.updatedBy || ws.clientIdentity || null
          }));
          return;
        }

        // Zero-Knowledge Encrypted message storage:
        // Save opaque ciphertext (iv, ciphertext) to SQLite on 512GB HDD
        if (parsed.ciphertext && parsed.iv) {
          const saved = db.saveMessage(parsed);
          if (saved && parsed.id) {
            // Send ACK back to sender to confirm message caught by server DB (turns 1 check into 2 checks)
            try {
              ws.send(JSON.stringify({
                type: 'ack',
                id: parsed.id,
                timestamp: Date.now()
              }));
            } catch (e) {}
          }
        }
      } catch (err) {
        // Not a JSON packet or parse failed, proceed to relay as raw
      }
    }

    // Broadcast payload to all other connected clients
    broadcastToOthers(ws, data, isBinary);
  });

  ws.on('close', (code, reason) => {
    console.log(`[Relay] Client disconnected (${code}). Total active: ${wss.clients.size}`);
    if (ws.clientIdentity) {
      let hasOther = false;
      for (const client of wss.clients) {
        if (client !== ws && client.clientIdentity === ws.clientIdentity && client.readyState === WebSocket.OPEN) {
          hasOther = true;
          break;
        }
      }
      if (!hasOther) {
        db.setPresence(ws.clientIdentity, false);
        broadcastPresenceState();
      }
    }
    broadcastPresence();
  });

  ws.on('error', (err) => {
    console.error('[Relay] Client socket error:', err.message);
  });
});

function broadcastPresenceState() {
  const payload = JSON.stringify({
    type: 'presence_state',
    presence: db.getAllPresence()
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (e) {}
    }
  }
}

function broadcastPresence() {
  const presencePayload = JSON.stringify({
    type: 'presence',
    connectedPeers: Math.max(0, wss.clients.size),
    timestamp: Date.now()
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(presencePayload);
      } catch (e) {}
    }
  }
}

function broadcastToOthers(senderWs, data, isBinary) {
  for (const client of wss.clients) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(data, { binary: isBinary });
      } catch (err) {
        console.error('[Relay] Error sending payload to peer:', err.message);
      }
    }
  }
}

// 4. Server Heartbeat (Interval ping to keep Cloudflare Tunnel connections alive)
const heartbeatInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      console.log('[Relay] Terminating unresponsive client connection');
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (e) {
      ws.terminate();
    }
  }
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// 5. Start Listening
server.listen(PORT, HOST, () => {
  console.log(`===============================================`);
  console.log(`🐻 Dudu Duo Chat Relay & Preview Server`);
  console.log(`🚀 Listening on http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://${HOST}:${PORT}/chat-socket (or /ws)`);
  console.log(`🔒 Zero-Knowledge Mode Active (No plaintext logging)`);
  console.log(`===============================================`);
});

// Graceful Termination
function shutdown() {
  console.log('\n[Relay] Shutting down relay server gracefully...');
  clearInterval(heartbeatInterval);
  wss.close(() => {
    server.close(() => {
      console.log('[Relay] Server terminated cleanly.');
      process.exit(0);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
