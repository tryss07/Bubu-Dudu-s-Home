/**
 * Dudu Duo Chat - Server-side Cloud Storage Database
 * Stores E2EE encrypted chat messages, stickers, and media on the 512GB HDD.
 * Zero-Knowledge Architecture: Server only stores opaque ciphertext (iv, ciphertext).
 * Native node:sqlite with resilient JSON fallback.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'chat.db');
const BACKUP_JSON_PATH = path.join(DATA_DIR, 'messages_fallback.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = null;
let useFallback = false;
let fallbackMemoryMessages = [];

// Try initializing native node:sqlite
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  
  // Enable WAL mode for high performance on HDD
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      iv TEXT NOT NULL,
      ciphertext TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages (session_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp);

    CREATE TABLE IF NOT EXISTS presence (
      identity TEXT PRIMARY KEY,
      online INTEGER NOT NULL DEFAULT 0,
      last_seen INTEGER NOT NULL
    );
    -- Reset all online states to 0 on server startup
    UPDATE presence SET online = 0;

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '💬',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_activity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      val TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tummy_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT,
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      spice_level INTEGER,
      portion_level INTEGER,
      penalty INTEGER,
      status TEXT,
      note TEXT,
      eater TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS push_tokens (
      identity TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const seeded = db.prepare("SELECT val FROM meta WHERE key = 'seeded_topics'").get();
  if (!seeded) {
    const insertTopic = db.prepare(`
      INSERT OR REPLACE INTO topics (id, title, emoji, is_pinned, is_archived, created_at, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const DEFAULT_TOPICS = [
      { id: 'daily_banter', title: 'Daily Banter', emoji: '💬', isPinned: 1, isArchived: 0, createdAt: 1728000000000, lastActivity: Date.now() },
      { id: 'date_ideas', title: 'Date Ideas', emoji: '🍱', isPinned: 0, isArchived: 0, createdAt: 1728000000000, lastActivity: Date.now() - 3600000 },
      { id: 'watchlist', title: 'Watchlist', emoji: '🎬', isPinned: 0, isArchived: 0, createdAt: 1728000000000, lastActivity: Date.now() - 7200000 },
      { id: 'vent_space', title: 'Vent Space', emoji: '🧸', isPinned: 0, isArchived: 0, createdAt: 1728000000000, lastActivity: Date.now() - 10800000 },
      { id: 'deep_talks', title: 'Deep Talks', emoji: '🌙', isPinned: 0, isArchived: 0, createdAt: 1728000000000, lastActivity: Date.now() - 14400000 }
    ];
    DEFAULT_TOPICS.forEach(t => {
      insertTopic.run(t.id, t.title, t.emoji, t.isPinned ? 1 : 0, t.isArchived ? 1 : 0, t.createdAt, t.lastActivity);
    });
    db.prepare("INSERT OR REPLACE INTO meta (key, val) VALUES ('seeded_topics', '1')").run();
    console.log('[Database] Seeded default chat topics in SQLite');
  }

  console.log(`[Database] SQLite initialized at ${DB_PATH} (WAL mode)`);
} catch (err) {
  console.warn(`[Database] Native node:sqlite not available (${err.message}). Using resilient JSON file fallback.`);
  useFallback = true;
  if (fs.existsSync(BACKUP_JSON_PATH)) {
    try {
      fallbackMemoryMessages = JSON.parse(fs.readFileSync(BACKUP_JSON_PATH, 'utf8'));
    } catch (e) {
      fallbackMemoryMessages = [];
    }
  }
}

function persistFallback() {
  try {
    fs.writeFileSync(BACKUP_JSON_PATH, JSON.stringify(fallbackMemoryMessages, null, 2));
  } catch (err) {
    console.error('[Database] Error saving fallback JSON:', err.message);
  }
}

/**
 * Save an encrypted message packet to server storage
 */
