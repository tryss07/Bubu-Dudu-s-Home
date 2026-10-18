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
const STATE_JSON_PATH = path.join(DATA_DIR, 'state_fallback.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = null;
let useFallback = false;
let fallbackMemoryMessages = [];
let fallbackPresence = {
  dudu: { online: false, lastSeen: null },
  bubu: { online: false, lastSeen: null }
};

let fallbackTopics = [
  { id: 'daily_banter', title: 'Daily Banter', emoji: '💬', isPinned: true, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() },
  { id: 'date_ideas', title: 'Date Ideas', emoji: '🍱', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 3600000 },
  { id: 'watchlist', title: 'Watchlist', emoji: '🎬', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 7200000 },
  { id: 'vent_space', title: 'Vent Space', emoji: '🧸', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 10800000 },
  { id: 'deep_talks', title: 'Deep Talks', emoji: '🌙', isPinned: false, isArchived: false, createdAt: 1728000000000, lastActivity: Date.now() - 14400000 }
];

let fallbackTummyLogs = [];
let fallbackPushTokens = {};

let fallbackCalendarEvents = [
  { id: 'cal_1', date: 10, month: 9, year: 2026, title: 'Picnic Date 🧺', icon: '🧺', createdAt: 1728000000000 },
  { id: 'cal_2', date: 24, month: 9, year: 2026, title: 'Anniversary Cake Prep 🎂', icon: '🎂', createdAt: 1728000000000 },
  { id: 'cal_3', date: 26, month: 9, year: 2026, title: 'Our 100th Day Celebration! 🤎', icon: '🐻🐼', createdAt: 1728000000000 }
];

let fallbackPlannerItems = [
  { id: 'bl_1', title: 'Cozy coffee shop date ☕🍂', desc: 'Find a warm local café, order seasonal lattes, and read or sketch together. Include polaroid photos.', plannedDate: '26 June • 12:30 PM', statusBadge: 'Ready to Go', category: 'indoor', completed: true, image: 'assets/mockup_art/date_coffee.png', createdAt: 1728000000000 },
  { id: 'bl_2', title: 'Stargazing trip ✨🏕️', desc: 'Drive out of the city, pack a cozy blanket, and look at the night sky. Point out constellations.', plannedDate: 'Next weekend', statusBadge: 'Added today', category: 'outdoor', completed: false, image: 'assets/mockup_art/date_stargazing.png', createdAt: 1728000000000 - 86400000 },
  { id: 'bl_3', title: 'Bake a sweet treat together 🍰🧑‍🍳', desc: 'Try baking a messy chocolate cake or cookies from scratch.', plannedDate: 'Rainy Sunday', statusBadge: 'Done!', category: 'indoor', completed: true, image: 'assets/mockup_art/date_baking.png', createdAt: 1728000000000 - 172800000 },
  { id: 'bl_4', title: 'Autumn foliage stroll 🍁', desc: 'Walk through the park with warm knit scarves, crunch leaves, and take cute polaroids.', plannedDate: 'October 2026', statusBadge: 'Ready to Go', category: 'outdoor', completed: false, image: 'assets/mockup_art/polaroid_autumn.png', createdAt: 1728000000000 - 259200000 },
  { id: 'bl_5', title: 'Nintendo Switch cozy marathon 🎮', desc: 'Play Animal Crossing or Mario Kart while sharing warm hot cocoa and fluffy marshmallows.', plannedDate: 'Friday Night', statusBadge: 'Ready to Go', category: 'indoor', completed: true, image: 'assets/mockup_art/minigame_switch.png', createdAt: 1728000000000 - 345600000 }
];

let fallbackNotes = [
  { id: 'note_1', style: 'envelope', body: "Can't wait to see you tonight! Bring your cozy sweater... 💌", sender: 'Dudu 🐻', senderRole: 'dudu', time: '10:15 AM', date: 'Today', isFavorite: true, isRead: false, createdAt: 1728000000000 },
  { id: 'note_2', style: 'craft', body: 'You are my favorite person to drink warm tea with. Have a lovely afternoon, Bubu! ☕✨', sender: 'Honey', senderRole: 'dudu', time: 'Yesterday', date: 'Yesterday', isFavorite: true, isRead: true, createdAt: 1728000000000 - 86400000 },
  { id: 'note_3', style: 'card', body: 'Reminding you to smile today! You got this! 💪❤️', sender: 'Dudu 🐻', senderRole: 'dudu', time: '2 days ago', date: '2 days ago', isFavorite: false, isRead: true, createdAt: 1728000000000 - 172800000 }
];

let fallbackPolaroids = [
  { id: 'pol_1', title: 'Cafe date', date: 'Oct 10', image: 'assets/mockup_art/polaroid_cafe.png', tape: 'washi-tape-grid', rotate: -2, createdAt: 1728000000000 },
  { id: 'pol_2', title: 'Picnic day', date: 'Sep 28', image: 'assets/mockup_art/polaroid_picnic.png', tape: 'washi-tape-grid', rotate: 1.5, createdAt: 1728000000000 - 86400000 },
  { id: 'pol_3', title: 'Sunset gaze', date: 'Sep 24', image: 'assets/mockup_art/polaroid_sunset.png', tape: 'washi-tape-peach', rotate: -1, createdAt: 1728000000000 - 172800000 },
  { id: 'pol_4', title: 'Autumn walk', date: 'Oct 05', image: 'assets/mockup_art/polaroid_autumn.png', tape: 'washi-tape-grid', rotate: 2, createdAt: 1728000000000 - 259200000 }
];

let fallbackMilestones = [
  { id: 'ms_1', title: '100th Day Anniversary 🤎', date: 'October 12th', desc: 'celebrated with sweet cake & walks 🐻🐼', createdAt: 1728000000000 },
  { id: 'ms_2', title: 'First Photo in the Jar', date: 'September 15th', desc: 'the rainy day we started our memory jar', createdAt: 1728000000000 - 86400000 },
  { id: 'ms_3', title: 'Cozy Autumn Picnic 🧺', date: 'September 28th', desc: 'warm blankets, honey sandwiches & soft wind', createdAt: 1728000000000 - 172800000 }
];

let fallbackCoupleSpace = {
  anniversaryDate: '2025-11-04',
  loveBattery: 100,
  statuses: {
    dudu: 'Thinking of you! 💭',
    bubu: 'Eating snacks! 🐼'
  },
  wardrobe: {
    dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
    bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
  },
  miniGameHighScore: 420
};

function persistFallbackState() {
  if (!useFallback) return;
  try {
    fs.writeFileSync(STATE_JSON_PATH, JSON.stringify({
      topics: fallbackTopics,
      tummyLogs: fallbackTummyLogs,
      pushTokens: fallbackPushTokens,
      calendarEvents: fallbackCalendarEvents,
      plannerItems: fallbackPlannerItems,
      notes: fallbackNotes,
      polaroids: fallbackPolaroids,
      milestones: fallbackMilestones,
      coupleSpace: fallbackCoupleSpace,
      presence: fallbackPresence
    }, null, 2));
  } catch (err) {
    console.error('[Database] Error saving fallback state JSON:', err.message);
  }
}

function loadFallbackState() {
  if (!fs.existsSync(STATE_JSON_PATH)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_JSON_PATH, 'utf8'));
    if (Array.isArray(parsed.topics)) fallbackTopics = parsed.topics;
    if (Array.isArray(parsed.tummyLogs)) fallbackTummyLogs = parsed.tummyLogs;
    if (parsed.pushTokens && typeof parsed.pushTokens === 'object') fallbackPushTokens = parsed.pushTokens;
    if (Array.isArray(parsed.calendarEvents)) fallbackCalendarEvents = parsed.calendarEvents;
    if (Array.isArray(parsed.plannerItems)) fallbackPlannerItems = parsed.plannerItems;
    if (Array.isArray(parsed.notes)) fallbackNotes = parsed.notes;
    if (Array.isArray(parsed.polaroids)) fallbackPolaroids = parsed.polaroids;
    if (Array.isArray(parsed.milestones)) fallbackMilestones = parsed.milestones;
    if (parsed.coupleSpace && typeof parsed.coupleSpace === 'object') {
      const defaultW = {
        dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
        bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
      };
      fallbackCoupleSpace = {
        ...fallbackCoupleSpace,
        ...parsed.coupleSpace,
        wardrobe: {
          dudu: { ...defaultW.dudu, ...(fallbackCoupleSpace.wardrobe?.dudu || {}), ...(parsed.coupleSpace.wardrobe?.dudu || {}) },
          bubu: { ...defaultW.bubu, ...(fallbackCoupleSpace.wardrobe?.bubu || {}), ...(parsed.coupleSpace.wardrobe?.bubu || {}) }
        }
      };
    }
    if (parsed.presence && typeof parsed.presence === 'object') {
      fallbackPresence = {
        dudu: { online: false, lastSeen: parsed.presence.dudu?.lastSeen || null },
        bubu: { online: false, lastSeen: parsed.presence.bubu?.lastSeen || null }
      };
    }
  } catch (e) {
    console.warn('[Database] Failed loading state_fallback.json:', e.message);
  }
}

