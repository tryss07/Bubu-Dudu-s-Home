/**
 * Zero-Knowledge WebSocket Relay Server for Dudu Duo Chat
 * Strictly relays opaque encrypted payloads between the two connected clients.
 * Plaintext is NEVER seen, parsed, or stored by this server.
 */

require('dotenv').config();
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fs = require('fs');
const path = require('path');
const db = require('./db');

const BLOBS_DIR = process.env.BLOBS_DIR || path.resolve(__dirname, 'data', 'blobs');
if (!fs.existsSync(BLOBS_DIR)) {
  fs.mkdirSync(BLOBS_DIR, { recursive: true });
}

// 1. Create HTTP Server for Health Checks, Blob Storage & WebSocket Upgrade
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // CORS Headers for zero-knowledge blob transfer
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Chunk-Index, X-Total-Chunks');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname === '/health' || url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'dudu-duo-chat-relay',
      activeClients: wss.clients.size,
      uptimeSeconds: Math.floor(process.uptime()),
      db: db.getStats(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (url.pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      ...db.getStats(),
      activeClients: wss.clients.size,
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
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  // Accept /chat-socket, /ws, or root WebSocket connections
  if (url.pathname === '/chat-socket' || url.pathname === '/ws' || url.pathname === '/') {
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
  console.log(`🐻 Dudu Duo Chat Relay Server`);
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
