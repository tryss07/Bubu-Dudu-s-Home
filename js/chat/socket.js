/**
 * Dudu Duo Chat - Resilient WebSocket Client
 * Automatic exponential backoff, background appState resume, and heartbeat ping.
 */

(function () {
  'use strict';

  const STORAGE_KEY_SERVER = 'DUDU_CHAT_SERVER_URL';
  const STORAGE_KEY_AUTH_TOKEN = 'DUDU_RELAY_AUTH_TOKEN';
  const DEFAULT_REMOTE_URL = 'wss://chat.nexora-v1.my.id/chat-socket';
  const DEFAULT_AUTH_TOKEN = '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
  const LOCAL_DEV_URL = 'ws://localhost:3000/chat-socket';

  let ws = null;
  let currentStatus = 'disconnected'; // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let manualDisconnect = false;

  async function maybeDecrypt(item) {
    if (!item || typeof item !== 'object') return item;
    if (window.DuduChatCrypto?.decryptPayload && item.iv && item.ciphertext) {
      return await window.DuduChatCrypto.decryptPayload(item);
    }
    return item;
  }

  async function maybeDecryptList(list) {
    if (!Array.isArray(list)) return [];
    if (window.DuduChatCrypto?.decryptList) {
      return await window.DuduChatCrypto.decryptList(list);
    }
    return Promise.all(list.map(item => maybeDecrypt(item)));
  }

  const listeners = {
    status: new Set(),
    message: new Set(),
    presence: new Set(),
    presenceState: new Set(),
    ack: new Set(),
    read: new Set(),
    sync: new Set(),
    deleteMessage: new Set(),
    deleteTopic: new Set(),
    deleteAllTopics: new Set(),
    topicCreated: new Set(),
    topicSync: new Set(),
    tummyLogCreated: new Set(),
    tummyLogDeleted: new Set(),
    tummyLogSync: new Set(),
    calendarSync: new Set(),
    calendarEventSaved: new Set(),
    calendarEventDeleted: new Set(),
    plannerSync: new Set(),
    plannerItemSaved: new Set(),
    plannerItemDeleted: new Set(),
    notesSync: new Set(),
    noteSaved: new Set(),
    noteDeleted: new Set(),
    memoriesSync: new Set(),
    polaroidSaved: new Set(),
    polaroidDeleted: new Set(),
    milestoneSaved: new Set(),
    milestoneDeleted: new Set(),
    coupleSpaceSync: new Set(),
    coupleSpaceUpdated: new Set(),
    wardrobeSync: new Set(),
    wardrobeUpdated: new Set(),
    typing: new Set()
  };

  function getAuthToken() {
    return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || localStorage.getItem('dudu_relay_auth_token') || DEFAULT_AUTH_TOKEN;
  }

  function setAuthToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token.trim());
      localStorage.setItem('dudu_relay_auth_token', token.trim());
    }
  }

  function getServerUrl() {
    let custom = localStorage.getItem(STORAGE_KEY_SERVER) || localStorage.getItem('dudu_chat_server_url');
    // Clear legacy auto-detected localhost entries so Cloudflare relay is always the default
    if (custom === LOCAL_DEV_URL || custom === 'ws://127.0.0.1:3000/chat-socket') {
      custom = null;
      localStorage.removeItem(STORAGE_KEY_SERVER);
      localStorage.removeItem('dudu_chat_server_url');
    }
    let raw = (custom && custom.trim()) ? custom.trim() : DEFAULT_REMOTE_URL;

    // Attach token query param if not already present
    try {
      const token = getAuthToken();
      if (token && !raw.includes('token=') && !raw.includes('auth=')) {
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}token=${encodeURIComponent(token)}`;
      }
    } catch (_) {}
    return raw;
  }

  function setServerUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEY_SERVER, url.trim());
      // Reconnect to new URL
      disconnect();
      connect();
    }
  }

  function setStatus(status) {
    if (currentStatus === status) return;
    currentStatus = status;
    listeners.status.forEach(fn => {
      try { fn(status); } catch (e) { console.error(e); }
    });
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    manualDisconnect = false;
    const url = getServerUrl();
    setStatus(reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      ws = new WebSocket(url);
    } catch (err) {
      console.warn('[Socket] Connection creation error:', err.message);
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      console.log(`[Socket] Connected to ${url}`);
      reconnectAttempts = 0;
      setStatus('connected');
      startHeartbeat();
      sendPresenceAnnounce('online');
      flushOutbox();
    };

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'pong') {
          // Heartbeat response from server
          return;
        }
        if (payload.type === 'presence') {
          listeners.presence.forEach(fn => {
            try { fn(payload.connectedPeers); } catch (e) {}
          });
          return;
        }

        if (payload.type === 'presence_state') {
          listeners.presenceState.forEach(fn => {
            try { fn(payload.presence); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'ack') {
          listeners.ack.forEach(fn => {
            try { fn(payload); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'read') {
          listeners.read.forEach(fn => {
            try { fn(payload); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'sync_response') {
          listeners.sync.forEach(fn => {
            try { fn(payload.messages || []); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'delete_message') {
          listeners.deleteMessage.forEach(fn => {
            try { fn(payload.messageId, payload.sessionId); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'delete_topic') {
          listeners.deleteTopic.forEach(fn => {
            try { fn(payload.sessionId); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'delete_all_topics') {
          listeners.deleteAllTopics.forEach(fn => {
            try { fn(); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'topic_created' && payload.topic) {
          const decTopic = await maybeDecrypt(payload.topic);
          listeners.topicCreated.forEach(fn => {
            try { fn(decTopic); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'topic_deleted') {
          listeners.deleteTopic.forEach(fn => {
            try { fn(payload.sessionId); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'topic_sync' && Array.isArray(payload.topics)) {
          const decTopics = await maybeDecryptList(payload.topics);
          listeners.topicSync.forEach(fn => {
            try { fn(decTopics); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'tummy_log_created' && payload.log) {
          listeners.tummyLogCreated.forEach(fn => {
            try { fn(payload.log); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'tummy_log_deleted') {
          listeners.tummyLogDeleted.forEach(fn => {
            try { fn(payload.logId); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'tummy_log_sync' && Array.isArray(payload.logs)) {
          listeners.tummyLogSync.forEach(fn => {
            try { fn(payload.logs); } catch (e) { console.error(e); }
          });
          return;
        }

        // Calendar
        if (payload.type === 'calendar_sync' && Array.isArray(payload.events)) {
          const decEvents = await maybeDecryptList(payload.events);
          listeners.calendarSync.forEach(fn => {
            try { fn(decEvents); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'calendar_event_saved' && payload.event) {
          const decEvent = await maybeDecrypt(payload.event);
          listeners.calendarEventSaved.forEach(fn => {
            try { fn(decEvent); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'calendar_event_deleted') {
          listeners.calendarEventDeleted.forEach(fn => {
            try { fn(payload.id); } catch (e) { console.error(e); }
          });
          return;
        }

        // Planner
        if (payload.type === 'planner_sync' && Array.isArray(payload.items)) {
          const decItems = await maybeDecryptList(payload.items);
          listeners.plannerSync.forEach(fn => {
            try { fn(decItems); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'planner_item_saved' && payload.item) {
          const decItem = await maybeDecrypt(payload.item);
          listeners.plannerItemSaved.forEach(fn => {
            try { fn(decItem); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'planner_item_deleted') {
          listeners.plannerItemDeleted.forEach(fn => {
            try { fn(payload.id); } catch (e) { console.error(e); }
          });
          return;
        }

        // Notes
        if (payload.type === 'notes_sync' && Array.isArray(payload.notes)) {
          const decNotes = await maybeDecryptList(payload.notes);
          listeners.notesSync.forEach(fn => {
            try { fn(decNotes); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'note_saved' && payload.note) {
          const decNote = await maybeDecrypt(payload.note);
          listeners.noteSaved.forEach(fn => {
            try { fn(decNote); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'note_deleted') {
          listeners.noteDeleted.forEach(fn => {
            try { fn(payload.id); } catch (e) { console.error(e); }
          });
          return;
        }

        // Memories
        if (payload.type === 'memories_sync') {
          const decPolaroids = await maybeDecryptList(payload.polaroids || []);
          const decMilestones = await maybeDecryptList(payload.milestones || []);
          listeners.memoriesSync.forEach(fn => {
            try { fn({ polaroids: decPolaroids, milestones: decMilestones }); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'polaroid_saved' && payload.polaroid) {
          const decPolaroid = await maybeDecrypt(payload.polaroid);
          listeners.polaroidSaved.forEach(fn => {
            try { fn(decPolaroid); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'polaroid_deleted') {
          listeners.polaroidDeleted.forEach(fn => {
            try { fn(payload.id); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'milestone_saved' && payload.milestone) {
          const decMilestone = await maybeDecrypt(payload.milestone);
          listeners.milestoneSaved.forEach(fn => {
            try { fn(decMilestone); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'milestone_deleted') {
          listeners.milestoneDeleted.forEach(fn => {
            try { fn(payload.id); } catch (e) { console.error(e); }
          });
          return;
        }

        // Couple Space
        if (payload.type === 'couple_space_sync' && payload.data) {
          const decData = await maybeDecrypt(payload.data);
          listeners.coupleSpaceSync.forEach(fn => {
            try { fn(decData); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'couple_space_updated' && payload.data) {
          const decData = await maybeDecrypt(payload.data);
          listeners.coupleSpaceUpdated.forEach(fn => {
            try { fn(decData); } catch (e) { console.error(e); }
          });
          return;
        }

        // Wardrobe / Couple Closet
        if (payload.type === 'wardrobe_sync' && payload.data) {
          listeners.wardrobeSync.forEach(fn => {
            try { fn(payload.data); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'wardrobe_updated' && payload.data) {
          listeners.wardrobeUpdated.forEach(fn => {
            try { fn(payload.data, payload.updatedBy); } catch (e) { console.error(e); }
          });
          return;
        }

        if (payload.type === 'typing') {
          listeners.typing.forEach(fn => {
            try { fn(payload); } catch (e) { console.error(e); }
          });
          return;
        }

        // Encrypted wire message packet { iv, ciphertext, timestamp }
        listeners.message.forEach(fn => {
          try { fn(payload); } catch (e) { console.error(e); }
        });
      } catch (err) {
        console.warn('[Socket] Message parse error:', err.message);
      }
    };

    ws.onclose = (event) => {
      stopHeartbeat();
      console.log(`[Socket] Closed with code ${event.code}.`);
      if (!manualDisconnect) {
        scheduleReconnect();
      } else {
        setStatus('disconnected');
      }
    };

    ws.onerror = (err) => {
      console.warn('[Socket] Error occurred:', err);
      // onclose will handle reconnect
    };
  }

  function disconnect() {
    manualDisconnect = true;
    stopHeartbeat();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      try { ws.close(); } catch (e) {}
      ws = null;
    }
    setStatus('disconnected');
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s, up to 15s with jitter
    const delay = Math.min(15000, Math.pow(2, reconnectAttempts - 1) * 1000) + Math.random() * 500;
    console.log(`[Socket] Scheduling reconnect attempt #${reconnectAttempts} in ${Math.round(delay)}ms`);
    setStatus('reconnecting');

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } catch (e) {}
      }
    }, 25000);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function send(packet) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[Socket] Cannot send, socket not open (status: ' + currentStatus + ')');
      return false;
    }

    try {
      const payloadString = typeof packet === 'string' ? packet : JSON.stringify(packet);
      ws.send(payloadString);
      return true;
    } catch (err) {
      console.error('[Socket] Send failed:', err.message);
      return false;
    }
  }

  // --- Durable Outbox ---
  // Every mutating op is queued when the socket is not open (offline, mid
  // reconnect, or the app just booted) and flushed on connect. Without this,
  // topics and feature edits were silently dropped and never reached the relay.
  const OUTBOX_KEY = 'DUDU_CHAT_OUTBOX_V1';
  const OUTBOX_LIMIT = 200;
  const ENCRYPTED_FIELD = {
    create_topic: 'topic',
    save_calendar_event: 'event',
    save_planner_item: 'item',
    save_note: 'note',
    save_polaroid: 'polaroid',
    save_milestone: 'milestone',
    update_couple_space: 'data'
  };
  let outbox = [];
  let isFlushingOutbox = false;

  function loadOutbox() {
    try {
      const parsed = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]');
      outbox = Array.isArray(parsed) ? parsed.filter(op => op && op.type) : [];
    } catch (_) {
      outbox = [];
    }
  }

  function persistOutbox() {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox.slice(-OUTBOX_LIMIT)));
    } catch (_) {}
  }

  function outboxKey(op) {
    const p = op.payload || {};
    const target = p.sessionId || p.messageId || p.logId || p.id ||
      p.topic?.id || p.event?.id || p.item?.id || p.note?.id ||
      p.polaroid?.id || p.milestone?.id || p.log?.id || null;
    return target ? `${op.type}:${target}` : op.type;
  }

  function enqueueOutbox(type, payload) {
    const op = { type, payload: payload || {}, queuedAt: Date.now() };
    const key = outboxKey(op);
    if (type === 'delete_all_topics') {
      outbox = outbox.filter(o => o.type !== 'create_topic' && o.type !== 'delete_topic');
    }
    outbox = outbox.filter(existing => outboxKey(existing) !== key);
    outbox.push(op);
    if (outbox.length > OUTBOX_LIMIT) outbox = outbox.slice(-OUTBOX_LIMIT);
    persistOutbox();
  }

  async function flushOutbox() {
    if (isFlushingOutbox) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (outbox.length === 0) return;

    isFlushingOutbox = true;
    try {
      console.log(`[Socket] Flushing ${outbox.length} queued op(s)...`);
      while (outbox.length > 0) {
        const op = outbox[0];
        let payload = op.payload || {};
        const field = ENCRYPTED_FIELD[op.type];
        try {
          if (field && payload[field] && !payload[field].ciphertext && window.DuduChatCrypto?.encryptPayload) {
            payload = { ...payload, [field]: await window.DuduChatCrypto.encryptPayload(payload[field]) };
          }
        } catch (err) {
          console.warn('[Socket] Outbox encryption failed, keeping op:', err.message);
          break;
        }
        if (!send({ type: op.type, ...payload })) break;
        outbox.shift();
        persistOutbox();
      }
    } finally {
      isFlushingOutbox = false;
    }
  }

  function hasPendingOutbox(types) {
    const list = Array.isArray(types) ? types : [types];
    return outbox.some(op => list.includes(op.type));
  }

  function getPendingTopicIds() {
    return outbox.filter(op => op.type === 'create_topic' && op.payload?.topic?.id)
      .map(op => op.payload.topic.id);
  }

  loadOutbox();

  // Send now when connected, otherwise queue for the next connection.
  async function dispatchOp(type, payload = {}) {
    const field = ENCRYPTED_FIELD[type];
    if (ws && ws.readyState === WebSocket.OPEN) {
      let body = payload;
      if (field && payload[field] && !payload[field].ciphertext && window.DuduChatCrypto?.encryptPayload) {
        try {
          body = { ...payload, [field]: await window.DuduChatCrypto.encryptPayload(payload[field]) };
        } catch (err) {
          console.warn('[Socket] Encryption failed, queueing op:', err.message);
          enqueueOutbox(type, payload);
          return false;
        }
      }
      if (send({ type, ...body })) return true;
    }
    enqueueOutbox(type, payload);
    return false;
  }

  // --- Network & Lifecycle Listeners ---
  window.addEventListener('online', () => {
    console.log('[Socket] Device back online. Reconnecting...');
    reconnectAttempts = 0;
    connect();
  });

  window.addEventListener('offline', () => {
    console.log('[Socket] Device went offline.');
    setStatus('disconnected');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Socket] App brought to foreground. Checking socket...');
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reconnectAttempts = 0;
        connect();
      } else {
        sendPresenceAnnounce('online');
      }
    }
  });

  window.addEventListener('beforeunload', () => {
    sendPresenceAnnounce('offline');
  });

  window.addEventListener('pagehide', () => {
    sendPresenceAnnounce('offline');
  });

  // Capacitor App Plugin Lifecycle (if available on native Android)
  if (window.Capacitor?.Plugins?.App) {
    try {
      window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          console.log('[Socket] Capacitor appState isActive. Reconnecting socket...');
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            connect();
          } else {
            sendPresenceAnnounce('online');
          }
        } else {
          console.log('[Socket] Capacitor appState inactive. Announcing offline presence...');
          sendPresenceAnnounce('offline');
        }
      });
    } catch (e) {}
  }

  function sendPresenceAnnounce(status = 'online', customIdentity = null) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const identity = customIdentity || (window.DuduChatCrypto ? window.DuduChatCrypto.getStoredIdentity() : 'dudu');
      try {
        ws.send(JSON.stringify({
          type: 'presence_announce',
          identity,
          status,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }
  }

  function sendReadReceipt(sessionId, upToTimestamp) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const identity = window.DuduChatCrypto ? window.DuduChatCrypto.getStoredIdentity() : 'dudu';
      try {
        ws.send(JSON.stringify({
          type: 'read',
          sessionId,
          upToTimestamp: upToTimestamp || Date.now(),
          reader: identity,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }
  }

  function requestSync(sinceTimestamp = 0) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'sync', sinceTimestamp }));
    }
  }

  function sendDeleteMessage(messageId, sessionId, blobId = null) {
    if (!messageId) return false;
    return dispatchOp('delete_message', { messageId, sessionId, blobId });
  }

  function getHttpBaseUrl() {
    const wsUrl = getServerUrl();
    try {
      const u = new URL(wsUrl);
      const protocol = u.protocol === 'wss:' ? 'https:' : 'http:';
      return `${protocol}//${u.host}`;
    } catch (e) {
      return 'https://chat.nexora-v1.my.id';
    }
  }

  async function fetchAllFeaturesRest() {
    const baseUrl = getHttpBaseUrl();
    const token = getAuthToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    const headers = token ? { 'x-relay-token': token } : {};
    const result = {
      calendar: null,
      planner: null,
      notes: null,
      polaroids: null,
      milestones: null,
      coupleSpace: null,
      wardrobe: null
    };

    try {
      const [calRes, planRes, notesRes, memRes, spaceRes, wardRes] = await Promise.allSettled([
        fetch(`${baseUrl}/api/calendar${query}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/api/planner${query}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/api/notes${query}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/api/memories${query}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/api/couple-space${query}`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/api/wardrobe${query}`, { headers }).then(r => r.ok ? r.json() : null)
      ]);

      // null means "unknown / request failed"; an empty array means "server says none left".
      if (calRes.status === 'fulfilled' && Array.isArray(calRes.value?.events)) {
        result.calendar = await maybeDecryptList(calRes.value.events);
      }
      if (planRes.status === 'fulfilled' && Array.isArray(planRes.value?.items)) {
        result.planner = await maybeDecryptList(planRes.value.items);
      }
      if (notesRes.status === 'fulfilled' && Array.isArray(notesRes.value?.notes)) {
        result.notes = await maybeDecryptList(notesRes.value.notes);
      }
      if (memRes.status === 'fulfilled' && memRes.value) {
        if (Array.isArray(memRes.value.polaroids)) result.polaroids = await maybeDecryptList(memRes.value.polaroids);
        if (Array.isArray(memRes.value.milestones)) result.milestones = await maybeDecryptList(memRes.value.milestones);
      }
      if (spaceRes.status === 'fulfilled' && spaceRes.value?.data) {
        result.coupleSpace = await maybeDecrypt(spaceRes.value.data);
      }
      if (wardRes.status === 'fulfilled' && wardRes.value?.data) result.wardrobe = wardRes.value.data;
    } catch (err) {
      console.warn('[Socket] fetchAllFeaturesRest error:', err);
    }
    return result;
  }

  async function sendCreateTopic(topic) {
    if (!topic) return false;
    return dispatchOp('create_topic', { topic });
  }

  function sendDeleteTopic(sessionId) {
    if (!sessionId) return false;
    return dispatchOp('delete_topic', { sessionId });
  }

  function sendDeleteAllTopics() {
    return dispatchOp('delete_all_topics', {});
  }

  function sendCreateTummyLog(log) {
    if (!log) return false;
    return dispatchOp('create_tummy_log', { log });
  }

  function sendDeleteTummyLog(logId) {
    if (!logId) return false;
    return dispatchOp('delete_tummy_log', { logId });
  }

  // --- Calendar Senders ---
  async function sendSaveCalendarEvent(event) {
    if (!event) return false;
    return dispatchOp('save_calendar_event', { event });
  }

  function sendDeleteCalendarEvent(id) {
    if (!id) return false;
    return dispatchOp('delete_calendar_event', { id });
  }

  // --- Planner Senders ---
  async function sendSavePlannerItem(item) {
    if (!item) return false;
    return dispatchOp('save_planner_item', { item });
  }

  function sendDeletePlannerItem(id) {
    if (!id) return false;
    return dispatchOp('delete_planner_item', { id });
  }

  // --- Notes Senders ---
  async function sendSaveNote(note) {
    if (!note) return false;
    return dispatchOp('save_note', { note });
  }

  function sendDeleteNote(id) {
    if (!id) return false;
    return dispatchOp('delete_note', { id });
  }

  // --- Memories Senders ---
  async function sendSavePolaroid(polaroid) {
    if (!polaroid) return false;
    return dispatchOp('save_polaroid', { polaroid });
  }

  function sendDeletePolaroid(id) {
    if (!id) return false;
    return dispatchOp('delete_polaroid', { id });
  }

  async function sendSaveMilestone(milestone) {
    if (!milestone) return false;
    return dispatchOp('save_milestone', { milestone });
  }

  function sendDeleteMilestone(id) {
    if (!id) return false;
    return dispatchOp('delete_milestone', { id });
  }

  // --- Couple Space Sender ---
  async function sendUpdateCoupleSpace(data) {
    if (!data) return false;
    return dispatchOp('update_couple_space', { data });
  }

  function sendUpdateWardrobe(data) {
    if (!data) return false;
    return dispatchOp('update_wardrobe', { data });
  }

  function sendTyping(sender, isTyping, sessionId) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({
        type: 'typing',
        sender,
        isTyping: !!isTyping,
        sessionId
      }));
      return true;
    } catch (e) {
      return false;
    }
  }

  window.DuduChatSocket = {
    connect,
    disconnect,
    reconnect: () => { disconnect(); connect(); },
    send,
    sendPresenceAnnounce,
    sendReadReceipt,
    requestSync,
    sendCreateTopic,
    sendDeleteMessage,
    sendDeleteTopic,
    sendDeleteAllTopics,
    sendCreateTummyLog,
    sendDeleteTummyLog,
    // New Feature Senders
    sendSaveCalendarEvent,
    sendDeleteCalendarEvent,
    sendSavePlannerItem,
    sendDeletePlannerItem,
    sendSaveNote,
    sendDeleteNote,
    sendSavePolaroid,
    sendDeletePolaroid,
    sendSaveMilestone,
    sendDeleteMilestone,
    sendUpdateCoupleSpace,
    sendUpdateWardrobe,
    sendTyping,
    flushOutbox,
    hasPendingOutbox,
    getPendingTopicIds,
    getOutboxSize: () => outbox.length,
    getStatus: () => currentStatus,
    getServerUrl,
    setServerUrl,
    getHttpBaseUrl,
    onStatusChange: (fn) => listeners.status.add(fn),
    onMessage: (fn) => listeners.message.add(fn),
    onPresence: (fn) => listeners.presence.add(fn),
    onPresenceState: (fn) => listeners.presenceState.add(fn),
    onAck: (fn) => listeners.ack.add(fn),
    onRead: (fn) => listeners.read.add(fn),
    onSync: (fn) => listeners.sync.add(fn),
    onDeleteMessage: (fn) => listeners.deleteMessage.add(fn),
    onDeleteTopic: (fn) => listeners.deleteTopic.add(fn),
    onDeleteAllTopics: (fn) => listeners.deleteAllTopics.add(fn),
    onTopicCreated: (fn) => listeners.topicCreated.add(fn),
    onTopicSync: (fn) => listeners.topicSync.add(fn),
    onTummyLogCreated: (fn) => listeners.tummyLogCreated.add(fn),
    onTummyLogDeleted: (fn) => listeners.tummyLogDeleted.add(fn),
    onTummyLogSync: (fn) => listeners.tummyLogSync.add(fn),
    // New Feature Listeners
    onCalendarSync: (fn) => listeners.calendarSync.add(fn),
    onCalendarEventSaved: (fn) => listeners.calendarEventSaved.add(fn),
    onCalendarEventDeleted: (fn) => listeners.calendarEventDeleted.add(fn),
    onPlannerSync: (fn) => listeners.plannerSync.add(fn),
    onPlannerItemSaved: (fn) => listeners.plannerItemSaved.add(fn),
    onPlannerItemDeleted: (fn) => listeners.plannerItemDeleted.add(fn),
    onNotesSync: (fn) => listeners.notesSync.add(fn),
    onNoteSaved: (fn) => listeners.noteSaved.add(fn),
    onNoteDeleted: (fn) => listeners.noteDeleted.add(fn),
    onMemoriesSync: (fn) => listeners.memoriesSync.add(fn),
    onPolaroidSaved: (fn) => listeners.polaroidSaved.add(fn),
    onPolaroidDeleted: (fn) => listeners.polaroidDeleted.add(fn),
    onMilestoneSaved: (fn) => listeners.milestoneSaved.add(fn),
    onMilestoneDeleted: (fn) => listeners.milestoneDeleted.add(fn),
    onCoupleSpaceSync: (fn) => listeners.coupleSpaceSync.add(fn),
    onCoupleSpaceUpdated: (fn) => listeners.coupleSpaceUpdated.add(fn),
    onWardrobeSync: (fn) => listeners.wardrobeSync.add(fn),
    onWardrobeUpdated: (fn) => listeners.wardrobeUpdated.add(fn),
    onTyping: (fn) => listeners.typing.add(fn),
    fetchAllFeaturesRest,
    getAuthToken,
    setAuthToken,
    LOCAL_DEV_URL,
    DEFAULT_REMOTE_URL
  };

  // Immediate auto-connection on boot
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { connect(); });
    } else {
      setTimeout(connect, 0);
    }
  }
})();