// Try initializing native node:sqlite
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);

  // Enable WAL mode for high performance on HDD
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Create tables
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

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '❤️',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events (year, month, date);

    CREATE TABLE IF NOT EXISTS planner_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      desc TEXT,
      planned_date TEXT,
      status_badge TEXT,
      category TEXT NOT NULL DEFAULT 'indoor',
      completed INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS love_notes (
      id TEXT PRIMARY KEY,
      style TEXT NOT NULL DEFAULT 'envelope',
      body TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      time TEXT,
      date TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notes_created ON love_notes (created_at DESC);

    CREATE TABLE IF NOT EXISTS polaroids (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      image TEXT NOT NULL,
      tape TEXT NOT NULL DEFAULT 'washi-tape-grid',
      rotate REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      desc TEXT,
      created_at INTEGER NOT NULL,
      iv TEXT,
      ciphertext TEXT
    );

    CREATE TABLE IF NOT EXISTS couple_space (
      key TEXT PRIMARY KEY,
      val TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Auto-migrate tables for Zero-Knowledge E2EE fields (iv, ciphertext)
  const tablesToMigrate = ['calendar_events', 'planner_items', 'love_notes', 'polaroids', 'milestones', 'topics', 'tummy_logs'];
  tablesToMigrate.forEach(table => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN iv TEXT;`); } catch (_) {}
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ciphertext TEXT;`); } catch (_) {}
  });

  const seeded = db.prepare("SELECT val FROM meta WHERE key = 'seeded_topics'").get();
  if (!seeded) {
    const insertTopic = db.prepare(`
      INSERT OR REPLACE INTO topics (id, title, emoji, is_pinned, is_archived, created_at, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    fallbackTopics.forEach(t => {
      insertTopic.run(t.id, t.title, t.emoji, t.isPinned ? 1 : 0, t.isArchived ? 1 : 0, t.createdAt, t.lastActivity);
    });
    db.prepare("INSERT OR REPLACE INTO meta (key, val) VALUES ('seeded_topics', '1')").run();
    console.log('[Database] Seeded default chat topics in SQLite');
  }

  const seededFeatures = db.prepare("SELECT val FROM meta WHERE key = 'seeded_features_v1'").get();
  if (!seededFeatures) {
    const insertCal = db.prepare(`
      INSERT OR REPLACE INTO calendar_events (id, date, month, year, title, icon, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    fallbackCalendarEvents.forEach(c => insertCal.run(c.id, c.date, c.month, c.year, c.title, c.icon, c.createdAt));

    const insertPlanner = db.prepare(`
      INSERT OR REPLACE INTO planner_items (id, title, desc, planned_date, status_badge, category, completed, image, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    fallbackPlannerItems.forEach(p => insertPlanner.run(p.id, p.title, p.desc, p.plannedDate, p.statusBadge, p.category, p.completed ? 1 : 0, p.image, p.createdAt));

    const insertNote = db.prepare(`
      INSERT OR REPLACE INTO love_notes (id, style, body, sender, sender_role, time, date, is_favorite, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    fallbackNotes.forEach(n => insertNote.run(n.id, n.style, n.body, n.sender, n.senderRole, n.time, n.date, n.isFavorite ? 1 : 0, n.isRead ? 1 : 0, n.createdAt));

    const insertPol = db.prepare(`
      INSERT OR REPLACE INTO polaroids (id, title, date, image, tape, rotate, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    fallbackPolaroids.forEach(p => insertPol.run(p.id, p.title, p.date, p.image, p.tape, p.rotate, p.createdAt));

    const insertMs = db.prepare(`
      INSERT OR REPLACE INTO milestones (id, title, date, desc, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    fallbackMilestones.forEach(m => insertMs.run(m.id, m.title, m.date, m.desc, m.createdAt));

    const insertCouple = db.prepare(`
      INSERT OR REPLACE INTO couple_space (key, val, updated_at)
      VALUES (?, ?, ?)
    `);
    insertCouple.run('anniversary_date', '2025-11-04', Date.now());
    insertCouple.run('love_battery', '100', Date.now());
    insertCouple.run('status_dudu', 'Thinking of you! 💭', Date.now());
    insertCouple.run('status_bubu', 'Eating snacks! 🐼', Date.now());
    insertCouple.run('wardrobe_dudu', JSON.stringify(fallbackCoupleSpace.wardrobe.dudu), Date.now());
    insertCouple.run('wardrobe_bubu', JSON.stringify(fallbackCoupleSpace.wardrobe.bubu), Date.now());
    insertCouple.run('minigame_high_score', '420', Date.now());

    db.prepare("INSERT OR REPLACE INTO meta (key, val) VALUES ('seeded_features_v1', '1')").run();
    console.log('[Database] Seeded calendar, planner, notes, memories, and couple space in SQLite');
  }

  // Ensure wardrobe & minigame rows exist even if SQLite database was created prior to wardrobe feature
  try {
    const hasWardrobe = db.prepare("SELECT val FROM couple_space WHERE key = 'wardrobe_dudu'").get();
    if (!hasWardrobe) {
      const insertCouple = db.prepare("INSERT OR REPLACE INTO couple_space (key, val, updated_at) VALUES (?, ?, ?)");
      insertCouple.run('wardrobe_dudu', JSON.stringify(fallbackCoupleSpace.wardrobe.dudu), Date.now());
      insertCouple.run('wardrobe_bubu', JSON.stringify(fallbackCoupleSpace.wardrobe.bubu), Date.now());
      insertCouple.run('minigame_high_score', '420', Date.now());
      console.log('[Database] Migrated & initialized wardrobe state in SQLite');
    }
  } catch (mErr) {
    console.warn('[Database] Wardrobe migration check warning:', mErr.message);
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
  loadFallbackState();
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
  } else {
    fallbackPresence[ident] = {
      online: Boolean(online),
      lastSeen
    };
    persistFallbackState();
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
  } else {
    return {
      dudu: { ...(fallbackPresence.dudu || { online: false, lastSeen: null }) },
      bubu: { ...(fallbackPresence.bubu || { online: false, lastSeen: null }) }
    };
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
function getAllTopics() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, title, emoji, is_pinned as isPinned, is_archived as isArchived,
               created_at as createdAt, last_activity as lastActivity, iv, ciphertext
        FROM topics
        ORDER BY is_pinned DESC, last_activity DESC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return {
            id: r.id,
            iv: r.iv,
            ciphertext: r.ciphertext,
            isPinned: r.isPinned === 1,
            isArchived: r.isArchived === 1,
            createdAt: r.createdAt,
            lastActivity: r.lastActivity,
            isEncrypted: true
          };
        }
        return {
          id: r.id,
          title: r.title,
          emoji: r.emoji,
          isPinned: r.isPinned === 1,
          isArchived: r.isArchived === 1,
          createdAt: r.createdAt,
          lastActivity: r.lastActivity
        };
      });
    } catch (e) {
      console.error('[Database] getAllTopics error:', e.message);
      return [];
    }
  } else {
    return fallbackTopics;
  }
}

function saveTopic(topic) {
  if (!topic || !topic.id) return false;
  const isEncrypted = Boolean(topic.ciphertext && topic.iv);
  if (!isEncrypted && !topic.title) return false;

  const id = String(topic.id);
  const title = String(topic.title || '[Encrypted]');
  const emoji = String(topic.emoji || '💬');
  const isPinned = topic.isPinned ? 1 : 0;
  const isArchived = topic.isArchived ? 1 : 0;
  const createdAt = Number(topic.createdAt || Date.now());
  const lastActivity = Number(topic.lastActivity || Date.now());
  const iv = isEncrypted ? String(topic.iv) : null;
  const ciphertext = isEncrypted ? String(topic.ciphertext) : null;

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO topics (id, title, emoji, is_pinned, is_archived, created_at, last_activity, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, emoji, isPinned, isArchived, createdAt, lastActivity, iv, ciphertext);
      return true;
    } catch (e) {
      console.error('[Database] saveTopic error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackTopics.findIndex(t => t.id === id);
    const item = isEncrypted
      ? { id, iv, ciphertext, isPinned: !!isPinned, isArchived: !!isArchived, createdAt, lastActivity, isEncrypted: true }
      : { id, title, emoji, isPinned: !!isPinned, isArchived: !!isArchived, createdAt, lastActivity };
    if (idx >= 0) fallbackTopics[idx] = item;
    else fallbackTopics.push(item);
    persistFallbackState();
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
      persistFallbackState();
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
    persistFallbackState();
    return true;
  }
}

/**
 * Tummy Logs / Health Tracking Synchronization
 */
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
    persistFallbackState();
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
      persistFallbackState();
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
    persistFallbackState();
    return true;
  }
}

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
    persistFallbackState();
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

