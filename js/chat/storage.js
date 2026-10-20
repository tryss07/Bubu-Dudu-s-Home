/**
 * Dudu Duo Chat - Multi-Session & Message Persistence Engine
 * Native IndexedDB wrapper for offline-first, private message storage.
 */

(function () {
  'use strict';

  const DB_NAME = 'DuduDuoChatDB';
  const DB_VERSION = 2;

  const DEFAULT_SESSIONS = [
    {
      id: 'daily_banter',
      title: 'Daily Banter',
      emoji: '💬',
      isPinned: true,
      isArchived: false,
      createdAt: 1728000000000,
      lastActivity: Date.now()
    },
    {
      id: 'date_ideas',
      title: 'Date Ideas',
      emoji: '🍱',
      isPinned: false,
      isArchived: false,
      createdAt: 1728000000000,
      lastActivity: Date.now() - 3600000
    }
  ];

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Sessions Store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('isPinned', 'isPinned', { unique: false });
          sessionStore.createIndex('lastActivity', 'lastActivity', { unique: false });
          sessionStore.createIndex('isArchived', 'isArchived', { unique: false });
        }

        // Messages Store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('sessionId', 'sessionId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Blobs Store (for local decrypted binary media caching)
        if (!db.objectStoreNames.contains('blobs')) {
          db.createObjectStore('blobs', { keyPath: 'blobId' });
        }
      };

      request.onsuccess = async (event) => {
        const db = event.target.result;
        await seedDefaultSessions(db);
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('[Storage] IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });

    return dbPromise;
  }

  async function seedDefaultSessions(db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['sessions', 'messages'], 'readwrite');
        const sessionStore = tx.objectStore('sessions');
        const msgStore = tx.objectStore('messages');

        // Automatically clean up legacy mock messages
        ['mock_msg_1', 'mock_msg_2', 'mock_msg_3'].forEach(id => {
          try { msgStore.delete(id); } catch (_) {}
        });

        // Automatically clean up empty placeholder topics
        ['watchlist', 'vent_space', 'deep_talks'].forEach(id => {
          try { sessionStore.delete(id); } catch (_) {}
        });

        const countReq = sessionStore.count();
        countReq.onsuccess = () => {
          if (countReq.result === 0) {
            DEFAULT_SESSIONS.forEach(sess => sessionStore.put(sess));
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (_) {
        resolve();
      }
    });
  }

  // --- Session Management ---

  async function getSessions(includeArchived = false) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();

      req.onsuccess = () => {
        let sessions = req.result || [];
        if (!includeArchived) {
          sessions = sessions.filter(s => !s.isArchived);
        }
        // Sort: Pinned first, then by lastActivity descending
        sessions.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return b.isPinned ? 1 : -1;
          }
          return (b.lastActivity || 0) - (a.lastActivity || 0);
        });
        resolve(sessions);
      };

      req.onerror = () => reject(req.error);
    });
  }

  async function createSession(title, emoji = '💬') {
    const db = await openDB();
    const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const session = {
      id,
      title: title.trim(),
      emoji: emoji.trim() || '💬',
      isPinned: false,
      isArchived: false,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);

      req.onsuccess = () => resolve(session);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveSession(session) {
    if (!session || !session.id) return null;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const req = store.put(session);
      req.onsuccess = () => resolve(session);
      req.onerror = () => reject(req.error);
    });
  }

  async function togglePinSession(sessionId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const getReq = store.get(sessionId);

      getReq.onsuccess = () => {
        const session = getReq.result;
        if (!session) return resolve(null);
        session.isPinned = !session.isPinned;
        store.put(session);
        resolve(session);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function archiveSession(sessionId, isArchived = true) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      const getReq = store.get(sessionId);

      getReq.onsuccess = () => {
        const session = getReq.result;
        if (!session) return resolve(null);
        session.isArchived = isArchived;
        store.put(session);
        resolve(session);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  async function deleteSession(sessionId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['sessions', 'messages'], 'readwrite');
      const sessionStore = tx.objectStore('sessions');
      const messageStore = tx.objectStore('messages');

      // Delete session record
      sessionStore.delete(sessionId);

      // Delete all messages belonging to this session
      const msgIndex = messageStore.index('sessionId');
      const msgReq = msgIndex.openCursor(IDBKeyRange.only(sessionId));

      msgReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Message Persistence ---

  async function saveMessage(message) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['messages', 'sessions'], 'readwrite');
      const messageStore = tx.objectStore('messages');
      const sessionStore = tx.objectStore('sessions');

      messageStore.put(message);

      // Touch session lastActivity timestamp
      const getSess = sessionStore.get(message.sessionId);
      getSess.onsuccess = () => {
        const sess = getSess.result;
        if (sess) {
          sess.lastActivity = message.timestamp || Date.now();
          sessionStore.put(sess);
        }
      };

      tx.oncomplete = () => resolve(message);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getMessages(sessionId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('sessionId');
      const req = index.getAll(sessionId);

      req.onsuccess = () => {
        const msgs = req.result || [];
        msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        resolve(msgs);
      };

      req.onerror = () => reject(req.error);
    });
  }

  async function deleteMessage(messageId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const req = store.delete(messageId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function getLastMessageTimestamp() {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('timestamp');
      const req = index.openCursor(null, 'prev');
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor && cursor.value && cursor.value.timestamp) {
          resolve(cursor.value.timestamp);
        } else {
          resolve(0);
        }
      };
      req.onerror = () => resolve(0);
    });
  }

  async function updateMessageStatus(messageId, status) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const req = store.get(messageId);
      req.onsuccess = () => {
        const msg = req.result;
        if (msg) {
          msg.status = status;
          store.put(msg);
          resolve(msg);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function markMessagesRead(sessionId, upToTimestamp) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const index = store.index('sessionId');
      const req = index.openCursor(IDBKeyRange.only(sessionId));
      const updatedIds = [];
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const msg = cursor.value;
          if ((msg.timestamp || 0) <= upToTimestamp && msg.status !== 'read') {
            msg.status = 'read';
            cursor.update(msg);
            updatedIds.push(msg.id);
          }
          cursor.continue();
        } else {
          resolve(updatedIds);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  const SYNC_TS_KEY = 'DUDU_CHAT_LAST_SYNC_TS';

  function getLastSyncTimestamp() {
    const val = localStorage.getItem(SYNC_TS_KEY);
    return val ? Number(val) : 0;
  }

  function setLastSyncTimestamp(ts) {
    if (ts) {
      localStorage.setItem(SYNC_TS_KEY, String(ts));
    }
  }

  async function getMessage(messageId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const req = store.get(messageId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function getPendingMessages() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        const pending = all.filter(m => m.status === 'pending');
        pending.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        resolve(pending);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function saveBlob(blobId, blobData, meta = {}) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');
      const record = {
        blobId,
        blob: blobData,
        ...meta,
        cachedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function getBlob(blobId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readonly');
      const store = tx.objectStore('blobs');
      const req = store.get(blobId);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteBlob(blobId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('blobs', 'readwrite');
      const store = tx.objectStore('blobs');
      const req = store.delete(blobId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  window.DuduChatStorage = {
    openDB,
    getSessions,
    createSession,
    saveSession,
    deleteSession,
    togglePinSession,
    archiveSession,
    saveMessage,
    getMessages,
    getMessage,
    getPendingMessages,
    deleteMessage,
    saveBlob,
    getBlob,
    deleteBlob,
    getLastMessageTimestamp,
    getLastSyncTimestamp,
    setLastSyncTimestamp,
    updateMessageStatus,
    markMessagesRead
  };
})();