function saveMessage(msg) {
  if (!msg || !msg.iv || !msg.ciphertext) {
    return false;
  }

  const id = String(msg.id || ('msg_' + msg.iv.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)));
  const sessionId = String(msg.sessionId || 'default');
  const sender = String(msg.sender || 'unknown');
  const type = String(msg.type || 'text');
  const iv = String(msg.iv);
  const ciphertext = String(msg.ciphertext);
  const timestamp = Number(msg.timestamp || Date.now());
  const createdAt = Date.now();

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO messages (id, session_id, sender, type, iv, ciphertext, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, sessionId, sender, type, iv, ciphertext, timestamp, createdAt);
      return true;
    } catch (err) {
      console.error('[Database] SQLite insert error:', err.message);
      return false;
    }
  } else {
    const existingIndex = fallbackMemoryMessages.findIndex(m => m.id === id);
    const record = { id, session_id: sessionId, sender, type, iv, ciphertext, timestamp, created_at: createdAt };
    if (existingIndex >= 0) {
      fallbackMemoryMessages[existingIndex] = record;
    } else {
      fallbackMemoryMessages.push(record);
    }
    persistFallback();
    return true;
  }
}

/**
 * Get messages newer than a given timestamp for sync
 */
function getMessagesSince(sinceTimestamp = 0, limit = 500) {
  const ts = Number(sinceTimestamp || 0);
  const lim = Math.min(Number(limit || 500), 2000);

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        SELECT id, session_id as sessionId, sender, type, iv, ciphertext, timestamp
        FROM messages
        WHERE timestamp > ?
        ORDER BY timestamp ASC
        LIMIT ?
      `);
      return stmt.all(ts, lim);
    } catch (err) {
      console.error('[Database] SQLite query error:', err.message);
      return [];
    }
  } else {
    return fallbackMemoryMessages
      .filter(m => m.timestamp > ts)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, lim)
      .map(m => ({
        id: m.id,
        sessionId: m.session_id,
        sender: m.sender,
        type: m.type,
        iv: m.iv,
        ciphertext: m.ciphertext,
        timestamp: m.timestamp
      }));
  }
}

/**
 * Delete all messages belonging to a session
 */
function deleteTopicMessages(sessionId) {
  if (!sessionId) return 0;
  const sid = String(sessionId);

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`DELETE FROM messages WHERE session_id = ?`);
      const info = stmt.run(sid);
      return info.changes;
    } catch (err) {
      console.error('[Database] SQLite delete error:', err.message);
      return 0;
    }
  } else {
    const initialLen = fallbackMemoryMessages.length;
    fallbackMemoryMessages = fallbackMemoryMessages.filter(m => m.session_id !== sid);
    persistFallback();
    return initialLen - fallbackMemoryMessages.length;
  }
}

/**
 * Wipe all messages from database
 */
function clearAllMessages() {
  if (!useFallback && db) {
    try {
      db.exec('DELETE FROM messages;');
      return true;
    } catch (err) {
      console.error('[Database] SQLite clear error:', err.message);
      return false;
    }
  } else {
    fallbackMemoryMessages = [];
    persistFallback();
    return true;
  }
}

/**
 * Delete a single message by ID
 */
function deleteMessage(messageId) {
  if (!messageId) return false;
  const mid = String(messageId);

  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
      const res = stmt.run(mid);
      return res.changes > 0;
    } catch (err) {
      console.error('[Database] SQLite deleteMessage error:', err.message);
      return false;
    }
  } else {
    const idx = fallbackMemoryMessages.findIndex(m => m.id === mid);
    if (idx >= 0) {
      fallbackMemoryMessages.splice(idx, 1);
      persistFallback();
      return true;
    }
    return false;
  }
}

/**
 * Get database statistics
 */
function getStats() {
  let count = 0;
  let dbSizeBytes = 0;

  if (fs.existsSync(DB_PATH)) {
    try {
      dbSizeBytes = fs.statSync(DB_PATH).size;
    } catch (e) {}
  } else if (fs.existsSync(BACKUP_JSON_PATH)) {
    try {
      dbSizeBytes = fs.statSync(BACKUP_JSON_PATH).size;
    } catch (e) {}
  }

  if (!useFallback && db) {
    try {
      const res = db.prepare('SELECT COUNT(*) as count FROM messages').get();
      count = res ? res.count : 0;
    } catch (e) {}
  } else {
    count = fallbackMemoryMessages.length;
  }

  return {
    engine: useFallback ? 'json_fallback' : 'sqlite',
    totalMessages: count,
    dbSizeBytes,
    dbPath: useFallback ? BACKUP_JSON_PATH : DB_PATH
  };
}

/**
 * Presence & Last Seen Tracking
 */
function setPresence(identity, isOnline) {
  if (!identity) return;
  const ident = String(identity).toLowerCase().includes('dudu') || String(identity).toLowerCase().includes('kevin') ? 'dudu' : 'bubu';
  const online = isOnline ? 1 : 0;
  const lastSeen = Date.now();

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO presence (identity, online, last_seen)
        VALUES (?, ?, ?)
      `);
      stmt.run(ident, online, lastSeen);
    } catch (e) {
      console.error('[Database] setPresence error:', e.message);
    }
  }
}