/**
 * ============================================================================
 * Calendar Events Synchronization
 * ============================================================================
 */
function getAllCalendarEvents() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, date, month, year, title, icon, created_at as createdAt, iv, ciphertext
        FROM calendar_events
        ORDER BY year ASC, month ASC, date ASC, created_at ASC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return { id: r.id, iv: r.iv, ciphertext: r.ciphertext, createdAt: r.createdAt, isEncrypted: true };
        }
        const { iv, ciphertext, ...plain } = r;
        return plain;
      });
    } catch (e) {
      console.error('[Database] getAllCalendarEvents error:', e.message);
      return [];
    }
  } else {
    return fallbackCalendarEvents;
  }
}

function saveCalendarEvent(ev) {
  if (!ev) return null;
  const isEncrypted = Boolean(ev.ciphertext && ev.iv);
  if (!isEncrypted && !ev.title) return null;

  const id = String(ev.id || ('cal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)));
  const date = Number(ev.date || 1);
  const month = Number(ev.month !== undefined ? ev.month : 9);
  const year = Number(ev.year || new Date().getFullYear());
  const title = String(ev.title || '[Encrypted]');
  const icon = String(ev.icon || '❤️');
  const createdAt = Number(ev.createdAt || Date.now());
  const iv = isEncrypted ? String(ev.iv) : null;
  const ciphertext = isEncrypted ? String(ev.ciphertext) : null;

  const eventObj = isEncrypted
    ? { id, iv, ciphertext, createdAt, isEncrypted: true }
    : { id, date, month, year, title, icon, createdAt };

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO calendar_events (id, date, month, year, title, icon, created_at, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, date, month, year, title, icon, createdAt, iv, ciphertext);
      return eventObj;
    } catch (e) {
      console.error('[Database] saveCalendarEvent error:', e.message);
      return null;
    }
  } else {
    const idx = fallbackCalendarEvents.findIndex(c => c.id === id);
    if (idx >= 0) fallbackCalendarEvents[idx] = eventObj;
    else fallbackCalendarEvents.push(eventObj);
    persistFallbackState();
    return eventObj;
  }
}

