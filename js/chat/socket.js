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
    };

    ws.onmessage = (event) => {
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
          listeners.topicCreated.forEach(fn => {
            try { fn(payload.topic); } catch (e) { console.error(e); }
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
          listeners.topicSync.forEach(fn => {
            try { fn(payload.topics); } catch (e) { console.error(e); }
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
          listeners.calendarSync.forEach(fn => {
            try { fn(payload.events); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'calendar_event_saved' && payload.event) {
          listeners.calendarEventSaved.forEach(fn => {
            try { fn(payload.event); } catch (e) { console.error(e); }
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
          listeners.plannerSync.forEach(fn => {
            try { fn(payload.items); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'planner_item_saved' && payload.item) {
          listeners.plannerItemSaved.forEach(fn => {
            try { fn(payload.item); } catch (e) { console.error(e); }
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
          listeners.notesSync.forEach(fn => {
            try { fn(payload.notes); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'note_saved' && payload.note) {
          listeners.noteSaved.forEach(fn => {
            try { fn(payload.note); } catch (e) { console.error(e); }
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
          listeners.memoriesSync.forEach(fn => {
            try { fn(payload); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'polaroid_saved' && payload.polaroid) {
          listeners.polaroidSaved.forEach(fn => {
            try { fn(payload.polaroid); } catch (e) { console.error(e); }
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
          listeners.milestoneSaved.forEach(fn => {
            try { fn(payload.milestone); } catch (e) { console.error(e); }
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
          listeners.coupleSpaceSync.forEach(fn => {
            try { fn(payload.data); } catch (e) { console.error(e); }
          });
          return;
        }
        if (payload.type === 'couple_space_updated' && payload.data) {
          listeners.coupleSpaceUpdated.forEach(fn => {
            try { fn(payload.data); } catch (e) { console.error(e); }
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
    } else if (document.visibilityState === 'hidden') {
      console.log('[Socket] App hidden. Announcing offline presence...');
      sendPresenceAnnounce('offline');
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

  function sendPresenceAnnounce(status = 'online') {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const identity = window.DuduChatCrypto ? window.DuduChatCrypto.getStoredIdentity() : 'dudu';
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
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete_message', messageId, sessionId, blobId }));
    }
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
      calendar: [],
      planner: [],
      notes: [],
      polaroids: [],
      milestones: [],
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

      if (calRes.status === 'fulfilled' && calRes.value?.events) result.calendar = calRes.value.events;
      if (planRes.status === 'fulfilled' && planRes.value?.items) result.planner = planRes.value.items;
      if (notesRes.status === 'fulfilled' && notesRes.value?.notes) result.notes = notesRes.value.notes;
      if (memRes.status === 'fulfilled' && memRes.value) {
        if (Array.isArray(memRes.value.polaroids)) result.polaroids = memRes.value.polaroids;
        if (Array.isArray(memRes.value.milestones)) result.milestones = memRes.value.milestones;
      }
      if (spaceRes.status === 'fulfilled' && spaceRes.value?.data) result.coupleSpace = spaceRes.value.data;
      if (wardRes.status === 'fulfilled' && wardRes.value?.data) result.wardrobe = wardRes.value.data;
    } catch (err) {
      console.warn('[Socket] fetchAllFeaturesRest error:', err);
    }
    return result;
  }

  function sendCreateTopic(topic) {
    if (ws && ws.readyState === WebSocket.OPEN && topic) {
      ws.send(JSON.stringify({ type: 'create_topic', topic }));
    }
  }

  function sendDeleteTopic(sessionId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete_topic', sessionId }));
    }
  }

  function sendDeleteAllTopics() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete_all_topics' }));
    }
  }

  function sendCreateTummyLog(log) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({
        type: 'create_tummy_log',
        log: log
      }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send create_tummy_log:', e);
      return false;
    }
  }

  function sendDeleteTummyLog(logId) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({
        type: 'delete_tummy_log',
        logId: logId
      }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_tummy_log:', e);
      return false;
    }
  }

  // --- Calendar Senders ---
  function sendSaveCalendarEvent(event) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'save_calendar_event', event }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send save_calendar_event:', e);
      return false;
    }
  }

  function sendDeleteCalendarEvent(id) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'delete_calendar_event', id }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_calendar_event:', e);
      return false;
    }
  }

  // --- Planner Senders ---
  function sendSavePlannerItem(item) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'save_planner_item', item }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send save_planner_item:', e);
      return false;
    }
  }

  function sendDeletePlannerItem(id) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'delete_planner_item', id }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_planner_item:', e);
      return false;
    }
  }

  // --- Notes Senders ---
  function sendSaveNote(note) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'save_note', note }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send save_note:', e);
      return false;
    }
  }

  function sendDeleteNote(id) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'delete_note', id }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_note:', e);
      return false;
    }
  }

  // --- Memories Senders ---
  function sendSavePolaroid(polaroid) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'save_polaroid', polaroid }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send save_polaroid:', e);
      return false;
    }
  }

  function sendDeletePolaroid(id) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'delete_polaroid', id }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_polaroid:', e);
      return false;
    }
  }

  function sendSaveMilestone(milestone) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'save_milestone', milestone }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send save_milestone:', e);
      return false;
    }
  }

  function sendDeleteMilestone(id) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'delete_milestone', id }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send delete_milestone:', e);
      return false;
    }
  }

  // --- Couple Space Sender ---
  function sendUpdateCoupleSpace(data) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'update_couple_space', data }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send update_couple_space:', e);
      return false;
    }
  }

  function sendUpdateWardrobe(data) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'update_wardrobe', data }));
      return true;
    } catch (e) {
      console.error('[Socket] Failed to send update_wardrobe:', e);
      return false;
    }
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