function getAllPresence() {
  const result = {
    dudu: { online: false, lastSeen: null },
    bubu: { online: false, lastSeen: null }
  };

  if (!useFallback && db) {
    try {
      const rows = db.prepare('SELECT identity, online, last_seen FROM presence').all();
      for (const row of rows) {
        if (result[row.identity]) {
          result[row.identity] = {
            online: row.online === 1,
            lastSeen: row.last_seen
          };
        }
      }
    } catch (e) {
      console.error('[Database] getAllPresence error:', e.message);
    }
  }

  return result;
}

function getPresence(identity) {
  const all = getAllPresence();
  const ident = String(identity || '').toLowerCase().includes('dudu') || String(identity || '').toLowerCase().includes('kevin') ? 'dudu' : 'bubu';
  return all[ident] || { online: false, lastSeen: null };
}

/**
 * Topic / Multi-Session Synchronization
 */
let fallbackTopics = [
  { id: 'daily_banter', title: 'Daily Banter', emoji: '💬', isPinned: true, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() },
  { id: 'date_ideas', title: 'Date Ideas', emoji: '🍱', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 3600000 },
  { id: 'watchlist', title: 'Watchlist', emoji: '🎬', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 7200000 },
  { id: 'vent_space', title: 'Vent Space', emoji: '🧸', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 10800000 },
  { id: 'deep_talks', title: 'Deep Talks', emoji: '🌙', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 14400000 }
];

function getAllTopics() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, title, emoji, is_pinned as isPinned, is_archived as isArchived, created_at as createdAt, last_activity as lastActivity
        FROM topics
        ORDER BY is_pinned DESC, last_activity DESC
      `).all();
      return rows.map(r => ({
        id: r.id,
        title: r.title,
        emoji: r.emoji,
        isPinned: r.isPinned === 1,
        isArchived: r.isArchived === 1,
        createdAt: r.createdAt,
        lastActivity: r.lastActivity
      }));
    } catch (e) {
      console.error('[Database] getAllTopics error:', e.message);
      return [];
    }
  } else {
    return fallbackTopics;
  }
}

function saveTopic(topic) {
  if (!topic || !topic.id || !topic.title) return false;
  const id = String(topic.id);
  const title = String(topic.title);
  const emoji = String(topic.emoji || '💬');
  const isPinned = topic.isPinned ? 1 : 0;
  const isArchived = topic.isArchived ? 1 : 0;
  const createdAt = Number(topic.createdAt || Date.now());
  const lastActivity = Number(topic.lastActivity || Date.now());

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO topics (id, title, emoji, is_pinned, is_archived, created_at, last_activity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, emoji, isPinned, isArchived, createdAt, lastActivity);
      return true;
    } catch (e) {
      console.error('[Database] saveTopic error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackTopics.findIndex(t => t.id === id);
    const item = { id, title, emoji, isPinned: !!isPinned, isArchived: !!isArchived, createdAt, lastActivity };
    if (idx >= 0) fallbackTopics[idx] = item;
    else fallbackTopics.push(item);
    return true;
  }
}

function deleteTopic(sessionId) {
  if (!sessionId) return false;
  const sid = String(sessionId);

  deleteTopicMessages(sid);

  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM topics WHERE id = ?');
      const res = stmt.run(sid);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deleteTopic error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackTopics.findIndex(t => t.id === sid);
    if (idx >= 0) {
      fallbackTopics.splice(idx, 1);
      return true;
    }
    return false;
  }
}

function clearAllTopics() {
  clearAllMessages();
  if (!useFallback && db) {
    try {
      db.exec('DELETE FROM topics;');
      return true;
    } catch (e) {
      console.error('[Database] clearAllTopics error:', e.message);
      return false;
    }
  } else {
    fallbackTopics = [];
    return true;
  }
}

/**
 * Tummy Logs / Health Tracking Synchronization
 */
let fallbackTummyLogs = [];

function getAllTummyLogs() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, date, time, item, category, spice_level as spiceLevel, portion_level as portionLevel,
               penalty, status, note, eater, created_at as createdAt
        FROM tummy_logs
        ORDER BY date DESC, time DESC, created_at DESC
      `).all();
      return rows;
    } catch (e) {
      console.error('[Database] getAllTummyLogs error:', e.message);
      return [];
    }
  } else {
    return fallbackTummyLogs;
  }
}