function deleteCalendarEvent(id) {
  if (!id) return false;
  const calId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM calendar_events WHERE id = ?');
      const res = stmt.run(calId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deleteCalendarEvent error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackCalendarEvents.findIndex(c => c.id === calId);
    if (idx >= 0) {
      fallbackCalendarEvents.splice(idx, 1);
      persistFallbackState();
      return true;
    }
    return false;
  }
}

/**
 * ============================================================================
 * Planner Items / Bucket List Synchronization
 * ============================================================================
 */
function getAllPlannerItems() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, title, desc, planned_date as plannedDate, status_badge as statusBadge,
               category, completed, image, created_at as createdAt, iv, ciphertext
        FROM planner_items
        ORDER BY created_at DESC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return { id: r.id, iv: r.iv, ciphertext: r.ciphertext, createdAt: r.createdAt, isEncrypted: true };
        }
        const { iv, ciphertext, ...plain } = r;
        return { ...plain, completed: Boolean(plain.completed) };
      });
    } catch (e) {
      console.error('[Database] getAllPlannerItems error:', e.message);
      return [];
    }
  } else {
    return fallbackPlannerItems;
  }
}

function savePlannerItem(item) {
  if (!item) return null;
  const isEncrypted = Boolean(item.ciphertext && item.iv);
  if (!isEncrypted && !item.title) return null;

  const id = String(item.id || ('bl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)));
  const title = String(item.title || '[Encrypted]');
  const desc = String(item.desc || '');
  const plannedDate = String(item.plannedDate || '');
  const statusBadge = String(item.statusBadge || 'Ready');
  const category = String(item.category || 'indoor');
  const completed = item.completed ? 1 : 0;
  const image = String(item.image || '');
  const createdAt = Number(item.createdAt || Date.now());
  const iv = isEncrypted ? String(item.iv) : null;
  const ciphertext = isEncrypted ? String(item.ciphertext) : null;

  const savedObj = isEncrypted
    ? { id, iv, ciphertext, createdAt, isEncrypted: true }
    : { id, title, desc, plannedDate, statusBadge, category, completed: Boolean(completed), image, createdAt };

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO planner_items (id, title, desc, planned_date, status_badge, category, completed, image, created_at, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, desc, plannedDate, statusBadge, category, completed, image, createdAt, iv, ciphertext);
      return savedObj;
    } catch (e) {
      console.error('[Database] savePlannerItem error:', e.message);
      return null;
    }
  } else {
    const idx = fallbackPlannerItems.findIndex(b => b.id === id);
    if (idx >= 0) fallbackPlannerItems[idx] = savedObj;
    else fallbackPlannerItems.unshift(savedObj);
    persistFallbackState();
    return savedObj;
  }
}

