/**
 * Dudu Duo Chat - UI Controller & Orchestration Engine
 * Multi-Session topic switching, bubble chat, sticker tray, and E2EE key settings.
 */

(function () {
  'use strict';

  let activeSessionId = 'daily_banter';
  let activeCryptoKey = null;
  let activeSessions = [];
  let isStickerTrayOpen = false;
  let lastPartnerOnlineState = null;
  let activeReplyMessage = null;
  let selectedActionMessage = null;
  let pendingForwardMessage = null;
  let isSelectionMode = false;
  const selectedMessageIds = new Set();
  let pendingDeleteMessageIds = [];
  let pendingForwardMessages = [];
  const localBlobUrls = new Map();
  let typingBroadcastTimeout = null;
  let isTypingActive = false;
  let incomingTypingTimeout = null;
  let unreadSessionIds = new Set();
  try {
    const raw = localStorage.getItem('dudu_unread_topics');
    if (raw) unreadSessionIds = new Set(JSON.parse(raw));
  } catch (e) {
    unreadSessionIds = new Set();
  }

  function removeEmojis(text) {
    if (!text) return '';
    return String(text)
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function saveUnreadSessions() {
    try {
      localStorage.setItem('dudu_unread_topics', JSON.stringify([...unreadSessionIds]));
    } catch (e) {}
    updateNavChatBadge();
    window.syncCompanionWidgetStats?.();
  }

  function updateNavChatBadge() {
    const navDot = document.getElementById('nav-chat-unread-dot');
    if (navDot) {
      const isChatTab = document.body.classList.contains('chat-tab-active');
      navDot.classList.toggle('hidden', isChatTab || unreadSessionIds.size === 0);
    }
  }

  async function markSessionUnread(sessionId) {
    if (!sessionId) return;
    unreadSessionIds.add(sessionId);
    saveUnreadSessions();
    if (!activeSessions.some(s => s.id === sessionId)) {
      activeSessions = await DuduChatStorage.getSessions();
    }
    renderSessionBar();
    const modal = document.getElementById('modal-all-topics');
    if (modal && !modal.classList.contains('hidden')) {
      const q = document.getElementById('input-search-topics')?.value || '';
      renderAllTopicsList(q);
    }
  }

  function markSessionRead(sessionId) {
    if (!sessionId) return;
    if (unreadSessionIds.has(sessionId)) {
      unreadSessionIds.delete(sessionId);
      saveUnreadSessions();
      renderSessionBar();
      const modal = document.getElementById('modal-all-topics');
      if (modal && !modal.classList.contains('hidden')) {
        const q = document.getElementById('input-search-topics')?.value || '';
        renderAllTopicsList(q);
      }
    }
  }

  function notifyTypingState(isTyping) {
    const myIdentity = DuduChatCrypto.getStoredIdentity() || 'dudu';
    window.DuduChatSocket?.sendTyping?.(myIdentity, isTyping, activeSessionId);
  }

  function handleIncomingTyping(data) {
    if (!data) return;
    const myIdentity = (DuduChatCrypto.getStoredIdentity() || 'dudu').toLowerCase();
    const sender = (data.sender || '').toLowerCase();
    const isMeDudu = myIdentity.includes('dudu') || myIdentity.includes('kevin');
    const isSenderDudu = sender.includes('dudu') || sender.includes('kevin');

    if (isMeDudu === isSenderDudu) return;
    if (data.sessionId && data.sessionId !== activeSessionId) return;

    const indicator = document.getElementById('chat-typing-indicator');
    const textEl = document.getElementById('chat-typing-indicator-text');
    if (!indicator || !textEl) return;

    if (data.isTyping) {
      textEl.textContent = isSenderDudu ? 'dudu is typing...' : 'she is typing...';
      indicator.classList.remove('hidden');

      clearTimeout(incomingTypingTimeout);
      incomingTypingTimeout = setTimeout(() => {
        indicator.classList.add('hidden');
      }, 3500);
    } else {
      indicator.classList.add('hidden');
      clearTimeout(incomingTypingTimeout);
    }
  }

  async function initChat() {
    try {
      await DuduChatStorage.openDB();
      await updateCryptoKey();
      await loadSessions();
      setupEventListeners();
      setupKeyboardAndDockHandling();
      handlePresenceState();
      requestNotificationPermission();
      setupSocketListeners();
      updateNavChatBadge();
      try {
        const myId = DuduChatCrypto.getStoredIdentity() || 'dudu';
        window.Capacitor?.Plugins?.DuduCompanion?.setIdentity?.({ identity: myId });
      } catch (_) {}
      DuduChatSocket.connect();
      if (DuduChatSocket.getStatus() === 'connected') {
        flushPendingMessages();
      }
      console.log('[ChatUI] Private Duo Chat initialized');
    } catch (err) {
      console.error('[ChatUI] Initialization error:', err);
    }
  }

  async function updateCryptoKey() {
    const passphrase = DuduChatCrypto.getStoredPassphrase();
    try {
      activeCryptoKey = await DuduChatCrypto.deriveKey(passphrase);
      console.log('[ChatUI] E2EE 256-bit AES-GCM Key Derived');
    } catch (err) {
      console.error('[ChatUI] Failed to derive key:', err);
    }
  }

  async function requestNotificationPermission() {
    try {
      if (window.Capacitor?.Plugins?.LocalNotifications) {
        await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
        try {
          await window.Capacitor.Plugins.LocalNotifications.createChannel({
            id: 'dudu_chat_channel',
            name: 'Dudu Chat',
            description: 'Notifications for incoming messages',
            importance: 5,
            visibility: 1,
            vibration: true
          });
        } catch (chanErr) {
          console.warn('[Notify] Channel creation error:', chanErr);
        }
      } else if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('[Notify] Permission request error:', e);
    }
  }

  async function notifyUser(title, body) {
    const cleanTitle = removeEmojis(title) || 'Dudu Chat';
    const cleanBody = removeEmojis(body) || 'New update';
    try {
      if (window.Capacitor?.Plugins?.LocalNotifications) {
        await window.Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
            title: cleanTitle,
            body: cleanBody,
            channelId: 'dudu_chat_channel'
          }]
        });
        return;
      }
    } catch (err) {
      console.warn('[Notify] LocalNotifications error:', err);
    }

    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(cleanTitle, { body: cleanBody, icon: 'assets/dudu_icon.png' });
        return;
      }
    } catch (err) {
      console.warn('[Notify] Web Notification error:', err);
    }

    if (window.showToast) {
      window.showToast(`${cleanTitle}: ${cleanBody}`);
    }
  }

  let lastKnownPresence = null;

  function handlePresenceState(presence) {
    if (presence) lastKnownPresence = presence;
    const currentPresence = presence || lastKnownPresence;

    const myIdentity = DuduChatCrypto.getStoredIdentity() || 'dudu';
    const myIdLower = myIdentity.toLowerCase();
    const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
    const partnerKey = isMeDudu ? 'bubu' : 'dudu';
    const partnerLabel = isMeDudu ? 'Bubu' : 'Dudu';
    const partnerState = currentPresence ? currentPresence[partnerKey] : null;

    // Check simulated state in localStorage (allows toggling online/offline easily)
    const simulatedState = localStorage.getItem('DUDU_SIMULATED_PRESENCE_' + partnerKey);
    let isOnline = false;
    if (simulatedState !== null) {
      isOnline = simulatedState === 'online';
    } else if (partnerState && partnerState.online !== undefined) {
      isOnline = !!partnerState.online;
    } else {
      // Default to online matching mockup reference
      isOnline = true;
    }

    const dotEl = document.getElementById('chat-partner-presence-dot');
    const textEl = document.getElementById('chat-partner-presence-text');
    const partnerNameEl = document.getElementById('chat-partner-name');

    if (partnerNameEl) {
      partnerNameEl.textContent = isMeDudu ? 'Bubu 🐼❤️' : 'Dudu 🐻❤️';
    }

    if (isOnline) {
      if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-200 dark:ring-emerald-900 shrink-0 animate-pulse';
      if (textEl) {
        textEl.textContent = 'online 💫';
        textEl.className = 'text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate';
      }

      if (lastPartnerOnlineState === 0) {
        notifyUser(`${partnerLabel} is online`, `${partnerLabel} just entered your private space!`);
        window.duduAudio?.playSparkle?.();
      }
      lastPartnerOnlineState = 1;
    } else {
      if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-600 shrink-0';
      if (textEl) {
        const lastSeenTs = partnerState && (partnerState.lastSeen || partnerState.last_seen);
        const lastSeenStr = lastSeenTs ? formatLastSeen(lastSeenTs) : 'recently';
        textEl.textContent = `offline (${lastSeenStr})`;
        textEl.className = 'text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate';
      }
      lastPartnerOnlineState = 0;
    }
  }

  function formatLastSeen(timestamp) {
    if (!timestamp) return '';
    const now = Date.now();
    const diffMs = now - timestamp;
    if (diffMs < 60000) return 'last seen just now';
    return `last seen ${formatTime(timestamp)}`;
  }

  // --- Session Management ---

  async function loadSessions() {
    activeSessions = await DuduChatStorage.getSessions();
    if (!activeSessions.some(s => s.id === activeSessionId)) {
      activeSessionId = activeSessions[0]?.id || null;
    }
    renderSessionBar();
    await loadActiveMessages();
  }

  // --- Topic Long Hold Actions & Rename State ---
  let activeActionSession = null;

  function attachTopicLongPress(element, session, onShortClick) {
    let pressTimer = null;
    let didLongPress = false;
    let startX = 0;
    let startY = 0;

    const start = (e) => {
      if (e.button && e.button !== 0) return;
      didLongPress = false;
      startX = e.clientX;
      startY = e.clientY;
      pressTimer = setTimeout(() => {
        didLongPress = true;
        window.navigator?.vibrate?.(40);
        openTopicActionsModal(session);
      }, 450);
    };

    const cancel = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    const move = (e) => {
      if (!pressTimer) return;
      if (Math.abs(e.clientX - startX) > 15 || Math.abs(e.clientY - startY) > 15) {
        cancel();
      }
    };

    element.addEventListener('pointerdown', start);
    element.addEventListener('pointerup', cancel);
    element.addEventListener('pointercancel', cancel);
    element.addEventListener('pointermove', move);

    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openTopicActionsModal(session);
    });

    element.addEventListener('click', (e) => {
      if (didLongPress) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (onShortClick) onShortClick(e);
    });
  }

  function openTopicActionsModal(session) {
    if (!session) return;
    activeActionSession = session;
    const modal = document.getElementById('modal-topic-actions');
    const titleEl = document.getElementById('topic-action-title');
    const emojiEl = document.getElementById('topic-action-emoji');
    if (titleEl) titleEl.textContent = session.title || 'Topic';
    if (emojiEl) emojiEl.textContent = session.emoji || '💬';
    if (modal) modal.classList.remove('hidden');
    window.duduAudio?.playPop?.(440);
  }

  function closeTopicActionsModal() {
    const modal = document.getElementById('modal-topic-actions');
    if (modal) modal.classList.add('hidden');
  }

  function openRenameTopicModal(session) {
    if (!session) return;
    activeActionSession = session;
    closeTopicActionsModal();
    const modal = document.getElementById('modal-rename-topic');
    const titleInput = document.getElementById('input-rename-topic-title');
    const emojiSelect = document.getElementById('select-rename-topic-emoji');
    if (titleInput) titleInput.value = session.title || '';
    if (emojiSelect && session.emoji) emojiSelect.value = session.emoji;
    if (modal) modal.classList.remove('hidden');
    titleInput?.focus();
    window.duduAudio?.playPop?.(460);
  }

  function closeRenameTopicModal() {
    const modal = document.getElementById('modal-rename-topic');
    if (modal) modal.classList.add('hidden');
  }

  function renderSessionBar() {
    const container = document.getElementById('chat-sessions-list');
    if (!container) return;

    // Sort: active session first, then unread sessions, then recent activity
    const activeSession = activeSessions.find(s => s.id === activeSessionId) || activeSessions[0];
    const otherSessions = activeSessions.filter(s => s.id !== activeSession?.id);
    otherSessions.sort((a, b) => {
      const aUnread = unreadSessionIds.has(a.id) ? 1 : 0;
      const bUnread = unreadSessionIds.has(b.id) ? 1 : 0;
      if (aUnread !== bUnread) return bUnread - aUnread;
      return (b.lastActivity || 0) - (a.lastActivity || 0);
    });

    // Limit topic bookmarks to 3 items, followed by the swipeable All Topics button
    const allOrdered = activeSession ? [activeSession, ...otherSessions] : otherSessions;
    const visibleSessions = allOrdered.slice(0, 3);

    const sessionChipsHtml = visibleSessions.map(session => {
      const isActive = session.id === activeSessionId;
      const hasUnread = unreadSessionIds.has(session.id);
      const activeClasses = isActive
        ? 'bg-secondary text-surface-container-lowest shadow-xs ring-1 ring-secondary/50'
        : (hasUnread ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border-2 border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20 shadow-xs' : 'bg-surface-container-lowest text-primary hover:bg-surface-container-high border border-outline-variant/30');

      return `
        <button type="button" data-session-id="${session.id}" class="chat-session-chip relative button-press shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${activeClasses}">
          <span class="text-sm pointer-events-none">${session.emoji || '💬'}</span>
          <span class="pointer-events-none whitespace-nowrap">${escapeHtml(session.title)}</span>
          ${session.isPinned ? '<span class="material-symbols-outlined text-[12px] opacity-75 pointer-events-none">push_pin</span>' : ''}
          ${hasUnread ? '<span class="flex items-center gap-1 pointer-events-none"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-xs ring-2 ring-white dark:ring-stone-900"></span><span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">new</span></span>' : ''}
        </button>
      `;
    }).join('');

    const hasAnyUnread = unreadSessionIds.size > 0;
    const allTopicsBtnHtml = `
      <button type="button" id="btn-open-all-topics" class="chat-all-topics-btn relative button-press shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-heading font-bold bg-surface-container-low text-primary hover:bg-surface-container border border-outline-variant/30 transition-all cursor-pointer">
        <span class="material-symbols-outlined text-[15px] text-secondary pointer-events-none">grid_view</span>
        <span class="pointer-events-none whitespace-nowrap">All Topics</span>
        <span class="ml-0.5 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px] text-on-surface-variant font-extrabold">${activeSessions.length}</span>
        ${hasAnyUnread ? '<span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse pointer-events-none shrink-0 shadow-xs ring-1 ring-white dark:ring-stone-900"></span>' : ''}
      </button>
    `;

    container.innerHTML = sessionChipsHtml + allTopicsBtnHtml;

    container.querySelectorAll('.chat-session-chip').forEach(chip => {
      const sid = chip.getAttribute('data-session-id');
      const sess = activeSessions.find(s => s.id === sid);
      if (!sess) return;

      attachTopicLongPress(chip, sess, async () => {
        markSessionRead(sid);
        if (sid !== activeSessionId) {
          activeSessionId = sid;
          renderSessionBar();
          await loadActiveMessages();
          window.duduAudio?.playPop(440);
        }
      });
    });

    document.getElementById('btn-open-all-topics')?.addEventListener('click', () => {
      openAllTopicsModal();
    });

    // Update active topic header label if present
    const activeSess = activeSessions.find(s => s.id === activeSessionId);
    const headerTitle = document.getElementById('chat-active-topic-title');
    if (headerTitle) {
      if (activeSess) {
        headerTitle.innerHTML = `<span class="mr-1">${activeSess.emoji}</span>${escapeHtml(activeSess.title)}`;
      } else {
        headerTitle.innerHTML = `<span class="text-outline text-xs font-normal">No topic selected</span>`;
      }
    }
  }

  // --- All Topics Modal (Searchable) ---

  function openAllTopicsModal() {
    const modal = document.getElementById('modal-all-topics');
    if (!modal) return;
    const searchInput = document.getElementById('input-search-topics');
    if (searchInput) searchInput.value = '';
    renderAllTopicsList('');
    modal.classList.remove('hidden');
    window.duduAudio?.playPop(420);
  }

  function closeAllTopicsModal() {
    const modal = document.getElementById('modal-all-topics');
    if (modal) modal.classList.add('hidden');
  }

  function renderAllTopicsList(query = '') {
    const listContainer = document.getElementById('all-topics-list-container');
    const badge = document.getElementById('all-topics-count-badge');
    if (!listContainer) return;

    const filtered = activeSessions.filter(s => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (s.title && s.title.toLowerCase().includes(q)) || (s.emoji && s.emoji.includes(q));
    });

    if (badge) badge.textContent = `${filtered.length}`;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="p-6 text-center text-outline text-xs flex flex-col items-center gap-1">
          <span class="material-symbols-outlined text-2xl text-outline/60">search_off</span>
          <span>No topics matching "${escapeHtml(query)}"</span>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(session => {
      const isActive = session.id === activeSessionId;
      const hasUnread = unreadSessionIds.has(session.id);
      const borderClass = isActive
        ? 'border-2 border-secondary bg-secondary-container/20'
        : (hasUnread ? 'border-rose-400/60 bg-rose-500/5 hover:bg-rose-500/10' : 'border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container');

      return `
        <div data-session-id="${session.id}" class="all-topic-item button-press p-3 rounded-2xl flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer ${borderClass}">
          <div class="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
            <div class="relative shrink-0 flex items-center justify-center">
              <span class="text-xl">${session.emoji || '💬'}</span>
              ${hasUnread ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-stone-900 animate-pulse"></span>' : ''}
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="font-heading font-extrabold text-xs text-primary truncate">${escapeHtml(session.title)}</span>
                ${session.isPinned ? '<span class="material-symbols-outlined text-xs text-secondary">push_pin</span>' : ''}
                ${hasUnread ? '<span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">New</span>' : ''}
              </div>
              <span class="text-[10px] text-on-surface-variant font-medium mt-0.5">
                ${session.lastActivity ? formatTime(session.lastActivity) : 'Ready for chat'}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            ${isActive ? '<span class="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-secondary text-white pointer-events-none">Current</span>' : ''}
            <button type="button" data-rename-id="${session.id}" class="btn-item-rename-topic p-1 rounded-lg text-outline hover:text-[#8D5B4C] hover:bg-[#8D5B4C]/10 cursor-pointer button-press transition-colors" title="Rename Topic">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button type="button" data-delete-id="${session.id}" data-delete-title="${escapeHtml(session.title)}" class="btn-delete-topic p-1 rounded-lg text-outline hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer button-press transition-colors" title="Delete Topic">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.all-topic-item').forEach(item => {
      const sid = item.getAttribute('data-session-id');
      const sess = activeSessions.find(s => s.id === sid);
      if (!sess) return;

      attachTopicLongPress(item, sess, async (e) => {
        if (e.target.closest('.btn-delete-topic') || e.target.closest('.btn-item-rename-topic')) return;
        markSessionRead(sid);
        activeSessionId = sid;
        closeAllTopicsModal();
        renderSessionBar();
        await loadActiveMessages();
        window.duduAudio?.playPop(460);
      });
    });

    listContainer.querySelectorAll('.btn-item-rename-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = btn.getAttribute('data-rename-id');
        const sess = activeSessions.find(s => s.id === sid);
        if (sess) {
          closeAllTopicsModal();
          openRenameTopicModal(sess);
        }
      });
    });

    listContainer.querySelectorAll('.btn-delete-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = btn.getAttribute('data-delete-id');
        const title = btn.getAttribute('data-delete-title');
        if (sid) {
          startDeleteTopicWorkflow(sid, title);
        }
      });
    });
  }

  // --- Delete Topic 3-Step Confirmation Workflow ---

  let pendingDeleteSessionId = null;
  let pendingDeleteTitle = '';
  let deleteStep = 1;

  const DELETE_STEPS = [
    {
      step: 1,
      title: 'Are you sure?',
      desc: (title) => `Do you want to delete "${escapeHtml(title)}" and its chat messages?`,
      btnText: "Yes, I'm sure",
      icon: 'delete'
    },
    {
      step: 2,
      title: 'Are you actually sure?',
      desc: (title) => `All messages in "${escapeHtml(title)}" will be permanently lost!`,
      btnText: "I'm actually sure",
      icon: 'warning'
    },
    {
      step: 3,
      title: 'Are you super duper sure?',
      desc: () => 'Final warning! There is no undo. Permanently delete now?',
      btnText: 'Yes, delete forever',
      icon: 'delete_forever'
    }
  ];

  function startDeleteTopicWorkflow(sessionId, title) {
    pendingDeleteSessionId = sessionId;
    pendingDeleteTitle = title || 'Topic';
    deleteStep = 1;
    updateDeleteStepUI();
    const modal = document.getElementById('modal-delete-topic-confirm');
    if (modal) modal.classList.remove('hidden');
    window.duduAudio?.playPop(400);
  }

  function updateDeleteStepUI() {
    const conf = DELETE_STEPS[deleteStep - 1];
    if (!conf) return;

    const titleEl = document.getElementById('delete-prompt-title');
    const descEl = document.getElementById('delete-prompt-desc');
    const iconEl = document.getElementById('delete-prompt-icon');
    const btnConfirm = document.getElementById('btn-confirm-delete-step');

    if (titleEl) titleEl.textContent = conf.title;
    if (descEl) descEl.innerHTML = conf.desc(pendingDeleteTitle);
    if (iconEl) iconEl.innerHTML = `<span class="material-symbols-outlined text-3xl text-rose-500">${conf.icon}</span>`;
    if (btnConfirm) btnConfirm.textContent = conf.btnText;

    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById(`delete-step-dot-${i}`);
      if (dot) {
        if (i <= deleteStep) {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500 scale-110 transition-all';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-surface-container-highest transition-all';
        }
      }
    }
  }

  function closeDeleteModal() {
    const modal = document.getElementById('modal-delete-topic-confirm');
    if (modal) modal.classList.add('hidden');
    pendingDeleteSessionId = null;
    pendingDeleteTitle = '';
    deleteStep = 1;
  }

  async function advanceOrExecuteDelete() {
    if (!pendingDeleteSessionId) return;

    if (deleteStep < 3) {
      deleteStep++;
      updateDeleteStepUI();
      window.duduAudio?.playPop(480);
      return;
    }

    // Step 3 confirmed -> Execute deletion
    const deletedTitle = pendingDeleteTitle;
    const targetSessionId = pendingDeleteSessionId;
    await DuduChatStorage.deleteSession(targetSessionId);
    DuduChatSocket.sendDeleteTopic(targetSessionId);
    closeDeleteModal();
    await loadSessions();

    const searchInput = document.getElementById('input-search-topics');
    renderAllTopicsList(searchInput ? searchInput.value.trim() : '');

    if (window.showToast) {
      window.showToast(`Done! "${deletedTitle}" deleted.`);
    }
    window.duduAudio?.playSparkle?.();
  }

  // --- Message Rendering & Scrolling (Paginated Chunks) ---
  const CHAT_PAGE_SIZE = 30;
  let activeSessionAllMessages = [];
  let renderedMessageCount = 0;
  let isLoadingOlderMessages = false;

  async function loadActiveMessages(preserveScroll = false) {
    exitSelectionMode();
    const listContainer = document.getElementById('chat-messages-container');
    if (!listContainer) return;

    if (!activeSessionId) {
      activeSessionAllMessages = [];
      renderedMessageCount = 0;
      listContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant/70 gap-2 my-auto select-none">
          <div class="w-14 h-14 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary text-2xl mb-1 shadow-inner">
            <span class="material-symbols-outlined text-2xl text-secondary">forum</span>
          </div>
          <p class="font-heading font-bold text-xs text-primary">No topics yet</p>
          <p class="text-[11px] max-w-xs leading-relaxed text-outline">
            Tap the "+" button at the top to create a new chat space!
          </p>
        </div>
      `;
      return;
    }

    activeSessionAllMessages = await DuduChatStorage.getMessages(activeSessionId);
    const myIdentity = DuduChatCrypto.getStoredIdentity();

    if (activeSessionAllMessages.length === 0) {
      renderedMessageCount = 0;
      const activeSess = activeSessions.find(s => s.id === activeSessionId);
      listContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant/70 gap-2 my-auto select-none">
          <div class="w-14 h-14 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary text-2xl mb-1 shadow-inner">
            <span class="text-2xl">${activeSess?.emoji || '💬'}</span>
          </div>
          <p class="font-heading font-bold text-xs text-primary">No messages in "${escapeHtml(activeSess?.title || 'Topic')}" yet</p>
          <p class="text-[11px] max-w-xs leading-relaxed text-outline">
            Say something sweet to Bubu, share an idea, or send a cute Dudu sticker!
          </p>
        </div>
      `;
      return;
    }

    const totalCount = activeSessionAllMessages.length;
    renderedMessageCount = Math.min(totalCount, CHAT_PAGE_SIZE);
    const initialChunk = activeSessionAllMessages.slice(totalCount - renderedMessageCount);

    // Pre-populate memory URLs from IndexedDB blob cache for initial chunk
    for (const msg of initialChunk) {
      if (msg.type === 'blob') {
        try {
          const meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
          if (meta.blobId && !localBlobUrls.has(meta.blobId)) {
            const cachedBlob = await DuduChatStorage.getBlob(meta.blobId);
            if (cachedBlob) {
              localBlobUrls.set(meta.blobId, URL.createObjectURL(cachedBlob));
            }
          }
        } catch (e) {}
      }
    }

    let topBannerHtml = '';
    if (renderedMessageCount < totalCount) {
      const remaining = totalCount - renderedMessageCount;
      topBannerHtml = `
        <div id="chat-load-older-banner" class="w-full flex items-center justify-center py-2 select-none shrink-0">
          <button type="button" id="btn-load-older-msgs" class="text-[11px] font-bold text-secondary bg-surface-container hover:bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer button-press transition-colors shadow-2xs">
            <span class="material-symbols-outlined text-[14px]">history</span>
            <span>Load older messages (${remaining})</span>
          </button>
        </div>
      `;
    }

    listContainer.innerHTML = topBannerHtml + initialChunk.map(msg => renderMessageBubble(msg, myIdentity)).join('');

    if (!preserveScroll) {
      jumpToBottom();
      setTimeout(jumpToBottom, 40);
      setTimeout(jumpToBottom, 120);
    }

    if (activeSessionId) {
      DuduChatSocket.sendReadReceipt(activeSessionId, Date.now());
    }
  }

  async function loadOlderMessagesChunk() {
    if (isLoadingOlderMessages) return;
    const totalCount = activeSessionAllMessages.length;
    if (renderedMessageCount >= totalCount) return;

    isLoadingOlderMessages = true;
    const listContainer = document.getElementById('chat-messages-container');
    if (!listContainer) {
      isLoadingOlderMessages = false;
      return;
    }

    const prevScrollHeight = listContainer.scrollHeight;
    const prevScrollTop = listContainer.scrollTop;

    const currentCount = renderedMessageCount;
    const nextCount = Math.min(totalCount, currentCount + CHAT_PAGE_SIZE);
    const olderChunk = activeSessionAllMessages.slice(totalCount - nextCount, totalCount - currentCount);
    renderedMessageCount = nextCount;

    for (const msg of olderChunk) {
      if (msg.type === 'blob') {
        try {
          const meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
          if (meta.blobId && !localBlobUrls.has(meta.blobId)) {
            const cachedBlob = await DuduChatStorage.getBlob(meta.blobId);
            if (cachedBlob) {
              localBlobUrls.set(meta.blobId, URL.createObjectURL(cachedBlob));
            }
          }
        } catch (e) {}
      }
    }

    const myIdentity = DuduChatCrypto.getStoredIdentity();
    const olderHtml = olderChunk.map(msg => renderMessageBubble(msg, myIdentity)).join('');

    const existingBanner = document.getElementById('chat-load-older-banner');
    if (existingBanner) existingBanner.remove();

    let newTopBannerHtml = '';
    if (renderedMessageCount < totalCount) {
      const remaining = totalCount - renderedMessageCount;
      newTopBannerHtml = `
        <div id="chat-load-older-banner" class="w-full flex items-center justify-center py-2 select-none shrink-0">
          <button type="button" id="btn-load-older-msgs" class="text-[11px] font-bold text-secondary bg-surface-container hover:bg-surface-container-high px-3.5 py-1.5 rounded-full border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer button-press transition-colors shadow-2xs">
            <span class="material-symbols-outlined text-[14px]">history</span>
            <span>Load older messages (${remaining})</span>
          </button>
        </div>
      `;
    }

    listContainer.insertAdjacentHTML('afterbegin', newTopBannerHtml + olderHtml);

    // Retain exact viewport position
    const newScrollHeight = listContainer.scrollHeight;
    const heightDiff = newScrollHeight - prevScrollHeight;
    listContainer.scrollTop = prevScrollTop + heightDiff;

    isLoadingOlderMessages = false;
  }

  function getCheckmarkHtml(msg) {
    const status = msg.status;
    if (status === 'read') {
      return `<span class="material-symbols-outlined text-[11px] text-sky-500 font-bold msg-check-icon" data-msg-id="${msg.id}" data-timestamp="${msg.timestamp || 0}">done_all</span>`;
    } else if (status === 'delivered') {
      return `<span class="material-symbols-outlined text-[11px] text-outline msg-check-icon" data-msg-id="${msg.id}" data-timestamp="${msg.timestamp || 0}">done_all</span>`;
    } else {
      return `<span class="material-symbols-outlined text-[11px] text-outline msg-check-icon" data-msg-id="${msg.id}" data-timestamp="${msg.timestamp || 0}">done</span>`;
    }
  }

  function startReply(message) {
    if (!message) return;
    activeReplyMessage = {
      id: message.id,
      sender: message.sender,
      type: message.type,
      content: message.type === 'text' ? message.content : (message.type === 'sticker' ? 'Sticker' : (message.type === 'video' ? 'Video' : 'Photo'))
    };

    const replyBar = document.getElementById('chat-reply-bar');
    const replySender = document.getElementById('chat-reply-sender');
    const replySnippet = document.getElementById('chat-reply-snippet');

    if (replyBar && replySender && replySnippet) {
      const myIdentity = DuduChatCrypto.getStoredIdentity() || 'dudu';
      const myIdLower = myIdentity.toLowerCase();
      const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
      const senderLower = (message.sender || '').toLowerCase();
      const isSenderDudu = senderLower.includes('dudu') || senderLower.includes('kevin');
      const label = (isMeDudu === isSenderDudu) ? 'You' : (isSenderDudu ? 'Dudu' : 'Bubu');

      replySender.textContent = `Replying to ${label}`;
      let preview = message.content || '';
      if (message.type === 'sticker') preview = '🧸 Sticker';
      else if (message.type === 'image') preview = '📷 Photo';
      else if (message.type === 'video') preview = '🎥 Video';
      replySnippet.textContent = preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
      replyBar.classList.remove('hidden');
    }

    const input = document.getElementById('chat-text-input');
    if (input) input.focus();
    window.duduAudio?.playPop?.(480);
  }

  function cancelReply() {
    activeReplyMessage = null;
    const replyBar = document.getElementById('chat-reply-bar');
    if (replyBar) replyBar.classList.add('hidden');
  }

  function openMsgActionsModal(message) {
    if (!message) return;
    selectedActionMessage = message;
    const modal = document.getElementById('modal-message-actions');
    const preview = document.getElementById('msg-action-preview-text');
    if (preview) {
      const text = getMessageCopyText(message);
      preview.textContent = text.length > 80 ? text.substring(0, 77) + '...' : text;
    }
    if (modal) modal.classList.remove('hidden');
    window.duduAudio?.playPop?.(400);
  }

  function closeMsgActionsModal() {
    const modal = document.getElementById('modal-message-actions');
    if (modal) modal.classList.add('hidden');
    selectedActionMessage = null;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async function copyToClipboard(text) {
    if (text === null || text === undefined) return false;
    const str = String(text);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(str);
        return true;
      }
    } catch (err) {
      console.warn('[Clipboard] navigator.clipboard error, trying fallback:', err);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = str;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (e) {
      console.error('[Clipboard] execCommand fallback failed:', e);
      return false;
    }
  }

  function getMessageCopyText(msg) {
    if (!msg) return '';
    if (msg.type === 'text') {
      return msg.content || '';
    }
    if (msg.type === 'sticker') {
      const stickerId = parseInt(msg.content, 10);
      const sticker = window.DuduTaxonomy?.getById?.(stickerId) || window.DUDU_STICKERS?.[stickerId - 1];
      return sticker?.title ? `[Sticker: ${sticker.title}]` : `[Sticker #${msg.content}]`;
    }
    if (msg.type === 'image') {
      return '[Photo]';
    }
    if (msg.type === 'video') {
      return '[Video]';
    }
    if (msg.type === 'blob') {
      try {
        const meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
        return `[File: ${meta.fileName || 'Attachment'}]`;
      } catch (e) {
        return '[Attachment]';
      }
    }
    return String(msg.content || '');
  }

  async function uploadEncryptedBlob(file, cryptoKey, onProgress) {
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const blobId = 'blob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const httpBase = DuduChatSocket.getHttpBaseUrl();
    const token = DuduChatSocket.getAuthToken ? DuduChatSocket.getAuthToken() : '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';

    for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
      const slice = file.slice(chunkIdx * CHUNK_SIZE, (chunkIdx + 1) * CHUNK_SIZE);
      const arrayBuffer = await slice.arrayBuffer();
      const encryptedPacket = await DuduChatCrypto.encryptChunk(arrayBuffer, cryptoKey);

      const res = await fetch(`${httpBase}/api/blobs/${blobId}/chunk/${chunkIdx}?total=${totalChunks}&token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-relay-token': token
        },
        body: encryptedPacket
      });
      if (!res.ok) throw new Error(`Failed to upload chunk ${chunkIdx}`);
      if (onProgress) onProgress(Math.round(((chunkIdx + 1) / totalChunks) * 100));
    }

    return { blobId, totalChunks };
  }

  async function downloadEncryptedBlob(blobMeta, cryptoKey, onProgress) {
    const blobId = blobMeta.blobId;
    const cached = await DuduChatStorage.getBlob(blobId);
    if (cached) return cached;

    const httpBase = DuduChatSocket.getHttpBaseUrl();
    const token = DuduChatSocket.getAuthToken ? DuduChatSocket.getAuthToken() : '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
    const decryptedChunks = [];
    const total = blobMeta.totalChunks || 1;

    for (let i = 0; i < total; i++) {
      const res = await fetch(`${httpBase}/api/blobs/${blobId}/chunk/${i}?token=${encodeURIComponent(token)}`, {
        headers: { 'x-relay-token': token }
      });
      if (!res.ok) throw new Error(`Failed to download chunk ${i}`);
      const encBuffer = await res.arrayBuffer();
      const decBuffer = await DuduChatCrypto.decryptChunk(encBuffer, cryptoKey);
      decryptedChunks.push(decBuffer);
      if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
    }

    const finalBlob = new Blob(decryptedChunks, { type: blobMeta.fileType || 'application/octet-stream' });
    await DuduChatStorage.saveBlob(blobId, finalBlob, { fileName: blobMeta.fileName, fileType: blobMeta.fileType });
    return finalBlob;
  }

  async function downloadAndDisplayBlob(blobId) {
    if (!blobId) return;
    if (localBlobUrls.has(blobId)) return localBlobUrls.get(blobId);

    const messages = await DuduChatStorage.getMessages(activeSessionId);
    const msg = messages.find(m => {
      if (m.type !== 'blob') return false;
      try {
        const meta = typeof m.content === 'object' ? m.content : JSON.parse(m.content);
        return meta.blobId === blobId;
      } catch (e) { return false; }
    });
    if (!msg) return;
    const meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);

    const card = document.querySelector(`.blob-media-card[data-blob-id="${blobId}"]`);
    const btn = card?.querySelector('.btn-load-blob');
    const label = card?.querySelector('.blob-btn-label');
    const progressContainer = card?.querySelector('.blob-progress-bar');
    const progressBar = progressContainer?.querySelector('div');

    if (btn) btn.disabled = true;
    if (progressContainer) progressContainer.classList.remove('hidden');

    try {
      if (!activeCryptoKey) await updateCryptoKey();
      const finalBlob = await downloadEncryptedBlob(meta, activeCryptoKey, (pct) => {
        if (label) label.textContent = `Decrypting: ${pct}%`;
        if (progressBar) progressBar.style.width = `${pct}%`;
      });

      const url = URL.createObjectURL(finalBlob);
      localBlobUrls.set(blobId, url);

      const row = card?.closest('.chat-bubble-row');
      if (row) {
        const myIdentity = DuduChatCrypto.getStoredIdentity();
        row.outerHTML = renderMessageBubble(msg, myIdentity);
        window.duduAudio?.playSparkle?.();
      }
      return url;
    } catch (err) {
      console.error('[ChatUI] Download error:', err);
      if (label) label.textContent = 'Failed (Retry)';
      if (btn) btn.disabled = false;
      if (window.showToast) window.showToast('Download failed');
    }
  }

  function enterSelectionMode(initialMessageId) {
    isSelectionMode = true;
    selectedMessageIds.clear();
    if (initialMessageId) {
      selectedMessageIds.add(initialMessageId);
    }
    updateSelectionUI();
    window.duduAudio?.playPop?.(400);
  }

  function exitSelectionMode() {
    isSelectionMode = false;
    selectedMessageIds.clear();
    updateSelectionUI();
  }

  function toggleSelectMessage(messageId) {
    if (!messageId) return;
    if (selectedMessageIds.has(messageId)) {
      selectedMessageIds.delete(messageId);
    } else {
      selectedMessageIds.add(messageId);
    }
    if (selectedMessageIds.size === 0) {
      exitSelectionMode();
      return;
    }
    updateSelectionUI();
    window.duduAudio?.playPop?.(460);
  }

  function updateSelectionUI() {
    const bar = document.getElementById('chat-selection-bar');
    const countEl = document.getElementById('chat-selection-count');

    if (isSelectionMode) {
      if (bar) bar.classList.remove('hidden');
      if (countEl) countEl.textContent = `${selectedMessageIds.size} selected`;
    } else {
      if (bar) bar.classList.add('hidden');
    }

    document.querySelectorAll('.chat-bubble-row').forEach(row => {
      const id = row.getAttribute('data-msg-id');
      if (isSelectionMode && selectedMessageIds.has(id)) {
        row.classList.add('ring-2', 'ring-secondary', 'bg-secondary/15', 'rounded-2xl', 'p-1');
      } else {
        row.classList.remove('ring-2', 'ring-secondary', 'bg-secondary/15', 'rounded-2xl', 'p-1');
      }
    });
  }

  function openForwardTopicModal(messages) {
    if (!messages) return;
    pendingForwardMessages = Array.isArray(messages) ? messages : [messages];
    if (pendingForwardMessages.length === 0) return;

    const modal = document.getElementById('modal-forward-topic');
    const listEl = document.getElementById('forward-topics-list');
    if (listEl) {
      listEl.innerHTML = activeSessions.map(s => `
        <button type="button" class="forward-topic-item button-press w-full p-2.5 rounded-xl bg-surface-container-low hover:bg-secondary-container/30 flex items-center justify-between text-left border border-outline-variant/30 cursor-pointer transition-colors" data-session-id="${s.id}">
          <div class="flex items-center gap-2">
            <span class="text-base">${s.emoji || '💬'}</span>
            <span class="text-xs font-bold text-primary">${escapeHtml(s.title)}</span>
          </div>
          <span class="material-symbols-outlined text-sm text-secondary">send</span>
        </button>
      `).join('');

      listEl.querySelectorAll('.forward-topic-item').forEach(btn => {
        btn.addEventListener('click', async () => {
          const targetSessionId = btn.getAttribute('data-session-id');
          if (targetSessionId && pendingForwardMessages && pendingForwardMessages.length > 0) {
            await executeBatchForward(pendingForwardMessages, targetSessionId);
          }
        });
      });
    }
    if (modal) modal.classList.remove('hidden');
    window.duduAudio?.playPop?.(400);
  }

  function closeForwardTopicModal() {
    const modal = document.getElementById('modal-forward-topic');
    if (modal) modal.classList.add('hidden');
    pendingForwardMessages = [];
    pendingForwardMessage = null;
  }

  async function executeBatchForward(msgsOrIds, targetSessionId) {
    closeForwardTopicModal();
    let count = 0;
    for (const item of msgsOrIds) {
      let msg = typeof item === 'object' ? item : await DuduChatStorage.getMessage(item);
      if (msg) {
        await executeForwardMessage(msg, targetSessionId, false);
        count++;
      }
    }
    if (isSelectionMode) {
      exitSelectionMode();
    }
    const targetSess = activeSessions.find(s => s.id === targetSessionId);
    if (window.showToast) window.showToast(`Forwarded ${count} message(s) to "${targetSess?.title || 'Topic'}"!`);
    window.duduAudio?.playSparkle?.();
  }

  async function executeForwardMessage(msg, targetSessionId, showFeedback = true) {
    const forwardedMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId: targetSessionId,
      sender: DuduChatCrypto.getStoredIdentity(),
      type: msg.type,
      content: msg.content,
      isForwarded: true,
      timestamp: Date.now(),
      status: 'pending'
    };

    if (targetSessionId === activeSessionId) {
      await handleOutboundMessage(forwardedMsg);
    } else {
      await DuduChatStorage.saveMessage(forwardedMsg);
      if (!activeCryptoKey) await updateCryptoKey();
      try {
        const encryptedPacket = await DuduChatCrypto.encrypt(forwardedMsg, activeCryptoKey);
        const wirePacket = {
          id: forwardedMsg.id,
          sessionId: forwardedMsg.sessionId,
          sender: forwardedMsg.sender,
          type: forwardedMsg.type,
          timestamp: forwardedMsg.timestamp,
          iv: encryptedPacket.iv,
          ciphertext: encryptedPacket.ciphertext
        };
        DuduChatSocket.send(wirePacket);
      } catch (e) {}
      loadSessions();
    }

    if (showFeedback) {
      const targetSess = activeSessions.find(s => s.id === targetSessionId);
      if (window.showToast) window.showToast(`Forwarded to "${targetSess?.title || 'Topic'}"!`);
      window.duduAudio?.playSparkle?.();
    }
  }

  function promptDeleteConfirmation(messageIds) {
    if (!messageIds) return;
    pendingDeleteMessageIds = Array.isArray(messageIds) ? messageIds : [messageIds];
    if (pendingDeleteMessageIds.length === 0) return;

    const modal = document.getElementById('modal-delete-message-confirm');
    const textEl = document.getElementById('delete-message-confirm-text');
    if (textEl) {
      if (pendingDeleteMessageIds.length === 1) {
        textEl.textContent = 'Are you sure you want to delete this message? This cannot be undone.';
      } else {
        textEl.textContent = `Are you sure you want to delete ${pendingDeleteMessageIds.length} messages? This cannot be undone.`;
      }
    }
    if (modal) modal.classList.remove('hidden');
    window.duduAudio?.playPop?.(400);
  }

  function closeDeleteConfirmModal() {
    const modal = document.getElementById('modal-delete-message-confirm');
    if (modal) modal.classList.add('hidden');
    pendingDeleteMessageIds = [];
  }

  async function executeDeleteMessages(messageIds) {
    if (!messageIds || messageIds.length === 0) return;
    closeDeleteConfirmModal();

    let count = 0;
    for (const messageId of messageIds) {
      const msg = await DuduChatStorage.getMessage(messageId);
      let blobId = null;
      if (msg && msg.type === 'blob') {
        try {
          const meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
          blobId = meta.blobId;
        } catch (e) {}
      }

      await DuduChatStorage.deleteMessage(messageId);
      if (blobId) {
        await DuduChatStorage.deleteBlob(blobId);
        localBlobUrls.delete(blobId);
      }

      DuduChatSocket.sendDeleteMessage(messageId, activeSessionId, blobId);
      activeSessionAllMessages = activeSessionAllMessages.filter(m => m.id !== messageId);
      renderedMessageCount = Math.max(0, renderedMessageCount - 1);
      const row = document.querySelector(`.chat-bubble-row[data-msg-id="${messageId}"]`);
      if (row) row.remove();
      count++;
    }

    const listContainer = document.getElementById('chat-messages-container');
    if (listContainer && listContainer.querySelectorAll('.chat-bubble-row').length === 0) {
      await loadActiveMessages(false);
    }

    if (isSelectionMode) {
      exitSelectionMode();
    }

    window.duduAudio?.playPop?.(300);
    if (window.showToast) {
      window.showToast(count === 1 ? 'Message deleted' : `Deleted ${count} messages`);
    }
  }

  const confirmDeleteMessage = promptDeleteConfirmation;

  function isSenderDudu(sender) {
    const s = String(sender || '').toLowerCase();
    return s.includes('dudu') || s.includes('kevin');
  }

  function isMessageFromMe(msg, myIdentity) {
    const activeId = myIdentity || DuduChatCrypto.getStoredIdentity();
    const myIdLower = String(activeId || '').toLowerCase();
    const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
    const msgSenderDudu = isSenderDudu(msg.sender);
    return isMeDudu ? msgSenderDudu : !msgSenderDudu;
  }

  function renderMessageBubble(msg, myIdentity) {
    const activeId = myIdentity || DuduChatCrypto.getStoredIdentity();
    const myIdLower = String(activeId || '').toLowerCase();
    const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
    const isMe = isMessageFromMe(msg, activeId);
    const timeStr = formatTime(msg.timestamp);

    let forwardedHtml = '';
    if (msg.isForwarded) {
      forwardedHtml = `
        <div class="flex items-center gap-1 text-[9px] opacity-75 italic mb-1 select-none">
          <span class="material-symbols-outlined text-[11px]">forward</span>
          <span>Forwarded</span>
        </div>
      `;
    }

    let quoteHtml = '';
    if (msg.replyTo) {
      const replySender = (msg.replyTo.sender || '').toLowerCase();
      const isReplyDudu = replySender.includes('dudu') || replySender.includes('kevin');
      const replyLabel = (isMeDudu === isReplyDudu) ? 'You' : (isReplyDudu ? 'Dudu' : 'Bubu');
      let snippet = msg.replyTo.content || '';
      if (msg.replyTo.type === 'sticker') snippet = '🧸 Sticker';
      else if (msg.replyTo.type === 'image') snippet = '📷 Photo';
      else if (msg.replyTo.type === 'video') snippet = '🎥 Video';
      else if (msg.replyTo.type === 'blob') {
        try {
          const m = typeof snippet === 'object' ? snippet : JSON.parse(snippet);
          snippet = `📁 ${m.fileName || 'Attachment'}`;
        } catch (e) { snippet = '📁 Attachment'; }
      }
      if (snippet.length > 55) snippet = snippet.substring(0, 52) + '...';

      quoteHtml = `
        <div class="mb-1 p-1.5 rounded-lg bg-black/10 dark:bg-white/10 border-l-2 border-secondary text-[10px] cursor-pointer hover:opacity-80 transition-opacity reply-quote-jump select-none" data-target-id="${escapeHtml(msg.replyTo.id)}">
          <span class="font-bold text-secondary block">${escapeHtml(replyLabel)}</span>
          <span class="opacity-80 truncate block">${escapeHtml(snippet)}</span>
        </div>
      `;
    }

    const isSticker = msg.type === 'sticker';
    const isGifOrStickerImg = msg.type === 'image' && typeof msg.content === 'string' && (msg.content.includes('stickers_gif') || msg.content.includes('chat_stk') || msg.content.endsWith('.gif'));
    const isPureSticker = (isSticker || isGifOrStickerImg) && !msg.replyTo && !msg.forwardedFrom;

    let contentHtml = '';
    if (msg.type === 'sticker') {
      const stickerId = parseInt(msg.content, 10);
      const sticker = window.DuduTaxonomy?.getById(stickerId) || window.DUDU_STICKERS?.[0];
      const stickerFile = sticker ? sticker.file : 'STK-20260925-WA0187.webp';
      contentHtml = `
        <div class="w-36 h-36 xs:w-44 xs:h-44 sm:w-48 sm:h-48 py-1 select-none pointer-events-none flex items-center justify-center">
          <img src="Dudu Stickers/${stickerFile}" alt="Sticker" loading="lazy" class="w-full h-full object-contain filter drop-shadow-sm">
        </div>
      `;
    } else if (isGifOrStickerImg) {
      contentHtml = `
        <div class="w-36 h-36 xs:w-44 xs:h-44 sm:w-48 sm:h-48 py-1 select-none pointer-events-none flex items-center justify-center">
          <img src="${msg.content}" alt="Sticker Animasi" loading="lazy" class="w-full h-full object-contain filter drop-shadow-sm">
        </div>
      `;
    } else if (msg.type === 'image') {
      contentHtml = `
        <div class="rounded-xl overflow-hidden cursor-pointer max-w-[220px] xs:max-w-[260px] my-1 group/img" data-img-src="${escapeHtml(msg.content)}" onclick="window.DuduChatUI?.previewImage(this.getAttribute('data-img-src'))">
          <img src="${msg.content}" alt="Photo" loading="lazy" class="w-full h-auto max-h-56 object-cover rounded-xl group-hover/img:opacity-95 transition-opacity">
        </div>
      `;
    } else if (msg.type === 'video') {
      contentHtml = `
        <div class="rounded-xl overflow-hidden max-w-[220px] xs:max-w-[260px] my-1 bg-black">
          <video src="${msg.content}" controls playsinline preload="metadata" class="w-full max-h-56 rounded-xl object-contain"></video>
        </div>
      `;
    } else if (msg.type === 'blob') {
      let meta = {};
      try {
        meta = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
      } catch (e) {
        meta = { fileName: 'File', fileSize: 0, mediaKind: 'file', blobId: '' };
      }
      const blobId = meta.blobId || '';
      const existingUrl = localBlobUrls.get(blobId);

      if (existingUrl) {
        if (meta.mediaKind === 'video') {
          contentHtml = `
            <div class="rounded-xl overflow-hidden max-w-[220px] xs:max-w-[260px] my-1 bg-black">
              <video src="${existingUrl}" controls playsinline preload="metadata" class="w-full max-h-56 rounded-xl object-contain"></video>
            </div>
          `;
        } else if (meta.mediaKind === 'image') {
          contentHtml = `
            <div class="rounded-xl overflow-hidden cursor-pointer max-w-[220px] xs:max-w-[260px] my-1 group/img" data-img-src="${escapeHtml(existingUrl)}" onclick="window.DuduChatUI?.previewImage(this.getAttribute('data-img-src'))">
              <img src="${existingUrl}" alt="Photo" loading="lazy" class="w-full h-auto max-h-56 object-cover rounded-xl group-hover/img:opacity-95 transition-opacity">
            </div>
          `;
        } else {
          contentHtml = `
            <div class="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 my-1">
              <span class="material-symbols-outlined text-2xl text-secondary">description</span>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-bold truncate">${escapeHtml(meta.fileName)}</span>
                <span class="text-[9px] text-outline">${formatBytes(meta.fileSize)}</span>
              </div>
              <a href="${existingUrl}" download="${escapeHtml(meta.fileName)}" class="button-press p-1.5 rounded-lg bg-secondary text-white flex items-center justify-center">
                <span class="material-symbols-outlined text-xs">download</span>
              </a>
            </div>
          `;
        }
      } else {
        const iconName = meta.mediaKind === 'video' ? 'videocam' : (meta.mediaKind === 'image' ? 'photo' : 'attach_file');
        contentHtml = `
          <div class="flex flex-col gap-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 my-1 min-w-[180px] blob-media-card" data-blob-id="${escapeHtml(blobId)}">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                <span class="material-symbols-outlined text-base">${iconName}</span>
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-bold truncate">${escapeHtml(meta.fileName || 'Encrypted File')}</span>
                <span class="text-[9px] text-outline">${formatBytes(meta.fileSize)} • E2EE</span>
              </div>
            </div>
            <button type="button" class="btn-load-blob button-press w-full py-1.5 px-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs" data-blob-id="${escapeHtml(blobId)}">
              <span class="material-symbols-outlined text-xs">download</span>
              <span class="blob-btn-label">Download &amp; Play</span>
            </button>
            <div class="w-full bg-black/10 rounded-full h-1 overflow-hidden hidden blob-progress-bar">
              <div class="bg-secondary h-full transition-all duration-150" style="width: 0%"></div>
            </div>
          </div>
        `;
      }
    } else {
      contentHtml = `<p class="text-[15px] sm:text-base leading-relaxed break-words whitespace-pre-wrap">${escapeHtml(msg.content)}</p>`;
    }

    const bubbleBodyClassMe = isPureSticker
      ? 'chat-bubble-body bg-transparent border-0 shadow-none p-0 cursor-pointer min-w-0 max-w-full'
      : 'chat-bubble-body bg-[#8D5B4C] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-sm border-0 cursor-pointer min-w-0 max-w-full break-words';

    const bubbleBodyClassPartner = isPureSticker
      ? 'chat-bubble-body bg-transparent border-0 shadow-none p-0 cursor-pointer min-w-0 max-w-full'
      : 'chat-bubble-body bg-white dark:bg-stone-800 text-[#4A3222] dark:text-stone-100 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-sm border border-[#E8DACB] dark:border-stone-700 cursor-pointer min-w-0 max-w-full break-words';

    if (isMe) {
      return `
        <div class="chat-bubble-row flex flex-col items-end gap-0.5 max-w-[85%] self-end group relative transition-transform ${isSelectionMode && selectedMessageIds.has(msg.id) ? 'ring-2 ring-secondary bg-secondary/15 rounded-2xl p-1' : ''}" data-msg-id="${msg.id}">
          <div class="flex items-center gap-1 max-w-full justify-end">
            <div class="msg-action-bar ${isSelectionMode ? 'hidden' : 'hidden md:group-hover:flex'} items-center gap-0.5 transition-opacity px-1 shrink-0">
              <button type="button" class="btn-quick-reply p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Reply" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">reply</span>
              </button>
              <button type="button" class="btn-quick-copy p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Copy" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">content_copy</span>
              </button>
              <button type="button" class="btn-quick-forward p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Forward" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">forward</span>
              </button>
              <button type="button" class="btn-quick-delete p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-rose-500 button-press cursor-pointer" title="Delete" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">delete</span>
              </button>
            </div>
            <div class="${bubbleBodyClassMe}" data-msg-id="${msg.id}">
              ${forwardedHtml}
              ${quoteHtml}
              ${contentHtml}
            </div>
          </div>
          <div class="flex items-center gap-1 px-1 text-[10px] text-stone-500 font-medium">
            <span>${timeStr}</span>
            ${getCheckmarkHtml(msg)}
          </div>
        </div>
      `;
    } else {
      const isPartnerDudu = isSenderDudu(msg.sender);
      const partnerLabel = isPartnerDudu ? 'Dudu' : 'Bubu';
      return `
        <div class="chat-bubble-row flex flex-col items-start gap-0.5 max-w-[85%] self-start group relative transition-transform ${isSelectionMode && selectedMessageIds.has(msg.id) ? 'ring-2 ring-secondary bg-secondary/15 rounded-2xl p-1' : ''}" data-msg-id="${msg.id}">
          <span class="text-xs font-heading font-bold text-[#8D5B4C] dark:text-stone-300 px-1">${escapeHtml(partnerLabel)}</span>
          <div class="flex items-center gap-1 max-w-full justify-start">
            <div class="${bubbleBodyClassPartner}" data-msg-id="${msg.id}">
              ${forwardedHtml}
              ${quoteHtml}
              ${contentHtml}
            </div>
            <div class="msg-action-bar ${isSelectionMode ? 'hidden' : 'hidden md:group-hover:flex'} items-center gap-0.5 transition-opacity px-1 shrink-0">
              <button type="button" class="btn-quick-reply p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Reply" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">reply</span>
              </button>
              <button type="button" class="btn-quick-copy p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Copy" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">content_copy</span>
              </button>
              <button type="button" class="btn-quick-forward p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-secondary button-press cursor-pointer" title="Forward" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">forward</span>
              </button>
              <button type="button" class="btn-quick-delete p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-rose-500 button-press cursor-pointer" title="Delete" data-msg-id="${msg.id}">
                <span class="material-symbols-outlined text-xs pointer-events-none">delete</span>
              </button>
            </div>
          </div>
          <span class="px-1 text-[10px] text-stone-500 font-medium">${timeStr}</span>
        </div>
      `;
    }
  }

  function jumpToBottom() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => {
      if (container) container.scrollTop = container.scrollHeight;
    });
  }

  function scrollToBottom(smooth = true) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      jumpToBottom();
    }
  }

  // --- Send Message Operations ---

  async function sendTextMessage() {
    const input = document.getElementById('chat-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    if (!activeSessionId) {
      if (window.showToast) window.showToast('Please create a topic first!');
      return;
    }

    input.value = '';
    input.style.height = 'auto'; // Reset auto-resize
    syncNavHeight();
    isTypingActive = false;
    clearTimeout(typingBroadcastTimeout);
    notifyTypingState(false);
    const sendBtn = document.getElementById('btn-send-message');
    if (sendBtn) sendBtn.classList.remove('scale-105', 'shadow-md');

    const replyToData = activeReplyMessage ? { ...activeReplyMessage } : null;
    cancelReply();

    const message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId: activeSessionId,
      sender: DuduChatCrypto.getStoredIdentity(),
      type: 'text',
      content: text,
      replyTo: replyToData,
      timestamp: Date.now(),
      status: 'pending'
    };

    await handleOutboundMessage(message);
    window.duduAudio?.playPop(520);
  }

  async function sendStickerMessage(stickerId) {
    if (!activeSessionId) {
      if (window.showToast) window.showToast('Please create a topic first!');
      return;
    }

    const replyToData = activeReplyMessage ? { ...activeReplyMessage } : null;
    cancelReply();

    const message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sessionId: activeSessionId,
      sender: DuduChatCrypto.getStoredIdentity(),
      type: 'sticker',
      content: String(stickerId),
      replyTo: replyToData,
      timestamp: Date.now(),
      status: 'pending'
    };

    await handleOutboundMessage(message);
    window.duduAudio?.playSparkle();
    closeStickerTray();
  }

  async function compressImageFile(file, maxWidth = 1200, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function sendMediaMessage(file) {
    if (!file) return;
    if (!activeSessionId) {
      if (window.showToast) window.showToast('Please create a topic first!');
      return;
    }

    const replyToData = activeReplyMessage ? { ...activeReplyMessage } : null;
    cancelReply();

    const isVideo = file.type && file.type.startsWith('video/');
    const isImage = file.type && file.type.startsWith('image/');
    const mediaKind = isVideo ? 'video' : (isImage ? 'image' : 'file');

    // Route large files (>256KB) or non-media attachments to chunked encrypted blob system
    if (file.size > 256 * 1024 || (!isVideo && !isImage)) {
      if (file.size > 200 * 1024 * 1024) {
        if (window.showToast) window.showToast('File too large (max 200MB)');
        return;
      }

      if (window.showToast) window.showToast(`Encrypting & uploading ${file.name || 'file'}...`);

      try {
        if (!activeCryptoKey) await updateCryptoKey();
        const { blobId, totalChunks } = await uploadEncryptedBlob(file, activeCryptoKey);

        const blobMeta = {
          blobId,
          fileName: file.name || (isVideo ? 'video.mp4' : (isImage ? 'photo.jpg' : 'attachment')),
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          mediaKind,
          totalChunks
        };

        // Save local blob reference so sender doesn't need to re-download
        await DuduChatStorage.saveBlob(blobId, file, { fileName: blobMeta.fileName, fileType: blobMeta.fileType });
        localBlobUrls.set(blobId, URL.createObjectURL(file));

        const message = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          sessionId: activeSessionId,
          sender: DuduChatCrypto.getStoredIdentity(),
          type: 'blob',
          content: JSON.stringify(blobMeta),
          replyTo: replyToData,
          timestamp: Date.now(),
          status: 'pending'
        };

        await handleOutboundMessage(message);
        window.duduAudio?.playPop?.(520);
        if (window.showToast) window.showToast('Encrypted media sent!');
      } catch (err) {
        console.error('[ChatUI] Blob upload error:', err);
        if (window.showToast) window.showToast('Failed to upload file');
      }
      return;
    }

    // Small video (<= 256KB): Send inline
    if (isVideo) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const videoDataUrl = e.target.result;
          const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            sessionId: activeSessionId,
            sender: DuduChatCrypto.getStoredIdentity(),
            type: 'video',
            content: videoDataUrl,
            replyTo: replyToData,
            timestamp: Date.now(),
            status: 'pending'
          };

          await handleOutboundMessage(message);
          window.duduAudio?.playPop?.(520);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('[ChatUI] Video processing error:', err);
        if (window.showToast) window.showToast('Could not process video');
      }
      return;
    }

    // Small images (<= 256KB): Compress and send inline
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 0.75);
      const message = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        sessionId: activeSessionId,
        sender: DuduChatCrypto.getStoredIdentity(),
        type: 'image',
        content: compressedDataUrl,
        replyTo: replyToData,
        timestamp: Date.now(),
        status: 'pending'
      };

      await handleOutboundMessage(message);
      window.duduAudio?.playPop?.(520);
    } catch (err) {
      console.error('[ChatUI] Photo processing error:', err);
      if (window.showToast) window.showToast('Could not process photo');
    }
  }

  const sendPhotoMessage = sendMediaMessage;

  function previewImage(src) {
    if (!src) return;
    const modal = document.getElementById('modal-photo-preview');
    const img = document.getElementById('img-full-preview');
    if (modal && img) {
      img.src = src;
      modal.classList.remove('hidden');
    }
  }

  function closePhotoPreview() {
    const modal = document.getElementById('modal-photo-preview');
    const img = document.getElementById('img-full-preview');
    if (modal) modal.classList.add('hidden');
    if (img) img.src = '';
  }

  async function handleOutboundMessage(message) {
    // 1. Save locally in IndexedDB
    await DuduChatStorage.saveMessage(message);

    if (message.sessionId === activeSessionId && !activeSessionAllMessages.some(m => m.id === message.id)) {
      activeSessionAllMessages.push(message);
      renderedMessageCount++;
    }

    // 2. Append to UI & Scroll (deduplicated by data-msg-id)
    const listContainer = document.getElementById('chat-messages-container');
    if (listContainer) {
      const emptyState = listContainer.querySelector('.select-none.my-auto');
      if (emptyState) listContainer.innerHTML = '';

      if (!listContainer.querySelector(`.chat-bubble-row[data-msg-id="${message.id}"]`)) {
        const myIdentity = DuduChatCrypto.getStoredIdentity();
        listContainer.insertAdjacentHTML('beforeend', renderMessageBubble(message, myIdentity));
      }
      scrollToBottom(true);
    }

    // 3. Encrypt payload via AES-GCM
    if (!activeCryptoKey) {
      await updateCryptoKey();
    }

    try {
      const encryptedPacket = await DuduChatCrypto.encrypt(message, activeCryptoKey);
      // 4. Send encrypted payload over WebSocket relay
      const wirePacket = {
        id: message.id,
        sessionId: message.sessionId,
        sender: message.sender,
        type: message.type,
        timestamp: message.timestamp,
        iv: encryptedPacket.iv,
        ciphertext: encryptedPacket.ciphertext
      };
      const sent = DuduChatSocket.send(wirePacket);
      if (!sent) {
        console.warn('[ChatUI] Device offline. Message saved locally as pending; auto-sending on reconnect.');
      }
    } catch (err) {
      console.error('[ChatUI] Encryption error during send:', err);
    }
  }

  let isFlushingPending = false;

  async function flushPendingMessages() {
    if (isFlushingPending) return;
    if (DuduChatSocket.getStatus() !== 'connected') return;

    isFlushingPending = true;
    try {
      const pending = await DuduChatStorage.getPendingMessages();
      if (!pending || pending.length === 0) {
        isFlushingPending = false;
        return;
      }

      if (!activeCryptoKey) {
        await updateCryptoKey();
      }

      console.log(`[ChatUI] Auto-flushing ${pending.length} pending offline messages...`);
      for (const message of pending) {
        try {
          const encryptedPacket = await DuduChatCrypto.encrypt(message, activeCryptoKey);
          const wirePacket = {
            id: message.id,
            sessionId: message.sessionId,
            sender: message.sender,
            type: message.type,
            timestamp: message.timestamp,
            iv: encryptedPacket.iv,
            ciphertext: encryptedPacket.ciphertext
          };
          const sent = DuduChatSocket.send(wirePacket);
          if (!sent) break;
        } catch (err) {
          console.error('[ChatUI] Error sending pending message:', err);
        }
      }
    } catch (err) {
      console.error('[ChatUI] Error in flushPendingMessages:', err);
    } finally {
      isFlushingPending = false;
    }
  }

  // --- Inbound Socket Handling ---

  function setupSocketListeners() {
    // 1. Incoming Message Payload
    DuduChatSocket.onMessage(async (packet) => {
      if (!packet || !packet.iv || !packet.ciphertext) return;

      if (!activeCryptoKey) {
        await updateCryptoKey();
      }

      try {
        const decryptedMsg = await DuduChatCrypto.decrypt(packet, activeCryptoKey);
        if (!decryptedMsg || !decryptedMsg.id || !decryptedMsg.sessionId) return;

        // Save incoming message in IndexedDB
        await DuduChatStorage.saveMessage(decryptedMsg);

        if (decryptedMsg.timestamp) {
          const currentSync = DuduChatStorage.getLastSyncTimestamp();
          if (decryptedMsg.timestamp > currentSync) {
            DuduChatStorage.setLastSyncTimestamp(decryptedMsg.timestamp);
          }
        }

        // Notify user if incoming message is from partner
        const myIdentity = DuduChatCrypto.getStoredIdentity();
        const senderLower = (decryptedMsg.sender || '').toLowerCase();
        const myIdLower = (myIdentity || '').toLowerCase();
        const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
        const isSenderDudu = senderLower.includes('dudu') || senderLower.includes('kevin');
        const isFromPartner = isMeDudu !== isSenderDudu;

        if (isFromPartner) {
          const partnerLabel = isMeDudu ? 'Bubu' : 'Dudu';
          const targetSession = activeSessions.find(s => s.id === decryptedMsg.sessionId);
          const topicName = targetSession ? (removeEmojis(targetSession.title) || targetSession.title) : 'Topic';
          let preview = decryptedMsg.content;
          if (decryptedMsg.type === 'sticker') preview = 'Sent a sticker';
          else if (decryptedMsg.type === 'image') preview = 'Sent a photo';
          else if (decryptedMsg.type === 'video') preview = 'Sent a video';
          else preview = removeEmojis(decryptedMsg.content) || decryptedMsg.content || 'New message';

          notifyUser(`[${topicName}] ${partnerLabel}`, preview);

          const isChatTabActive = document.body.classList.contains('chat-tab-active');
          const isViewingThisSession = isChatTabActive && activeSessionId === decryptedMsg.sessionId;
          if (!isViewingThisSession) {
            markSessionUnread(decryptedMsg.sessionId);
          }
        }

        // If message is for currently open session, append directly (deduplicated)
        if (decryptedMsg.sessionId === activeSessionId) {
          if (!activeSessionAllMessages.some(m => m.id === decryptedMsg.id)) {
            activeSessionAllMessages.push(decryptedMsg);
            renderedMessageCount++;
          }

          const listContainer = document.getElementById('chat-messages-container');
          if (listContainer) {
            const emptyState = listContainer.querySelector('.select-none.my-auto');
            if (emptyState) listContainer.innerHTML = '';

            if (!listContainer.querySelector(`.chat-bubble-row[data-msg-id="${decryptedMsg.id}"]`)) {
              listContainer.insertAdjacentHTML('beforeend', renderMessageBubble(decryptedMsg, myIdentity));
            }
            scrollToBottom(true);
          }
          window.duduAudio?.playPop(380);
          DuduChatSocket.sendReadReceipt(activeSessionId, decryptedMsg.timestamp || Date.now());
        } else {
          // If in another session, highlight session chips
          loadSessions();
          window.duduAudio?.playSparkle();
        }
      } catch (err) {
        console.warn('[ChatUI] Failed to decrypt incoming packet (passphrase mismatch?):', err.message);
      }
    });

    // 2. Socket Status Changes & Cloud Sync Catch-Up
    DuduChatSocket.onStatusChange(async (status) => {
      updateConnectionStatusUI(status);
      if (status === 'connected') {
        try {
          await flushPendingMessages();
          const lastTs = DuduChatStorage.getLastSyncTimestamp();
          DuduChatSocket.requestSync(lastTs);
        } catch (e) {}
      }
    });

    // 3. Offline Sync Catch-Up (From Server Cloud Storage Database)
    DuduChatSocket.onSync(async (missedMessages) => {
      if (!Array.isArray(missedMessages) || missedMessages.length === 0) return;
      if (!activeCryptoKey) await updateCryptoKey();

      let hasNewForActiveSession = false;
      let hasPartnerNew = false;
      let highestSyncTs = DuduChatStorage.getLastSyncTimestamp();
      const myIdentity = DuduChatCrypto.getStoredIdentity() || 'dudu';
      const myIdLower = myIdentity.toLowerCase();
      const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');

      for (const packet of missedMessages) {
        try {
          if (packet.timestamp && packet.timestamp > highestSyncTs) {
            highestSyncTs = packet.timestamp;
          }

          const existing = await DuduChatStorage.getMessage(packet.id);
          if (existing) continue;

          const decryptedMsg = await DuduChatCrypto.decrypt(packet, activeCryptoKey);
          if (decryptedMsg && decryptedMsg.id && decryptedMsg.sessionId) {
            await DuduChatStorage.saveMessage(decryptedMsg);

            const senderLower = (decryptedMsg.sender || '').toLowerCase();
            const isSenderDudu = senderLower.includes('dudu') || senderLower.includes('kevin');
            const isFromPartner = isMeDudu !== isSenderDudu;

            if (isFromPartner) {
              hasPartnerNew = true;
              const partnerLabel = isMeDudu ? 'Bubu' : 'Dudu';
              const targetSession = activeSessions.find(s => s.id === decryptedMsg.sessionId);
              const topicName = targetSession ? (removeEmojis(targetSession.title) || targetSession.title) : 'Topic';
              let preview = decryptedMsg.content;
              if (decryptedMsg.type === 'sticker') preview = 'Sent a sticker';
              else if (decryptedMsg.type === 'image') preview = 'Sent a photo';
              else if (decryptedMsg.type === 'video') preview = 'Sent a video';
              else preview = removeEmojis(decryptedMsg.content) || decryptedMsg.content || 'New message';

              notifyUser(`[${topicName}] ${partnerLabel}`, preview);

              const isChatTabActive = document.body.classList.contains('chat-tab-active');
              const isViewingThisSession = isChatTabActive && activeSessionId === decryptedMsg.sessionId;
              if (!isViewingThisSession) {
                markSessionUnread(decryptedMsg.sessionId);
              }
            }

            if (decryptedMsg.sessionId === activeSessionId) {
              hasNewForActiveSession = true;
            }
          }
        } catch (e) {
          console.warn('[ChatUI] Error decrypting synced message:', e.message);
        }
      }

      DuduChatStorage.setLastSyncTimestamp(highestSyncTs);

      if (hasNewForActiveSession) {
        await loadActiveMessages();
        DuduChatSocket.sendReadReceipt(activeSessionId, Date.now());
      }
      if (hasPartnerNew) {
        window.duduAudio?.playSparkle?.();
      }
      loadSessions();
    });

    // 4. Remote Deletion Sync
    DuduChatSocket.onDeleteMessage(async (messageId) => {
      if (!messageId) return;
      await DuduChatStorage.deleteMessage(messageId);
      activeSessionAllMessages = activeSessionAllMessages.filter(m => m.id !== messageId);
      renderedMessageCount = Math.max(0, renderedMessageCount - 1);
      const row = document.querySelector(`.chat-bubble-row[data-msg-id="${messageId}"]`);
      if (row) row.remove();
      const listContainer = document.getElementById('chat-messages-container');
      if (listContainer && listContainer.querySelectorAll('.chat-bubble-row').length === 0) {
        await loadActiveMessages(false);
      }
    });

    DuduChatSocket.onDeleteTopic(async (sessionId) => {
      if (!sessionId) return;
      markSessionRead(sessionId);
      await DuduChatStorage.deleteSession(sessionId);
      if (activeSessionId === sessionId) {
        const remainingSessions = await DuduChatStorage.getSessions();
        activeSessionId = remainingSessions.length > 0 ? remainingSessions[0].id : null;
        await loadActiveMessages();
      }
      loadSessions();
    });

    DuduChatSocket.onDeleteAllTopics(async () => {
      unreadSessionIds.clear();
      saveUnreadSessions();
      const all = await DuduChatStorage.getSessions();
      for (const s of all) {
        await DuduChatStorage.deleteSession(s.id);
      }
      activeSessionId = null;
      await loadActiveMessages();
      loadSessions();
    });

    // Topic Creation & Real-Time Sync (Dudu creates -> Bubu sees)
    DuduChatSocket.onTopicCreated(async (topic) => {
      if (!topic || !topic.id) return;
      await DuduChatStorage.saveSession(topic);
      await loadSessions();
      if (window.showToast) {
        window.showToast(`New topic: ${topic.title || 'Topic'}`);
      }
      window.duduAudio?.playSparkle?.();
    });

    DuduChatSocket.onTopicSync(async (topics) => {
      if (!Array.isArray(topics)) return;
      for (const t of topics) {
        await DuduChatStorage.saveSession(t);
      }
      await loadSessions();
    });

    // 5. Server ACK handling (turns 1 check to 2 checks)
    DuduChatSocket.onAck(async (payload) => {
      if (!payload || !payload.id) return;
      await DuduChatStorage.updateMessageStatus(payload.id, 'delivered');
      const icon = document.querySelector(`.msg-check-icon[data-msg-id="${payload.id}"]`);
      if (icon) {
        icon.textContent = 'done_all';
        icon.className = 'material-symbols-outlined text-[11px] text-outline msg-check-icon';
      }
    });

    // 6. Read receipt handling (turns 2 checks to 2 blue checks)
    DuduChatSocket.onRead(async (payload) => {
      if (!payload || !payload.sessionId) return;
      const upTo = payload.upToTimestamp || Date.now();
      await DuduChatStorage.markMessagesRead(payload.sessionId, upTo);
      if (payload.sessionId === activeSessionId) {
        const icons = document.querySelectorAll('.msg-check-icon');
        icons.forEach(icon => {
          const ts = Number(icon.getAttribute('data-timestamp') || 0);
          if (ts <= upTo) {
            icon.textContent = 'done_all';
            icon.className = 'material-symbols-outlined text-[11px] text-sky-500 font-bold msg-check-icon';
          }
        });
      }
    });

    // 7. Presence Updates
    DuduChatSocket.onPresence((count) => {
      const presenceText = document.getElementById('chat-presence-text');
      if (presenceText) {
        if (count >= 2) {
          presenceText.textContent = 'Both Online';
          presenceText.classList.remove('text-on-surface-variant');
          presenceText.classList.add('text-emerald-700', 'font-bold');
        } else {
          presenceText.textContent = 'Private Line';
          presenceText.classList.add('text-on-surface-variant');
          presenceText.classList.remove('text-emerald-700', 'font-bold');
        }
      }
    });

    DuduChatSocket.onPresenceState((presence) => {
      handlePresenceState(presence);
    });

    // 8. Real-Time Typing Indicator Listener
    DuduChatSocket.onTyping((data) => {
      handleIncomingTyping(data);
    });
  }

  function updateConnectionStatusUI(status) {
    const pill = document.getElementById('chat-status-pill');
    const dot = document.getElementById('chat-status-dot');
    const label = document.getElementById('chat-status-label');
    if (!pill || !dot || !label) return;

    if (status === 'connected') {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      label.textContent = 'Connected';
      pill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 select-none';
    } else if (status === 'connecting' || status === 'reconnecting') {
      dot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-ping';
      label.textContent = 'Connecting...';
      pill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 select-none';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-rose-500';
      label.textContent = 'Offline';
      pill.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200 select-none';
    }
  }

  // --- Sticker Tray Drawer ---

  const DUDU_GIF_STICKERS = [
    { file: 'assets/stickers_gif/STK-20260925-WA0187.gif', title: 'Wiggle Dance' },
    { file: 'assets/stickers_gif/STK-20260925-WA0188.gif', title: 'Side Eye' },
    { file: 'assets/stickers_gif/STK-20260925-WA0208.gif', title: 'Butterfly Chill' },
    { file: 'assets/stickers_gif/STK-20260926-WA0047.gif', title: 'Wall Peek' },
    { file: 'assets/stickers_gif/STK-20260926-WA0050.gif', title: 'Tummy Sick' },
    { file: 'assets/stickers_gif/STK-20260926-WA0056.gif', title: 'Happy Dance' },
    { file: 'assets/stickers_gif/STK-20260926-WA0103.gif', title: 'Nibbling Nuts' },
    { file: 'assets/stickers_gif/STK-20260926-WA0128.gif', title: 'Tears of Joy' },
    { file: 'assets/stickers_gif/STK-20260926-WA0176.gif', title: 'Angry Milk Tea' },
    { file: 'assets/stickers_gif/STK-20260927-WA0005.gif', title: 'Giving Rose' },
    { file: 'assets/stickers_gif/STK-20260927-WA0006.gif', title: 'Floating Soft' },
    { file: 'assets/stickers_gif/STK-20260927-WA0015.gif', title: 'Piggy Bank' },
    { file: 'assets/stickers_gif/STK-20260929-WA0000.gif', title: 'Guilty Thumbs' },
    { file: 'assets/stickers_gif/STK-20260929-WA0001.gif', title: 'Baby Hug' },
    { file: 'assets/stickers_gif/STK-20260929-WA0002.gif', title: 'Head Pat' },
    { file: 'assets/stickers_gif/STK-20260929-WA0003.gif', title: 'Warm Hug' },
    { file: 'assets/stickers_gif/STK-20260929-WA0035.gif', title: 'Love Heart' },
    { file: 'assets/stickers_gif/STK-20260929-WA0063.gif', title: 'Cheering' },
    { file: 'assets/stickers_gif/STK-20260930-WA0024.gif', title: 'Bedtime Cuddle' },
    { file: 'assets/stickers_gif/STK-20260930-WA0037.gif', title: 'Cute Wink' },
    { file: 'assets/stickers_gif/STK-20260930-WA0048.gif', title: 'Blowing Kiss' },
    { file: 'assets/stickers_gif/STK-20260930-WA0057.gif', title: 'Panda Hug' },
    { file: 'assets/stickers_gif/STK-20260930-WA0071.gif', title: 'Happy Clap' },
    { file: 'assets/stickers_gif/STK-20260930-WA0075.gif', title: 'Holding Hands' },
    { file: 'assets/stickers_gif/STK-20260930-WA0076.gif', title: 'Shy Blush' },
    { file: 'assets/stickers_gif/STK-20260930-WA0081.gif', title: 'Eating Snack' },
    { file: 'assets/stickers_gif/STK-20260930-WA0091.gif', title: 'Pout Face' },
    { file: 'assets/stickers_gif/STK-20260930-WA0100.gif', title: 'Sweet Cuddle' },
    { file: 'assets/stickers_gif/STK-20260930-WA0101.gif', title: 'Excited Jump' },
    { file: 'assets/stickers_gif/STK-20260930-WA0102.gif', title: 'Blanket Snuggle' },
    { file: 'assets/stickers_gif/STK-20260930-WA0107.gif', title: 'Love Note' },
    { file: 'assets/stickers_gif/STK-20260930-WA0108.gif', title: 'Good Morning' },
    { file: 'assets/stickers_gif/STK-20260930-WA0109.gif', title: 'Good Night' },
    { file: 'assets/stickers_gif/STK-20260930-WA0111.gif', title: 'Tickle Giggle' },
    { file: 'assets/stickers_gif/STK-20260930-WA0112.gif', title: 'Always Together' }
  ];

  function getStickerCategory(s) {
    if (s.cat) return s.cat;
    const title = (s.title || '').toLowerCase();
    const tags = (s.tags || []).join(' ').toLowerCase();
    const isCouple = /hug|cuddle|peluk|kiss|together|berdua|couple|holding_hands|snuggle|bed|crying|safe_space/.test(title + ' ' + tags);
    if (isCouple) return 'couple';
    const isBubu = /bubu|panda|dress|skirt|hair_bow|blush|shy|soft|cute|rose|flower|gentle|pat_pat|sweet/.test(title + ' ' + tags);
    if (isBubu) return 'bubu';
    return 'dudu';
  }

  let activeStickerCategory = 'all';

  function setupStickerTray(category = 'all') {
    activeStickerCategory = category;
    const grid = document.getElementById('mockup-stickers-grid') || document.getElementById('chat-sticker-tray-grid');
    if (!grid) return;

    const mockupStickers = [
      { id: 1001, file: 'assets/mockup_art/chat_stk_peek.png', title: 'Dudu Peek', cat: 'dudu' },
      { id: 1002, file: 'assets/mockup_art/chat_stk_wave.png', title: 'Bubu Wave', cat: 'bubu' },
      { id: 1003, file: 'assets/mockup_art/chat_stk_heart.png', title: 'Dudu Heart', cat: 'dudu' },
      { id: 1004, file: 'assets/mockup_art/chat_stk_bamboo.png', title: 'Bubu Bamboo', cat: 'bubu' },
      { id: 1005, file: 'assets/mockup_art/chat_stk_hug.png', title: 'Couple Hug', cat: 'couple' },
      { id: 1006, file: 'assets/mockup_art/chat_stk_sleep.png', title: 'Bubu Sleep', cat: 'bubu' }
    ];

    let itemsHtml = '';

    if (category === 'gif') {
      // Render animated GIF stickers with transparent background
      itemsHtml = DUDU_GIF_STICKERS.map(s => `
        <button type="button" data-gif-file="${s.file}" class="chat-gif-stk-btn button-press p-1.5 rounded-2xl bg-white dark:bg-stone-700/80 hover:bg-[#F5C7A9]/40 border border-[#E8DACB] dark:border-stone-600 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 relative group" title="${escapeHtml(s.title)}">
          <span class="absolute top-1 right-1 px-1 py-0.2 rounded-md bg-[#8D5B4C] text-[8px] font-bold text-white tracking-wider pointer-events-none">GIF</span>
          <div class="w-16 h-16 flex items-center justify-center pointer-events-none">
            <img src="${s.file}" alt="${escapeHtml(s.title)}" loading="lazy" class="max-h-full max-w-full object-contain filter drop-shadow-xs">
          </div>
        </button>
      `).join('');
    } else {
      // 1. Mockup stickers matching category
      const filteredMockup = mockupStickers.filter(s => category === 'all' || s.cat === category);
      itemsHtml += filteredMockup.map(s => `
        <button type="button" data-mockup-file="${s.file}" class="chat-mockup-stk-btn button-press p-1.5 rounded-2xl bg-[#FAF0E6] dark:bg-stone-700/90 hover:bg-[#F5C7A9]/40 border border-[#E8DACB] dark:border-stone-600 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105" title="${escapeHtml(s.title)}">
          <div class="w-16 h-16 flex items-center justify-center pointer-events-none">
            <img src="${s.file}" alt="${escapeHtml(s.title)}" class="max-h-full max-w-full object-contain">
          </div>
        </button>
      `).join('');

      // 2. All 95 WebP animated stickers matching category
      if (window.DUDU_STICKERS) {
        const filteredStandard = window.DUDU_STICKERS.filter(s => {
          if (category === 'all') return true;
          return getStickerCategory(s) === category;
        });

        itemsHtml += filteredStandard.map(s => `
          <button type="button" data-sticker-id="${s.id}" class="chat-sticker-select-btn button-press p-1.5 rounded-2xl bg-white dark:bg-stone-700/80 hover:bg-[#F5C7A9]/40 border border-[#E8DACB] dark:border-stone-600 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105" title="${escapeHtml(s.title)}">
            <div class="w-16 h-16 flex items-center justify-center pointer-events-none">
              <img src="Dudu Stickers/${s.file}" alt="${escapeHtml(s.title)}" loading="lazy" class="max-h-full max-w-full object-contain filter drop-shadow-xs">
            </div>
          </button>
        `).join('');
      }
    }

    grid.innerHTML = itemsHtml;

    // Click handlers for mockup stickers
    grid.querySelectorAll('.chat-mockup-stk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const file = btn.getAttribute('data-mockup-file');
        if (file) {
          sendDirectImageSticker(file);
          closeStickerTray();
        }
      });
    });

    // Click handlers for standard stickers
    grid.querySelectorAll('.chat-sticker-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-sticker-id');
        if (sid) {
          sendStickerMessage(sid);
          closeStickerTray();
        }
      });
    });

    // Click handlers for GIF stickers
    grid.querySelectorAll('.chat-gif-stk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gifFile = btn.getAttribute('data-gif-file');
        if (gifFile) {
          sendDirectImageSticker(gifFile);
          closeStickerTray();
        }
      });
    });

    // Wire up category filter buttons
    document.querySelectorAll('.stk-cat-btn').forEach(catBtn => {
      catBtn.onclick = () => {
        document.querySelectorAll('.stk-cat-btn').forEach(b => {
          b.classList.remove('bg-[#8D5B4C]', 'text-white');
          b.classList.add('bg-[#F5EAE0]', 'dark:bg-stone-700', 'text-[#4A3222]', 'dark:text-stone-200');
        });
        catBtn.classList.add('bg-[#8D5B4C]', 'text-white');
        catBtn.classList.remove('bg-[#F5EAE0]', 'dark:bg-stone-700', 'text-[#4A3222]', 'dark:text-stone-200');
        setupStickerTray(catBtn.getAttribute('data-cat') || 'all');
      };
    });
  }

  async function sendDirectImageSticker(imgUrl) {
    if (!activeSessionId) {
      if (window.showToast) window.showToast('Please create a topic first!');
      return;
    }
    const sender = DuduChatCrypto.getStoredIdentity() || 'dudu';
    const replyToData = activeReplyMessage ? { ...activeReplyMessage } : null;
    cancelReply();

    const message = {
      id: 'stk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      sessionId: activeSessionId,
      sender: sender,
      type: 'image',
      content: imgUrl,
      timestamp: Date.now(),
      status: 'pending',
      replyTo: replyToData
    };

    await handleOutboundMessage(message);
    window.duduAudio?.playSparkle?.();
  }

  function toggleStickerTray() {
    isStickerTrayOpen = !isStickerTrayOpen;
    const tray = document.getElementById('chat-sticker-tray');
    if (tray) {
      if (isStickerTrayOpen) {
        tray.classList.remove('hidden');
        setupStickerTray();
      } else {
        tray.classList.add('hidden');
      }
    }
  }

  function closeStickerTray() {
    isStickerTrayOpen = false;
    const tray = document.getElementById('chat-sticker-tray');
    if (tray) tray.classList.add('hidden');
  }

  // --- Event Listeners Setup ---

  function setupEventListeners() {
    // Send message on click
    document.getElementById('btn-send-message')?.addEventListener('click', () => {
      sendTextMessage();
    });

    // Enter creates newline; Ctrl+Enter or Cmd+Enter sends message
    const textInput = document.getElementById('chat-text-input');
    const adjustTextareaHeight = () => {
      if (!textInput) return;
      textInput.style.height = 'auto';
      const scrollH = textInput.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, 20), 112);
      textInput.style.height = targetH + 'px';
      syncNavHeight();
    };

    textInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          sendTextMessage();
        } else {
          // Allow Enter to create space downward (newline)
          setTimeout(adjustTextareaHeight, 0);
        }
      }
    });

    // Auto-resizing textarea, typing broadcast, and button feedback
    textInput?.addEventListener('input', () => {
      adjustTextareaHeight();
      const hasContent = textInput.value.trim().length > 0;
      if (hasContent) {
        if (!isTypingActive) {
          isTypingActive = true;
          notifyTypingState(true);
        }
        clearTimeout(typingBroadcastTimeout);
        typingBroadcastTimeout = setTimeout(() => {
          isTypingActive = false;
          notifyTypingState(false);
        }, 2500);
      } else {
        if (isTypingActive) {
          isTypingActive = false;
          clearTimeout(typingBroadcastTimeout);
          notifyTypingState(false);
        }
      }
    });

    // Toggle Sticker Tray (supporting both button IDs)
    document.getElementById('btn-toggle-stickers')?.addEventListener('click', toggleStickerTray);
    document.getElementById('btn-toggle-sticker-tray')?.addEventListener('click', toggleStickerTray);

    // Close Sticker Tray button
    document.getElementById('btn-close-sticker-tray')?.addEventListener('click', closeStickerTray);

    // Call, Video Call, and Lock buttons matching chat.jpg
    document.getElementById('btn-chat-call')?.addEventListener('click', () => {
      window.duduAudio?.playPop?.(600);
      const partner = isSenderDudu(DuduChatCrypto.getStoredIdentity()) ? 'Bubu 🐼' : 'Dudu 🐻';
      if (window.showToast) window.showToast(`📞 Calling ${partner}... Ring ring! ❤️`);
    });
    document.getElementById('btn-chat-videocall')?.addEventListener('click', () => {
      window.duduAudio?.playPop?.(700);
      const partner = isSenderDudu(DuduChatCrypto.getStoredIdentity()) ? 'Bubu 🐼' : 'Dudu 🐻';
      if (window.showToast) window.showToast(`📹 Starting cozy video peek with ${partner}! ✨`);
    });
    document.getElementById('btn-chat-e2ee-lock')?.addEventListener('click', () => {
      window.duduAudio?.playPop?.(500);
      const settingsModal = document.getElementById('modal-chat-settings');
      if (settingsModal) {
        openChatSettingsModal();
      } else if (window.showToast) {
        window.showToast('🔒 AES-GCM 256-bit End-to-End Encryption Active');
      }
    });

    // Camera, Photo, and Mic buttons
    const chatImageInput = document.getElementById('chat-image-input');
    document.getElementById('btn-chat-photo')?.addEventListener('click', () => {
      if (chatImageInput) {
        chatImageInput.removeAttribute('capture');
        chatImageInput.click();
      }
    });
    document.getElementById('btn-chat-camera')?.addEventListener('click', () => {
      if (chatImageInput) {
        chatImageInput.setAttribute('capture', 'environment');
        chatImageInput.click();
      }
    });
    chatImageInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await sendMediaMessage(file);
        chatImageInput.value = '';
      }
    });
    document.getElementById('btn-chat-mic')?.addEventListener('click', () => {
      window.duduAudio?.playPop?.(500);
      if (window.showToast) window.showToast('🎙️ Voice notes coming soon! Send a sweet text or sticker 🧸');
    });

    // Reply Bar Cancel Trigger
    document.getElementById('btn-cancel-reply')?.addEventListener('click', () => {
      cancelReply();
    });

    // Message Actions Modal Triggers
    document.getElementById('btn-close-msg-actions')?.addEventListener('click', () => {
      closeMsgActionsModal();
    });

    document.getElementById('btn-action-reply')?.addEventListener('click', () => {
      if (selectedActionMessage) {
        const msg = selectedActionMessage;
        closeMsgActionsModal();
        startReply(msg);
      }
    });

    document.getElementById('btn-action-forward')?.addEventListener('click', () => {
      if (selectedActionMessage) {
        const msg = selectedActionMessage;
        closeMsgActionsModal();
        openForwardTopicModal(msg);
      }
    });

    document.getElementById('btn-action-copy')?.addEventListener('click', async () => {
      if (selectedActionMessage) {
        const msg = selectedActionMessage;
        closeMsgActionsModal();
        const text = getMessageCopyText(msg);
        await copyToClipboard(text);
        window.duduAudio?.playPop?.(480);
        if (window.showToast) window.showToast('Copied to clipboard');
      }
    });

    document.getElementById('btn-action-delete')?.addEventListener('click', async () => {
      if (selectedActionMessage) {
        const msgId = selectedActionMessage.id;
        closeMsgActionsModal();
        await confirmDeleteMessage(msgId);
      }
    });

    const msgActionsModal = document.getElementById('modal-message-actions');
    msgActionsModal?.addEventListener('click', (e) => {
      if (e.target === msgActionsModal) closeMsgActionsModal();
    });

    // Forward Topic Modal Triggers
    document.getElementById('btn-close-forward-topic')?.addEventListener('click', () => {
      closeForwardTopicModal();
    });

    const forwardModal = document.getElementById('modal-forward-topic');
    forwardModal?.addEventListener('click', (e) => {
      if (e.target === forwardModal) closeForwardTopicModal();
    });

    // Selection Bar Action Triggers (Under Topic / Bookmark section)
    document.getElementById('btn-exit-selection')?.addEventListener('click', () => {
      exitSelectionMode();
    });

    document.getElementById('btn-selection-copy')?.addEventListener('click', async () => {
      if (selectedMessageIds.size === 0) return;
      const ids = Array.from(selectedMessageIds);
      const msgs = [];
      for (const id of ids) {
        const m = await DuduChatStorage.getMessage(id);
        if (m) msgs.push(m);
      }
      if (msgs.length === 0) return;
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      const textToCopy = msgs.length === 1
        ? getMessageCopyText(msgs[0])
        : msgs.map(m => {
            const senderLower = (m.sender || '').toLowerCase();
            const isSenderDudu = senderLower.includes('dudu') || senderLower.includes('kevin');
            const senderLabel = isSenderDudu ? 'Dudu' : 'Bubu';
            return `${senderLabel}: ${getMessageCopyText(m)}`;
          }).join('\n');
      await copyToClipboard(textToCopy);
      exitSelectionMode();
      window.duduAudio?.playPop?.(480);
      if (window.showToast) {
        window.showToast(msgs.length === 1 ? 'Copied message' : `Copied ${msgs.length} messages`);
      }
    });

    document.getElementById('btn-selection-forward')?.addEventListener('click', async () => {
      if (selectedMessageIds.size === 0) return;
      const ids = Array.from(selectedMessageIds);
      const msgs = [];
      for (const id of ids) {
        const m = await DuduChatStorage.getMessage(id);
        if (m) msgs.push(m);
      }
      if (msgs.length > 0) {
        openForwardTopicModal(msgs);
      }
    });

    document.getElementById('btn-selection-delete')?.addEventListener('click', () => {
      if (selectedMessageIds.size === 0) return;
      promptDeleteConfirmation(Array.from(selectedMessageIds));
    });

    // Delete Message Confirmation Modal Triggers ("Are you sure?")
    document.getElementById('btn-close-delete-msg-modal')?.addEventListener('click', () => {
      closeDeleteConfirmModal();
    });

    document.getElementById('btn-cancel-delete-msg')?.addEventListener('click', () => {
      closeDeleteConfirmModal();
    });

    document.getElementById('btn-confirm-delete-msg')?.addEventListener('click', async () => {
      await executeDeleteMessages(pendingDeleteMessageIds);
    });

    const deleteMsgModal = document.getElementById('modal-delete-message-confirm');
    deleteMsgModal?.addEventListener('click', (e) => {
      if (e.target === deleteMsgModal) closeDeleteConfirmModal();
    });

    // Message Bubbles Long-Press / Hold-Down to Enter Selection Mode (450ms)
    let holdTimer = null;
    let holdStartPos = { x: 0, y: 0 };
    let heldRow = null;
    let holdTriggeredTime = 0;

    const messagesContainer = document.getElementById('chat-messages-container');

    messagesContainer?.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.chat-bubble-row')) {
        e.preventDefault();
      }
    });

    messagesContainer?.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button, a, video, input, textarea, .msg-action-bar')) return;

      const row = e.target.closest('.chat-bubble-row');
      if (!row) return;

      heldRow = row;
      holdStartPos = { x: e.clientX, y: e.clientY };

      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        const msgId = row.getAttribute('data-msg-id');
        if (msgId) {
          holdTriggeredTime = Date.now();
          if (!isSelectionMode) {
            enterSelectionMode(msgId);
          } else {
            toggleSelectMessage(msgId);
          }
          if (navigator.vibrate) {
            try { navigator.vibrate(40); } catch (_) {}
          }
        }
        heldRow = null;
      }, 450);
    });

    const cancelHold = (e) => {
      if (e && e.type === 'pointermove' && heldRow) {
        const dist = Math.hypot(e.clientX - holdStartPos.x, e.clientY - holdStartPos.y);
        if (dist > 10) {
          clearTimeout(holdTimer);
          heldRow = null;
        }
        return;
      }
      clearTimeout(holdTimer);
      heldRow = null;
    };

    messagesContainer?.addEventListener('pointermove', cancelHold);
    messagesContainer?.addEventListener('pointerup', cancelHold);
    messagesContainer?.addEventListener('pointercancel', cancelHold);

    messagesContainer?.addEventListener('scroll', () => {
      if (messagesContainer.scrollTop < 60 && !isLoadingOlderMessages) {
        if (renderedMessageCount < activeSessionAllMessages.length) {
          loadOlderMessagesChunk();
        }
      }
    }, { passive: true });

    // Message Bubbles Delegated Clicks (Selection toggle, Quotes, Quick-Reply, Quick-Forward, Quick-Delete, Actions Modal, Blob Downloads)
    messagesContainer?.addEventListener('click', async (e) => {
      // 0. Load older messages button
      const loadOlderBtn = e.target.closest('#btn-load-older-msgs');
      if (loadOlderBtn) {
        e.preventDefault();
        e.stopPropagation();
        await loadOlderMessagesChunk();
        return;
      }

      // If a hold-to-select just fired, suppress the subsequent click event
      if (Date.now() - holdTriggeredTime < 350) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If selection mode is active, clicking toggles selection and blocks all other actions
      if (isSelectionMode) {
        const row = e.target.closest('.chat-bubble-row');
        if (row) {
          e.preventDefault();
          e.stopPropagation();
          const msgId = row.getAttribute('data-msg-id');
          toggleSelectMessage(msgId);
          return;
        }
      }

      // 1. Reply quote jump
      const quoteJump = e.target.closest('.reply-quote-jump');
      if (quoteJump) {
        const targetId = quoteJump.getAttribute('data-target-id');
        if (targetId) {
          const targetBubble = messagesContainer.querySelector(`.chat-bubble-row[data-msg-id="${targetId}"]`);
          if (targetBubble) {
            targetBubble.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetBubble.classList.add('ring-2', 'ring-secondary', 'rounded-2xl');
            setTimeout(() => targetBubble.classList.remove('ring-2', 'ring-secondary', 'rounded-2xl'), 1200);
          }
        }
        return;
      }

      // 2. Quick reply button
      const quickReply = e.target.closest('.btn-quick-reply');
      if (quickReply) {
        const msgId = quickReply.getAttribute('data-msg-id');
        const msg = await DuduChatStorage.getMessage(msgId);
        if (msg) startReply(msg);
        return;
      }

      // 2b. Quick copy button
      const quickCopy = e.target.closest('.btn-quick-copy');
      if (quickCopy) {
        const msgId = quickCopy.getAttribute('data-msg-id');
        const msg = await DuduChatStorage.getMessage(msgId);
        if (msg) {
          const text = getMessageCopyText(msg);
          await copyToClipboard(text);
          window.duduAudio?.playPop?.(480);
          if (window.showToast) window.showToast('Copied to clipboard');
        }
        return;
      }

      // 3. Quick forward button
      const quickForward = e.target.closest('.btn-quick-forward');
      if (quickForward) {
        const msgId = quickForward.getAttribute('data-msg-id');
        const msg = await DuduChatStorage.getMessage(msgId);
        if (msg) openForwardTopicModal(msg);
        return;
      }

      // 4. Quick delete button
      const quickDelete = e.target.closest('.btn-quick-delete');
      if (quickDelete) {
        const msgId = quickDelete.getAttribute('data-msg-id');
        if (msgId) await confirmDeleteMessage(msgId);
        return;
      }

      // 5. Download & Decrypt Blob button
      const loadBlobBtn = e.target.closest('.btn-load-blob');
      if (loadBlobBtn) {
        const blobId = loadBlobBtn.getAttribute('data-blob-id');
        if (blobId) await downloadAndDisplayBlob(blobId);
        return;
      }

      // 6. Click bubble body to open options modal (excluding video controls & image preview click)
      const bubbleBody = e.target.closest('.chat-bubble-body');
      if (bubbleBody && !e.target.closest('video') && !e.target.closest('[data-img-src]')) {
        const msgId = bubbleBody.getAttribute('data-msg-id');
        const msg = await DuduChatStorage.getMessage(msgId);
        if (msg) openMsgActionsModal(msg);
      }
    });

    // Native WhatsApp-Style Swipe-to-Reply Gesture on Touch
    let touchStartX = 0;
    let touchStartY = 0;
    let swipedRow = null;
    let isSwiping = false;

    messagesContainer?.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const row = touch.target.closest('.chat-bubble-row');
      if (!row) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      swipedRow = row;
      isSwiping = false;
    }, { passive: true });

    messagesContainer?.addEventListener('touchmove', (e) => {
      if (!swipedRow || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Cancel horizontal swipe if user scrolls vertically
      if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
        swipedRow = null;
        return;
      }

      // Swipe right to reply
      if (deltaX > 10) {
        isSwiping = true;
        const clampedX = Math.min(deltaX * 0.45, 65);
        swipedRow.style.transform = `translateX(${clampedX}px)`;
        swipedRow.style.transition = 'none';
      }
    }, { passive: true });

    messagesContainer?.addEventListener('touchend', async () => {
      if (!swipedRow) return;
      const row = swipedRow;
      const wasSwiping = isSwiping;
      swipedRow = null;
      isSwiping = false;

      const currentTransform = row.style.transform;
      row.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      row.style.transform = '';

      if (wasSwiping && currentTransform) {
        const match = currentTransform.match(/translateX\(([\d.]+)px\)/);
        const val = match ? parseFloat(match[1]) : 0;
        if (val >= 35) {
          const msgId = row.getAttribute('data-msg-id');
          if (msgId) {
            const msg = await DuduChatStorage.getMessage(msgId);
            if (msg) {
              startReply(msg);
              if (navigator.vibrate) {
                try { navigator.vibrate(20); } catch (e) {}
              }
            }
          }
        }
      }
    }, { passive: true });

    // Attach and send encrypted media (photos / videos)
    const btnAttachPhoto = document.getElementById('btn-attach-photo');
    const photoInput = document.getElementById('chat-photo-input');
    btnAttachPhoto?.addEventListener('click', () => {
      photoInput?.click();
    });
    photoInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await sendMediaMessage(file);
        photoInput.value = '';
      }
    });

    // Direct Camera Capture & Send Photo Directly
    const btnCameraCapture = document.getElementById('btn-camera-capture');
    const cameraInput = document.getElementById('chat-camera-input');
    btnCameraCapture?.addEventListener('click', () => {
      cameraInput?.click();
    });
    cameraInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await sendMediaMessage(file);
        cameraInput.value = '';
      }
    });

    // Photo Preview Modal close
    document.getElementById('btn-close-photo-preview')?.addEventListener('click', () => {
      closePhotoPreview();
    });
    const photoPreviewModal = document.getElementById('modal-photo-preview');
    photoPreviewModal?.addEventListener('click', (e) => {
      if (e.target === photoPreviewModal) closePhotoPreview();
    });

    // New Topic Modal Triggers
    document.getElementById('btn-new-topic')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-new-topic');
      if (modal) modal.classList.remove('hidden');
    });

    document.getElementById('btn-close-new-topic')?.addEventListener('click', () => {
      const modal = document.getElementById('modal-new-topic');
      if (modal) modal.classList.add('hidden');
    });

    // All Topics Modal Triggers
    document.getElementById('btn-close-all-topics')?.addEventListener('click', () => {
      closeAllTopicsModal();
    });

    document.getElementById('input-search-topics')?.addEventListener('input', (e) => {
      renderAllTopicsList(e.target.value.trim());
    });

    const allTopicsModal = document.getElementById('modal-all-topics');
    allTopicsModal?.addEventListener('click', (e) => {
      if (e.target === allTopicsModal) closeAllTopicsModal();
    });

    // Delete Topic 3-Step Confirmation Modal Triggers
    document.getElementById('btn-confirm-delete-step')?.addEventListener('click', async () => {
      await advanceOrExecuteDelete();
    });

    document.getElementById('btn-cancel-delete-step')?.addEventListener('click', () => {
      closeDeleteModal();
    });

    const deleteModal = document.getElementById('modal-delete-topic-confirm');
    deleteModal?.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });

    document.getElementById('form-new-topic')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('input-new-topic-title');
      const emojiSelect = document.getElementById('select-new-topic-emoji');
      if (!titleInput || !titleInput.value.trim()) return;

      const newSess = await DuduChatStorage.createSession(
        titleInput.value.trim(),
        emojiSelect ? emojiSelect.value : '💬'
      );

      // Broadcast topic creation over WebSocket so partner immediately sees it
      DuduChatSocket.sendCreateTopic(newSess);

      titleInput.value = '';
      document.getElementById('modal-new-topic')?.classList.add('hidden');
      activeSessionId = newSess.id;
      await loadSessions();
      window.duduAudio?.playSparkle();
    });

    // Topic Options / Long Hold Modal Triggers
    document.getElementById('btn-close-topic-actions')?.addEventListener('click', closeTopicActionsModal);
    const topicActionsModal = document.getElementById('modal-topic-actions');
    topicActionsModal?.addEventListener('click', (e) => {
      if (e.target === topicActionsModal) closeTopicActionsModal();
    });

    document.getElementById('btn-topic-action-rename')?.addEventListener('click', () => {
      if (activeActionSession) {
        openRenameTopicModal(activeActionSession);
      }
    });

    document.getElementById('btn-topic-action-delete')?.addEventListener('click', () => {
      if (activeActionSession) {
        const sess = activeActionSession;
        closeTopicActionsModal();
        startDeleteTopicWorkflow(sess.id, sess.title);
      }
    });

    // Rename Topic Form & Modal Triggers
    document.getElementById('btn-close-rename-topic')?.addEventListener('click', closeRenameTopicModal);
    const renameModal = document.getElementById('modal-rename-topic');
    renameModal?.addEventListener('click', (e) => {
      if (e.target === renameModal) closeRenameTopicModal();
    });

    document.getElementById('form-rename-topic')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeActionSession) return;
      const titleInput = document.getElementById('input-rename-topic-title');
      const emojiSelect = document.getElementById('select-rename-topic-emoji');
      const newTitle = titleInput?.value.trim();
      const newEmoji = emojiSelect?.value || '💬';
      if (!newTitle) return;

      activeActionSession.title = newTitle;
      activeActionSession.emoji = newEmoji;
      await DuduChatStorage.saveSession(activeActionSession);
      DuduChatSocket.sendCreateTopic(activeActionSession);
      closeRenameTopicModal();
      await loadSessions();

      if (window.showToast) {
        window.showToast(`Topic renamed to "${newTitle}" ♡`);
      }
      window.duduAudio?.playSparkle?.();
    });

    // Chat Settings / E2EE Key Modal Triggers
    document.getElementById('btn-chat-settings')?.addEventListener('click', () => {
      openChatSettingsModal();
    });

    document.getElementById('btn-close-chat-settings')?.addEventListener('click', () => {
      document.getElementById('modal-chat-settings')?.classList.add('hidden');
    });

    document.getElementById('form-chat-settings')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passInput = document.getElementById('input-chat-passphrase');
      const identSelect = document.getElementById('select-chat-identity');
      const serverInput = document.getElementById('input-chat-server-url');

      if (passInput) DuduChatCrypto.setStoredPassphrase(passInput.value);
      if (identSelect) DuduChatCrypto.setStoredIdentity(identSelect.value);
      if (serverInput && serverInput.value.trim()) DuduChatSocket.setServerUrl(serverInput.value.trim());

      await updateCryptoKey();
      document.getElementById('modal-chat-settings')?.classList.add('hidden');
      await loadActiveMessages();
      window.duduAudio?.playSparkle();
    });

    // Localhost toggle in Settings Modal
    document.getElementById('btn-use-localhost')?.addEventListener('click', () => {
      const serverInput = document.getElementById('input-chat-server-url');
      if (serverInput) serverInput.value = DuduChatSocket.LOCAL_DEV_URL;
    });

    document.getElementById('btn-use-remote')?.addEventListener('click', () => {
      const serverInput = document.getElementById('input-chat-server-url');
      if (serverInput) serverInput.value = DuduChatSocket.DEFAULT_REMOTE_URL;
    });

    // Chat partner presence toggle & simulator
    document.getElementById('chat-partner-presence-container')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const myIdentity = DuduChatCrypto.getStoredIdentity() || 'dudu';
      const myIdLower = myIdentity.toLowerCase();
      const isMeDudu = myIdLower.includes('dudu') || myIdLower.includes('kevin');
      const partnerKey = isMeDudu ? 'bubu' : 'dudu';

      const currentSim = localStorage.getItem('DUDU_SIMULATED_PRESENCE_' + partnerKey);
      const nextSim = (currentSim === 'offline') ? 'online' : 'offline';
      localStorage.setItem('DUDU_SIMULATED_PRESENCE_' + partnerKey, nextSim);

      handlePresenceState();
      window.duduAudio?.playPop?.(nextSim === 'online' ? 650 : 350);
      if (typeof window.showFeedbackToast === 'function') {
        window.showFeedbackToast(`${isMeDudu ? 'Bubu' : 'Dudu'} is now ${nextSim} 🐾`);
      }
    });
  }

  function openChatSettingsModal() {
    const modal = document.getElementById('modal-chat-settings');
    if (!modal) return;

    const passInput = document.getElementById('input-chat-passphrase');
    const identSelect = document.getElementById('select-chat-identity');
    const serverInput = document.getElementById('input-chat-server-url');

    if (passInput) passInput.value = DuduChatCrypto.getStoredPassphrase();
    if (identSelect) identSelect.value = DuduChatCrypto.getStoredIdentity();
    if (serverInput) serverInput.value = DuduChatSocket.getServerUrl();

    modal.classList.remove('hidden');
  }

  // --- Mobile Keyboard & Bottom Nav Animation Handling ---

  function syncNavHeight() {
    const bottomNav = document.getElementById('bottom-nav-bar');
    if (bottomNav) {
      const rect = bottomNav.getBoundingClientRect();
      const h = rect.height || bottomNav.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--bottom-nav-height', `${Math.round(h)}px`);
      }
    }

    const inputDock = document.getElementById('chat-input-dock');
    if (inputDock) {
      const dockH = inputDock.offsetHeight;
      if (dockH > 0) {
        document.documentElement.style.setProperty('--chat-dock-height', `${Math.round(dockH)}px`);
      }
    }
  }

  function setupKeyboardAndDockHandling() {
    const textInput = document.getElementById('chat-text-input');
    const bottomNav = document.getElementById('bottom-nav-bar');
    const inputDock = document.getElementById('chat-input-dock');
    const sendBtn = document.getElementById('btn-send-message');
    const stickerBtn = document.getElementById('btn-toggle-stickers');
    const attachBtn = document.getElementById('btn-attach-photo');
    if (!inputDock) return;

    syncNavHeight();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => syncNavHeight());
      if (bottomNav) ro.observe(bottomNav);
      if (inputDock) ro.observe(inputDock);
    }
    window.addEventListener('resize', syncNavHeight);

    // Prevent button press from prematurely blurring input before click fires
    const preventPrematureBlur = (e) => {
      if (document.activeElement === textInput) {
        e.preventDefault();
      }
    };
    sendBtn?.addEventListener('pointerdown', preventPrematureBlur);
    stickerBtn?.addEventListener('pointerdown', preventPrematureBlur);
    attachBtn?.addEventListener('pointerdown', preventPrematureBlur);

    function updateDockPosition(isFocused) {
      if (!inputDock) return;
      let keyboardHeight = 0;
      if (window.visualViewport) {
        keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport.height);
      }

      if (isFocused || keyboardHeight > 80) {
        bottomNav?.classList.add('nav-bar-hidden');
        document.body.classList.add('keyboard-open');
        inputDock.classList.add('dock-keyboard-active');
        if (keyboardHeight > 0) {
          inputDock.style.bottom = `${keyboardHeight + 8}px`;
        } else {
          inputDock.style.bottom = '8px';
        }
        scrollToBottom(true);
      } else {
        bottomNav?.classList.remove('nav-bar-hidden');
        document.body.classList.remove('keyboard-open');
        inputDock.classList.remove('dock-keyboard-active');
        inputDock.style.bottom = '';
        syncNavHeight();
      }
    }

    if (textInput) {
      textInput.addEventListener('focus', () => {
        updateDockPosition(true);
        setTimeout(() => scrollToBottom(true), 150);
      });

      textInput.addEventListener('blur', () => {
        // Small timeout to allow tap on send/sticker buttons
        setTimeout(() => {
          if (document.activeElement !== textInput) {
            updateDockPosition(false);
            scrollToBottom(false);
          }
        }, 100);
      });
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const isFocused = document.activeElement === textInput;
        updateDockPosition(isFocused);
      });
    }
  }

  // --- Helper Functions ---

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.scrollToChatBottom = () => scrollToBottom(false);
  window.sendDirectImageSticker = sendDirectImageSticker;
  window.DuduChatUI = {
    init: initChat,
    sendText: sendTextMessage,
    sendSticker: sendStickerMessage,
    sendDirectImageSticker: sendDirectImageSticker,
    sendPhoto: sendPhotoMessage,
    sendMedia: sendMediaMessage,
    startReply: startReply,
    cancelReply: cancelReply,
    deleteMessage: confirmDeleteMessage,
    promptDeleteConfirmation: promptDeleteConfirmation,
    executeDeleteMessages: executeDeleteMessages,
    enterSelectionMode: enterSelectionMode,
    exitSelectionMode: exitSelectionMode,
    toggleSelectMessage: toggleSelectMessage,
    copyToClipboard: copyToClipboard,
    getMessageCopyText: getMessageCopyText,
    copyMessage: async (msgId) => {
      const msg = await DuduChatStorage.getMessage(msgId);
      if (msg) {
        const text = getMessageCopyText(msg);
        await copyToClipboard(text);
        if (window.showToast) window.showToast('Copied to clipboard');
        return text;
      }
      return null;
    },
    copySelectedMessages: async () => {
      if (selectedMessageIds.size === 0) return null;
      const ids = Array.from(selectedMessageIds);
      const msgs = [];
      for (const id of ids) {
        const m = await DuduChatStorage.getMessage(id);
        if (m) msgs.push(m);
      }
      if (msgs.length === 0) return null;
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      const textToCopy = msgs.length === 1
        ? getMessageCopyText(msgs[0])
        : msgs.map(m => {
            const senderLower = (m.sender || '').toLowerCase();
            const isSenderDudu = senderLower.includes('dudu') || senderLower.includes('kevin');
            const senderLabel = isSenderDudu ? 'Dudu' : 'Bubu';
            return `${senderLabel}: ${getMessageCopyText(m)}`;
          }).join('\n');
      await copyToClipboard(textToCopy);
      exitSelectionMode();
      if (window.showToast) {
        window.showToast(msgs.length === 1 ? 'Copied message' : `Copied ${msgs.length} messages`);
      }
      return textToCopy;
    },
    openForwardModal: openForwardTopicModal,
    forwardMessage: executeForwardMessage,
    batchForward: executeBatchForward,
    uploadBlob: uploadEncryptedBlob,
    downloadBlob: downloadEncryptedBlob,
    downloadAndDisplayBlob: downloadAndDisplayBlob,
    previewImage: previewImage,
    closePhotoPreview: closePhotoPreview,
    openSettings: openChatSettingsModal,
    scrollToBottom: scrollToBottom,
    jumpToBottom: jumpToBottom,
    loadOlderMessages: loadOlderMessagesChunk,
    syncNavHeight: syncNavHeight,
    onTabActivated: async () => {
      syncNavHeight();
      const bottomNav = document.getElementById('bottom-nav-bar');
      const textInput = document.getElementById('chat-text-input');
      const inputDock = document.getElementById('chat-input-dock');
      if (document.activeElement !== textInput) {
        bottomNav?.classList.remove('nav-bar-hidden');
        document.body.classList.remove('keyboard-open');
        inputDock?.classList.remove('dock-keyboard-active');
        if (inputDock) inputDock.style.bottom = '';
      }
      handlePresenceState();
      await loadActiveMessages(false);
      if (activeSessionId) {
        markSessionRead(activeSessionId);
        DuduChatSocket.sendReadReceipt(activeSessionId, Date.now());
      }
      updateNavChatBadge();
      DuduChatSocket.sendPresenceAnnounce('online');
      jumpToBottom();
      setTimeout(jumpToBottom, 40);
      setTimeout(jumpToBottom, 120);
    },
    markSessionRead: markSessionRead,
    updateNavChatBadge: updateNavChatBadge,
    flushPendingMessages,
    refreshPresence: () => handlePresenceState(),
    reloadActiveMessages: async (preserveScroll = true) => {
      await loadActiveMessages(preserveScroll);
    }
  };

  window.addEventListener('online', () => {
    if (DuduChatSocket.getStatus() === 'connected') {
      flushPendingMessages();
    }
  });
})();
