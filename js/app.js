/**
 * Dudu Companion App (For Bubu)
 * Finch x Pou inspired virtual companion & Tummy Guard (English)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'dudu_companion_bubu_en_v2';

  function getIsoDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTime(d = new Date()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function formatShortDate(isoStr, includeDay = false) {
    if (!isoStr || isoStr === 'all') return 'All';
    try {
      const parts = isoStr.split('-').map(Number);
      if (parts.length !== 3) return isoStr;
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      if (includeDay) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${dayNames[date.getDay()]}, ${month} ${parts[2]}`;
      }
      return `${month} ${parts[2]}`;
    } catch (e) {
      return isoStr;
    }
  }

  function parseDateFromIso(isoStr) {
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function getDailyHoneyPool(dateIso) {
    const DAILY_MAX_HONEY = 120;
    const currentLogs = (typeof state !== 'undefined' && state && state.tummyLogs) ? state.tummyLogs : defaultState.tummyLogs;
    const logsForDay = (currentLogs || []).filter(l => l.date === dateIso);
    const totalDeducted = logsForDay.reduce((acc, cur) => acc + (cur.penalty || 0), 0);
    const remaining = Math.max(0, DAILY_MAX_HONEY - totalDeducted);
    return {
      max: DAILY_MAX_HONEY,
      deducted: totalDeducted,
      remaining: remaining
    };
  }

  const defaultState = {
    bubuName: 'Bubu',
    honeyPoints: 120,
    cleanDaysStreak: 3,
    lastStreakDate: new Date().toISOString().split('T')[0],
    currentDayDate: new Date().toISOString().split('T')[0],
    lastActiveTimestamp: Date.now(),
    inventory: {
      spiceShields: 0,
      junkShields: 0
    },
    stats: {
      hunger: 80,       // Food / Fullness
      mood: 95,         // Mood / Affection
      energy: 90,       // Sleep / Energy
      tummyHealth: 85   // Bubu's Belly
    },
    counters: {
      kisses: 14,
      hugs: 28,
      boops: 42,
      gifts: 10
    },
    habits: [
      { id: 'water', text: 'Drink 2 glasses of warm water', reward: 10, completed: false, icon: 'local_cafe' },
      { id: 'healthy_meal', text: 'Eat veggies', reward: 15, completed: false, icon: 'eco' },
      { id: 'rest_eyes', text: 'Rest eyes & relax deeply for 5 minutes', reward: 10, completed: false, icon: 'self_improvement' }
    ],
    tummyLogs: [
      {
        id: 'sample_today_1',
        date: getIsoDate(new Date()),
        time: '13:30',
        item: 'Spicy Samyang Carbonara',
        spiceLevel: 3,
        portionLevel: null,
        penalty: 25,
        category: 'spicy',
        status: 'safe',
        note: 'Drank warm milk first. Stomach protected!'
      },
      {
        id: 'sample_today_2',
        date: getIsoDate(new Date()),
        time: '16:00',
        item: 'Crispy French Fries Snack',
        spiceLevel: null,
        portionLevel: 1,
        penalty: 15,
        category: 'junk',
        status: 'caution',
        note: 'Afternoon oily snack. Balanced with warm water.'
      },
      {
        id: 'sample_yest_1',
        date: getIsoDate(new Date(Date.now() - 86400000)),
        time: '23:15',
        item: 'Extra Fiery Shin Ramyun',
        spiceLevel: 4,
        portionLevel: null,
        penalty: 25,
        category: 'spicy',
        status: 'danger',
        note: 'Midnight noodles on empty stomach! Triggered reflux.'
      },
      {
        id: 'sample_yest_2',
        date: getIsoDate(new Date(Date.now() - 86400000)),
        time: '18:45',
        item: 'Crispy Fried Chicken',
        spiceLevel: null,
        portionLevel: 2,
        penalty: 15,
        category: 'junk',
        status: 'caution',
        note: 'Oily fast food dinner.'
      },
      {
        id: 'sample_2days_1',
        date: getIsoDate(new Date(Date.now() - 172800000)),
        time: '19:40',
        item: 'Fiery Chili Oil Fried Rice',
        spiceLevel: 5,
        portionLevel: null,
        penalty: 35,
        category: 'spicy',
        status: 'danger',
        note: 'Extremely spicy dinner! Drank 2 glasses of milk.'
      }
    ],
    currentStickerId: 0,
    currentDialogue: 'Hello gorgeous Bubu! Let us protect your sweet tummy and smile all day~ 💕',
    isSleeping: false,
    debugMode: false,
    activeTab: 'home'
  };

  let state = loadState();
  let selectedHistoryDate = getIsoDate(new Date());

  function applyOfflineSimulation(parsed) {
    const now = Date.now();
    const lastActive = parsed.lastActiveTimestamp || now;
    const elapsedMinutes = Math.max(0, (now - lastActive) / (1000 * 60));

    // Initialize stats structure if older schema
    if (!parsed.stats) parsed.stats = { ...defaultState.stats };
    if (parsed.stats.mood === undefined) parsed.stats.mood = parsed.stats.affection || 90;
    if (parsed.stats.energy === undefined) parsed.stats.energy = 90;

    // Decay rates per minute offline:
    // Food: ~12% per hour (~0.20% per min)
    // Mood: ~8% per hour (~0.13% per min)
    // Energy: if sleeping, recovers +25% per hr; if awake, drains -10% per hr
    if (parsed.isSleeping) {
      // Recharging sleep
      parsed.stats.energy = Math.min(100, Math.round(parsed.stats.energy + (elapsedMinutes * 0.42)));
      parsed.stats.hunger = Math.max(20, Math.round(parsed.stats.hunger - (elapsedMinutes * 0.08)));
      parsed.stats.mood = Math.max(30, Math.round(parsed.stats.mood - (elapsedMinutes * 0.05)));
      parsed.stats.tummyHealth = Math.min(100, Math.round(parsed.stats.tummyHealth + (elapsedMinutes * 0.1)));
    } else {
      parsed.stats.hunger = Math.max(10, Math.round(parsed.stats.hunger - (elapsedMinutes * 0.20)));
      parsed.stats.mood = Math.max(15, Math.round(parsed.stats.mood - (elapsedMinutes * 0.13)));
      parsed.stats.energy = Math.max(10, Math.round(parsed.stats.energy - (elapsedMinutes * 0.15)));
    }

    // Circadian rhythm check: if late night (23:00 - 05:00) and not sleeping, energy naturally low
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour < 5) {
      if (!parsed.isSleeping) {
        parsed.stats.energy = Math.min(parsed.stats.energy, 40);
      }
    }

    parsed.lastActiveTimestamp = now;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const backupLogs = localStorage.getItem('DUDU_BELLY_LOGS');
      let parsedBackup = null;
      if (backupLogs) {
        try { parsedBackup = JSON.parse(backupLogs); } catch (e) {}
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        const today = getIsoDate(new Date());

        // Day change detection on boot
        if (parsed.currentDayDate && parsed.currentDayDate !== today) {
          const prevLogs = (parsed.tummyLogs || []).filter(l => l.date === parsed.currentDayDate);
          const prevDeductions = prevLogs.reduce((acc, c) => acc + (c.penalty || 0), 0);
          if (prevDeductions === 0) {
            parsed.cleanDaysStreak = (parsed.cleanDaysStreak || 0) + 1;
          }
          parsed.habits = defaultState.habits.map(h => ({ ...h, completed: false }));
          parsed.currentDayDate = today;
          parsed.lastStreakDate = today;
        } else if (!parsed.currentDayDate) {
          parsed.currentDayDate = today;
        }

        if (Array.isArray(parsed.habits)) {
          parsed.habits = parsed.habits.filter(h => h.id !== 'resist_noodle');
          const mealHabit = parsed.habits.find(h => h.id === 'healthy_meal');
          if (mealHabit) {
            mealHabit.text = 'Eat veggies';
            mealHabit.icon = 'eco';
          }
        }

        // Tummy logs persistence: NEVER wipe if user has logs
        if (Array.isArray(parsed.tummyLogs) && parsed.tummyLogs.length > 0) {
          // Keep existing user logs intact
        } else if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          parsed.tummyLogs = parsedBackup;
        } else if (!Array.isArray(parsed.tummyLogs)) {
          parsed.tummyLogs = [...defaultState.tummyLogs];
        }

        if (!parsed.inventory) {
          parsed.inventory = { spiceShields: 0, junkShields: 0 };
        }

        applyOfflineSimulation(parsed);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed loading state', e);
    }
    const fresh = { ...defaultState };
    fresh.lastActiveTimestamp = Date.now();
    return fresh;
  }

  function syncCompanionWidgetStats() {
    try {
      if (window.Capacitor?.Plugins?.DuduCompanion) {
        let unread = 0;
        try {
          const raw = localStorage.getItem('dudu_unread_topics');
          if (raw) unread = JSON.parse(raw).length;
        } catch (_) {}
        const food = Math.round(state?.stats?.hunger ?? 80);
        const sleep = Math.round(state?.stats?.energy ?? 90);
        window.Capacitor.Plugins.DuduCompanion.updateStats({ food, sleep, unread });
      }
    } catch (_) {}
  }
  window.syncCompanionWidgetStats = syncCompanionWidgetStats;

  function saveState() {
    try {
      state.lastActiveTimestamp = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (Array.isArray(state.tummyLogs)) {
        localStorage.setItem('DUDU_BELLY_LOGS', JSON.stringify(state.tummyLogs));
      }
    } catch (e) {
      console.warn('Failed saving state', e);
    }
    renderHeaderStats();
    if (typeof renderShopPanel === 'function') renderShopPanel();
    syncCompanionWidgetStats();
  }

  // DOM Elements
  const el = {
    honeyCount: document.getElementById('honey-count'),
    streakCount: document.getElementById('streak-count'),
    duduAvatarImg: document.getElementById('dudu-avatar-img'),
    duduStickerIdPill: document.getElementById('dudu-sticker-id-pill'),
    duduDialogue: document.getElementById('dudu-dialogue'),
    duduContainer: document.getElementById('dudu-avatar-container'),
    duduMoodBadge: document.getElementById('dudu-mood-badge'),
    tummyHealthBar: document.getElementById('tummy-health-bar'),
    hungerBar: document.getElementById('hunger-bar'),
    affectionBar: document.getElementById('affection-bar'),
    energyBar: document.getElementById('energy-bar'),
    foodValText: document.getElementById('food-val-text'),
    moodValText: document.getElementById('mood-val-text'),
    energyValText: document.getElementById('energy-val-text'),
    tummyValText: document.getElementById('tummy-val-text'),
    habitsContainer: document.getElementById('habits-container'),
    toast: document.getElementById('feedback-toast'),
    // Modals
    cravingModal: document.getElementById('craving-modal'),
    pantryModal: document.getElementById('pantry-modal'),
    // Tabs
    tabHome: document.getElementById('tab-home'),
    tabShield: document.getElementById('tab-shield'),
    tabShop: document.getElementById('tab-shop'),
    navLinks: document.querySelectorAll('.nav-link')
  };

  function checkDayChange() {
    const todayIso = getIsoDate(new Date());
    if (state.currentDayDate && state.currentDayDate !== todayIso) {
      handleDayTransition(state.currentDayDate, todayIso);
    } else {
      state.currentDayDate = todayIso;
    }
  }

  function handleDayTransition(prevDay, newDay) {
    const prevLogs = (state.tummyLogs || []).filter(l => l.date === prevDay);
    const prevDeductions = prevLogs.reduce((acc, c) => acc + (c.penalty || 0), 0);
    if (prevDeductions === 0) {
      state.cleanDaysStreak = (state.cleanDaysStreak || 0) + 1;
    }

    state.habits = defaultState.habits.map(h => ({ ...h, completed: false }));
    state.currentDayDate = newDay;
    state.lastStreakDate = newDay;

    saveState();
    renderAll();
    showToast(`New day started! Fresh 120 Honey reward pool ready for Bubu! 🍯`);
  }

  function init() {
    checkDayChange();
    setupNavigation();
    setupPetInteractions();
    setupCollapsibleSections();
    setupCalendarHistory();
    setupShopPanel();
    setupSpicyAndJunkLoggers();
    setupHabits();
    setupCravingRescue();
    setupFoodPantry();
    setupDebugMode();
    setupIdentityPicker();
    setupWeeklySpicyAndThemeControls();
    renderAll();
    renderShopPanel();
    syncCompanionWidgetStats();

    // Initialize Private Duo Chat
    if (window.DuduChatUI) {
      window.DuduChatUI.init();
    }

    setupTummyLogSocketListeners();

    // Heartbeat clock sync every 30s when app is active
    setInterval(() => {
      applyOfflineSimulation(state);
      saveState();
    }, 30000);

    // Visibility change / exit timestamp capture & Day change detection
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        state.lastActiveTimestamp = Date.now();
        saveState();
      } else if (document.visibilityState === 'visible') {
        checkDayChange();
        applyOfflineSimulation(state);
        renderHeaderStats();
        renderShopPanel();
      }
    });

    window.addEventListener('focus', () => {
      checkDayChange();
    });

    // Check day change every minute in case app stays open past midnight
    setInterval(checkDayChange, 60000);

    window.addEventListener('beforeunload', () => {
      state.lastActiveTimestamp = Date.now();
      saveState();
    });

    const hours = new Date().getHours();
    if (hours >= 22 || hours < 5) {
      setDuduSticker(93, 'It is bedtime, darling Bubu... Dudu has prepared the starry duvet, sleep soundly tonight.');
    }
  }

  function setupTummyLogSocketListeners() {
    if (!window.DuduChatSocket) return;

    window.DuduChatSocket.onTummyLogCreated((incomingLog) => {
      if (!incomingLog || !incomingLog.id) return;
      const exists = state.tummyLogs.some(l => l.id === incomingLog.id);
      if (!exists) {
        state.tummyLogs.unshift(incomingLog);
        state.tummyLogs.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
        const todayIso = getIsoDate(new Date());
        if (incomingLog.date === todayIso && incomingLog.penalty) {
          state.honeyPoints = Math.max(0, state.honeyPoints - incomingLog.penalty);
          state.stats.tummyHealth = Math.max(10, state.stats.tummyHealth - Math.round(incomingLog.penalty * 0.6));
        }
        saveState();
        renderAll();
        const eaterName = (incomingLog.eater || 'Partner').toLowerCase() === 'dudu' ? 'Dudu' : 'Bubu';
        showToast(`${eaterName} tracked ${incomingLog.item}!`);
        window.duduAudio?.playPop?.(480);
      }
    });

    window.DuduChatSocket.onTummyLogDeleted((logId) => {
      if (!logId) return;
      const initialCount = state.tummyLogs.length;
      state.tummyLogs = state.tummyLogs.filter(l => l.id !== logId);
      if (state.tummyLogs.length !== initialCount) {
        saveState();
        renderAll();
      }
    });

    window.DuduChatSocket.onTummyLogSync((incomingLogs) => {
      if (!Array.isArray(incomingLogs)) return;
      let updated = false;
      incomingLogs.forEach(inLog => {
        if (inLog && inLog.id && !state.tummyLogs.some(l => l.id === inLog.id)) {
          state.tummyLogs.push(inLog);
          updated = true;
        }
      });
      if (updated) {
        state.tummyLogs.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.time || '').localeCompare(a.time || ''));
        saveState();
        renderAll();
      }
    });
  }

  function setupNavigation() {
    el.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = link.getAttribute('data-tab');
        switchTab(targetTab);
        window.duduAudio.playPop(420);
      });
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.body.classList.toggle('chat-tab-active', tabName === 'chat');
    const bottomNav = document.getElementById('bottom-nav-bar');
    if (bottomNav) {
      bottomNav.classList.remove('nav-bar-hidden');
    }
    if (tabName !== 'chat' && document.activeElement?.id === 'chat-text-input') {
      document.activeElement.blur();
    }
    ['home', 'shield', 'shop', 'chat'].forEach(name => {
      const section = document.getElementById(`tab-${name}`);
      if (section) {
        if (name === tabName) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      }
    });

    if (tabName === 'shop') {
      renderShopPanel();
    } else if (tabName === 'chat') {
      window.DuduChatUI?.onTabActivated?.();
    }
    window.DuduChatUI?.updateNavChatBadge?.();

    el.navLinks.forEach(link => {
      const match = link.getAttribute('data-tab') === tabName;
      if (match) {
        link.classList.add('active-tab', 'text-secondary', 'font-bold');
        link.classList.remove('text-on-surface-variant', 'bg-secondary-container', 'hover:bg-surface-container');
      } else {
        link.classList.remove('active-tab', 'text-secondary', 'font-bold', 'bg-secondary-container');
        link.classList.add('text-on-surface-variant');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setDuduSticker(id, customQuote = null) {
    const sticker = window.DuduTaxonomy.getById(id) || window.DUDU_STICKERS[0];
    state.currentStickerId = sticker.id;
    state.currentDialogue = customQuote || sticker.quote;

    if (el.duduAvatarImg) {
      el.duduAvatarImg.src = `Dudu Stickers/${sticker.file}`;
      el.duduAvatarImg.alt = sticker.title;
    }

    if (el.duduStickerIdPill) {
      el.duduStickerIdPill.textContent = `ID #${sticker.id}`;
    }

    if (el.duduDialogue) {
      el.duduDialogue.textContent = state.currentDialogue;
      el.duduDialogue.parentElement.classList.remove('animate-squish');
      void el.duduDialogue.parentElement.offsetWidth;
      el.duduDialogue.parentElement.classList.add('animate-squish');
    }

    if (el.duduMoodBadge) {
      el.duduMoodBadge.textContent = formatMoodBadge(sticker.mood);
    }

    saveState();
  }

  function formatMoodBadge(mood) {
    const map = {
      happy: 'Cheerful & Radiant',
      loving: 'Full of Love',
      playful: 'Playful & Cuddly',
      comforting: 'Warm Hug Ready',
      eating: 'Well-Fed & Content',
      relaxed: 'Peacefully Chilling',
      craving_alert: "Bubu's Belly Protected",
      spicy_alarm: 'Spicy Alert Active',
      sleepy: 'Sleepy & Cozy',
      pouting: 'Affectionate Pout',
      tired: 'Resting Softly',
      annoyed: 'Angy Bear Mode',
      fight: 'Duel Champion',
      scold: 'Violation Notebook',
      scolded: 'Violation Notebook'
    };
    return map[mood] || 'Happy With Bubu';
  }

  function setupPetInteractions() {
    if (el.duduContainer) {
      el.duduContainer.addEventListener('click', (e) => {
        handleBoop(e);
      });
    }

    document.getElementById('action-feed-btn')?.addEventListener('click', () => {
      openPantryModal();
      window.duduAudio.playPop(480);
    });

    document.querySelectorAll('.trigger-dance-btn, #action-dance-btn, #action-dance-grid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDance();
      });
    });

    document.getElementById('action-hug-btn')?.addEventListener('click', () => {
      handleHug();
    });

    document.getElementById('action-kiss-btn')?.addEventListener('click', () => {
      handleKiss();
    });

    document.getElementById('action-gift-btn')?.addEventListener('click', () => {
      handleGift();
    });

    document.getElementById('action-sleep-btn')?.addEventListener('click', () => {
      handleTuckIn();
    });

    document.getElementById('pout-annoy-btn')?.addEventListener('click', () => {
      handleAnnoy();
    });

    document.getElementById('pout-fight-btn')?.addEventListener('click', () => {
      handleFight();
    });

    document.getElementById('pout-scold-btn')?.addEventListener('click', () => {
      handleScold();
    });

    document.getElementById('pout-squish-btn')?.addEventListener('click', () => {
      handleCheekSquish();
    });

    document.getElementById('pout-massage-btn')?.addEventListener('click', () => {
      handleMassage();
    });
  }

  function setupCollapsibleSections() {
    const toggleCareBtn = document.getElementById('toggle-care-btn');
    const careContainer = document.getElementById('care-buttons-container');
    const chevronCare = document.getElementById('chevron-care');
    const toggleActionBtn = document.getElementById('toggle-action-btn');
    const actionContainer = document.getElementById('action-buttons-container');
    const chevronAction = document.getElementById('chevron-action');

    function toggle(container, chevron, btn) {
      if (!container) return;
      const isHidden = container.classList.contains('hidden');
      if (isHidden) {
        container.classList.remove('hidden');
        chevron?.classList.remove('-rotate-90');
        btn?.setAttribute('aria-expanded', 'true');
      } else {
        container.classList.add('hidden');
        chevron?.classList.add('-rotate-90');
        btn?.setAttribute('aria-expanded', 'false');
      }
      window.duduAudio?.playPop(480);
    }

    toggleCareBtn?.addEventListener('click', () => toggle(careContainer, chevronCare, toggleCareBtn));
    toggleActionBtn?.addEventListener('click', () => toggle(actionContainer, chevronAction, toggleActionBtn));
  }

  function handleDance() {
    window.duduAudio.playDance();
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 12);
    state.stats.energy = Math.max(10, (state.stats.energy || 90) - 3);
    state.stats.affection = state.stats.mood;
    saveState();

    if (el.duduContainer) {
      el.duduContainer.classList.remove('animate-squish');
      void el.duduContainer.offsetWidth;
      el.duduContainer.classList.add('animate-squish');
    }

    const sticker = window.DuduTaxonomy.getRandomFromPool('dance', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleAnnoy() {
    window.duduAudio.playGrumpy();
    const sticker = window.DuduTaxonomy.getRandomFromPool('annoy', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleFight() {
    window.duduAudio.playPunch();
    const sticker = window.DuduTaxonomy.getRandomFromPool('fight', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleScold() {
    window.duduAudio.playWhimper();
    const sticker = window.DuduTaxonomy.getRandomFromPool('scold', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleBoop(event) {
    state.counters.boops++;
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 4);
    state.stats.affection = state.stats.mood;
    saveState();

    window.duduAudio.playBoop();
    spawnHeartBurst(event?.clientX, event?.clientY);

    if (el.duduContainer) {
      el.duduContainer.classList.remove('animate-squish');
      void el.duduContainer.offsetWidth;
      el.duduContainer.classList.add('animate-squish');
    }

    const sticker = window.DuduTaxonomy.getRandomFromPool('boop', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleCheekSquish() {
    state.counters.boops++;
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 5);
    state.stats.affection = state.stats.mood;
    saveState();
    window.duduAudio.playBoop();
    const sticker = window.DuduTaxonomy.getRandomFromPool('squish', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleMassage() {
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 8);
    state.stats.energy = Math.min(100, (state.stats.energy || 90) + 6);
    state.stats.affection = state.stats.mood;
    saveState();
    window.duduAudio.playPop(380);
    const sticker = window.DuduTaxonomy.getRandomFromPool('massage', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleHug() {
    state.counters.hugs++;
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 10);
    state.stats.affection = state.stats.mood;
    saveState();

    window.duduAudio.playSparkle();
    spawnHeartBurst();

    const sticker = window.DuduTaxonomy.getRandomFromPool('hug', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleKiss() {
    state.counters.kisses++;
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 8);
    state.stats.affection = state.stats.mood;
    saveState();

    window.duduAudio.playSparkle();
    spawnHeartBurst();

    const sticker = window.DuduTaxonomy.getRandomFromPool('kiss', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleGift() {
    state.counters.gifts = (state.counters.gifts || 0) + 1;
    state.stats.mood = Math.min(100, (state.stats.mood || 90) + 10);
    state.stats.affection = state.stats.mood;
    saveState();

    window.duduAudio?.playSparkle();
    spawnHeartBurst();

    const sticker = window.DuduTaxonomy.getRandomFromPool('gift', state.currentStickerId);
    setDuduSticker(sticker.id);
  }

  function handleTuckIn() {
    state.isSleeping = !state.isSleeping;
    if (state.isSleeping) {
      window.duduAudio.playLullaby();
      const sticker = window.DuduTaxonomy.getRandomFromPool('sleep', state.currentStickerId);
      setDuduSticker(sticker.id);
    } else {
      state.stats.energy = Math.min(100, (state.stats.energy || 50) + 35);
      state.stats.mood = Math.min(100, (state.stats.mood || 70) + 15);
      saveState();
      window.duduAudio.playPop(520);
      const sticker = window.DuduTaxonomy.getRandomFromPool('wake', state.currentStickerId);
      setDuduSticker(sticker.id);
    }
  }

  function spawnHeartBurst(x, y) {
    const originX = x || (window.innerWidth / 2);
    const originY = y || (window.innerHeight * 0.35);

    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      const emojis = ['💖', '💕', '✨', '🌸', '🍯'];
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const tx = (Math.random() - 0.5) * 100;
      const rot = (Math.random() - 0.5) * 60;
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--rot', `${rot}deg`);
      heart.style.left = `${originX + (Math.random() - 0.5) * 40}px`;
      heart.style.top = `${originY + (Math.random() - 0.5) * 20}px`;
      heart.style.fontSize = `${16 + Math.random() * 12}px`;

      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 950);
    }
  }

  function setupFoodPantry() {
    const modal = el.pantryModal;
    const closeBtn = document.getElementById('close-pantry-btn');
    closeBtn?.addEventListener('click', closePantryModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closePantryModal();
    });

    document.querySelectorAll('.food-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodType = btn.getAttribute('data-food');
        handleFeed(foodType);
        closePantryModal();
      });
    });
  }

  function openPantryModal() {
    if (el.pantryModal) el.pantryModal.classList.remove('hidden');
  }

  function closePantryModal() {
    if (el.pantryModal) el.pantryModal.classList.add('hidden');
  }

  function handleFeed(type) {
    if (type === 'soup') {
      window.duduAudio.playMunch();
      state.stats.hunger = Math.min(100, state.stats.hunger + 30);
      state.stats.tummyHealth = Math.min(100, state.stats.tummyHealth + 20);
      state.honeyPoints += 15;
      saveState();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedSoup', state.currentStickerId);
      setDuduSticker(sticker.id);
    } else if (type === 'rice') {
      window.duduAudio.playMunch();
      state.stats.hunger = Math.min(100, state.stats.hunger + 25);
      state.stats.tummyHealth = Math.min(100, state.stats.tummyHealth + 15);
      state.honeyPoints += 12;
      saveState();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedRice', state.currentStickerId);
      setDuduSticker(sticker.id);
    } else if (type === 'nuts' || type === 'berry') {
      window.duduAudio.playMunch();
      state.stats.hunger = Math.min(100, state.stats.hunger + 15);
      state.honeyPoints += 10;
      saveState();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedNuts', state.currentStickerId);
      setDuduSticker(sticker.id);
    } else if (type === 'honey_tea') {
      window.duduAudio.playSip();
      state.stats.tummyHealth = Math.min(100, state.stats.tummyHealth + 15);
      state.honeyPoints += 12;
      saveState();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedTea', state.currentStickerId);
      setDuduSticker(sticker.id);
    } else if (type === 'noodles') {
      window.duduAudio.playWarningAlarm();
      state.stats.tummyHealth = Math.max(10, state.stats.tummyHealth - 30);
      const todayIso = getIsoDate(new Date());
      state.tummyLogs.unshift({
        id: 'log_' + Date.now(),
        date: todayIso,
        time: formatTime(new Date()),
        item: 'Flaming Hot Instant Noodles',
        category: 'spicy',
        spiceLevel: 4,
        status: 'danger',
        note: 'Instant noodles fed in sanctuary! Flaming tummy alert.'
      });
      selectedHistoryDate = todayIso;
      saveState();
      renderTummyLogs();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedNoodles', state.currentStickerId);
      setDuduSticker(sticker.id);
      setTimeout(() => {
        openCravingModal();
      }, 1400);
    } else if (type === 'burger') {
      window.duduAudio.playPop(320);
      state.stats.tummyHealth = Math.max(20, state.stats.tummyHealth - 15);
      const todayIso = getIsoDate(new Date());
      state.tummyLogs.unshift({
        id: 'log_' + Date.now(),
        date: todayIso,
        time: formatTime(new Date()),
        item: 'Greasy Fast Food Burger',
        category: 'junk',
        spiceLevel: 1,
        status: 'caution',
        note: 'High sodium fast food. Need water & fresh fruit.'
      });
      selectedHistoryDate = todayIso;
      saveState();
      renderTummyLogs();
      const sticker = window.DuduTaxonomy.getRandomFromPool('feedBurger', state.currentStickerId);
      setDuduSticker(sticker.id);
    }
  }

  function setupDebugMode() {
    let profileClickCount = 0;
    let profileClickTimer = null;

    const profileAvatarBtn = document.getElementById('profile-avatar-btn');
    profileAvatarBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      profileClickCount++;
      if (profileClickTimer) clearTimeout(profileClickTimer);
      profileClickTimer = setTimeout(() => {
        profileClickCount = 0;
      }, 1000);

      if (profileClickCount >= 5) {
        profileClickCount = 0;
        clearTimeout(profileClickTimer);
        toggleDebugMode();
      } else {
        window.duduAudio?.playPop(320 + profileClickCount * 40);
      }
    });

    const galleryLauncherBtn = document.getElementById('debug-gallery-btn');
    galleryLauncherBtn?.addEventListener('click', () => {
      openStickerGallery();
    });

    const closeGalleryBtn = document.getElementById('close-gallery-btn');
    closeGalleryBtn?.addEventListener('click', () => {
      closeStickerGallery();
    });

    const galleryModal = document.getElementById('sticker-gallery-modal');
    galleryModal?.addEventListener('click', (e) => {
      if (e.target === galleryModal) closeStickerGallery();
    });

    const searchInput = document.getElementById('gallery-search-input');
    searchInput?.addEventListener('input', (e) => {
      filterStickerGallery(e.target.value.trim().toLowerCase());
    });

    updateDebugUI();
  }

  function toggleDebugMode(forcedState = null) {
    state.debugMode = forcedState !== null ? forcedState : !state.debugMode;
    saveState();
    updateDebugUI();
    window.duduAudio?.playSparkle();

    if (state.debugMode) {
      showToast('🛠️ Debug mode enabled! (Sticker IDs & Gallery visible)');
    } else {
      showToast('🔒 Debug mode disabled');
      closeStickerGallery();
    }
  }

  function updateDebugUI() {
    const pill = document.getElementById('dudu-sticker-id-pill');
    const galleryBtn = document.getElementById('debug-gallery-btn');
    const chatSettingsBtn = document.getElementById('btn-chat-settings');

    if (pill) pill.classList.toggle('hidden', !state.debugMode);
    if (galleryBtn) galleryBtn.classList.toggle('hidden', !state.debugMode);
    if (chatSettingsBtn) chatSettingsBtn.classList.toggle('hidden', !state.debugMode);
  }

  // --- Header Identity Selector (Dudu / Bubu) ---

  function setupIdentityPicker() {
    const identityBtn = document.getElementById('header-identity-btn');
    const modal = document.getElementById('modal-identity-picker');
    const closeBtn = document.getElementById('btn-close-identity-picker');
    const chooseDuduBtn = document.getElementById('btn-choose-dudu');
    const chooseBubuBtn = document.getElementById('btn-choose-bubu');

    identityBtn?.addEventListener('click', () => {
      openIdentityPicker();
    });

    closeBtn?.addEventListener('click', () => {
      closeIdentityPicker();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeIdentityPicker();
    });

    chooseDuduBtn?.addEventListener('click', () => {
      setAppIdentity('kevin');
      closeIdentityPicker();
    });

    chooseBubuBtn?.addEventListener('click', () => {
      setAppIdentity('nana');
      closeIdentityPicker();
    });

    refreshIdentityUI();
  }

  function openIdentityPicker() {
    const modal = document.getElementById('modal-identity-picker');
    if (!modal) return;
    refreshIdentityUI();
    modal.classList.remove('hidden');
    window.duduAudio?.playPop(400);
  }

  function closeIdentityPicker() {
    const modal = document.getElementById('modal-identity-picker');
    if (modal) modal.classList.add('hidden');
  }

  function setAppIdentity(identity) {
    const normalized = (identity === 'bubu' || identity === 'nana') ? 'nana' : 'kevin';
    if (window.DuduChatCrypto) {
      window.DuduChatCrypto.setStoredIdentity(normalized);
    }
    localStorage.setItem('dudu_chat_identity', normalized);
    localStorage.setItem('DUDU_CHAT_IDENTITY', normalized);
    refreshIdentityUI();
    window.duduAudio?.playSparkle();
    showToast(normalized === 'nana' ? 'Profile set to Bubu' : 'Profile set to Dudu');

    // Refresh Duo Chat active messages so outgoing bubbles align with chosen profile
    if (window.DuduChatUI?.onTabActivated) {
      window.DuduChatUI.onTabActivated();
    }
  }

  function refreshIdentityUI() {
    const current = (window.DuduChatCrypto?.getStoredIdentity() || localStorage.getItem('dudu_chat_identity') || 'kevin').toLowerCase();
    const isBubu = current.includes('nana') || current.includes('bubu');

    const nameEl = document.getElementById('header-identity-name');
    const subEl = document.getElementById('header-identity-subtitle');
    const duduBadge = document.getElementById('badge-identity-dudu-active');
    const bubuBadge = document.getElementById('badge-identity-bubu-active');
    const duduCard = document.getElementById('btn-choose-dudu');
    const bubuCard = document.getElementById('btn-choose-bubu');

    if (nameEl) nameEl.textContent = isBubu ? 'Bubu' : 'Dudu';
    if (subEl) subEl.textContent = isBubu ? 'Bubu & Dudu sanctuary' : 'Dudu & Bubu sanctuary';

    if (duduBadge) duduBadge.classList.toggle('hidden', isBubu);
    if (bubuBadge) bubuBadge.classList.toggle('hidden', !isBubu);

    if (duduCard) {
      duduCard.classList.toggle('border-secondary', !isBubu);
      duduCard.classList.toggle('bg-secondary-container/20', !isBubu);
      duduCard.classList.toggle('border-outline-variant/30', isBubu);
    }
    if (bubuCard) {
      bubuCard.classList.toggle('border-secondary', isBubu);
      bubuCard.classList.toggle('bg-secondary-container/20', isBubu);
      bubuCard.classList.toggle('border-outline-variant/30', !isBubu);
    }
  }

  function openStickerGallery() {
    const modal = document.getElementById('sticker-gallery-modal');
    if (!modal) return;
    renderStickerGallery();
    modal.classList.remove('hidden');
    window.duduAudio?.playPop(480);
  }

  function closeStickerGallery() {
    const modal = document.getElementById('sticker-gallery-modal');
    if (modal) modal.classList.add('hidden');
  }

  function renderStickerGallery(filterQuery = '') {
    const container = document.getElementById('gallery-grid-container');
    if (!container || !window.DUDU_STICKERS) return;

    const stickers = window.DUDU_STICKERS.filter(s => {
      if (!filterQuery) return true;
      const idStr = String(s.id);
      const titleLower = (s.title || '').toLowerCase();
      const fileLower = (s.file || '').toLowerCase();
      return idStr === filterQuery || idStr.includes(filterQuery) || titleLower.includes(filterQuery) || fileLower.includes(filterQuery);
    });

    container.innerHTML = stickers.map(s => `
      <button type="button" class="gallery-sticker-card button-press flex flex-col items-center p-2 rounded-2xl bg-surface-container-low/60 hover:bg-secondary-fixed/30 border border-outline-variant/20 transition-all cursor-pointer group text-center" data-sticker-id="${s.id}">
        <div class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center pointer-events-none">
          <img src="Dudu Stickers/${s.file}" alt="${s.title}" loading="lazy" class="w-full h-full object-contain">
        </div>
        <span class="mt-1 bg-neutral-900/85 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 group-hover:bg-primary group-hover:text-white transition-colors">
          ID #${s.id}
        </span>
        <span class="text-[9px] text-on-surface-variant line-clamp-1 mt-0.5 max-w-full font-medium">
          ${s.title}
        </span>
      </button>
    `).join('');

    container.querySelectorAll('.gallery-sticker-card').forEach(card => {
      card.addEventListener('click', () => {
        const stickerId = parseInt(card.getAttribute('data-sticker-id'), 10);
        const s = window.DuduTaxonomy?.getById(stickerId);
        if (s) {
          setDuduSticker(s.id);
          window.duduAudio?.playSparkle();
          showToast(`Displaying Sticker #${s.id}: ${s.title}`);
          closeStickerGallery();
        }
      });
    });
  }

  function filterStickerGallery(query) {
    renderStickerGallery(query);
  }

  function setupHabits() {
    renderHabits();
  }

  function renderHabits() {
    if (!el.habitsContainer) return;
    el.habitsContainer.innerHTML = '';

    state.habits.forEach(habit => {
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        habit.completed
          ? 'bg-surface-container-high/60 border-outline-variant/30 opacity-75'
          : 'bg-surface-container-lowest border-outline-variant/40 soft-card-shadow'
      }`;

      const isMaterialIcon = habit.icon && !habit.icon.includes(' ');
      const iconMarkup = isMaterialIcon 
        ? `<div class="w-8 h-8 rounded-full bg-secondary-fixed/30 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base text-secondary">${habit.icon}</span></div>`
        : `<span class="text-xl select-none shrink-0">${habit.icon}</span>`;

      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          ${iconMarkup}
          <div class="flex flex-col text-left min-w-0 flex-1">
            <span class="text-xs font-bold text-primary ${habit.completed ? 'line-through opacity-70' : ''}">${habit.text}</span>
            <span class="text-[10px] text-tertiary font-bold whitespace-nowrap">+${habit.reward} Honey</span>
          </div>
        </div>
        <button class="button-press px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
          habit.completed
            ? 'bg-surface-container text-on-surface-variant cursor-default'
            : 'bg-secondary text-white hover:bg-secondary/90 shadow-xs'
        }">
          ${habit.completed ? 'Done ✓' : 'Complete'}
        </button>
      `;

      const btn = card.querySelector('button');
      if (!habit.completed) {
        btn.addEventListener('click', () => {
          completeHabit(habit.id);
        });
      }

      el.habitsContainer.appendChild(card);
    });
  }

  function completeHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit || habit.completed) return;

    habit.completed = true;
    state.honeyPoints += habit.reward;
    state.stats.tummyHealth = Math.min(100, state.stats.tummyHealth + 10);
    saveState();

    window.duduAudio.playChime();
    spawnHeartBurst();

    setDuduSticker(28, `Hooray! Bubu finished: "${habit.text}"! Dudu is so proud of your gentle self-discipline! 💖🎉`);
    showToast(`Great job Bubu! +${habit.reward} Honey earned!`);
    renderHabits();
  }

  function setupCravingRescue() {
    document.querySelectorAll('.open-craving-sos-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openCravingModal();
        window.duduAudio.playWarningAlarm();
      });
    });

    const modal = el.cravingModal;
    const closeBtn = document.getElementById('close-craving-btn');
    closeBtn?.addEventListener('click', closeCravingModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeCravingModal();
    });

    const startTimerBtn = document.getElementById('start-cooldown-timer-btn');
    startTimerBtn?.addEventListener('click', startCooldownTimer);

    document.querySelectorAll('.swap-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const swapTitle = btn.getAttribute('data-swap');
        handleSwapSelected(swapTitle);
      });
    });

    const logCravingForm = document.getElementById('honest-craving-form');
    logCravingForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleHonestCravingSubmit();
    });
  }

  function openCravingModal() {
    if (el.cravingModal) {
      el.cravingModal.classList.remove('hidden');
      setDuduSticker(80, 'TUMMY EMERGENCY ALARM! 🚨 Bubu, are you craving instant noodles or spicy junk food? Pause for a second, let us protect your tummy first!');
    }
  }

  function closeCravingModal() {
    if (el.cravingModal) el.cravingModal.classList.add('hidden');
  }

  let cooldownInterval = null;
  function startCooldownTimer() {
    const display = document.getElementById('timer-display');
    const timerBox = document.getElementById('timer-active-box');
    const startBtn = document.getElementById('start-cooldown-timer-btn');
    if (!display || !timerBox) return;

    timerBox.classList.remove('hidden');
    startBtn.classList.add('hidden');

    let secondsLeft = 180;
    window.duduAudio.playPop(500);

    clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      secondsLeft--;
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (secondsLeft <= 0) {
        clearInterval(cooldownInterval);
        window.duduAudio.playChime();
        state.honeyPoints += 25;
        saveState();
        display.textContent = 'DONE! 🎉';
        showToast('Bubu conquered the craving! +25 Honey!');
        setDuduSticker(31, 'SPECTACULAR! 🦸‍♂️ Bubu triumphed over the midnight noodle craving! Supreme champion of healthy tummies!');
      }
    }, 1000);
  }

  function handleSwapSelected(swapTitle) {
    window.duduAudio.playChime();
    state.honeyPoints += 20;
    const todayIso = getIsoDate(new Date());
    state.tummyLogs.unshift({
      id: 'log_' + Date.now(),
      date: todayIso,
      time: formatTime(new Date()),
      item: `Craving swapped: ${swapTitle}`,
      category: 'swap',
      spiceLevel: 0,
      status: 'saved',
      note: 'Wise, tummy-friendly healthy swap!'
    });
    selectedHistoryDate = todayIso;
    saveState();
    closeCravingModal();
    setDuduSticker(36, `Wise choice Bubu! Choosing ${swapTitle} leaves your stomach calm and acid-free! Dudu loves you so much 💕`);
    showToast(`Healthy swap logged! +20 Honey`);
    renderTummyLogs();
  }

  function handleHonestCravingSubmit() {
    const spiceLevel = document.getElementById('spice-level-slider')?.value || 3;
    const drankMilk = document.getElementById('check-drank-milk')?.checked;
    const notEmpty = document.getElementById('check-not-empty')?.checked;
    const noodleName = document.getElementById('craving-food-input')?.value || 'Spicy Instant Noodles';

    let outcomeText = `${noodleName} (Spice Lv ${spiceLevel})`;
    let warningNote = '';

    if (drankMilk && notEmpty) {
      warningNote = 'Great: Bubu drank warm milk & avoided empty stomach.';
      window.duduAudio.playPop(440);
      setDuduSticker(7, `Dudu deeply appreciates your honesty! Because you drank warm milk first, your belly is better protected 🥛💕`);
    } else {
      warningNote = 'Caution: Please drink warm water or milk immediately!';
      window.duduAudio.playWarningAlarm();
      setDuduSticker(71, `WAKE UP BUBU! 😱 Drink warm milk or warm water right this second to extinguish the gastric fire! 🥛🆘`);
    }

    const todayIso = getIsoDate(new Date());
    state.tummyLogs.unshift({
      id: 'log_' + Date.now(),
      date: todayIso,
      time: formatTime(new Date()),
      item: outcomeText,
      category: 'spicy',
      spiceLevel: Number(spiceLevel),
      status: (drankMilk && notEmpty) ? 'safe' : 'danger',
      note: warningNote
    });
    selectedHistoryDate = todayIso;
    saveState();

    closeCravingModal();
    showToast('Tummy log saved with honest care!');
    renderTummyLogs();
  }

  function setupCalendarHistory() {
    const prevBtn = document.getElementById('cal-prev-day-btn');
    const nextBtn = document.getElementById('cal-next-day-btn');
    const dropdownTriggerBtn = document.getElementById('cal-dropdown-trigger-btn');
    const dropdownMenu = document.getElementById('cal-dropdown-menu');
    const dropdownChevron = document.getElementById('cal-dropdown-chevron');
    const calPicker = document.getElementById('tummy-calendar-picker');

    function toggleDropdown(forceState) {
      if (!dropdownMenu) return;
      const isHidden = dropdownMenu.classList.contains('hidden');
      const open = forceState !== undefined ? forceState : isHidden;
      if (open) {
        dropdownMenu.classList.remove('hidden');
        dropdownChevron?.classList.add('rotate-180');
        dropdownTriggerBtn?.setAttribute('aria-expanded', 'true');
        updateDropdownSublabels();
      } else {
        dropdownMenu.classList.add('hidden');
        dropdownChevron?.classList.remove('rotate-180');
        dropdownTriggerBtn?.setAttribute('aria-expanded', 'false');
      }
    }

    function updateDropdownSublabels() {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const twoDays = new Date(Date.now() - 172800000);
      const threeDays = new Date(Date.now() - 259200000);
      const todaySub = document.getElementById('drop-today-sub');
      const yestSub = document.getElementById('drop-yesterday-sub');
      const twoDaysSub = document.getElementById('drop-2days-sub');
      const threeDaysSub = document.getElementById('drop-3days-sub');
      if (todaySub) todaySub.textContent = formatShortDate(getIsoDate(today));
      if (yestSub) yestSub.textContent = formatShortDate(getIsoDate(yesterday));
      if (twoDaysSub) twoDaysSub.textContent = formatShortDate(getIsoDate(twoDays));
      if (threeDaysSub) threeDaysSub.textContent = formatShortDate(getIsoDate(threeDays));
    }

    dropdownTriggerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
      window.duduAudio?.playPop(420);
    });

    document.querySelectorAll('.cal-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const dateType = item.getAttribute('data-dropdown-date');
        if (!dateType) return;
        e.stopPropagation();
        const todayIso = getIsoDate(new Date());
        if (dateType === 'today') {
          selectedHistoryDate = todayIso;
        } else if (dateType === 'yesterday') {
          selectedHistoryDate = getIsoDate(new Date(Date.now() - 86400000));
        } else if (dateType === '2days') {
          selectedHistoryDate = getIsoDate(new Date(Date.now() - 172800000));
        } else if (dateType === '3days') {
          selectedHistoryDate = getIsoDate(new Date(Date.now() - 259200000));
        } else if (dateType === 'all') {
          selectedHistoryDate = 'all';
        }
        toggleDropdown(false);
        renderTummyLogs();
        window.duduAudio?.playPop(460);
      });
    });

    document.addEventListener('click', (e) => {
      if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownTriggerBtn?.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    prevBtn?.addEventListener('click', () => {
      shiftSelectedDate(-1);
      window.duduAudio?.playPop(400);
    });

    nextBtn?.addEventListener('click', () => {
      shiftSelectedDate(1);
      window.duduAudio?.playPop(400);
    });

    calPicker?.addEventListener('change', (e) => {
      if (e.target.value) {
        selectedHistoryDate = e.target.value;
        toggleDropdown(false);
        renderTummyLogs();
        window.duduAudio?.playPop(440);
      }
    });

    document.querySelectorAll('.day-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-day-filter');
        const todayIso = getIsoDate(new Date());
        if (type === 'today') {
          selectedHistoryDate = todayIso;
        } else if (type === 'yesterday') {
          selectedHistoryDate = getIsoDate(new Date(Date.now() - 86400000));
        } else if (type === '2days') {
          selectedHistoryDate = getIsoDate(new Date(Date.now() - 172800000));
        } else if (type === 'all') {
          selectedHistoryDate = 'all';
        }
        renderTummyLogs();
        window.duduAudio?.playPop(440);
      });
    });
  }

  function shiftSelectedDate(days) {
    if (selectedHistoryDate === 'all') {
      selectedHistoryDate = getIsoDate(new Date());
    } else {
      const current = parseDateFromIso(selectedHistoryDate);
      current.setDate(current.getDate() + days);
      selectedHistoryDate = getIsoDate(current);
    }
    renderTummyLogs();
  }

  function deleteTummyLog(id) {
    state.tummyLogs = state.tummyLogs.filter(l => l.id !== id);
    saveState();
    renderAll();
    showToast('Entry removed from history.');
    window.duduAudio?.playPop(350);
    window.DuduChatSocket?.sendDeleteTummyLog?.(id);
  }

  function setupShopPanel() {
    const buySpiceBtn = document.getElementById('buy-spice-shield-btn');
    const buyJunkBtn = document.getElementById('buy-junk-shield-btn');

    buySpiceBtn?.addEventListener('click', () => {
      if ((state.honeyPoints || 0) < 120) {
        showToast(`Need ${120 - (state.honeyPoints || 0)} more Honey!`);
        window.duduAudio?.playWhimper();
        return;
      }
      state.honeyPoints -= 120;
      state.inventory = state.inventory || { spiceShields: 0, junkShields: 0 };
      state.inventory.spiceShields = (state.inventory.spiceShields || 0) + 1;
      saveState();
      window.duduAudio?.playChime();
      spawnHeartBurst();
      showToast('Acquired Spice Shield! -50% spicy penalty active!');
      renderShopPanel();
    });

    buyJunkBtn?.addEventListener('click', () => {
      if ((state.honeyPoints || 0) < 95) {
        showToast(`Need ${95 - (state.honeyPoints || 0)} more Honey!`);
        window.duduAudio?.playWhimper();
        return;
      }
      state.honeyPoints -= 95;
      state.inventory = state.inventory || { spiceShields: 0, junkShields: 0 };
      state.inventory.junkShields = (state.inventory.junkShields || 0) + 1;
      saveState();
      window.duduAudio?.playChime();
      spawnHeartBurst();
      showToast('Acquired Junk Shield! -50% junk penalty active!');
      renderShopPanel();
    });
  }

  function renderShopPanel() {
    const walletEl = document.getElementById('shop-wallet-honey');
    const spiceOwnedEl = document.getElementById('spice-shield-owned-count');
    const junkOwnedEl = document.getElementById('junk-shield-owned-count');
    const modalSpiceBanner = document.getElementById('spicy-shield-banner');
    const modalJunkBanner = document.getElementById('junk-shield-banner');
    const modalSpiceCount = document.getElementById('modal-spice-shield-count');
    const modalJunkCount = document.getElementById('modal-junk-shield-count');

    if (walletEl) walletEl.textContent = state.honeyPoints || 0;
    if (spiceOwnedEl) spiceOwnedEl.textContent = state.inventory?.spiceShields || 0;
    if (junkOwnedEl) junkOwnedEl.textContent = state.inventory?.junkShields || 0;

    const spiceCount = state.inventory?.spiceShields || 0;
    const junkCount = state.inventory?.junkShields || 0;

    if (modalSpiceBanner) {
      if (spiceCount > 0) {
        modalSpiceBanner.classList.remove('hidden');
        if (modalSpiceCount) modalSpiceCount.textContent = spiceCount;
      } else {
        modalSpiceBanner.classList.add('hidden');
      }
    }

    if (modalJunkBanner) {
      if (junkCount > 0) {
        modalJunkBanner.classList.remove('hidden');
        if (modalJunkCount) modalJunkCount.textContent = junkCount;
      } else {
        modalJunkBanner.classList.add('hidden');
      }
    }
  }

  function setupSpicyAndJunkLoggers() {
    const spicyTriggerBtn = document.getElementById('log-spicy-trigger-btn');
    const junkTriggerBtn = document.getElementById('log-junk-trigger-btn');
    const spicyModal = document.getElementById('modal-log-spicy');
    const junkModal = document.getElementById('modal-log-junk');
    const closeSpicyBtn = document.getElementById('close-spicy-modal-btn');
    const closeJunkBtn = document.getElementById('close-junk-modal-btn');
    const formSpicy = document.getElementById('form-log-spicy');
    const formJunk = document.getElementById('form-log-junk');
    const spicySlider = document.getElementById('spicy-slider-input');
    const spicySliderLabel = document.getElementById('spicy-slider-label');
    const spicyMilkCheck = document.getElementById('check-spicy-milk');
    const spiceShieldCheck = document.getElementById('check-use-spice-shield');
    const junkSlider = document.getElementById('junk-slider-input');
    const junkSliderLabel = document.getElementById('junk-slider-label');
    const junkBalanceCheck = document.getElementById('check-junk-balance');
    const junkShieldCheck = document.getElementById('check-use-junk-shield');

    function calculateSpicyPenalty(lv, withMilk, withShield) {
      const baseMap = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 35 };
      const base = baseMap[lv] || 20;
      let factor = 1.0;
      if (withMilk) factor *= 0.5;
      if (withShield) factor *= 0.5;
      return Math.max(1, Math.round(base * factor));
    }

    function calculateJunkPenalty(lv, withBalance, withShield) {
      const baseMap = { 1: 10, 2: 15, 3: 25, 4: 35 };
      const base = baseMap[lv] || 15;
      let factor = 1.0;
      if (withBalance) factor *= 0.5;
      if (withShield) factor *= 0.5;
      return Math.max(1, Math.round(base * factor));
    }

    function updateSpicySlider() {
      const lv = parseInt(spicySlider?.value || 3, 10);
      const withMilk = spicyMilkCheck?.checked;
      const hasShield = (state.inventory?.spiceShields || 0) > 0;
      const withShield = hasShield && (spiceShieldCheck?.checked ?? true);
      const penalty = calculateSpicyPenalty(lv, withMilk, withShield);
      const titles = {
        1: 'Lv 1: Mild Heat',
        2: 'Lv 2: Warm Kick',
        3: 'Lv 3: Hot Sweat',
        4: 'Lv 4: Fiery Blaze',
        5: 'Lv 5: Volcanic Inferno'
      };
      if (spicySliderLabel) {
        let shieldTag = withShield ? ' (🛡️ Shield -50%)' : '';
        spicySliderLabel.textContent = `${titles[lv]} (-${penalty} Honey)${shieldTag}`;
      }
      const submitText = document.getElementById('spicy-submit-btn-text');
      if (submitText) {
        submitText.textContent = `Deduct -${penalty} Honey & Log`;
      }
    }

    function updateJunkSlider() {
      const lv = parseInt(junkSlider?.value || 2, 10);
      const withBalance = junkBalanceCheck?.checked;
      const hasShield = (state.inventory?.junkShields || 0) > 0;
      const withShield = hasShield && (junkShieldCheck?.checked ?? true);
      const penalty = calculateJunkPenalty(lv, withBalance, withShield);
      const titles = {
        1: 'Light Snack / Bites',
        2: 'Regular Meal',
        3: 'Large Portion',
        4: 'Feast / Late-Night Binge'
      };
      if (junkSliderLabel) {
        let shieldTag = withShield ? ' (🛡️ Shield -50%)' : '';
        junkSliderLabel.textContent = `${titles[lv]} (-${penalty} Honey)${shieldTag}`;
      }
      const submitText = document.getElementById('junk-submit-btn-text');
      if (submitText) {
        submitText.textContent = `Deduct -${penalty} Honey & Log`;
      }
    }

    function setupEaterPickers() {
      const currentId = (window.DuduChatCrypto?.getStoredIdentity() || localStorage.getItem('dudu_chat_identity') || 'bubu').toLowerCase();
      const defaultEater = (currentId.includes('dudu') || currentId.includes('kevin')) ? 'Dudu' : 'Bubu';

      function updateEaterUI(prefix, selected) {
        const btnBubu = document.getElementById(`btn-${prefix}-eater-bubu`);
        const btnDudu = document.getElementById(`btn-${prefix}-eater-dudu`);
        const input = document.getElementById(`${prefix}-eater-input`);
        if (input) input.value = selected;
        if (selected === 'Bubu') {
          btnBubu?.classList.add('bg-secondary', 'text-white', 'border-secondary');
          btnBubu?.classList.remove('bg-surface-container-low', 'text-primary', 'border-outline-variant/40');
          btnDudu?.classList.remove('bg-secondary', 'text-white', 'border-secondary');
          btnDudu?.classList.add('bg-surface-container-low', 'text-primary', 'border-outline-variant/40');
        } else {
          btnDudu?.classList.add('bg-secondary', 'text-white', 'border-secondary');
          btnDudu?.classList.remove('bg-surface-container-low', 'text-primary', 'border-outline-variant/40');
          btnBubu?.classList.remove('bg-secondary', 'text-white', 'border-secondary');
          btnBubu?.classList.add('bg-surface-container-low', 'text-primary', 'border-outline-variant/40');
        }
      }

      document.getElementById('btn-spicy-eater-bubu')?.addEventListener('click', () => updateEaterUI('spicy', 'Bubu'));
      document.getElementById('btn-spicy-eater-dudu')?.addEventListener('click', () => updateEaterUI('spicy', 'Dudu'));
      document.getElementById('btn-junk-eater-bubu')?.addEventListener('click', () => updateEaterUI('junk', 'Bubu'));
      document.getElementById('btn-junk-eater-dudu')?.addEventListener('click', () => updateEaterUI('junk', 'Dudu'));

      updateEaterUI('spicy', defaultEater);
      updateEaterUI('junk', defaultEater);
    }

    spicyTriggerBtn?.addEventListener('click', () => {
      spicyModal?.classList.remove('hidden');
      setupEaterPickers();
      renderShopPanel();
      updateSpicySlider();
      window.duduAudio?.playWarningAlarm();
      setDuduSticker(80, 'Spicy food incoming! Dudu is preparing the tummy defense shields!');
    });

    junkTriggerBtn?.addEventListener('click', () => {
      junkModal?.classList.remove('hidden');
      setupEaterPickers();
      renderShopPanel();
      updateJunkSlider();
      window.duduAudio?.playPop(420);
      setDuduSticker(1, 'Junk food craving? Dudu will monitor your portions closely!');
    });

    closeSpicyBtn?.addEventListener('click', () => spicyModal?.classList.add('hidden'));
    closeJunkBtn?.addEventListener('click', () => junkModal?.classList.add('hidden'));
    spicyModal?.addEventListener('click', (e) => { if (e.target === spicyModal) spicyModal.classList.add('hidden'); });
    junkModal?.addEventListener('click', (e) => { if (e.target === junkModal) junkModal.classList.add('hidden'); });

    spicySlider?.addEventListener('input', updateSpicySlider);
    spicyMilkCheck?.addEventListener('change', updateSpicySlider);
    spiceShieldCheck?.addEventListener('change', updateSpicySlider);
    junkSlider?.addEventListener('input', updateJunkSlider);
    junkBalanceCheck?.addEventListener('change', updateJunkSlider);
    junkShieldCheck?.addEventListener('change', updateJunkSlider);

    formSpicy?.addEventListener('submit', (e) => {
      e.preventDefault();
      const foodName = document.getElementById('spicy-food-name-input')?.value.trim() || 'Spicy Meal';
      const lv = parseInt(spicySlider?.value || 3, 10);
      const withMilk = spicyMilkCheck?.checked;
      const hasShield = (state.inventory?.spiceShields || 0) > 0;
      const withShield = hasShield && (spiceShieldCheck?.checked ?? true);
      const penalty = calculateSpicyPenalty(lv, withMilk, withShield);
      const todayIso = getIsoDate(new Date());
      const eater = document.getElementById('spicy-eater-input')?.value || 'Bubu';

      if (withShield) {
        state.inventory.spiceShields = Math.max(0, (state.inventory.spiceShields || 0) - 1);
      }

      let note = withMilk 
        ? 'Great! Drank warm milk first.'
        : 'Ate without milk protection.';
      if (withShield) {
        note += ' 🛡️ Spice Shield absorbed 50% heat penalty!';
      }

      state.honeyPoints = Math.max(0, state.honeyPoints - penalty);
      state.stats.tummyHealth = Math.max(10, state.stats.tummyHealth - Math.round(penalty * 0.7));

      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: todayIso,
        time: formatTime(new Date()),
        item: foodName,
        category: 'spicy',
        spiceLevel: lv,
        portionLevel: null,
        penalty: penalty,
        status: (withMilk || withShield) ? 'safe' : 'danger',
        note: note,
        eater: eater,
        createdAt: Date.now()
      };

      state.tummyLogs.unshift(newLog);
      window.DuduChatSocket?.sendCreateTummyLog?.(newLog);

      selectedHistoryDate = todayIso;
      saveState();
      spicyModal?.classList.add('hidden');
      formSpicy.reset();

      if (withShield) {
        setDuduSticker(31, `Spice Shield activated! Absorbed half the fiery chili for ${eater}! 🛡️✨`);
        window.duduAudio?.playChime();
      } else if (withMilk) {
        setDuduSticker(7, `Dudu gives you a gentle headpat! Good job drinking warm milk with your ${foodName}! 🥛💕`);
        window.duduAudio?.playChime();
      } else if (lv >= 4) {
        setDuduSticker(71, `EXTREME HEAT EMERGENCY! 😱 Drink warm water or milk right now to quench the gastric fire! 🥛🆘`);
        window.duduAudio?.playWarningAlarm();
      } else {
        setDuduSticker(26, `Aww, ${foodName} was spicy! Dudu will hug you while ${eater}'s belly rests! 🔥🥺`);
        window.duduAudio?.playWhimper();
      }

      showToast(`Logged spicy food (${eater}): -${penalty} Honey deducted.`);
      renderAll();
    });

    formJunk?.addEventListener('submit', (e) => {
      e.preventDefault();
      const foodName = document.getElementById('junk-food-name-input')?.value.trim() || 'Junk Food';
      const lv = parseInt(junkSlider?.value || 2, 10);
      const withBalance = junkBalanceCheck?.checked;
      const hasShield = (state.inventory?.junkShields || 0) > 0;
      const withShield = hasShield && (junkShieldCheck?.checked ?? true);
      const penalty = calculateJunkPenalty(lv, withBalance, withShield);
      const todayIso = getIsoDate(new Date());
      const eater = document.getElementById('junk-eater-input')?.value || 'Bubu';

      if (withShield) {
        state.inventory.junkShields = Math.max(0, (state.inventory.junkShields || 0) - 1);
      }

      let note = withBalance
        ? 'Balanced with water & veggies.'
        : 'Oily and salty snack.';
      if (withShield) {
        note += ' 🛡️ Junk Shield absorbed 50% snack penalty!';
      }

      state.honeyPoints = Math.max(0, state.honeyPoints - penalty);
      state.stats.tummyHealth = Math.max(10, state.stats.tummyHealth - Math.round(penalty * 0.6));

      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        date: todayIso,
        time: formatTime(new Date()),
        item: foodName,
        category: 'junk',
        spiceLevel: null,
        portionLevel: lv,
        penalty: penalty,
        status: (withBalance || withShield) ? 'safe' : 'caution',
        note: note,
        eater: eater,
        createdAt: Date.now()
      };

      state.tummyLogs.unshift(newLog);
      window.DuduChatSocket?.sendCreateTummyLog?.(newLog);

      selectedHistoryDate = todayIso;
      saveState();
      junkModal?.classList.add('hidden');
      formJunk.reset();

      if (withShield) {
        setDuduSticker(31, `Junk Shield deployed! Absorbed 50% penalty for ${eater}'s belly! 🛡️🍔`);
        window.duduAudio?.playChime();
      } else {
        setDuduSticker(1, `Logged ${foodName}! Bear police noted the calories. Drink warm water and get plenty of rest, sweet ${eater}! 👀🍔`);
        window.duduAudio?.playPop(340);
      }
      showToast(`Logged junk food (${eater}): -${penalty} Honey deducted.`);
      renderAll();
    });
  }

  function renderTummyLogs() {
    const list = document.getElementById('tummy-logs-list');
    const calLabel = document.getElementById('cal-current-label');
    const calPicker = document.getElementById('tummy-calendar-picker');
    const summaryText = document.getElementById('cal-summary-text');
    const dailyPoolEl = document.getElementById('daily-honey-pool-text');
    if (!list) return;

    const todayIso = getIsoDate(new Date());
    const yesterdayIso = getIsoDate(new Date(Date.now() - 86400000));
    const twoDaysIso = getIsoDate(new Date(Date.now() - 172800000));

    // Update Daily Honey Pool in hero card
    const todayPool = getDailyHoneyPool(todayIso);
    if (dailyPoolEl) {
      dailyPoolEl.textContent = `+${todayPool.remaining}/${todayPool.max}`;
    }

    // Update label text
    if (calLabel) {
      if (selectedHistoryDate === 'all') {
        calLabel.textContent = 'All History';
      } else if (selectedHistoryDate === todayIso) {
        calLabel.textContent = `Today (${formatShortDate(selectedHistoryDate)})`;
      } else if (selectedHistoryDate === yesterdayIso) {
        calLabel.textContent = `Yesterday (${formatShortDate(selectedHistoryDate)})`;
      } else {
        calLabel.textContent = formatShortDate(selectedHistoryDate, true);
      }
    }

    if (calPicker && selectedHistoryDate !== 'all') {
      calPicker.value = selectedHistoryDate;
    }

    // Update quick filter buttons active state
    document.querySelectorAll('.day-filter-btn').forEach(btn => {
      const type = btn.getAttribute('data-day-filter');
      let isActive = false;
      if (type === 'today' && selectedHistoryDate === todayIso) isActive = true;
      else if (type === 'yesterday' && selectedHistoryDate === yesterdayIso) isActive = true;
      else if (type === '2days' && selectedHistoryDate === twoDaysIso) isActive = true;
      else if (type === 'all' && selectedHistoryDate === 'all') isActive = true;

      if (isActive) {
        btn.className = 'day-filter-btn button-press px-2.5 py-1 rounded-lg text-[10px] font-bold bg-secondary text-white shadow-xs whitespace-nowrap cursor-pointer';
      } else {
        btn.className = 'day-filter-btn button-press px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/30 whitespace-nowrap cursor-pointer';
      }
    });

    // Filter logs
    let filtered = state.tummyLogs;
    if (selectedHistoryDate !== 'all') {
      filtered = state.tummyLogs.filter(log => log.date === selectedHistoryDate);
    }

    const dayPool = getDailyHoneyPool(selectedHistoryDate === 'all' ? todayIso : selectedHistoryDate);
    if (summaryText) {
      if (selectedHistoryDate === 'all') {
        summaryText.textContent = `${filtered.length} total entries recorded`;
      } else if (filtered.length > 0) {
        summaryText.textContent = `${filtered.length} item${filtered.length > 1 ? 's' : ''} eaten • -${dayPool.deducted} Honey deducted`;
      } else {
        summaryText.textContent = 'Clean day • Zero deductions';
      }
    }

    list.innerHTML = '';

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'py-6 px-3 rounded-2xl bg-surface-container-low/40 border border-outline-variant/20 flex flex-col items-center text-center gap-1.5';
      emptyDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary">
          <span class="material-symbols-outlined text-xl">verified</span>
        </div>
        <span class="font-heading font-bold text-xs text-primary">Clean &amp; Healthy Tummy Day!</span>
        <span class="text-[10px] text-on-surface-variant max-w-xs">No spicy food or junk food logged for this day. Bubu's stomach is resting peacefully! 🌿✨</span>
      `;
      list.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(log => {
      const item = document.createElement('div');
      item.className = 'p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between text-left gap-2';

      let icon = 'local_fire_department';
      let iconColor = 'text-rose-600';
      let iconBg = 'bg-rose-50 dark:bg-rose-950/40';

      if (log.category === 'junk') {
        icon = 'fastfood';
        iconColor = 'text-amber-600';
        iconBg = 'bg-amber-50 dark:bg-amber-950/40';
      } else if (log.status === 'safe') {
        icon = 'shield';
        iconColor = 'text-secondary';
        iconBg = 'bg-secondary-container/40';
      }

      let badgeText = log.category === 'junk'
        ? (log.portionLevel ? `Portion Lv ${log.portionLevel}` : 'Junk Food')
        : `Spice Lv ${log.spiceLevel || 3}`;

      let badgeClass = log.status === 'danger'
        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
        : log.status === 'caution'
        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
        : 'bg-secondary-container text-on-secondary-container';

      const eaterName = (log.eater || 'Bubu').toLowerCase() === 'dudu' ? 'Dudu' : 'Bubu';
      const eaterBadgeClass = eaterName === 'Dudu'
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/30';

      item.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <div class="w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-lg ${iconColor}">${icon}</span>
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-primary leading-tight">${log.item}</span>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeClass} leading-none whitespace-nowrap">${badgeText}</span>
              <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${eaterBadgeClass} leading-none whitespace-nowrap">${eaterName} ate</span>
            </div>
            <span class="text-[10px] text-on-surface-variant leading-tight mt-0.5">${log.note || ''}</span>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0 ml-1">
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 whitespace-nowrap leading-none">
            -${log.penalty || 15} Honey
          </span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[10px] text-outline font-semibold whitespace-nowrap">${log.time || ''}</span>
            <button type="button" class="delete-log-btn text-outline-variant hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer" data-log-id="${log.id}" title="Remove entry">
              <span class="material-symbols-outlined text-xs">delete</span>
            </button>
          </div>
        </div>
      `;

      item.querySelector('.delete-log-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTummyLog(log.id);
      });

      list.appendChild(item);
    });
  }



  let toastTimeout = null;
  function showToast(message) {
    if (!el.toast) el.toast = document.getElementById('feedback-toast');
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.remove('opacity-0', 'pointer-events-none');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2200);
  }
  window.showToast = showToast;

  function renderHeaderStats() {
    if (el.honeyCount) el.honeyCount.textContent = state.honeyPoints;
    if (el.streakCount) el.streakCount.textContent = `${state.cleanDaysStreak} Days`;
    const widgetStreak = document.getElementById('widget-streak-badge');
    if (widgetStreak) widgetStreak.textContent = `Streak: ${state.cleanDaysStreak} Days`;

    // Food / Hunger
    const foodVal = Math.round(state.stats.hunger);
    if (el.hungerBar) el.hungerBar.style.width = `${foodVal}%`;
    if (el.foodValText) el.foodValText.textContent = `${foodVal}%`;

    // Mood
    const moodVal = Math.round(state.stats.mood !== undefined ? state.stats.mood : (state.stats.affection || 90));
    if (el.affectionBar) el.affectionBar.style.width = `${moodVal}%`;
    if (el.moodValText) el.moodValText.textContent = `${moodVal}%`;

    // Energy / Sleep
    const energyVal = Math.round(state.stats.energy !== undefined ? state.stats.energy : 90);
    if (el.energyBar) el.energyBar.style.width = `${energyVal}%`;
    if (el.energyValText) el.energyValText.textContent = `${energyVal}%`;

    // Bubu's Belly
    const tummyVal = Math.round(state.stats.tummyHealth);
    if (el.tummyHealthBar) el.tummyHealthBar.style.width = `${tummyVal}%`;
    if (el.tummyValText) el.tummyValText.textContent = `${tummyVal}%`;

    const kissesEl = document.getElementById('stat-kisses-count');
    const hugsEl = document.getElementById('stat-hugs-count');
    const boopsEl = document.getElementById('stat-boops-count');
    if (kissesEl) kissesEl.textContent = state.counters.kisses;
    if (hugsEl) hugsEl.textContent = state.counters.hugs;
    if (boopsEl) boopsEl.textContent = state.counters.boops;
  }

  function getStartOfWeekMonday(d = new Date()) {
    const date = new Date(d);
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return getIsoDate(monday);
  }

  function renderWeeklySpicyMeter() {
    const mondayIso = getStartOfWeekMonday();
    const thisWeekLogs = (state.tummyLogs || []).filter(l => {
      return l.category === 'spicy' && (l.date || '') >= mondayIso;
    });

    let bubuCount = 0;
    let duduCount = 0;

    thisWeekLogs.forEach(log => {
      const eater = (log.eater || 'bubu').toLowerCase();
      if (eater.includes('dudu')) {
        duduCount++;
      } else {
        bubuCount++;
      }
    });

    const maxWeekly = 5;

    // 1. Render Bubu's Meter
    const bubuBadge = document.getElementById('weekly-spicy-bubu-count-badge');
    const bubuSlots = document.getElementById('weekly-spicy-bubu-slots');
    const bubuBar = document.getElementById('weekly-spicy-bubu-bar');
    const bubuStatus = document.getElementById('weekly-spicy-bubu-status');

    if (bubuBadge) {
      bubuBadge.textContent = `${bubuCount} / ${maxWeekly}`;
      if (bubuCount >= maxWeekly) {
        bubuBadge.className = 'text-[11px] font-heading font-extrabold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full';
      } else if (bubuCount >= 4) {
        bubuBadge.className = 'text-[11px] font-heading font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full';
      } else {
        bubuBadge.className = 'text-[11px] font-heading font-extrabold text-primary bg-surface-container-highest px-2 py-0.5 rounded-full';
      }
    }

    if (bubuSlots) {
      let html = '';
      for (let i = 1; i <= maxWeekly; i++) {
        if (i <= bubuCount) {
          html += `<span class="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center text-xs font-bold shadow-2xs" title="Spicy meal #${i}">🌶️</span>`;
        } else {
          html += `<span class="w-6 h-6 rounded-lg bg-surface-container-highest/60 text-outline-variant flex items-center justify-center text-xs opacity-40">⚪</span>`;
        }
      }
      bubuSlots.innerHTML = html;
    }

    if (bubuBar) {
      const pct = Math.min(100, Math.round((bubuCount / maxWeekly) * 100));
      bubuBar.style.width = `${pct}%`;
      if (bubuCount >= maxWeekly) {
        bubuBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      } else if (bubuCount >= 4) {
        bubuBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      } else {
        bubuBar.className = 'h-full bg-secondary rounded-full transition-all duration-300';
      }
    }

    if (bubuStatus) {
      const remaining = Math.max(0, maxWeekly - bubuCount);
      const isId = window.DuduI18n?.getLanguage?.() === 'id';
      if (bubuCount >= maxWeekly) {
        bubuStatus.textContent = isId ? 'Batas tercapai ⚠️' : 'Limit reached ⚠️';
        bubuStatus.className = 'text-rose-600 font-bold';
      } else {
        bubuStatus.textContent = isId ? `Sisa ${remaining} jatah minggu ini` : `${remaining} slots remaining`;
        bubuStatus.className = 'text-[10px] text-on-surface-variant';
      }
    }

    // 2. Render Dudu's Meter
    const duduBadge = document.getElementById('weekly-spicy-dudu-count-badge');
    const duduSlots = document.getElementById('weekly-spicy-dudu-slots');
    const duduBar = document.getElementById('weekly-spicy-dudu-bar');
    const duduStatus = document.getElementById('weekly-spicy-dudu-status');

    if (duduBadge) {
      duduBadge.textContent = `${duduCount} / ${maxWeekly}`;
      if (duduCount >= maxWeekly) {
        duduBadge.className = 'text-[11px] font-heading font-extrabold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full';
      } else if (duduCount >= 4) {
        duduBadge.className = 'text-[11px] font-heading font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full';
      } else {
        duduBadge.className = 'text-[11px] font-heading font-extrabold text-primary bg-surface-container-highest px-2 py-0.5 rounded-full';
      }
    }

    if (duduSlots) {
      let html = '';
      for (let i = 1; i <= maxWeekly; i++) {
        if (i <= duduCount) {
          html += `<span class="w-6 h-6 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center text-xs font-bold shadow-2xs" title="Spicy meal #${i}">🌶️</span>`;
        } else {
          html += `<span class="w-6 h-6 rounded-lg bg-surface-container-highest/60 text-outline-variant flex items-center justify-center text-xs opacity-40">⚪</span>`;
        }
      }
      duduSlots.innerHTML = html;
    }

    if (duduBar) {
      const pct = Math.min(100, Math.round((duduCount / maxWeekly) * 100));
      duduBar.style.width = `${pct}%`;
      if (duduCount >= maxWeekly) {
        duduBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      } else if (duduCount >= 4) {
        duduBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      } else {
        duduBar.className = 'h-full bg-tertiary rounded-full transition-all duration-300';
      }
    }

    if (duduStatus) {
      const remaining = Math.max(0, maxWeekly - duduCount);
      const isId = window.DuduI18n?.getLanguage?.() === 'id';
      if (duduCount >= maxWeekly) {
        duduStatus.textContent = isId ? 'Batas tercapai ⚠️' : 'Limit reached ⚠️';
        duduStatus.className = 'text-rose-600 font-bold';
      } else {
        duduStatus.textContent = isId ? `Sisa ${remaining} jatah minggu ini` : `${remaining} slots remaining`;
        duduStatus.className = 'text-[10px] text-on-surface-variant';
      }
    }
  }

  function setupWeeklySpicyAndThemeControls() {
    // Quick log buttons for weekly spicy meter
    document.getElementById('btn-quick-log-bubu-spicy')?.addEventListener('click', () => {
      document.getElementById('btn-spicy-eater-bubu')?.click();
      document.getElementById('log-spicy-trigger-btn')?.click();
    });

    document.getElementById('btn-quick-log-dudu-spicy')?.addEventListener('click', () => {
      document.getElementById('btn-spicy-eater-dudu')?.click();
      document.getElementById('log-spicy-trigger-btn')?.click();
    });

    // Dark Mode Toggle Setup
    const darkModeBtn = document.getElementById('btn-dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const savedTheme = localStorage.getItem('dudu_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      if (darkModeIcon) darkModeIcon.textContent = 'light_mode';
    }
    darkModeBtn?.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('dudu_theme', isDark ? 'dark' : 'light');
      if (darkModeIcon) darkModeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
      window.duduAudio?.playPop?.(isDark ? 360 : 480);
      showToast(isDark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
    });

    // Language Toggle Setup
    document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
      const newLang = window.DuduI18n?.toggleLanguage?.();
      window.duduAudio?.playPop?.(440);
      showToast(newLang === 'id' ? 'Bahasa Indonesia aktif 🇮🇩' : 'English enabled 🇬🇧');
      renderAll();
    });

    window.addEventListener('dudu-language-changed', () => {
      renderAll();
    });
  }

  function renderAll() {
    renderHeaderStats();
    renderHabits();
    renderTummyLogs();
    renderWeeklySpicyMeter();
    renderShopPanel();
    setDuduSticker(state.currentStickerId, state.currentDialogue);
  }

  window.DuduApp = {
    getState: () => state,
    setSticker: setDuduSticker,
    feed: handleFeed,
    boop: handleBoop,
    hug: handleHug,
    kiss: handleKiss,
    gift: handleGift,
    switchTab: switchTab,
    openCravingModal: openCravingModal,
    startCooldownTimer: startCooldownTimer,
    completeHabit: completeHabit,
    toggleDebugMode: toggleDebugMode,
    openStickerGallery: openStickerGallery
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