function deletePlannerItem(id) {
  if (!id) return false;
  const itemId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM planner_items WHERE id = ?');
      const res = stmt.run(itemId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deletePlannerItem error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackPlannerItems.findIndex(b => b.id === itemId);
    if (idx >= 0) {
      fallbackPlannerItems.splice(idx, 1);
      persistFallbackState();
      return true;
    }
    return false;
  }
}

/**
 * ============================================================================
 * Love Notes Synchronization
 * ============================================================================
 */
function getAllNotes() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, style, body, sender, sender_role as senderRole, time, date,
               is_favorite as isFavorite, is_read as isRead, created_at as createdAt,
               iv, ciphertext
        FROM love_notes
        ORDER BY created_at DESC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return { id: r.id, iv: r.iv, ciphertext: r.ciphertext, createdAt: r.createdAt, isEncrypted: true };
        }
        const { iv, ciphertext, ...plain } = r;
        return { ...plain, isFavorite: Boolean(plain.isFavorite), isRead: Boolean(plain.isRead) };
      });
    } catch (e) {
      console.error('[Database] getAllNotes error:', e.message);
      return [];
    }
  } else {
    return fallbackNotes;
  }
}

function saveNote(note) {
  if (!note) return null;
  const isEncrypted = Boolean(note.ciphertext && note.iv);
  if (!isEncrypted && !note.body) return null;

  const id = String(note.id || ('note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)));
  const style = String(note.style || 'envelope');
  const body = String(note.body || '[Encrypted]');
  const sender = String(note.sender || 'Honey');
  const senderRole = String(note.senderRole || 'dudu');
  const time = String(note.time || 'Just now');
  const date = String(note.date || 'Today');
  const isFavorite = note.isFavorite ? 1 : 0;
  const isRead = note.isRead ? 1 : 0;
  const createdAt = Number(note.createdAt || Date.now());
  const iv = isEncrypted ? String(note.iv) : null;
  const ciphertext = isEncrypted ? String(note.ciphertext) : null;

  const noteObj = isEncrypted
    ? { id, iv, ciphertext, createdAt, isEncrypted: true }
    : { id, style, body, sender, senderRole, time, date, isFavorite: Boolean(isFavorite), isRead: Boolean(isRead), createdAt };

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO love_notes (id, style, body, sender, sender_role, time, date, is_favorite, is_read, created_at, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, style, body, sender, senderRole, time, date, isFavorite, isRead, createdAt, iv, ciphertext);
      return noteObj;
    } catch (e) {
      console.error('[Database] saveNote error:', e.message);
      return null;
    }
  } else {
    const idx = fallbackNotes.findIndex(n => n.id === id);
    if (idx >= 0) fallbackNotes[idx] = noteObj;
    else fallbackNotes.unshift(noteObj);
    persistFallbackState();
    return noteObj;
  }
}

