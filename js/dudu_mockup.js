/**
 * Dudu & Bubu Mockup Feature Engine & Interactive Controller
 * Implements all 8 mockup screens faithfully to Huang Xiao B reference art.
 */

(function () {
  'use strict';

  // --- STORAGE KEY & DEFAULT STATE ---
  const STORAGE_KEY = 'DUDU_MOCKUP_DATA_V1';

  // Anniversary date: 4 November 2025
  const defaultAnniversaryIso = '2025-11-04';

  const defaultMockupData = {
    userRole: 'dudu', // 'dudu' (Kevin) or 'bubu' (Nana)
    anniversaryDate: defaultAnniversaryIso,
    loveBattery: 100,
    statuses: {
      dudu: 'Thinking of you! 💭',
      bubu: 'Eating snacks! 🐼'
    },
    notes: [
      {
        id: 'note_1',
        style: 'envelope',
        body: "Can't wait to see you tonight! Bring your cozy sweater... 💌",
        sender: 'Dudu 🐻',
        senderRole: 'dudu',
        time: '10:15 AM',
        date: 'Today',
        isFavorite: true,
        isRead: false
      },
      {
        id: 'note_2',
        style: 'craft',
        body: 'You are my favorite person to drink warm tea with. Have a lovely afternoon, Bubu! ☕✨',
        sender: 'Honey',
        senderRole: 'dudu',
        time: 'Yesterday',
        date: 'Yesterday',
        isFavorite: true,
        isRead: true
      },
      {
        id: 'note_3',
        style: 'card',
        body: 'Reminding you to smile today! You got this! 💪❤️',
        sender: 'Dudu 🐻',
        senderRole: 'dudu',
        time: '2 days ago',
        date: '2 days ago',
        isFavorite: false,
        isRead: true
      }
    ],
    polaroids: [
      {
        id: 'pol_1',
        title: 'Cafe date',
        date: 'Oct 10',
        image: 'assets/mockup_art/polaroid_cafe.png',
        tape: 'washi-tape-grid',
        rotate: -2
      },
      {
        id: 'pol_2',
        title: 'Picnic day',
        date: 'Sep 28',
        image: 'assets/mockup_art/polaroid_picnic.png',
        tape: 'washi-tape-grid',
        rotate: 1.5
      },
      {
        id: 'pol_3',
        title: 'Sunset gaze',
        date: 'Sep 24',
        image: 'assets/mockup_art/polaroid_sunset.png',
        tape: 'washi-tape-peach',
        rotate: -1
      },
      {
        id: 'pol_4',
        title: 'Autumn walk',
        date: 'Oct 05',
        image: 'assets/mockup_art/polaroid_autumn.png',
        tape: 'washi-tape-grid',
        rotate: 2
      }
    ],
    milestones: [
      {
        id: 'ms_1',
        title: '100th Day Anniversary 🤎',
        date: 'October 12th',
        desc: 'celebrated with sweet cake & walks 🐻🐼'
      },
      {
        id: 'ms_2',
        title: 'First Photo in the Jar',
        date: 'September 15th',
        desc: 'the rainy day we started our memory jar'
      },
      {
        id: 'ms_3',
        title: 'Cozy Autumn Picnic 🧺',
        date: 'September 28th',
        desc: 'warm blankets, honey sandwiches & soft wind'
      }
    ],
    bucketList: [
      {
        id: 'bl_1',
        title: 'Cozy coffee shop date ☕🍂',
        desc: 'Find a warm local café, order seasonal lattes, and read or sketch together. Include polaroid photos.',
        plannedDate: '26 June • 12:30 PM',
        statusBadge: 'Ready to Go',
        category: 'indoor',
        completed: true,
        image: 'assets/mockup_art/date_coffee.png'
      },
      {
        id: 'bl_2',
        title: 'Stargazing trip ✨🏕️',
        desc: 'Drive out of the city, pack a cozy blanket, and look at the night sky. Point out constellations.',
        plannedDate: 'Next weekend',
        statusBadge: 'Added today',
        category: 'outdoor',
        completed: false,
        image: 'assets/mockup_art/date_stargazing.png'
      },
      {
        id: 'bl_3',
        title: 'Bake a sweet treat together 🍰🧑‍🍳',
        desc: 'Try baking a messy chocolate cake or cookies from scratch.',
        plannedDate: 'Rainy Sunday',
        statusBadge: 'Done!',
        category: 'indoor',
        completed: true,
        image: 'assets/mockup_art/date_baking.png'
      },
      {
        id: 'bl_4',
        title: 'Autumn foliage stroll 🍁',
        desc: 'Walk through the park with warm knit scarves, crunch leaves, and take cute polaroids.',
        plannedDate: 'October 2026',
        statusBadge: 'Ready to Go',
        category: 'outdoor',
        completed: false,
        image: 'assets/mockup_art/polaroid_autumn.png'
      },
      {
        id: 'bl_5',
        title: 'Nintendo Switch cozy marathon 🎮',
        desc: 'Play Animal Crossing or Mario Kart while sharing warm hot cocoa and fluffy marshmallows.',
        plannedDate: 'Friday Night',
        statusBadge: 'Ready to Go',
        category: 'indoor',
        completed: true,
        image: 'assets/mockup_art/minigame_switch.png'
      }
    ],
    calendarEvents: [
      { id: 'cal_1', date: 10, month: 9, year: 2026, title: 'Picnic Date 🧺', icon: '🧺' },
      { id: 'cal_2', date: 24, month: 9, year: 2026, title: 'Anniversary Cake Prep 🎂', icon: '🎂' },
      { id: 'cal_3', date: 26, month: 9, year: 2026, title: 'Our 100th Day Celebration! 🤎', icon: '🐻🐼' }
    ],
    wardrobe: {
      dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
      bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
    },
    miniGameHighScore: 420
  };

  // --- STATE CONTAINER ---
  let appData = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const sessionRole = sessionStorage.getItem('DUDU_ACTIVE_ROLE');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force migration to 2025-11-04 per user requirement
        if (!parsed.anniversaryDate || parsed.anniversaryDate !== '2025-11-04') {
          parsed.anniversaryDate = '2025-11-04';
        }
        if (Array.isArray(parsed.calendarEvents)) {
          parsed.calendarEvents.forEach((ev, i) => {
            if (!ev.id) ev.id = 'cal_' + (i + 1);
          });
        }
        if (sessionRole && (sessionRole === 'dudu' || sessionRole === 'bubu')) {
          parsed.userRole = sessionRole;
        }
        return Object.assign({}, defaultMockupData, parsed);
      }
    } catch (e) {
      console.warn('Failed to parse mockup state', e);
    }
    const fresh = JSON.parse(JSON.stringify(defaultMockupData));
    try {
      const sessionRole = sessionStorage.getItem('DUDU_ACTIVE_ROLE');
      if (sessionRole && (sessionRole === 'dudu' || sessionRole === 'bubu')) {
        fresh.userRole = sessionRole;
      }
    } catch (_) {}
    return fresh;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.warn('Failed to save mockup state', e);
    }
  }

  // --- DAYS TOGETHER COUNTER ---
  function getDaysTogether() {
    const dateStr = appData.anniversaryDate || '2025-11-04';
    const [y, m, d] = dateStr.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = today - start;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  function getNextAnniversaryMilestone(anniversaryDateStr) {
    const [y, m, d] = (anniversaryDateStr || '2025-11-04').split('-').map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(y, m - 1, d);

    // 1-Year anniversary check (4 November 2026)
    const next1Year = new Date(y + 1, m - 1, d);
    const diff1Year = Math.round((next1Year - today) / (1000 * 60 * 60 * 24));
    if (diff1Year > 0 && diff1Year <= 100) {
      return {
        title: '1 Year Anniversary! 🎂🎉',
        subtitle: `Only ${diff1Year} days left! (${d} November ${y + 1}) 🐻❤️`
      };
    }

    const daysSoFar = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const nextBlock = (Math.floor(daysSoFar / 100) + 1) * 100;
    const daysLeft = nextBlock - daysSoFar;
    return {
      title: `${nextBlock} Days! 🎉`,
      subtitle: `Only ${daysLeft} days left! 🐻❤️`
    };
  }

  // --- AUDIO & HAPTIC SYNTHESIZER FOR BEDTIME LOFI ---
  class BedtimeLofiEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.currentTrackIndex = 0;
      this.volume = 0.65;
      this.chordTimer = null;
      this.noiseNode = null;
      this.tracks = [
        { title: 'Lofi Night Whispers 🌙', subtitle: 'Lo-fi Beats for Two', mood: 'Warm Electric Piano & Rain' },
        { title: 'Starlit Dreams with Bubu 🐻', subtitle: 'Lo-fi Beats for Two', mood: 'Gentle Rhodes Chords' },
        { title: 'Sweet Snooze & Soft Rain 🌧️', subtitle: 'Lo-fi Beats for Two', mood: 'Rain & Cozy Kalimba' },
        { title: 'Honey Moonbeam Lullaby 🍯', subtitle: 'Lo-fi Beats for Two', mood: 'Mellow Velvet Tones' }
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    start() {
      this.init();
      if (!this.ctx) return;
      this.isPlaying = true;
      this.startVinylCrackle();
      this.playChordProgression();
      updateLofiUI();
    }

    stop() {
      this.isPlaying = false;
      if (this.chordTimer) clearTimeout(this.chordTimer);
      if (this.noiseNode) {
        try { this.noiseNode.stop(); } catch (e) {}
        this.noiseNode = null;
      }
      updateLofiUI();
    }

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
    }

    nextTrack() {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
      updateLofiUI();
      if (this.isPlaying) {
        if (this.chordTimer) clearTimeout(this.chordTimer);
        this.playChordProgression();
      }
    }

    prevTrack() {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      updateLofiUI();
      if (this.isPlaying) {
        if (this.chordTimer) clearTimeout(this.chordTimer);
        this.playChordProgression();
      }
    }

    // Vinyl crackle simulation using brown/pink noise
    startVinylCrackle() {
      if (!this.ctx || this.noiseNode) return;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        if (Math.random() < 0.0006) data[i] += (Math.random() - 0.5) * 0.4; // subtle vinyl pop
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.035 * this.volume;

      this.noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      this.noiseNode.start();
    }

    // Generative cozy lofi 7th chords: Cmaj7, Am7, Dm7, G7sus
    playChordProgression() {
      if (!this.isPlaying || !this.ctx) return;
      const chordBanks = [
        // Progression A (Cmaj7 -> Am7 -> Dm7 -> G7)
        [ [261.63, 329.63, 392.00, 493.88], [220.00, 261.63, 329.63, 392.00], [146.83, 174.61, 220.00, 261.63], [196.00, 246.94, 293.66, 349.23] ],
        // Progression B (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
        [ [174.61, 220.00, 261.63, 329.63], [164.81, 196.00, 246.94, 293.66], [146.83, 174.61, 220.00, 261.63], [130.81, 164.81, 196.00, 246.94] ]
      ];
      const bank = chordBanks[this.currentTrackIndex % chordBanks.length];
      let step = 0;

      const playNextChord = () => {
        if (!this.isPlaying || !this.ctx) return;
        const freqs = bank[step % bank.length];
        const now = this.ctx.currentTime;
        const chordDuration = 3.6;

        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = (idx === 0) ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now);
          filter.frequency.exponentialRampToValueAtTime(450, now + chordDuration);

          const baseGain = 0.045 * this.volume;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(baseGain, now + 0.15 + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.03);
          osc.stop(now + chordDuration);
        });

        step++;
        this.chordTimer = setTimeout(playNextChord, (chordDuration - 0.4) * 1000);
      };

      playNextChord();
    }
  }

  const lofiEngine = new BedtimeLofiEngine();

  // --- MODAL SHEETS & TACTILE HELPERS ---
  function openSheet(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      window.duduAudio?.playPop?.(650);
    }
  }

  function closeSheet(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function updateSyncBadge(status) {
    const dot = document.getElementById('header-sync-dot');
    const txt = document.getElementById('header-sync-text');
    if (!dot || !txt) return;
    if (status === 'connected') {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
      txt.textContent = 'synced ♡';
    } else if (status === 'connecting' || status === 'reconnecting') {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
      txt.textContent = 'syncing...';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-stone-400';
      txt.textContent = 'offline';
    }
  }

  function sendDeleteRest(endpoint, id) {
    try {
      const base = window.DuduChatSocket?.getHttpBaseUrl?.() || 'https://chat.nexora-v1.my.id';
      fetch(`${base}${endpoint}/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (_) {}
  }

  function sendSaveRest(endpoint, body) {
    try {
      const base = window.DuduChatSocket?.getHttpBaseUrl?.() || 'https://chat.nexora-v1.my.id';
      fetch(`${base}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => {});
    } catch (_) {}
  }

  async function hydrateDataFromRemoteServer() {
    try {
      if (!window.DuduChatSocket?.fetchAllFeaturesRest) return;
      const data = await window.DuduChatSocket.fetchAllFeaturesRest();
      let rerender = false;
      if (Array.isArray(data.calendar) && data.calendar.length > 0) {
        appData.calendarEvents = data.calendar;
        rerender = true;
      }
      if (Array.isArray(data.planner) && data.planner.length > 0) {
        appData.bucketList = data.planner;
        rerender = true;
      }
      if (Array.isArray(data.notes) && data.notes.length > 0) {
        appData.notes = data.notes;
        rerender = true;
      }
      if (Array.isArray(data.polaroids) && data.polaroids.length > 0) {
        appData.polaroids = data.polaroids;
        rerender = true;
      }
      if (Array.isArray(data.milestones) && data.milestones.length > 0) {
        appData.milestones = data.milestones;
        rerender = true;
      }
      if (data.coupleSpace) {
        if (data.coupleSpace.anniversaryDate) appData.anniversaryDate = data.coupleSpace.anniversaryDate;
        if (data.coupleSpace.loveBattery !== undefined) appData.loveBattery = data.coupleSpace.loveBattery;
        if (data.coupleSpace.statuses) {
          if (data.coupleSpace.statuses.dudu) appData.statuses.dudu = data.coupleSpace.statuses.dudu;
          if (data.coupleSpace.statuses.bubu) appData.statuses.bubu = data.coupleSpace.statuses.bubu;
        }
        rerender = true;
      }
      if (rerender) {
        saveState();
        renderOurSpaceHome();
        renderLoveNotes();
        renderMemoryJar();
        renderBucketList();
        renderOurCalendar();
      }
    } catch (err) {
      console.warn('[Mockup] Remote hydration failed (offline fallback active):', err);
    }
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initTabRouting();
    initBottomNavOverflow();
    initChatInputCollapse();
    renderOurSpaceHome();
    renderLoveNotes();
    renderMemoryJar();
    renderBucketList();
    renderOurCalendar();
    renderBedtimeMusic();
    renderWardrobeRoom();
    initGlobalModals();
    startBedtimeCountdownTimer();
    setupMockupSocketListeners();
    hydrateDataFromRemoteServer();
    window.DuduChatUI?.init?.();
  });

  // --- REAL-TIME WEBSOCKET & REST SYNC ---
  function setupMockupSocketListeners() {
    if (!window.DuduChatSocket) return;

    window.DuduChatSocket.onStatusChange?.((status) => updateSyncBadge(status));
    updateSyncBadge(window.DuduChatSocket.getStatus?.() || 'disconnected');

    // 1. Calendar Sync & Events
    window.DuduChatSocket.onCalendarSync?.((events) => {
      if (Array.isArray(events)) {
        appData.calendarEvents = events;
        saveState();
        renderOurCalendar();
        renderCalendarDayModalEvents();
      }
    });

    window.DuduChatSocket.onCalendarEventSaved?.((event) => {
      if (!event || !event.id) return;
      const idx = appData.calendarEvents.findIndex(e => e.id === event.id);
      if (idx >= 0) appData.calendarEvents[idx] = event;
      else appData.calendarEvents.push(event);
      saveState();
      renderOurCalendar();
      renderCalendarDayModalEvents();
      showFeedbackToast(`New calendar event: ${event.title} 🗓️`);
      window.duduAudio?.playPop?.(750);
    });

    window.DuduChatSocket.onCalendarEventDeleted?.((id) => {
      if (!id) return;
      appData.calendarEvents = appData.calendarEvents.filter(e => e.id !== id);
      saveState();
      renderOurCalendar();
      renderCalendarDayModalEvents();
    });

    // 2. Planner / Bucket List
    window.DuduChatSocket.onPlannerSync?.((items) => {
      if (Array.isArray(items)) {
        appData.bucketList = items;
        saveState();
        renderBucketList();
      }
    });

    window.DuduChatSocket.onPlannerItemSaved?.((item) => {
      if (!item || !item.id) return;
      const idx = appData.bucketList.findIndex(i => i.id === item.id);
      if (idx >= 0) appData.bucketList[idx] = item;
      else appData.bucketList.unshift(item);
      saveState();
      renderBucketList();
      showFeedbackToast(`Partner updated date planner! 📝✨`);
      window.duduAudio?.playPop?.(600);
    });

    window.DuduChatSocket.onPlannerItemDeleted?.((id) => {
      if (!id) return;
      appData.bucketList = appData.bucketList.filter(i => i.id !== id);
      saveState();
      renderBucketList();
    });

    // 3. Love Notes
    window.DuduChatSocket.onNotesSync?.((notes) => {
      if (Array.isArray(notes)) {
        appData.notes = notes;
        saveState();
        renderLoveNotes();
      }
    });

    window.DuduChatSocket.onNoteSaved?.((note) => {
      if (!note || !note.body) return;
      const idx = appData.notes.findIndex(n => n.id === note.id);
      if (idx >= 0) appData.notes[idx] = note;
      else appData.notes.unshift(note);
      saveState();
      renderLoveNotes();
      showFeedbackToast(`New love note from ${note.sender}! 💌`);
      window.duduAudio?.playPop?.(880);
    });

    window.DuduChatSocket.onNoteDeleted?.((id) => {
      if (!id) return;
      appData.notes = appData.notes.filter(n => n.id !== id);
      saveState();
      renderLoveNotes();
    });

    // 4. Memories (Polaroids & Milestones)
    window.DuduChatSocket.onMemoriesSync?.((data) => {
      if (data && Array.isArray(data.polaroids)) {
        appData.polaroids = data.polaroids;
      }
      if (data && Array.isArray(data.milestones)) {
        appData.milestones = data.milestones;
      }
      saveState();
      renderMemoryJar();
    });

    window.DuduChatSocket.onPolaroidSaved?.((polaroid) => {
      if (!polaroid || !polaroid.id) return;
      const idx = appData.polaroids.findIndex(p => p.id === polaroid.id);
      if (idx >= 0) appData.polaroids[idx] = polaroid;
      else appData.polaroids.unshift(polaroid);
      saveState();
      renderMemoryJar();
      showFeedbackToast(`Partner added a memory to the jar! 📸🍯`);
      window.duduAudio?.playPop?.(700);
    });

    window.DuduChatSocket.onPolaroidDeleted?.((id) => {
      if (!id) return;
      appData.polaroids = appData.polaroids.filter(p => p.id !== id);
      saveState();
      renderMemoryJar();
    });

    window.DuduChatSocket.onMilestoneSaved?.((milestone) => {
      if (!milestone || !milestone.id) return;
      const idx = appData.milestones.findIndex(m => m.id === milestone.id);
      if (idx >= 0) appData.milestones[idx] = milestone;
      else appData.milestones.push(milestone);
      saveState();
      renderMemoryJar();
    });

    window.DuduChatSocket.onMilestoneDeleted?.((id) => {
      if (!id) return;
      appData.milestones = appData.milestones.filter(m => m.id !== id);
      saveState();
      renderMemoryJar();
    });

    // 5. Couple Space
    const handleCoupleSpace = (data) => {
      if (!data) return;
      let changed = false;
      if (data.anniversaryDate && data.anniversaryDate !== appData.anniversaryDate) {
        appData.anniversaryDate = data.anniversaryDate;
        changed = true;
      }
      if (data.loveBattery !== undefined && data.loveBattery !== appData.loveBattery) {
        appData.loveBattery = data.loveBattery;
        changed = true;
      }
      if (data.statuses) {
        if (data.statuses.dudu && data.statuses.dudu !== appData.statuses.dudu) {
          appData.statuses.dudu = data.statuses.dudu;
          changed = true;
        }
        if (data.statuses.bubu && data.statuses.bubu !== appData.statuses.bubu) {
          appData.statuses.bubu = data.statuses.bubu;
          changed = true;
        }
      }
      if (changed) {
        saveState();
        renderOurSpaceHome();
        renderOurCalendar();
      }
    };

    window.DuduChatSocket.onCoupleSpaceSync?.(handleCoupleSpace);
    window.DuduChatSocket.onCoupleSpaceUpdated?.(handleCoupleSpace);
  }

  // --- TAB ROUTING & BOTTOM DOCK OVERFLOW ---
  function updateBottomNavOverflow() {
    const moreBtn = document.getElementById('btn-bottom-nav-more');
    const morePopup = document.getElementById('bottom-nav-more-popup');
    const secondaryItems = document.querySelectorAll('.bottom-nav-secondary');
    if (!moreBtn) return;

    // Small phone screen threshold (< 560px)
    const isNarrow = window.innerWidth < 560;
    secondaryItems.forEach(el => {
      if (isNarrow) {
        el.classList.add('hidden');
        el.classList.remove('flex');
      } else {
        el.classList.remove('hidden');
        el.classList.add('flex');
      }
    });

    if (isNarrow) {
      moreBtn.classList.remove('hidden');
      moreBtn.classList.add('flex');
    } else {
      moreBtn.classList.add('hidden');
      moreBtn.classList.remove('flex');
      if (morePopup) {
        morePopup.classList.add('hidden');
        document.getElementById('bottom-nav-more-icon')?.classList.remove('rotate-180');
      }
    }
  }

  function initBottomNavOverflow() {
    const moreBtn = document.getElementById('btn-bottom-nav-more');
    const morePopup = document.getElementById('bottom-nav-more-popup');
    const moreIcon = document.getElementById('bottom-nav-more-icon');

    updateBottomNavOverflow();
    window.addEventListener('resize', updateBottomNavOverflow);

    moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!morePopup) return;
      const isOpen = !morePopup.classList.contains('hidden');
      if (isOpen) {
        morePopup.classList.add('hidden');
        moreIcon?.classList.remove('rotate-180');
      } else {
        morePopup.classList.remove('hidden');
        moreIcon?.classList.add('rotate-180');
        window.duduAudio?.playPop?.(480);
      }
    });

    // Close when tapping outside
    document.addEventListener('click', (e) => {
      if (morePopup && !morePopup.classList.contains('hidden')) {
        if (!morePopup.contains(e.target) && !moreBtn?.contains(e.target)) {
          morePopup.classList.add('hidden');
          moreIcon?.classList.remove('rotate-180');
        }
      }
    });
  }

  function initChatInputCollapse() {
    const chatInput = document.getElementById('chat-text-input');
    const bottomNav = document.getElementById('bottom-nav-bar');
    const morePopup = document.getElementById('bottom-nav-more-popup');
    const tabChat = document.getElementById('tab-chat');
    const messagesContainer = document.getElementById('chat-messages-container');

    chatInput?.addEventListener('focus', () => {
      bottomNav?.classList.add('nav-collapsed');
      tabChat?.classList.add('chat-input-focused');
      if (morePopup) {
        morePopup.classList.add('hidden');
        document.getElementById('bottom-nav-more-icon')?.classList.remove('rotate-180');
      }
    });

    chatInput?.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== chatInput) {
          bottomNav?.classList.remove('nav-collapsed');
          tabChat?.classList.remove('chat-input-focused');
        }
      }, 150);
    });

    // Dismiss keyboard and restore bottom nav when touching/clicking messages feed
    messagesContainer?.addEventListener('touchstart', () => {
      chatInput?.blur();
    }, { passive: true });
    messagesContainer?.addEventListener('mousedown', () => {
      chatInput?.blur();
    });
  }

  function initTabRouting() {
    const navLinks = document.querySelectorAll('.mockup-nav-item');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Hash change handler
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) switchTab(hash, false);
    });

    // Load initial hash or default to home
    const initialHash = window.location.hash.replace('#', '') || 'home';
    switchTab(initialHash, false);
  }

  function switchTab(tabName, updateHash = true) {
    if (tabName === 'memory') tabName = 'memories';
    const tabs = ['home', 'notes', 'chat', 'memories', 'calendar', 'bucket', 'music', 'wardrobe'];
    if (!tabs.includes(tabName)) tabName = 'home';

    tabs.forEach(t => {
      const el = document.getElementById(`tab-${t}`);
      if (el) {
        if (t === tabName) {
          el.classList.remove('hidden');
          el.classList.add('flex');
        } else {
          el.classList.add('hidden');
          el.classList.remove('flex');
        }
      }
    });

    // Close more popup on tab switch
    const morePopup = document.getElementById('bottom-nav-more-popup');
    if (morePopup) {
      morePopup.classList.add('hidden');
      document.getElementById('bottom-nav-more-icon')?.classList.remove('rotate-180');
    }

    // Update bottom dock active styles
    document.querySelectorAll('.mockup-nav-item').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      if (target === tabName) {
        btn.classList.add('dock-item-active', 'text-white');
        btn.classList.remove('opacity-75');
      } else {
        btn.classList.remove('dock-item-active', 'text-white');
        btn.classList.add('opacity-75');
      }
    });

    // Highlight More button if active tab is one of the secondary tabs
    const isSecondaryTab = ['calendar', 'bucket', 'music', 'wardrobe'].includes(tabName);
    const moreBtn = document.getElementById('btn-bottom-nav-more');
    const moreDot = document.getElementById('bottom-nav-more-dot');
    if (moreBtn) {
      if (isSecondaryTab) {
        moreBtn.classList.add('dock-item-active', 'text-white');
        moreBtn.classList.remove('opacity-75');
        moreDot?.classList.remove('hidden');
      } else {
        moreBtn.classList.remove('dock-item-active', 'text-white');
        moreBtn.classList.add('opacity-75');
        moreDot?.classList.add('hidden');
      }
    }

    // Special handling for chat tab
    document.body.classList.toggle('chat-tab-active', tabName === 'chat');
    if (tabName === 'chat') {
      window.scrollToChatBottom?.();
    } else {
      // Ensure bottom dock is visible if navigating away while typing
      document.getElementById('bottom-nav-bar')?.classList.remove('nav-collapsed');
      document.getElementById('tab-chat')?.classList.remove('chat-input-focused');
    }

    if (updateHash && window.location.hash !== `#${tabName}`) {
      window.location.hash = `#${tabName}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 1. OUR SPACE (HOME SCREEN - timeline.jpg) ---
  function renderOurSpaceHome() {
    // Days together pill
    const days = getDaysTogether();
    const daysEl = document.getElementById('home-days-count');
    if (daysEl) daysEl.textContent = `${days} days ♡`;

    const subEl = document.getElementById('home-anniversary-sub');
    if (subEl) {
      const [y, m, d] = (appData.anniversaryDate || '2025-11-04').split('-').map(Number);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      subEl.textContent = `Since ${d} ${months[m - 1]} ${y}`;
    }

    // Love Battery
    updateLoveBatteryUI();

    // Statuses
    const duduStatusEl = document.getElementById('home-status-dudu');
    const bubuStatusEl = document.getElementById('home-status-bubu');
    if (duduStatusEl) duduStatusEl.textContent = appData.statuses.dudu;
    if (bubuStatusEl) bubuStatusEl.textContent = appData.statuses.bubu;

    // Love Battery Boost Button
    const batteryBtn = document.getElementById('btn-boost-battery');
    if (batteryBtn) {
      batteryBtn.onclick = () => {
        appData.loveBattery = Math.min(100, appData.loveBattery + 10);
        saveState();
        updateLoveBatteryUI();
        window.DuduChatSocket?.sendUpdateCoupleSpace?.({ loveBattery: appData.loveBattery });
        triggerHeartBurst();
        showFeedbackToast('Love battery charged! 💖 +10%');
        window.duduAudio?.playPop?.(650);
      };
    }

    // Status Click Handlers
    const statusCard = document.getElementById('home-status-card');
    if (statusCard) {
      statusCard.onclick = () => openStatusEditModal();
    }

    // Anniversary Pill Click (Edit Anniversary Date)
    const daysPill = document.getElementById('home-anniversary-pill');
    if (daysPill) {
      daysPill.onclick = () => openAnniversaryModal();
    }
  }

  function updateLoveBatteryUI() {
    const val = appData.loveBattery;
    const txt = document.getElementById('home-battery-text');
    const fill = document.getElementById('home-battery-fill');
    if (txt) txt.textContent = `${val}%`;
    if (fill) fill.style.width = `${val}%`;
  }

  function triggerHeartBurst() {
    const container = document.getElementById('heart-burst-container');
    if (!container) return;
    for (let i = 0; i < 7; i++) {
      const heart = document.createElement('span');
      heart.textContent = ['❤️', '💖', '💕', '🥰', '✨'][Math.floor(Math.random() * 5)];
      heart.className = 'absolute pointer-events-none text-xl transition-all duration-700 ease-out';
      heart.style.left = `${45 + (Math.random() * 20 - 10)}%`;
      heart.style.top = '50%';
      heart.style.transform = 'translate(-50%, -50%) scale(0.6)';
      container.appendChild(heart);

      setTimeout(() => {
        heart.style.transform = `translate(${Math.random() * 80 - 40}px, -${60 + Math.random() * 60}px) scale(1.3)`;
        heart.style.opacity = '0';
      }, 20);

      setTimeout(() => heart.remove(), 750);
    }
  }

  // --- 2. LOVE NOTES (love notes.jpg) ---
  let activeNotesFilter = 'all';

  function renderLoveNotes() {
    const listEl = document.getElementById('notes-cards-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const filtered = appData.notes.filter(note => {
      if (activeNotesFilter === 'unread') return !note.isRead;
      if (activeNotesFilter === 'favorites') return note.isFavorite;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-on-surface-variant text-xs">
          <span class="text-3xl block mb-2">💌</span>
          No love notes found in this folder. Write one to Bubu!
        </div>
      `;
      return;
    }

    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = 'button-press cursor-pointer relative';

      if (note.style === 'envelope') {
        // Sealed envelope card matching mockup 1
        card.innerHTML = `
          <div class="bg-[#FAF4ED] dark:bg-stone-800 rounded-3xl p-4 plush-shadow border border-[#E8DACB] relative flex flex-col gap-2.5">
            <div class="flex items-start gap-3">
              <div class="w-16 h-14 bg-[#F2E5D5] rounded-xl flex items-center justify-center border border-[#DFCBB7] relative shadow-inner shrink-0">
                <span class="wax-seal w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-md">♥</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-handwriting text-lg text-primary dark:text-stone-100 leading-snug">
                  "${escapeHtml(note.body)}"
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-[#DFCBB7]/40 text-[11px] text-on-surface-variant">
              <span class="font-bold text-[#8D5B4C] flex items-center gap-1">
                Written by ${escapeHtml(note.sender)}
              </span>
              <div class="flex items-center gap-2">
                <span>${escapeHtml(note.time)}</span>
                <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (note.style === 'craft') {
        // Warm craft paper card matching mockup 2
        card.innerHTML = `
          <div class="bg-[#EBD2B4] text-[#4A3222] rounded-3xl p-4.5 plush-shadow border border-[#D8BC9B] relative flex flex-col gap-2.5">
            <p class="font-handwriting text-lg leading-snug font-medium">
              "${escapeHtml(note.body)}"
            </p>
            <div class="flex items-center justify-between text-[11px] font-bold opacity-85">
              <span>From ${escapeHtml(note.sender)}</span>
              <div class="flex items-center gap-2">
                <span>${escapeHtml(note.time)}</span>
                <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-[#4A3222]/50 hover:text-rose-700 hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        // Open envelope card matching mockup 3
        card.innerHTML = `
          <div class="bg-[#FAF4ED] dark:bg-stone-800 rounded-3xl p-4 plush-shadow border border-[#E8DACB] relative flex flex-col gap-2">
            <div class="bg-[#FFFDF9] dark:bg-stone-700/60 rounded-2xl p-3 border border-[#E5D7C7] shadow-sm">
              <p class="font-handwriting text-lg text-primary dark:text-stone-100 text-center leading-snug">
                "${escapeHtml(note.body)}"
              </p>
            </div>
            <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-bold px-1">
              <span>From ${escapeHtml(note.sender)}</span>
              <div class="flex items-center gap-2">
                <span>${escapeHtml(note.time)}</span>
                <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      card.querySelector('.btn-delete-note')?.addEventListener('click', (e) => {
        e.stopPropagation();
        appData.notes = appData.notes.filter(n => n.id !== note.id);
        saveState();
        renderLoveNotes();
        window.DuduChatSocket?.sendDeleteNote?.(note.id);
        sendDeleteRest('/api/notes', note.id);
        showFeedbackToast('Love note deleted 🗑️');
        window.duduAudio?.playPop?.(400);
      });

      card.onclick = () => {
        note.isRead = true;
        saveState();
        window.DuduChatSocket?.sendSaveNote?.(note);
        showNoteDetailsModal(note);
      };

      listEl.appendChild(card);
    });

    // Notes filter tabs
    document.querySelectorAll('.notes-filter-chip').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.notes-filter-chip').forEach(b => {
          b.classList.remove('bg-[#8D5B4C]', 'text-white');
          b.classList.add('bg-surface-container', 'text-primary');
        });
        btn.classList.add('bg-[#8D5B4C]', 'text-white');
        btn.classList.remove('bg-surface-container', 'text-primary');
        activeNotesFilter = btn.getAttribute('data-filter') || 'all';
        renderLoveNotes();
      };
    });
  }

  // --- 3. MEMORY JAR (Memory .jpg) ---
  function renderMemoryJar() {
    const polaroidGrid = document.getElementById('polaroids-grid');
    if (!polaroidGrid) return;
    polaroidGrid.innerHTML = '';

    appData.polaroids.forEach(p => {
      const card = document.createElement('div');
      card.className = `polaroid-card rounded-2xl p-2.5 flex flex-col gap-1.5 cursor-pointer relative`;
      card.style.transform = `rotate(${p.rotate || 0}deg)`;

      card.innerHTML = `
        <div class="washi-tape ${p.tape || 'washi-tape-grid'} -top-2.5 left-1/2 -translate-x-1/2"></div>
        <button type="button" class="btn-delete-polaroid absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-400 hover:text-rose-500 flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-xs button-press" data-id="${p.id}" title="Delete photo">
          <span class="material-symbols-outlined text-[14px]">delete</span>
        </button>
        <div class="aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover">
        </div>
        <div class="text-center pt-1">
          <span class="font-handwriting text-base text-primary font-bold tracking-wide">
            ${escapeHtml(p.title)} • ${escapeHtml(p.date)}
          </span>
        </div>
      `;

      card.querySelector('.btn-delete-polaroid')?.addEventListener('click', (e) => {
        e.stopPropagation();
        appData.polaroids = appData.polaroids.filter(item => item.id !== p.id);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendDeletePolaroid?.(p.id);
        sendDeleteRest('/api/memories/polaroids', p.id);
        showFeedbackToast('Photo removed from jar 🗑️');
        window.duduAudio?.playPop?.(400);
      });

      card.onclick = () => showPolaroidPreviewModal(p);
      polaroidGrid.appendChild(card);
    });

    // Memory Timeline milestones
    const timelineList = document.getElementById('memory-timeline-nodes');
    if (!timelineList) return;
    timelineList.innerHTML = '';

    appData.milestones.forEach((m, idx) => {
      const node = document.createElement('div');
      node.className = 'flex gap-3 relative pb-4 last:pb-0';
      node.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-[#8D5B4C] bg-[#FAF5EE] z-10"></div>
          ${idx < appData.milestones.length - 1 ? '<div class="w-0.5 flex-1 border-l-2 border-dashed border-[#8D5B4C]/50 mt-1"></div>' : ''}
        </div>
        <div class="flex-1 -mt-0.5 flex items-start justify-between gap-2">
          <div>
            <h4 class="font-heading font-bold text-xs text-primary">${escapeHtml(m.title)}</h4>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              <span class="font-semibold">${escapeHtml(m.date)}</span> — ${escapeHtml(m.desc)}
            </p>
          </div>
          <button type="button" class="btn-delete-milestone text-stone-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer button-press transition-colors" data-id="${m.id}" title="Delete milestone">
            <span class="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      `;

      node.querySelector('.btn-delete-milestone')?.addEventListener('click', (e) => {
        e.stopPropagation();
        appData.milestones = appData.milestones.filter(item => item.id !== m.id);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendDeleteMilestone?.(m.id);
        sendDeleteRest('/api/memories/milestones', m.id);
        showFeedbackToast('Milestone removed 🗑️');
        window.duduAudio?.playPop?.(400);
      });

      timelineList.appendChild(node);
    });
  }

  // --- 4. BUCKET LIST & DATE PLANNER (bucket list.jpg) ---
  let activeBucketFilter = 'all';

  function renderBucketList() {
    const listEl = document.getElementById('bucket-cards-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const completedCount = appData.bucketList.filter(b => b.completed).length;
    const totalCount = appData.bucketList.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Progress bar update
    const percentEl = document.getElementById('bucket-progress-percent');
    const barFillEl = document.getElementById('bucket-progress-fill');
    const countEl = document.getElementById('bucket-progress-count');
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (barFillEl) barFillEl.style.width = `${percent}%`;
    if (countEl) countEl.textContent = `${completedCount} of ${totalCount} Completed`;

    const filtered = appData.bucketList.filter(item => {
      if (activeBucketFilter === 'indoor') return item.category === 'indoor';
      if (activeBucketFilter === 'outdoor') return item.category === 'outdoor';
      return true;
    });

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-surface-container-lowest dark:bg-stone-800 rounded-3xl p-3.5 plush-shadow border border-outline-variant/30 flex items-center justify-between gap-3 button-press';

      card.innerHTML = `
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <button type="button" class="btn-toggle-bucket mt-0.5 w-6 h-6 rounded-lg border-2 ${item.completed ? 'bg-[#5C3D2E] border-[#5C3D2E] text-white' : 'border-[#8D5B4C] bg-transparent'} flex items-center justify-center shrink-0 cursor-pointer transition-colors" data-id="${item.id}">
            ${item.completed ? '<span class="text-xs font-bold">✓</span>' : ''}
          </button>
          <div class="flex flex-col min-w-0">
            <h4 class="font-heading font-bold text-xs text-primary dark:text-stone-100 leading-tight ${item.completed ? 'line-through opacity-70' : ''}">${escapeHtml(item.title)}</h4>
            <p class="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2 mt-0.5">${escapeHtml(item.desc)}</p>
            <span class="text-[10px] text-[#8D5B4C] font-semibold mt-1">Planned: ${escapeHtml(item.plannedDate)}</span>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <div class="flex items-center gap-1.5">
            ${item.image ? `<img src="${item.image}" alt="date" class="w-12 h-10 rounded-xl object-cover border border-[#E8DACB]">` : ''}
            <button type="button" class="btn-delete-bucket w-7 h-7 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${item.id}" title="Delete date idea">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FBE4D5] text-[#8D5B4C]'}">
            ${item.completed ? 'Done!' : escapeHtml(item.statusBadge || 'Ready')}
          </span>
        </div>
      `;

      card.querySelector('.btn-toggle-bucket').onclick = (e) => {
        e.stopPropagation();
        item.completed = !item.completed;
        saveState();
        renderBucketList();
        window.DuduChatSocket?.sendSavePlannerItem?.(item);
        sendSaveRest('/api/planner', item);
        window.duduAudio?.playPop?.(item.completed ? 800 : 400);
        showFeedbackToast(item.completed ? 'Date completed! 🥰' : 'Marked active');
      };

      card.querySelector('.btn-delete-bucket')?.addEventListener('click', (e) => {
        e.stopPropagation();
        appData.bucketList = appData.bucketList.filter(b => b.id !== item.id);
        saveState();
        renderBucketList();
        window.DuduChatSocket?.sendDeletePlannerItem?.(item.id);
        sendDeleteRest('/api/planner', item.id);
        showFeedbackToast('Date removed from wishlist 🗑️');
        window.duduAudio?.playPop?.(400);
      });

      listEl.appendChild(card);
    });

    // Bucket filter chips
    document.querySelectorAll('.bucket-filter-chip').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.bucket-filter-chip').forEach(b => {
          b.classList.remove('bg-[#5C3D2E]', 'text-white');
          b.classList.add('bg-surface-container', 'text-primary');
        });
        btn.classList.add('bg-[#5C3D2E]', 'text-white');
        btn.classList.remove('bg-surface-container', 'text-primary');
        activeBucketFilter = btn.getAttribute('data-filter') || 'all';
        renderBucketList();
      };
    });
  }

  // --- 5. OUR CALENDAR (calender.jpg) ---
  let calMonth = 9; // October (0-indexed: 9)
  let calYear = 2026;

  function renderOurCalendar() {
    const monthTitle = document.getElementById('calendar-month-title');
    const gridEl = document.getElementById('calendar-days-grid');
    if (!monthTitle || !gridEl) return;

    // Update milestone countdown card dynamically
    const countdownTitleEl = document.getElementById('calendar-anniversary-title');
    const countdownSubEl = document.getElementById('calendar-anniversary-subtitle');
    if (countdownTitleEl || countdownSubEl) {
      const milestone = getNextAnniversaryMilestone(appData.anniversaryDate);
      if (countdownTitleEl) countdownTitleEl.textContent = milestone.title;
      if (countdownSubEl) countdownSubEl.textContent = milestone.subtitle;
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthTitle.textContent = `${monthNames[calMonth]} ${calYear}`;

    gridEl.innerHTML = '';
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'h-10 border border-[#EFE5DB]/40 rounded-lg opacity-20';
      gridEl.appendChild(blank);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'h-11 border border-[#EFE5DB] dark:border-stone-700/40 rounded-xl p-1 flex flex-col justify-between relative cursor-pointer button-press transition-colors';

      // Check for special events or stickers matching mockup
      let stickerIcon = '';
      let highlightClass = '';

      if (calMonth === 9 && calYear === 2026) {
        if ([1, 15, 22].includes(day)) stickerIcon = '<span class="text-[9px]">🐾</span>';
        if ([2, 23].includes(day)) stickerIcon = '<span class="text-[9px]">🤎</span>';
        if (day === 10) {
          stickerIcon = '<span class="text-[10px] block -mt-1">🧺</span>';
          highlightClass = 'bg-[#FFF3E8] border-[#E8DACB]';
        }
        if (day === 26) {
          stickerIcon = '<span class="text-[10px] block -mt-1">🐻🐼</span>';
          highlightClass = 'bg-[#FCDFD0] border-[#E5A88B] text-[#5C3D2E] font-bold';
        }
      }

      if (highlightClass) cell.className += ` ${highlightClass}`;

      cell.innerHTML = `
        <span class="text-[11px] font-heading font-semibold text-primary leading-none">${day}</span>
        <div class="flex items-center justify-end">${stickerIcon}</div>
      `;

      cell.onclick = () => showCalendarDayEvents(day, calMonth, calYear);
      gridEl.appendChild(cell);
    }

    // Month Navigation
    const prevBtn = document.getElementById('btn-cal-prev');
    const nextBtn = document.getElementById('btn-cal-next');
    if (prevBtn) {
      prevBtn.onclick = () => {
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderOurCalendar();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderOurCalendar();
      };
    }
  }

  let activeCalSelection = null;

  function showCalendarDayEvents(day, month, year) {
    activeCalSelection = { day, month, year };
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${fullMonthNames[month]} ${day}, ${year}`;

    const titleEl = document.getElementById('modal-cal-date-title');
    if (titleEl) titleEl.textContent = dateStr;

    renderCalendarDayModalEvents();

    const inputEl = document.getElementById('input-cal-event-title');
    if (inputEl) inputEl.value = '';

    openSheet('modal-calendar-day');
  }

  function renderCalendarDayModalEvents() {
    if (!activeCalSelection) return;
    const { day, month, year } = activeCalSelection;
    const listEl = document.getElementById('modal-cal-events-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const events = appData.calendarEvents.filter(e => e.date === day && e.month === month && e.year === year);
    if (events.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-3 text-xs text-stone-400 font-semibold italic">
          No cozy plans yet on this day. Add something sweet below! ✨
        </div>
      `;
      return;
    }

    events.forEach(e => {
      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-700/80 border border-[#E8DACB] gap-2 button-press shadow-2xs';
      itemEl.innerHTML = `
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-base">${escapeHtml(e.icon || '❤️')}</span>
          <span class="text-xs font-bold text-primary dark:text-stone-100 truncate">${escapeHtml(e.title)}</span>
        </div>
        <button type="button" class="btn-del-cal-event p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer button-press transition-colors" data-id="${e.id}" title="Delete event">
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      `;

      itemEl.querySelector('.btn-del-cal-event').onclick = (ev) => {
        ev.stopPropagation();
        appData.calendarEvents = appData.calendarEvents.filter(item => item.id !== e.id);
        saveState();
        renderOurCalendar();
        renderCalendarDayModalEvents();
        window.DuduChatSocket?.sendDeleteCalendarEvent?.(e.id);
        sendDeleteRest('/api/calendar', e.id);
        showFeedbackToast('Event deleted! 🗑️');
        window.duduAudio?.playPop?.(400);
      };

      listEl.appendChild(itemEl);
    });
  }

  // --- 6. BEDTIME & MUSIC (music & bed time.jpg) ---
  function renderBedtimeMusic() {
    updateLofiUI();

    const playBtn = document.getElementById('btn-lofi-play');
    const prevBtn = document.getElementById('btn-lofi-prev');
    const nextBtn = document.getElementById('btn-lofi-next');
    const offlineBtn = document.getElementById('btn-together-offline');

    if (playBtn) playBtn.onclick = () => lofiEngine.toggle();
    if (prevBtn) prevBtn.onclick = () => lofiEngine.prevTrack();
    if (nextBtn) nextBtn.onclick = () => lofiEngine.nextTrack();

    if (offlineBtn) {
      offlineBtn.onclick = () => {
        const overlay = document.getElementById('offline-sleep-overlay');
        if (overlay) {
          overlay.classList.remove('hidden');
          window.duduAudio?.playPop?.(400);
        }
      };
    }

    const closeSleepBtn = document.getElementById('btn-close-sleep-overlay');
    if (closeSleepBtn) {
      closeSleepBtn.onclick = () => {
        const overlay = document.getElementById('offline-sleep-overlay');
        if (overlay) overlay.classList.add('hidden');
      };
    }
  }

  function updateLofiUI() {
    const cur = lofiEngine.tracks[lofiEngine.currentTrackIndex];
    const titleEl = document.getElementById('lofi-track-title');
    const subEl = document.getElementById('lofi-track-sub');
    const discEl = document.getElementById('lofi-vinyl-disc');
    const iconEl = document.getElementById('lofi-play-icon');

    if (titleEl) titleEl.textContent = cur.title;
    if (subEl) subEl.textContent = cur.subtitle;

    if (discEl) {
      if (lofiEngine.isPlaying) discEl.classList.add('vinyl-spinning');
      else discEl.classList.remove('vinyl-spinning');
    }

    if (iconEl) {
      iconEl.textContent = lofiEngine.isPlaying ? 'pause' : 'play_arrow';
    }
  }

  function startBedtimeCountdownTimer() {
    function tick() {
      const now = new Date();
      // Target 11:15 PM tonight
      const target = new Date();
      target.setHours(23, 15, 0, 0);
      let diff = target - now;
      if (diff < 0) diff += 24 * 60 * 60 * 1000;

      const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

      const cdEl = document.getElementById('bedtime-countdown-display');
      if (cdEl) cdEl.textContent = `Bedtime in ${hrs}:${mins}:${secs}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  // --- 7. COUPLE CLOSET & MINI GAME (wardrobe.jpg) ---
  let activeWardrobeChar = 'dudu'; // 'dudu' or 'bubu'

  function renderWardrobeRoom() {
    const duduBadge = document.getElementById('wardrobe-badge-dudu');
    const bubuBadge = document.getElementById('wardrobe-badge-bubu');

    if (duduBadge) {
      duduBadge.onclick = () => {
        activeWardrobeChar = 'dudu';
        updateWardrobeTabs();
      };
    }
    if (bubuBadge) {
      bubuBadge.onclick = () => {
        activeWardrobeChar = 'bubu';
        updateWardrobeTabs();
      };
    }

    // Wardrobe clothing options
    document.querySelectorAll('.wardrobe-item-card').forEach(card => {
      card.onclick = () => {
        const itemType = card.getAttribute('data-type');
        const itemVal = card.getAttribute('data-val');
        if (itemType && itemVal) {
          appData.wardrobe[activeWardrobeChar][itemType] = itemVal;
          saveState();
          window.duduAudio?.playPop?.(750);
          showFeedbackToast(`${activeWardrobeChar === 'dudu' ? 'Dudu' : 'Bubu'} changed outfit! ✨`);
        }
      };
    });

    // Play Mini Game Button
    const playMiniGameBtn = document.getElementById('btn-play-minigame');
    if (playMiniGameBtn) {
      playMiniGameBtn.onclick = () => startOutfitMatcherGame();
    }
  }

  function updateWardrobeTabs() {
    const isDudu = activeWardrobeChar === 'dudu';
    document.querySelectorAll('.wardrobe-char-dudu').forEach(el => el.classList.toggle('hidden', !isDudu));
    document.querySelectorAll('.wardrobe-char-bubu').forEach(el => el.classList.toggle('hidden', isDudu));
  }

  // --- MINI GAME: OUTFIT MATCHER (Mix & Match Pair Game) ---
  let gameTimer = null;
  let gameScore = 0;
  let gameFlippedCards = [];
  let gameMatchedPairs = 0;

  function startOutfitMatcherGame() {
    const modal = document.getElementById('modal-minigame');
    if (!modal) return;
    modal.classList.remove('hidden');

    const board = document.getElementById('minigame-board');
    const scoreEl = document.getElementById('minigame-score');
    const timeEl = document.getElementById('minigame-time');
    if (!board) return;

    gameScore = 0;
    gameMatchedPairs = 0;
    gameFlippedCards = [];
    if (scoreEl) scoreEl.textContent = '0';

    const cardItems = [
      { id: 1, icon: '🧣', label: 'Cozy Scarf' },
      { id: 2, icon: '☕', label: 'Warm Latte' },
      { id: 3, icon: '🍯', label: 'Honey Jar' },
      { id: 4, icon: '🎮', label: 'Switch' },
      { id: 5, icon: '🍓', label: 'Sweet Berry' },
      { id: 6, icon: '🎂', label: 'Baking Cake' }
    ];

    // Create 12 deck cards (6 pairs)
    const deck = [...cardItems, ...cardItems].sort(() => Math.random() - 0.5);
    board.innerHTML = '';

    deck.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'flip-card aspect-square cursor-pointer';
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front bg-[#8D5B4C] rounded-2xl flex items-center justify-center text-white font-bold text-xl plush-shadow border border-[#A66F5E]">
            🐾
          </div>
          <div class="flip-card-back bg-[#FAF4ED] rounded-2xl flex flex-col items-center justify-center p-2 plush-shadow border border-[#E8DACB]">
            <span class="text-2xl">${item.icon}</span>
            <span class="text-[9px] font-bold text-[#8D5B4C] mt-1 truncate">${item.label}</span>
          </div>
        </div>
      `;

      card.onclick = () => {
        if (card.classList.contains('flipped') || gameFlippedCards.length >= 2) return;
        card.classList.add('flipped');
        gameFlippedCards.push({ card, item });
        window.duduAudio?.playPop?.(550);

        if (gameFlippedCards.length === 2) {
          const [first, second] = gameFlippedCards;
          if (first.item.id === second.item.id) {
            // Match!
            gameMatchedPairs++;
            gameScore += 100;
            if (scoreEl) scoreEl.textContent = String(gameScore);
            gameFlippedCards = [];
            window.duduAudio?.playPop?.(900);

            if (gameMatchedPairs === cardItems.length) {
              clearInterval(gameTimer);
              setTimeout(() => {
                showFeedbackToast(`🎉 Congratulations! Score: ${gameScore} 🐻❤️`);
                modal.classList.add('hidden');
              }, 400);
            }
          } else {
            // No match
            setTimeout(() => {
              first.card.classList.remove('flipped');
              second.card.classList.remove('flipped');
              gameFlippedCards = [];
            }, 750);
          }
        }
      };

      board.appendChild(card);
    });

    // 45s countdown
    let timeLeft = 45;
    if (timeEl) timeEl.textContent = `${timeLeft}s`;
    if (gameTimer) clearInterval(gameTimer);

    gameTimer = setInterval(() => {
      timeLeft--;
      if (timeEl) timeEl.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(gameTimer);
        showFeedbackToast(`Time's up! Great effort, score: ${gameScore} ✨`);
        modal.classList.add('hidden');
      }
    }, 1000);

    const closeBtn = document.getElementById('btn-close-minigame');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (gameTimer) clearInterval(gameTimer);
        modal.classList.add('hidden');
      };
    }
  }

  // --- GLOBAL MODALS & HELPERS ---
  // --- GLOBAL MODALS & HELPERS ---
  let activeViewingNote = null;
  let activeViewingPolaroid = null;

  function initGlobalModals() {
    // 1. Write Love Note Modal
    const btnWriteNote = document.getElementById('btn-write-love-note');
    if (btnWriteNote) {
      btnWriteNote.onclick = () => {
        const bodyInput = document.getElementById('input-love-note-body');
        if (bodyInput) bodyInput.value = '';
        openSheet('modal-write-love-note');
      };
    }
    const closeWriteNote = document.getElementById('btn-close-write-note');
    if (closeWriteNote) closeWriteNote.onclick = () => closeSheet('modal-write-love-note');

    const sendNoteBtn = document.getElementById('btn-submit-love-note');
    if (sendNoteBtn) {
      sendNoteBtn.onclick = () => {
        const body = document.getElementById('input-love-note-body')?.value?.trim();
        if (!body) {
          showFeedbackToast('Please write a note! 💌');
          return;
        }

        const styleEl = document.querySelector('input[name="note-style"]:checked');
        const style = styleEl ? styleEl.value : 'envelope';

        const newNote = {
          id: 'note_' + Date.now(),
          style: style,
          body: body,
          sender: appData.userRole === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼',
          senderRole: appData.userRole,
          time: 'Just now',
          date: 'Today',
          isFavorite: true,
          isRead: false
        };

        appData.notes.unshift(newNote);
        saveState();
        renderLoveNotes();
        window.DuduChatSocket?.sendSaveNote?.(newNote);
        sendSaveRest('/api/notes', newNote);
        closeSheet('modal-write-love-note');
        document.getElementById('input-love-note-body').value = '';
        showFeedbackToast('Love note sent to Honey! 💌');
        window.duduAudio?.playPop?.(850);
      };
    }

    // 2. Add Polaroid Modal
    const btnAddPol = document.getElementById('btn-add-polaroid');
    if (btnAddPol) {
      btnAddPol.onclick = () => {
        const titleInput = document.getElementById('input-polaroid-title');
        const dateInput = document.getElementById('input-polaroid-date');
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = '';
        openSheet('modal-add-polaroid');
      };
    }
    const closeAddPol = document.getElementById('btn-close-add-polaroid');
    if (closeAddPol) closeAddPol.onclick = () => closeSheet('modal-add-polaroid');

    const submitPolBtn = document.getElementById('btn-submit-polaroid');
    if (submitPolBtn) {
      submitPolBtn.onclick = () => {
        const title = document.getElementById('input-polaroid-title')?.value?.trim() || 'Cozy Date';
        const date = document.getElementById('input-polaroid-date')?.value?.trim() || 'Today';

        const newPol = {
          id: 'pol_' + Date.now(),
          title: title,
          date: date,
          image: 'assets/mockup_art/polaroid_picnic.png',
          tape: 'washi-tape-peach',
          rotate: (Math.random() * 4 - 2)
        };

        appData.polaroids.unshift(newPol);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendSavePolaroid?.(newPol);
        sendSaveRest('/api/memories/polaroids', newPol);
        closeSheet('modal-add-polaroid');
        showFeedbackToast('Polaroid added to jar! 📸');
        window.duduAudio?.playPop?.(750);
      };
    }

    // 3. Add Date Idea (Planner / Bucket List) Modal
    const btnAddDate = document.getElementById('btn-add-date-idea');
    if (btnAddDate) {
      btnAddDate.onclick = () => {
        const titleInput = document.getElementById('input-planner-title');
        const descInput = document.getElementById('input-planner-desc');
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        openSheet('modal-add-planner');
      };
    }
    const closePlanner = document.getElementById('btn-close-planner-modal');
    if (closePlanner) closePlanner.onclick = () => closeSheet('modal-add-planner');

    const submitPlanner = document.getElementById('btn-submit-planner-item');
    if (submitPlanner) {
      submitPlanner.onclick = () => {
        const titleInput = document.getElementById('input-planner-title');
        const descInput = document.getElementById('input-planner-desc');
        const title = titleInput?.value?.trim();
        if (!title) {
          showFeedbackToast('Please enter a date idea! ✨');
          return;
        }
        const desc = descInput?.value?.trim() || 'A cozy couple adventure together';
        const catEl = document.querySelector('input[name="planner-category"]:checked');
        const category = catEl ? catEl.value : 'outdoor';

        const newPlan = {
          id: 'bl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          title: title,
          desc: desc,
          plannedDate: 'Soon',
          statusBadge: 'Ready to Go',
          category: category,
          completed: false,
          image: category === 'indoor' ? 'assets/mockup_art/date_coffee.png' : 'assets/mockup_art/date_stargazing.png'
        };

        appData.bucketList.unshift(newPlan);
        saveState();
        renderBucketList();
        window.DuduChatSocket?.sendSavePlannerItem?.(newPlan);
        sendSaveRest('/api/planner', newPlan);
        closeSheet('modal-add-planner');
        showFeedbackToast('Date idea added to planner! 📝✨');
        window.duduAudio?.playPop?.(800);
      };
    }

    // 4. Calendar Day Modal (Close & Add)
    const closeCal = document.getElementById('btn-close-cal-modal');
    if (closeCal) closeCal.onclick = () => closeSheet('modal-calendar-day');

    const submitCal = document.getElementById('btn-submit-cal-event');
    if (submitCal) {
      submitCal.onclick = () => {
        if (!activeCalSelection) return;
        const input = document.getElementById('input-cal-event-title');
        const title = input?.value?.trim();
        if (!title) {
          showFeedbackToast('Please enter an event title! 🗓️');
          return;
        }

        const iconEl = document.querySelector('input[name="cal-icon"]:checked');
        const icon = iconEl ? iconEl.value : '❤️';

        const newEvent = {
          id: 'cal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          date: activeCalSelection.day,
          month: activeCalSelection.month,
          year: activeCalSelection.year,
          title: title,
          icon: icon
        };

        appData.calendarEvents.push(newEvent);
        saveState();
        renderOurCalendar();
        renderCalendarDayModalEvents();
        window.DuduChatSocket?.sendSaveCalendarEvent?.(newEvent);
        sendSaveRest('/api/calendar', newEvent);
        if (input) input.value = '';
        showFeedbackToast('Event added to calendar! 🗓️✨');
        window.duduAudio?.playPop?.(750);
      };
    }

    // 5. View Love Note Modal
    const closeViewNote = document.getElementById('btn-close-view-note');
    if (closeViewNote) closeViewNote.onclick = () => closeSheet('modal-view-love-note');

    const dismissViewNote = document.getElementById('btn-dismiss-view-note');
    if (dismissViewNote) dismissViewNote.onclick = () => closeSheet('modal-view-love-note');

    const delViewNote = document.getElementById('btn-delete-view-note');
    if (delViewNote) {
      delViewNote.onclick = () => {
        if (!activeViewingNote) return;
        const id = activeViewingNote.id;
        appData.notes = appData.notes.filter(n => n.id !== id);
        saveState();
        renderLoveNotes();
        window.DuduChatSocket?.sendDeleteNote?.(id);
        sendDeleteRest('/api/notes', id);
        closeSheet('modal-view-love-note');
        showFeedbackToast('Love note removed from space 🗑️');
        window.duduAudio?.playPop?.(400);
      };
    }

    // 6. View Polaroid Modal
    const closeViewPol = document.getElementById('btn-close-view-polaroid');
    if (closeViewPol) closeViewPol.onclick = () => closeSheet('modal-view-polaroid');

    const dismissViewPol = document.getElementById('btn-dismiss-view-polaroid');
    if (dismissViewPol) dismissViewPol.onclick = () => closeSheet('modal-view-polaroid');

    const delViewPol = document.getElementById('btn-delete-view-polaroid');
    if (delViewPol) {
      delViewPol.onclick = () => {
        if (!activeViewingPolaroid) return;
        const id = activeViewingPolaroid.id;
        appData.polaroids = appData.polaroids.filter(p => p.id !== id);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendDeletePolaroid?.(id);
        sendDeleteRest('/api/memories/polaroids', id);
        closeSheet('modal-view-polaroid');
        showFeedbackToast('Photo removed from jar 🗑️');
        window.duduAudio?.playPop?.(400);
      };
    }

    // 7. Status Modal
    const closeStatus = document.getElementById('btn-close-status-modal');
    if (closeStatus) closeStatus.onclick = () => closeSheet('modal-edit-status');

    const saveStatusBtn = document.getElementById('btn-save-partner-status');
    if (saveStatusBtn) {
      saveStatusBtn.onclick = () => {
        const inputEl = document.getElementById('input-partner-status');
        const next = inputEl?.value?.trim();
        if (next) {
          if (appData.userRole === 'dudu') appData.statuses.dudu = next;
          else appData.statuses.bubu = next;
          saveState();
          renderOurSpaceHome();
          window.DuduChatSocket?.sendUpdateCoupleSpace?.({ statuses: appData.statuses });
          sendSaveRest('/api/couple-space', { statuses: appData.statuses });
          closeSheet('modal-edit-status');
          showFeedbackToast('Status updated! 💭');
          window.duduAudio?.playPop?.(700);
        }
      };
    }

    // Quick Status Presets
    document.querySelectorAll('.btn-preset-status').forEach(btn => {
      btn.onclick = () => {
        const inputEl = document.getElementById('input-partner-status');
        if (inputEl) inputEl.value = btn.textContent.trim();
        window.duduAudio?.playPop?.(500);
      };
    });

    // 8. Anniversary Modal
    const closeAnniv = document.getElementById('btn-close-anniversary-modal');
    if (closeAnniv) closeAnniv.onclick = () => closeSheet('modal-edit-anniversary');

    const saveAnnivBtn = document.getElementById('btn-save-anniversary');
    if (saveAnnivBtn) {
      saveAnnivBtn.onclick = () => {
        const inputEl = document.getElementById('input-anniversary-iso');
        const next = inputEl?.value?.trim();
        if (next && /^\d{4}-\d{2}-\d{2}$/.test(next)) {
          appData.anniversaryDate = next;
          saveState();
          renderOurSpaceHome();
          renderOurCalendar();
          window.DuduChatSocket?.sendUpdateCoupleSpace?.({ anniversaryDate: appData.anniversaryDate });
          sendSaveRest('/api/couple-space', { anniversaryDate: appData.anniversaryDate });
          closeSheet('modal-edit-anniversary');
          showFeedbackToast(`Anniversary updated! (${getDaysTogether()} days) ♡`);
          window.duduAudio?.playPop?.(750);
        }
      };
    }

    // Identity switch (Dudu / Bubu)
    const identityBtn = document.getElementById('header-identity-btn');
    if (identityBtn) identityBtn.onclick = toggleUserRole;

    const avatarBtn = document.getElementById('profile-avatar-btn');
    if (avatarBtn) avatarBtn.onclick = toggleUserRole;

    const chatPartnerToggleBtn = document.getElementById('chat-partner-toggle-btn');
    if (chatPartnerToggleBtn) {
      chatPartnerToggleBtn.onclick = (e) => {
        if (e.target.closest('#chat-partner-presence-container')) return;
        toggleUserRole();
      };
    }

    updateIdentityUI();
  }

  function toggleUserRole() {
    setUserRole(appData.userRole === 'dudu' ? 'bubu' : 'dudu');
  }

  function setUserRole(newRole) {
    appData.userRole = newRole;
    saveState();
    try {
      sessionStorage.setItem('DUDU_ACTIVE_ROLE', newRole);
    } catch (_) {}
    window.DuduChatCrypto?.setStoredIdentity?.(newRole);
    updateIdentityUI();
    window.DuduChatUI?.refreshPresence?.();
    window.DuduChatUI?.reloadActiveMessages?.();
    window.DuduChatSocket?.sendPresenceAnnounce?.('online');
    showFeedbackToast(`Viewing as ${appData.userRole === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'}`);
    window.duduAudio?.playPop?.(580);
  }

  function updateIdentityUI() {
    const isDudu = appData.userRole === 'dudu';
    const nameEl = document.getElementById('header-identity-name');
    if (nameEl) nameEl.textContent = isDudu ? 'Dudu 🐻' : 'Bubu 🐼';

    // In chat header: partner title
    const chatTitleEl = document.getElementById('chat-partner-name');
    if (chatTitleEl) chatTitleEl.textContent = isDudu ? 'Bubu 🐼❤️' : 'Dudu 🐻❤️';

    // Also tell chat UI to refresh presence header
    window.DuduChatUI?.refreshPresence?.();
  }

  function openStatusEditModal() {
    const current = appData.userRole === 'dudu' ? appData.statuses.dudu : appData.statuses.bubu;
    const inputEl = document.getElementById('input-partner-status');
    if (inputEl) inputEl.value = current || '';
    openSheet('modal-edit-status');
  }

  function openAnniversaryModal() {
    const inputEl = document.getElementById('input-anniversary-iso');
    const previewEl = document.getElementById('anniversary-preview-days');
    if (inputEl) inputEl.value = appData.anniversaryDate || '2025-11-04';
    if (previewEl) previewEl.textContent = `Together for ${getDaysTogether()} sweet days ♡`;
    openSheet('modal-edit-anniversary');
  }

  function showPolaroidPreviewModal(p) {
    activeViewingPolaroid = p;
    const imgEl = document.getElementById('modal-polaroid-img');
    const titleEl = document.getElementById('modal-polaroid-title');
    const dateEl = document.getElementById('modal-polaroid-date');
    if (imgEl) imgEl.src = p.image;
    if (titleEl) titleEl.textContent = p.title;
    if (dateEl) dateEl.textContent = p.date;
    openSheet('modal-view-polaroid');
  }

  function showNoteDetailsModal(note) {
    activeViewingNote = note;
    const senderEl = document.getElementById('modal-view-note-sender');
    const timeEl = document.getElementById('modal-view-note-time');
    const bodyEl = document.getElementById('modal-view-note-body');
    if (senderEl) senderEl.textContent = `Love Note from ${note.sender}`;
    if (timeEl) timeEl.textContent = `${note.date || 'Today'} • ${note.time || ''}`;
    if (bodyEl) bodyEl.textContent = `"${note.body}"`;
    openSheet('modal-view-love-note');
  }

  function showFeedbackToast(msg) {
    const toast = document.getElementById('feedback-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Expose to window for interactions
  window.DuduMockup = {
    switchTab,
    appData,
    saveState,
    lofiEngine,
    getUserRole: () => appData.userRole,
    setUserRole,
    toggleUserRole,
    getDaysTogether
  };
  window.duduMockup = window.DuduMockup;
  window.showFeedbackToast = showFeedbackToast;

})();
