/**
 * Dudu Duo Chat - Resilient WebSocket Client
 * Automatic exponential backoff, background appState resume, and heartbeat ping.
 */

(function () {
  'use strict';

  const STORAGE_KEY_SERVER = 'DUDU_CHAT_SERVER_URL';
  const DEFAULT_REMOTE_URL = 'wss://chat.nexora-v1.my.id/chat-socket';
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
    typing: new Set()
  };

  function getServerUrl() {
    return localStorage.getItem(STORAGE_KEY_SERVER) || localStorage.getItem('dudu_chat_server_url') || DEFAULT_REMOTE_URL;
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
      return 'http://localhost:3000';
    }
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
    onTyping: (fn) => listeners.typing.add(fn),
    LOCAL_DEV_URL,
    DEFAULT_REMOTE_URL
  };
})();