function deleteNote(id) {
  if (!id) return false;
  const noteId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM love_notes WHERE id = ?');
      const res = stmt.run(noteId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deleteNote error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackNotes.findIndex(n => n.id === noteId);
    if (idx >= 0) {
      fallbackNotes.splice(idx, 1);
      persistFallbackState();
      return true;
    }
    return false;
  }
}

/**
 * ============================================================================
 * Memories (Polaroids & Milestones) Synchronization
 * ============================================================================
 */
function getAllPolaroids() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, title, date, image, tape, rotate, created_at as createdAt, iv, ciphertext
        FROM polaroids
        ORDER BY created_at DESC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return { id: r.id, iv: r.iv, ciphertext: r.ciphertext, createdAt: r.createdAt, isEncrypted: true };
        }
        const { iv, ciphertext, ...plain } = r;
        return { ...plain, isLegacyPlaintext: true };
      });
    } catch (e) {
      console.error('[Database] getAllPolaroids error:', e.message);
      return [];
    }
  } else {
    return fallbackPolaroids;
  }
}

function savePolaroid(p) {
  if (!p) return null;
  const isEncrypted = Boolean(p.ciphertext && p.iv);

  const id = String(p.id || ('pol_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)));
  const title = String(p.title || (isEncrypted ? '[Encrypted]' : 'Cozy Date'));
  const date = String(p.date || 'Today');
  const image = String(p.image || '');
  const tape = String(p.tape || 'washi-tape-grid');
  const rotate = Number(p.rotate || 0);
  const createdAt = Number(p.createdAt || Date.now());
  const iv = isEncrypted ? String(p.iv) : null;
  const ciphertext = isEncrypted ? String(p.ciphertext) : null;

  const polObj = isEncrypted
    ? { id, iv, ciphertext, createdAt, isEncrypted: true }
    : { id, title, date, image, tape, rotate, createdAt };

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO polaroids (id, title, date, image, tape, rotate, created_at, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, date, image, tape, rotate, createdAt, iv, ciphertext);
      return polObj;
    } catch (e) {
      console.error('[Database] savePolaroid error:', e.message);
      return null;
    }
  } else {
    const idx = fallbackPolaroids.findIndex(item => item.id === id);
    if (idx >= 0) fallbackPolaroids[idx] = polObj;
    else fallbackPolaroids.unshift(polObj);
    persistFallbackState();
    return polObj;
  }
}

function deletePolaroid(id) {
  if (!id) return false;
  const polId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM polaroids WHERE id = ?');
      const res = stmt.run(polId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deletePolaroid error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackPolaroids.findIndex(p => p.id === polId);
    if (idx >= 0) {
      fallbackPolaroids.splice(idx, 1);
      persistFallbackState();
      return true;
    }
    return false;
  }
}

function getAllMilestones() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare(`
        SELECT id, title, date, desc, created_at as createdAt, iv, ciphertext
        FROM milestones
        ORDER BY created_at ASC
      `).all();
      return rows.map(r => {
        if (r.iv && r.ciphertext) {
          return { id: r.id, iv: r.iv, ciphertext: r.ciphertext, createdAt: r.createdAt, isEncrypted: true };
        }
        const { iv, ciphertext, ...plain } = r;
        return plain;
      });
    } catch (e) {
      console.error('[Database] getAllMilestones error:', e.message);
      return [];
    }
  } else {
    return fallbackMilestones;
  }
}