function saveTummyLog(log) {
  if (!log || !log.id || !log.item) return false;
  const id = String(log.id);
  const date = String(log.date || new Date().toISOString().split('T')[0]);
  const time = String(log.time || '');
  const item = String(log.item);
  const category = String(log.category || 'spicy');
  const spiceLevel = log.spiceLevel !== null && log.spiceLevel !== undefined ? Number(log.spiceLevel) : null;
  const portionLevel = log.portionLevel !== null && log.portionLevel !== undefined ? Number(log.portionLevel) : null;
  const penalty = Number(log.penalty || 0);
  const status = String(log.status || 'safe');
  const note = String(log.note || '');
  const eater = String(log.eater || 'Bubu');
  const createdAt = Number(log.createdAt || Date.now());

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO tummy_logs (id, date, time, item, category, spice_level, portion_level, penalty, status, note, eater, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, date, time, item, category, spiceLevel, portionLevel, penalty, status, note, eater, createdAt);
      return true;
    } catch (e) {
      console.error('[Database] saveTummyLog error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackTummyLogs.findIndex(l => l.id === id);
    const entry = { id, date, time, item, category, spiceLevel, portionLevel, penalty, status, note, eater, createdAt };
    if (idx >= 0) fallbackTummyLogs[idx] = entry;
    else fallbackTummyLogs.unshift(entry);
    return true;
  }
}

function deleteTummyLog(id) {
  if (!id) return false;
  const logId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM tummy_logs WHERE id = ?');
      const res = stmt.run(logId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deleteTummyLog error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackTummyLogs.findIndex(l => l.id === logId);
    if (idx >= 0) {
      fallbackTummyLogs.splice(idx, 1);
      return true;
    }
    return false;
  }
}

function clearAllTummyLogs() {
  if (!useFallback && db) {
    try {
      db.exec('DELETE FROM tummy_logs;');
      return true;
    } catch (e) {
      console.error('[Database] clearAllTummyLogs error:', e.message);
      return false;
    }
  } else {
    fallbackTummyLogs = [];
    return true;
  }
}

let fallbackPushTokens = {};

function savePushToken(identity, token) {
  const norm = String(identity || '').toLowerCase().includes('dudu') || String(identity || '').toLowerCase().includes('kevin') ? 'dudu' : 'bubu';
  if (!token) return false;
  if (!useFallback && db) {
    try {
      db.prepare(`
        INSERT OR REPLACE INTO push_tokens (identity, token, updated_at)
        VALUES (?, ?, ?)
      `).run(norm, String(token), Date.now());
      return true;
    } catch (e) {
      console.error('[Database] savePushToken error:', e.message);
      return false;
    }
  } else {
    fallbackPushTokens[norm] = String(token);
    return true;
  }
}

function getPushToken(identity) {
  const norm = String(identity || '').toLowerCase().includes('dudu') || String(identity || '').toLowerCase().includes('kevin') ? 'dudu' : 'bubu';
  if (!useFallback && db) {
    try {
      const row = db.prepare('SELECT token FROM push_tokens WHERE identity = ?').get(norm);
      return row ? row.token : null;
    } catch (e) {
      console.error('[Database] getPushToken error:', e.message);
      return null;
    }
  } else {
    return fallbackPushTokens[norm] || null;
  }
}

module.exports = {
  saveMessage,
  getMessagesSince,
  deleteMessage,
  deleteTopicMessages,
  clearAllMessages,
  getAllTopics,
  saveTopic,
  deleteTopic,
  clearAllTopics,
  getAllTummyLogs,
  saveTummyLog,
  deleteTummyLog,
  clearAllTummyLogs,
  getStats,
  setPresence,
  getAllPresence,
  getPresence,
  savePushToken,
  getPushToken
};