function saveMilestone(m) {
  if (!m) return null;
  const isEncrypted = Boolean(m.ciphertext && m.iv);
  if (!isEncrypted && !m.title) return null;

  const id = String(m.id || ('ms_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)));
  const title = String(m.title || '[Encrypted]');
  const date = String(m.date || 'Today');
  const desc = String(m.desc || '');
  const createdAt = Number(m.createdAt || Date.now());
  const iv = isEncrypted ? String(m.iv) : null;
  const ciphertext = isEncrypted ? String(m.ciphertext) : null;

  const msObj = isEncrypted
    ? { id, iv, ciphertext, createdAt, isEncrypted: true }
    : { id, title, date, desc, createdAt };

  if (!useFallback && db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO milestones (id, title, date, desc, created_at, iv, ciphertext)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, date, desc, createdAt, iv, ciphertext);
      return msObj;
    } catch (e) {
      console.error('[Database] saveMilestone error:', e.message);
      return null;
    }
  } else {
    const idx = fallbackMilestones.findIndex(item => item.id === id);
    if (idx >= 0) fallbackMilestones[idx] = msObj;
    else fallbackMilestones.push(msObj);
    persistFallbackState();
    return msObj;
  }
}

function deleteMilestone(id) {
  if (!id) return false;
  const msId = String(id);
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('DELETE FROM milestones WHERE id = ?');
      const res = stmt.run(msId);
      return res.changes > 0;
    } catch (e) {
      console.error('[Database] deleteMilestone error:', e.message);
      return false;
    }
  } else {
    const idx = fallbackMilestones.findIndex(m => m.id === msId);
    if (idx >= 0) {
      fallbackMilestones.splice(idx, 1);
      persistFallbackState();
      return true;
    }
    return false;
  }
}

/**
 * ============================================================================
 * Couple Space (Anniversary, Love Battery, Statuses)
 * ============================================================================
 */
const DEFAULT_WARDROBE = {
  dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
  bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
};

function getCoupleSpace() {
  if (!useFallback && db) {
    try {
      const rows = db.prepare('SELECT key, val FROM couple_space').all();
      const map = {};
      rows.forEach(r => { map[r.key] = r.val; });
      let duduW = { ...DEFAULT_WARDROBE.dudu, ...(fallbackCoupleSpace?.wardrobe?.dudu || {}) };
      let bubuW = { ...DEFAULT_WARDROBE.bubu, ...(fallbackCoupleSpace?.wardrobe?.bubu || {}) };
      try { if (map['wardrobe_dudu']) duduW = { ...duduW, ...JSON.parse(map['wardrobe_dudu']) }; } catch (_) {}
      try { if (map['wardrobe_bubu']) bubuW = { ...bubuW, ...JSON.parse(map['wardrobe_bubu']) }; } catch (_) {}

      let encryptedPayload = null;
      if (map['encrypted_payload']) {
        try { encryptedPayload = JSON.parse(map['encrypted_payload']); } catch (_) {}
      }

      return {
        ...(encryptedPayload || {}),
        anniversaryDate: map['anniversary_date'] || '2025-11-04',
        loveBattery: map['love_battery'] ? Number(map['love_battery']) : 100,
        badmoodLevel: map['badmood_level'] !== undefined ? Number(map['badmood_level']) : 0,
        statuses: {
          dudu: map['status_dudu'] || 'Thinking of you! 💭',
          bubu: map['status_bubu'] || 'Eating snacks! 🐼'
        },
        wardrobe: {
          dudu: duduW,
          bubu: bubuW
        },
        miniGameHighScore: map['minigame_high_score'] ? Number(map['minigame_high_score']) : 420
      };
    } catch (e) {
      console.error('[Database] getCoupleSpace error:', e.message);
      return {
        ...fallbackCoupleSpace,
        badmoodLevel: fallbackCoupleSpace?.badmoodLevel ?? 0,
        wardrobe: fallbackCoupleSpace?.wardrobe || DEFAULT_WARDROBE
      };
    }
  } else {
    return {
      ...fallbackCoupleSpace,
      badmoodLevel: fallbackCoupleSpace?.badmoodLevel ?? 0,
      wardrobe: fallbackCoupleSpace?.wardrobe || DEFAULT_WARDROBE
    };
  }
}

function saveCoupleSpace(data) {
  if (!data) return false;
  const now = Date.now();
  if (!useFallback && db) {
    try {
      const stmt = db.prepare('INSERT OR REPLACE INTO couple_space (key, val, updated_at) VALUES (?, ?, ?)');
      if (data.ciphertext && data.iv) {
        stmt.run('encrypted_payload', JSON.stringify({ iv: data.iv, ciphertext: data.ciphertext, isEncrypted: true }), now);
      }
      if (data.anniversaryDate) stmt.run('anniversary_date', String(data.anniversaryDate), now);
      if (data.loveBattery !== undefined) stmt.run('love_battery', String(data.loveBattery), now);
      if (data.badmoodLevel !== undefined) stmt.run('badmood_level', String(data.badmoodLevel), now);
      if (data.statusDudu !== undefined) stmt.run('status_dudu', String(data.statusDudu), now);
      if (data.statusBubu !== undefined) stmt.run('status_bubu', String(data.statusBubu), now);
      if (data.statuses) {
        if (data.statuses.dudu !== undefined) stmt.run('status_dudu', String(data.statuses.dudu), now);
        if (data.statuses.bubu !== undefined) stmt.run('status_bubu', String(data.statuses.bubu), now);
      }
      if (data.wardrobe) {
        const current = getCoupleSpace().wardrobe || DEFAULT_WARDROBE;
        if (data.wardrobe.dudu) {
          stmt.run('wardrobe_dudu', JSON.stringify({ ...(current?.dudu || DEFAULT_WARDROBE.dudu), ...data.wardrobe.dudu }), now);
        }
        if (data.wardrobe.bubu) {
          stmt.run('wardrobe_bubu', JSON.stringify({ ...(current?.bubu || DEFAULT_WARDROBE.bubu), ...data.wardrobe.bubu }), now);
        }
      }
      if (data.miniGameHighScore !== undefined) {
        const curScore = getCoupleSpace().miniGameHighScore || 0;
        const nextScore = Math.max(curScore, Number(data.miniGameHighScore) || 0);
        stmt.run('minigame_high_score', String(nextScore), now);
      }
      return true;
    } catch (e) {
      console.error('[Database] saveCoupleSpace error:', e.message);
      return false;
    }
  } else {
    if (data.anniversaryDate) fallbackCoupleSpace.anniversaryDate = String(data.anniversaryDate);
    if (data.loveBattery !== undefined) fallbackCoupleSpace.loveBattery = Number(data.loveBattery);
    if (data.statusDudu !== undefined) fallbackCoupleSpace.statuses.dudu = String(data.statusDudu);
    if (data.statusBubu !== undefined) fallbackCoupleSpace.statuses.bubu = String(data.statusBubu);
    if (data.statuses) {
      if (data.statuses.dudu !== undefined) fallbackCoupleSpace.statuses.dudu = String(data.statuses.dudu);
      if (data.statuses.bubu !== undefined) fallbackCoupleSpace.statuses.bubu = String(data.statuses.bubu);
    }
    if (!fallbackCoupleSpace.wardrobe) {
      fallbackCoupleSpace.wardrobe = {
        dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
        bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
      };
    }
    if (data.wardrobe) {
      if (data.wardrobe.dudu) {
        fallbackCoupleSpace.wardrobe.dudu = { ...fallbackCoupleSpace.wardrobe.dudu, ...data.wardrobe.dudu };
      }
      if (data.wardrobe.bubu) {
        fallbackCoupleSpace.wardrobe.bubu = { ...fallbackCoupleSpace.wardrobe.bubu, ...data.wardrobe.bubu };
      }
    }
    if (data.miniGameHighScore !== undefined) {
      fallbackCoupleSpace.miniGameHighScore = Math.max(
        Number(fallbackCoupleSpace.miniGameHighScore) || 0,
        Number(data.miniGameHighScore) || 0
      );
    }
    persistFallbackState();
    return true;
  }
}

function getWardrobe() {
  const space = getCoupleSpace();
  return {
    wardrobe: space.wardrobe || {
      dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
      bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
    },
    miniGameHighScore: space.miniGameHighScore || 420
  };
}

function saveWardrobe(data) {
  if (!data) return false;
  const payload = {};
  if (data.wardrobe) {
    payload.wardrobe = data.wardrobe;
  } else if (data.dudu || data.bubu) {
    payload.wardrobe = {};
    if (data.dudu) payload.wardrobe.dudu = data.dudu;
    if (data.bubu) payload.wardrobe.bubu = data.bubu;
  }
  if (data.miniGameHighScore !== undefined) {
    payload.miniGameHighScore = data.miniGameHighScore;
  }
  return saveCoupleSpace(payload);
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
  getPushToken,
  // New features
  getAllCalendarEvents,
  saveCalendarEvent,
  deleteCalendarEvent,
  getAllPlannerItems,
  savePlannerItem,
  deletePlannerItem,
  getAllNotes,
  saveNote,
  deleteNote,
  getAllPolaroids,
  savePolaroid,
  deletePolaroid,
  getAllMilestones,
  saveMilestone,
  deleteMilestone,
  getCoupleSpace,
  saveCoupleSpace,
  getWardrobe,
  saveWardrobe
};
