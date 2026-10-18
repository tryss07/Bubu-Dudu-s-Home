/**
 * Dudu & Bubu Mockup Feature Engine & Interactive Controller
 * Implements all 8 mockup screens faithfully to Huang Xiao B reference art.
 */

(function () {
  'use strict';

  // --- STORAGE KEY & DEFAULT STATE ---
  const STORAGE_KEY = 'DUDU_MOCKUP_DATA_V1';
  const THEME_STORAGE_KEY = 'DUDU_THEME';

  // Anniversary date: 4 November 2025
  const defaultAnniversaryIso = '2025-11-04';

  const WARDROBE_CATALOG = {
    dudu: {
      hat: [
        { val: 'none', label: 'Tanpa Topi', shortLabel: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_hat_sleep_beanie', label: 'Topi Tidur Bergaris', shortLabel: 'Topi Tidur', icon: '🧢', img: 'assets/mockup_art/wardrobe/items/dudu_hat_sleep_beanie.png', theme: 'sleep' },
        { val: 'dudu_hat_bucket', label: 'Topi Rimba Safari', shortLabel: 'Topi Rimba', icon: '🤠', img: 'assets/mockup_art/wardrobe/items/dudu_hat_bucket.png', theme: 'summer' },
        { val: 'dudu_hat_newsboy', label: 'Topi Newsboy Tweed', shortLabel: 'Newsboy', icon: '🎩', img: 'assets/mockup_art/wardrobe/items/dudu_hat_newsboy.png', theme: 'vintage' },
        { val: 'dudu_hat_beret', label: 'Topi Beret Cokelat', shortLabel: 'Beret', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/dudu_hat_beret.png', theme: 'chic' },
        { val: 'dudu_hat_pompom', label: 'Kupluk Rajut Pom-Pom', shortLabel: 'Pom-Pom', icon: '🧶', img: 'assets/mockup_art/wardrobe/items/dudu_hat_pompom.png', theme: 'cozy' }
      ],
      outfit: [
        { val: 'none', label: 'Tanpa Baju (Mentahan)', shortLabel: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_outfit_overalls', label: 'Baju Kodok Denim', shortLabel: 'Overalls', icon: '👖', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_overalls.png', theme: 'casual' },
        { val: 'dudu_outfit_pajamas', label: 'Piyama Tidur Garis', shortLabel: 'Piyama Garis', icon: '🛌', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_pajamas.png', theme: 'sleep' },
        { val: 'dudu_outfit_nightshirt', label: 'Baju Tidur Bulan Bintang', shortLabel: 'Nightshirt', icon: '🌙', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_nightshirt.png', theme: 'sleep' },
        { val: 'dudu_outfit_hawaiian', label: 'Kemeja Pantai Tropis', shortLabel: 'Hawaiian', icon: '🌺', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_hawaiian.png', theme: 'summer' },
        { val: 'dudu_outfit_palmtree', label: 'Kaos Kelapa & Celana Pendek', shortLabel: 'Kaos Kelapa', icon: '🌴', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_palmtree.png', theme: 'summer' },
        { val: 'dudu_outfit_tuxedo', label: 'Jas Tuxedo Formal', shortLabel: 'Tuxedo', icon: '🤵', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_tuxedo.png', theme: 'chic' },
        { val: 'dudu_outfit_cardigan', label: 'Kardigan Rajut Hangat', shortLabel: 'Kardigan', icon: '🧣', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_cardigan.png', theme: 'cozy' },
        { val: 'dudu_outfit_corduroy', label: 'Jaket Corduroy Musim Dingin', shortLabel: 'Jaket Corduroy', icon: '🧥', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_corduroy.png', theme: 'winter' }
      ],
      accs: [
        { val: 'none', label: 'Tanpa Aksesoris', shortLabel: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_accs_eyemask', label: 'Penutup Mata Beruang', shortLabel: 'Eye Mask', icon: '💤', img: 'assets/mockup_art/wardrobe/items/dudu_accs_eyemask.png', theme: 'sleep' },
        { val: 'dudu_accs_round_glasses', label: 'Kacamata Bulat Klasik', shortLabel: 'Kacamata', icon: '👓', img: 'assets/mockup_art/wardrobe/items/dudu_accs_round_glasses.png', theme: 'chic' },
        { val: 'dudu_accs_sunglasses', label: 'Kacamata Hitam Keren', shortLabel: 'Sunglasses', icon: '🕶️', img: 'assets/mockup_art/wardrobe/items/dudu_accs_sunglasses.png', theme: 'chic' },
        { val: 'dudu_accs_retro_sunglasses', label: 'Kacamata Retro Cokelat', shortLabel: 'Retro Shades', icon: '🕶️', img: 'assets/mockup_art/wardrobe/items/dudu_accs_retro_sunglasses.png', theme: 'summer' }
      ],
      shoes: [
        { val: 'none', label: 'Tanpa Alas Kaki', shortLabel: 'Nyeker', icon: '🐾', img: '', theme: 'natural' },
        { val: 'dudu_shoes_bear_slippers', label: 'Sandal Bulu Beruang', shortLabel: 'Sandal Beruang', icon: '🥿', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_bear_slippers.png', theme: 'sleep' },
        { val: 'dudu_shoes_sandals', label: 'Sandal Kulit Buckle', shortLabel: 'Sandal Buckle', icon: '🩴', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_sandals.png', theme: 'summer' },
        { val: 'dudu_shoes_winter_boots', label: 'Sepatu Boot Musim Dingin', shortLabel: 'Winter Boots', icon: '🥾', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_winter_boots.png', theme: 'winter' },
        { val: 'dudu_shoes_oxfords', label: 'Sepatu Pantofel Oxford', shortLabel: 'Oxfords', icon: '👞', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_oxfords.png', theme: 'chic' },
        { val: 'dudu_shoes_sneakers', label: 'Sepatu Kets Sneakers', shortLabel: 'Sneakers', icon: '👟', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_sneakers.png', theme: 'casual' }
      ]
    },
    bubu: {
      hat: [
        { val: 'none', label: 'Tanpa Topi', shortLabel: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_hat_nightcap', label: 'Topi Tidur Pita Manis', shortLabel: 'Nightcap', icon: '🎀', img: 'assets/mockup_art/wardrobe/items/bubu_hat_nightcap.png', theme: 'sleep' },
        { val: 'bubu_hat_straw_hat', label: 'Topi Jerami Pantai Pita', shortLabel: 'Topi Jerami', icon: '👒', img: 'assets/mockup_art/wardrobe/items/bubu_hat_straw_hat.png', theme: 'summer' },
        { val: 'bubu_hat_artist_beret', label: 'Topi Beret Seniman', shortLabel: 'Beret Seni', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/bubu_hat_artist_beret.png', theme: 'chic' },
        { val: 'bubu_hat_earflap', label: 'Topi Bulu Telinga Panda', shortLabel: 'Trapper Hat', icon: '🐼', img: 'assets/mockup_art/wardrobe/items/bubu_hat_earflap.png', theme: 'cozy' },
        { val: 'bubu_accs_hair_bow', label: 'Pita Rambut Cokelat Manis', shortLabel: 'Pita Rambut', icon: '🎀', img: 'assets/mockup_art/wardrobe/items/bubu_accs_hair_bow.png', theme: 'chic' }
      ],
      outfit: [
        { val: 'none', label: 'Tanpa Baju (Mentahan)', shortLabel: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_outfit_ruffle_dress', label: 'Gaun Princess Ruffle Pink', shortLabel: 'Ruffle Dress', icon: '👗', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_ruffle_dress.png', theme: 'chic' },
        { val: 'bubu_outfit_strawberry_pj', label: 'Piyama Motif Stroberi', shortLabel: 'Piyama Stroberi', icon: '🍓', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_strawberry_pj.png', theme: 'sleep' },
        { val: 'bubu_outfit_floral_dress', label: 'Dress Bunga Musim Panas', shortLabel: 'Floral Dress', icon: '🌸', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_floral_dress.png', theme: 'summer' },
        { val: 'bubu_outfit_tennis_skirt', label: 'Setelan Rok Tenis Stroberi', shortLabel: 'Tennis Skirt', icon: '🎾', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_tennis_skirt.png', theme: 'casual' },
        { val: 'bubu_outfit_vintage_dress', label: 'Dress Vintage Peter Pan', shortLabel: 'Vintage Dress', icon: '🌼', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_vintage_dress.png', theme: 'vintage' },
        { val: 'bubu_outfit_apron_dress', label: 'Gaun Celemek Cafe Maid', shortLabel: 'Apron Dress', icon: '☕', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_apron_dress.png', theme: 'chic' },
        { val: 'bubu_outfit_trench', label: 'Mantel Trench Klasik Elegan', shortLabel: 'Trench Coat', icon: '🧥', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_trench.png', theme: 'chic' },
        { val: 'bubu_outfit_sweater_skirt', label: 'Sweater Rajut & Rok Pink', shortLabel: 'Sweater & Rok', icon: '🧶', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_sweater_skirt.png', theme: 'cozy' }
      ],
      accs: [
        { val: 'none', label: 'Tanpa Aksesoris', shortLabel: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_accs_panda_mask', label: 'Penutup Mata Panda Lucu', shortLabel: 'Panda Mask', icon: '💤', img: 'assets/mockup_art/wardrobe/items/bubu_accs_panda_mask.png', theme: 'sleep' },
        { val: 'bubu_accs_heart_glasses', label: 'Kacamata Hati Merah Muda', shortLabel: 'Kacamata Hati', icon: '💖', img: 'assets/mockup_art/wardrobe/items/bubu_accs_heart_glasses.png', theme: 'chic' },
        { val: 'bubu_accs_round_glasses', label: 'Kacamata Bulat Manis', shortLabel: 'Kacamata Bulat', icon: '👓', img: 'assets/mockup_art/wardrobe/items/bubu_accs_round_glasses.png', theme: 'chic' },
        { val: 'bubu_accs_straw_bag', label: 'Tas Anyaman Jerami Beruang', shortLabel: 'Tas Jerami', icon: '👜', img: 'assets/mockup_art/wardrobe/items/bubu_accs_straw_bag.png', theme: 'summer' },
        { val: 'bubu_accs_bear_satchel', label: 'Tas Selempang Beruang Kecil', shortLabel: 'Tas Selempang', icon: '👝', img: 'assets/mockup_art/wardrobe/items/bubu_accs_bear_satchel.png', theme: 'cozy' }
      ],
      shoes: [
        { val: 'none', label: 'Tanpa Alas Kaki', shortLabel: 'Nyeker', icon: '🐾', img: '', theme: 'natural' },
        { val: 'bubu_shoes_bunny_slippers', label: 'Sandal Bulu Kelinci', shortLabel: 'Sandal Kelinci', icon: '🐰', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_bunny_slippers.png', theme: 'sleep' },
        { val: 'bubu_shoes_pink_sandals', label: 'Sandal Jepit Buckle Pink', shortLabel: 'Sandal Pink', icon: '🩴', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_pink_sandals.png', theme: 'summer' },
        { val: 'bubu_shoes_mary_janes', label: 'Sepatu Tali Mary Jane', shortLabel: 'Mary Janes', icon: '🥿', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_mary_janes.png', theme: 'chic' },
        { val: 'bubu_shoes_ankle_boots', label: 'Sepatu Boot Tali Cokelat', shortLabel: 'Ankle Boots', icon: '🥾', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_ankle_boots.png', theme: 'vintage' }
      ]
    }
  };

  const defaultMockupData = {
    userRole: 'dudu', // 'dudu' (Kevin) or 'bubu' (Nana)
    anniversaryDate: defaultAnniversaryIso,
    loveBattery: 100,
    badmoodLevel: 0,
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
      dudu: { hat: 'dudu_hat_beret', outfit: 'dudu_outfit_overalls', accs: 'dudu_accs_sunglasses', shoes: 'dudu_shoes_sneakers' },
      bubu: { hat: 'bubu_hat_artist_beret', outfit: 'bubu_outfit_ruffle_dress', accs: 'bubu_accs_heart_glasses', shoes: 'bubu_shoes_bunny_slippers' }
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
        if (!parsed.anniversaryDate) {
          parsed.anniversaryDate = '2025-11-04';
        }
        if (Array.isArray(parsed.calendarEvents)) {
          parsed.calendarEvents.forEach((ev, i) => {
            if (!ev.id) ev.id = 'cal_' + (i + 1);
          });
        }
        if (!parsed.wardrobe || !parsed.wardrobe.dudu || !parsed.wardrobe.bubu) {
          parsed.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
        } else {
          ['dudu', 'bubu'].forEach(c => {
            const w = parsed.wardrobe[c];
            if (w) {
              if (!w.outfit && w.sweater) w.outfit = w.sweater;
              if (!w.shoes && w.coat) w.shoes = w.coat;
            }
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
  function getDaysTogether(customIso) {
    const dateStr = customIso || appData.anniversaryDate || '2025-11-04';
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Next yearly anniversary
    let nextYear = today.getFullYear();
    let nextAnniv = new Date(nextYear, m - 1, d);
    if (nextAnniv < today) {
      nextYear++;
      nextAnniv = new Date(nextYear, m - 1, d);
    }
    const yearsCount = Math.max(1, nextYear - y);
    const diffAnniv = Math.round((nextAnniv - today) / (1000 * 60 * 60 * 24));
    if (diffAnniv >= 0 && diffAnniv <= 100) {
      return {
        title: `${yearsCount} Year Anniversary! 🎂🎉`,
        subtitle: diffAnniv === 0
          ? `Today is our ${yearsCount} Year Anniversary! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️`
          : `Only ${diffAnniv} days left! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️`,
        shortLabel: `Next: ${yearsCount} Year (${months[m - 1]} ${d})`
      };
    }

    const daysSoFar = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
    const nextBlock = (Math.floor(daysSoFar / 100) + 1) * 100;
    const daysLeft = nextBlock - daysSoFar;
    return {
      title: `${nextBlock} Days! 🎉`,
      subtitle: `Only ${daysLeft} days left! 🐻❤️`,
      shortLabel: `Next: ${nextBlock} Days (${daysLeft}d left)`
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
      this.noiseGain = null;
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

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, Number(val)));
      if (this.noiseGain && this.ctx) {
        this.noiseGain.gain.setValueAtTime(0.035 * this.volume, this.ctx.currentTime);
      }
      updateLofiUI();
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
        this.noiseGain = null;
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
        if (Math.random() < 0.0006) data[i] += (Math.random() - 0.5) * 0.4;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.035 * this.volume;
      this.noiseGain = gain;

      this.noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      this.noiseNode.start();
    }

    playChordProgression() {
      if (!this.isPlaying || !this.ctx) return;
      const chordBanks = [
        [ [261.63, 329.63, 392.00, 493.88], [220.00, 261.63, 329.63, 392.00], [146.83, 174.61, 220.00, 261.63], [196.00, 246.94, 293.66, 349.23] ],
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

  function updateNotificationBellBadge() {
    const bellBtn = document.getElementById('btn-header-bell');
    if (!bellBtn) return;
    const dot = bellBtn.querySelector('span.bg-rose-500');
    if (!dot) return;

    const hasUnreadNotes = Array.isArray(appData.notes) && appData.notes.some(n => !n.isRead);
    let hasUnreadChat = false;
    try {
      const raw = localStorage.getItem('dudu_unread_topics');
      if (raw) hasUnreadChat = JSON.parse(raw).length > 0;
    } catch (_) {}

    dot.classList.toggle('hidden', !(hasUnreadNotes || hasUnreadChat));
  }

  function sendDeleteRest(endpoint, id) {
    try {
      const base = window.DuduChatSocket?.getHttpBaseUrl?.() || 'https://chat.nexora-v1.my.id';
      const token = window.DuduChatSocket?.getAuthToken?.() || '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
      const url = `${base}${endpoint}/${id}?token=${encodeURIComponent(token)}`;
      fetch(url, {
        method: 'DELETE',
        headers: { 'x-relay-token': token }
      }).catch(() => {});
    } catch (_) {}
  }

  async function sendSaveRest(endpoint, body) {
    try {
      const base = window.DuduChatSocket?.getHttpBaseUrl?.() || 'https://chat.nexora-v1.my.id';
      const token = window.DuduChatSocket?.getAuthToken?.() || '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
      const url = `${base}${endpoint}?token=${encodeURIComponent(token)}`;
      const wireBody = (window.DuduChatCrypto?.encryptPayload && !body.ciphertext)
        ? await window.DuduChatCrypto.encryptPayload(body)
        : body;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-relay-token': token
        },
        body: JSON.stringify(wireBody)
      }).catch(() => {});
    } catch (_) {}
  }

  function autoMigrateLegacyItems(list, sendFn, restEndpoint) {
    if (!Array.isArray(list)) return;
    list.forEach(async (item) => {
      if (item && item.isLegacyPlaintext) {
        delete item.isLegacyPlaintext;
        sendFn?.(item);
        sendSaveRest(restEndpoint, item);
      }
    });
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
        autoMigrateLegacyItems(appData.polaroids, window.DuduChatSocket?.sendSavePolaroid, '/api/memories/polaroids');
        rerender = true;
      }
      if (Array.isArray(data.milestones) && data.milestones.length > 0) {
        appData.milestones = data.milestones;
        rerender = true;
      }
      if (data.coupleSpace) {
        if (data.coupleSpace.anniversaryDate) appData.anniversaryDate = data.coupleSpace.anniversaryDate;
        if (data.coupleSpace.loveBattery !== undefined) appData.loveBattery = data.coupleSpace.loveBattery;
        if (data.coupleSpace.badmoodLevel !== undefined) appData.badmoodLevel = Number(data.coupleSpace.badmoodLevel);
        if (data.coupleSpace.statuses) {
          if (data.coupleSpace.statuses.dudu) appData.statuses.dudu = data.coupleSpace.statuses.dudu;
          if (data.coupleSpace.statuses.bubu) appData.statuses.bubu = data.coupleSpace.statuses.bubu;
        }
        if (data.coupleSpace.wardrobe) {
          if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
          if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
          if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };
          if (data.coupleSpace.wardrobe.dudu) appData.wardrobe.dudu = { ...appData.wardrobe.dudu, ...data.coupleSpace.wardrobe.dudu };
          if (data.coupleSpace.wardrobe.bubu) appData.wardrobe.bubu = { ...appData.wardrobe.bubu, ...data.coupleSpace.wardrobe.bubu };
          ['dudu', 'bubu'].forEach(c => {
            if (!appData.wardrobe[c].outfit && appData.wardrobe[c].sweater) appData.wardrobe[c].outfit = appData.wardrobe[c].sweater;
            if (!appData.wardrobe[c].shoes && appData.wardrobe[c].coat) appData.wardrobe[c].shoes = appData.wardrobe[c].coat;
          });
        }
        if (data.coupleSpace.miniGameHighScore !== undefined) {
          appData.miniGameHighScore = Math.max(appData.miniGameHighScore || 0, Number(data.coupleSpace.miniGameHighScore) || 0);
        }
        rerender = true;
      }
      if (data.wardrobe) {
        if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
        if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
        if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };
        const w = data.wardrobe.wardrobe || data.wardrobe;
        if (w.dudu) appData.wardrobe.dudu = { ...appData.wardrobe.dudu, ...w.dudu };
        if (w.bubu) appData.wardrobe.bubu = { ...appData.wardrobe.bubu, ...w.bubu };
        ['dudu', 'bubu'].forEach(c => {
          if (!appData.wardrobe[c].outfit && appData.wardrobe[c].sweater) appData.wardrobe[c].outfit = appData.wardrobe[c].sweater;
          if (!appData.wardrobe[c].shoes && appData.wardrobe[c].coat) appData.wardrobe[c].shoes = appData.wardrobe[c].coat;
        });
        if (data.wardrobe.miniGameHighScore !== undefined) {
          appData.miniGameHighScore = Math.max(appData.miniGameHighScore || 0, Number(data.wardrobe.miniGameHighScore) || 0);
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
        renderWardrobeRoom();
      }
    } catch (err) {
      console.warn('[Mockup] Remote hydration failed (offline fallback active):', err);
    }
  }

  const OFFLINE_ICON_MAP = {
    home: '🏠',
    mail: '✉️',
    chat: '💬',
    photo_library: '🖼️',
    calendar_month: '🗓️',
    checklist: '📋',
    music_note: '🎵',
    styler: '👗',
    notifications: '🔔',
    dark_mode: '🌙',
    light_mode: '☀️',
    expand_more: '▾',
    keyboard_arrow_up: '▴',
    add_a_photo: '📷',
    photo_camera: '📷',
    image: '🖼️',
    mic: '🎙️',
    send: '➤',
    call: '📞',
    videocam: '📹',
    lock: '🔒',
    swap_horiz: '⇄',
    skip_previous: '⏮',
    play_arrow: '▶',
    pause: '⏸',
    skip_next: '⏭',
    volume_up: '🔊',
    delete: '🗑️',
    delete_forever: '🗑️',
    warning: '⚠️',
    edit: '✏️',
    forum: '💬',
    search: '🔍',
    search_off: '🔍',
    grid_view: '⊞',
    push_pin: '📌',
    history: '↺',
    reply: '↩',
    content_copy: '📋',
    forward: '➔',
    done: '✓',
    done_all: '✓✓',
    download: '⬇',
    description: '📄',
    photo: '🖼️',
    attach_file: '📎'
  };

  function syncOfflineIcons() {
    try {
      let fontLoaded = false; if (document.fonts && document.fonts.forEach) { document.fonts.forEach(f => { if (f.family.replace(/['"]/g, "") === "Material Symbols Outlined" && f.status === "loaded") fontLoaded = true; }); }
      document.documentElement.classList.toggle('offline-icons', !fontLoaded);
      document.querySelectorAll('.material-symbols-outlined').forEach(el => {
        const key = (el.textContent || '').trim();
        if (OFFLINE_ICON_MAP[key]) {
          el.setAttribute('data-fallback', OFFLINE_ICON_MAP[key]);
        }
      });
    } catch (_) {}
  }

  // --- THEME & HEADER CONTROLS ---
  function initThemeAndHeaderControls() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    const bellBtn = document.getElementById('btn-header-bell');

    const applyTheme = (isDark) => {
      document.documentElement.classList.toggle('dark', isDark);
      const iconSpan = themeBtn?.querySelector('.material-symbols-outlined');
      if (iconSpan) {
        iconSpan.textContent = isDark ? 'light_mode' : 'dark_mode';
        syncOfflineIcons();
      }
    };

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
      applyTheme(true);
    } else if (savedTheme === 'light') {
      applyTheme(false);
    }

    themeBtn?.addEventListener('click', () => {
      const nextDark = !document.documentElement.classList.contains('dark');
      applyTheme(nextDark);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
      } catch (_) {}
      window.duduAudio?.playPop?.(nextDark ? 420 : 620);
      showFeedbackToast(nextDark ? 'Cozy night mode active 🌙' : 'Warm daylight mode active ☀️');
    });

    bellBtn?.addEventListener('click', () => {
      window.duduAudio?.playPop?.(540);
      let unreadChat = [];
      try {
        const raw = localStorage.getItem('dudu_unread_topics');
        if (raw) unreadChat = JSON.parse(raw);
      } catch (_) {}

      const unreadNotesCount = (appData.notes || []).filter(n => !n.isRead).length;
      if (unreadChat.length > 0) {
        switchTab('chat');
        showFeedbackToast(`Opening ${unreadChat.length} unread chat topic(s) 💬`);
      } else if (unreadNotesCount > 0) {
        activeNotesFilter = 'unread';
        document.querySelectorAll('.notes-filter-chip').forEach(b => {
          const isUnread = b.getAttribute('data-filter') === 'unread';
          b.classList.toggle('bg-[#8D5B4C]', isUnread);
          b.classList.toggle('text-white', isUnread);
          b.classList.toggle('bg-surface-container', !isUnread);
          b.classList.toggle('text-primary', !isUnread);
        });
        renderLoveNotes();
        switchTab('notes');
        showFeedbackToast(`You have ${unreadNotesCount} unread love note(s)! 💌`);
      } else {
        showFeedbackToast('All caught up! Zero unread notes or messages ♡');
      }
      updateNotificationBellBadge();
    });

    updateNotificationBellBadge();
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initThemeAndHeaderControls();
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
    syncOfflineIcons();
    const obs = new MutationObserver(() => syncOfflineIcons());
    obs.observe(document.body, { childList: true, subtree: true });
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
        renderOurSpaceHome();
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
      renderOurSpaceHome();
      renderCalendarDayModalEvents();
      showFeedbackToast(`New calendar event: ${event.title} 🗓️`);
      window.duduAudio?.playPop?.(750);
    });

    window.DuduChatSocket.onCalendarEventDeleted?.((id) => {
      if (!id) return;
      appData.calendarEvents = appData.calendarEvents.filter(e => e.id !== id);
      saveState();
      renderOurCalendar();
      renderOurSpaceHome();
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
        updateNotificationBellBadge();
      }
    });

    window.DuduChatSocket.onNoteSaved?.((note) => {
      if (!note || !note.body) return;
      const idx = appData.notes.findIndex(n => n.id === note.id);
      if (idx >= 0) appData.notes[idx] = note;
      else appData.notes.unshift(note);
      saveState();
      renderLoveNotes();
      updateNotificationBellBadge();
      showFeedbackToast(`New love note from ${note.sender}! 💌`);
      window.duduAudio?.playPop?.(880);
    });

    window.DuduChatSocket.onNoteDeleted?.((id) => {
      if (!id) return;
      appData.notes = appData.notes.filter(n => n.id !== id);
      saveState();
      renderLoveNotes();
      updateNotificationBellBadge();
    });

    // 4. Memories (Polaroids & Milestones)
    window.DuduChatSocket.onMemoriesSync?.((data) => {
      if (data && Array.isArray(data.polaroids)) {
        appData.polaroids = data.polaroids;
        autoMigrateLegacyItems(appData.polaroids, window.DuduChatSocket?.sendSavePolaroid, '/api/memories/polaroids');
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
      if (data.badmoodLevel !== undefined && data.badmoodLevel !== appData.badmoodLevel) {
        appData.badmoodLevel = Number(data.badmoodLevel);
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

    // 6. Wardrobe / Couple Closet Real-Time Sync
    const applyWardrobePayload = (data, notifyFrom) => {
      if (!data) return;
      if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
      if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
      if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };
      const w = data.wardrobe || data;
      let changed = false;
      if (w.dudu && JSON.stringify(w.dudu) !== JSON.stringify(appData.wardrobe.dudu)) {
        appData.wardrobe.dudu = { ...appData.wardrobe.dudu, ...w.dudu };
        changed = true;
      }
      if (w.bubu && JSON.stringify(w.bubu) !== JSON.stringify(appData.wardrobe.bubu)) {
        appData.wardrobe.bubu = { ...appData.wardrobe.bubu, ...w.bubu };
        changed = true;
      }
      ['dudu', 'bubu'].forEach(c => {
        if (!appData.wardrobe[c].outfit && appData.wardrobe[c].sweater) appData.wardrobe[c].outfit = appData.wardrobe[c].sweater;
        if (!appData.wardrobe[c].shoes && appData.wardrobe[c].coat) appData.wardrobe[c].shoes = appData.wardrobe[c].coat;
      });
      if (data.miniGameHighScore !== undefined && Number(data.miniGameHighScore) > (appData.miniGameHighScore || 0)) {
        appData.miniGameHighScore = Number(data.miniGameHighScore);
        changed = true;
      }
      if (changed) {
        saveState();
        renderWardrobeRoom();
        if (notifyFrom) {
          const partnerName = notifyFrom === 'dudu' ? 'Dudu 🐻' : notifyFrom === 'bubu' ? 'Bubu 🐼' : 'Partner';
          showFeedbackToast(`${partnerName} updated the Couple Closet! 🧥✨`);
          window.duduAudio?.playPop?.(680);
        }
      }
    };

    window.DuduChatSocket.onWardrobeSync?.((data) => applyWardrobePayload(data, null));
    window.DuduChatSocket.onWardrobeUpdated?.((data, updatedBy) => applyWardrobePayload(data, updatedBy || 'partner'));
  }

  // --- TAB ROUTING & BOTTOM DOCK OVERFLOW ---
  function updateBottomNavHeightVar() {
    const bottomNav = document.getElementById('bottom-nav-bar');
    if (bottomNav) {
      const rect = bottomNav.getBoundingClientRect();
      const h = rect.height || bottomNav.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--bottom-nav-height', `${Math.round(h)}px`);
      }
    }
  }

  function updateBottomNavOverflow() {
    const moreBtn = document.getElementById('btn-bottom-nav-more');
    const morePopup = document.getElementById('bottom-nav-more-popup');
    const secondaryItems = document.querySelectorAll('.bottom-nav-secondary');
    if (!moreBtn) return;

    updateBottomNavHeightVar();

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
      updateBottomNavHeightVar();
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

    morePopup?.querySelectorAll('.mockup-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        morePopup.classList.add('hidden');
        moreIcon?.classList.remove('rotate-180');
      });
    });

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

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) switchTab(hash, false);
    });

    const initialHash = window.location.hash.replace('#', '') || 'home';
    switchTab(initialHash, false);
  }

  let currentActiveTab = null;
  window.switchTab = switchTab;
  window.navigateTo = function(tabName) {
    const alias = { planner: "bucket", sleep: "music", memory: "memories" };
    switchTab(alias[tabName] || tabName);
  };
  function switchTab(tabName, updateHash = true) {
    document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach(m => m.classList.add("hidden"));
    if (tabName === 'memory') tabName = 'memories';
    const tabs = ['home', 'notes', 'chat', 'memories', 'calendar', 'bucket', 'music', 'wardrobe'];
    if (!tabs.includes(tabName)) tabName = 'home';
    const isSameTab = (currentActiveTab === tabName);
    currentActiveTab = tabName;

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

    const morePopup = document.getElementById('bottom-nav-more-popup');
    if (morePopup) {
      morePopup.classList.add('hidden');
      document.getElementById('bottom-nav-more-icon')?.classList.remove('rotate-180');
    }

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

    document.body.classList.toggle('chat-tab-active', tabName === 'chat');
    if (tabName === 'chat' && !isSameTab) {
      window.DuduChatUI?.onTabActivated?.();
      window.scrollToChatBottom?.();
    } else {
      document.getElementById('bottom-nav-bar')?.classList.remove('nav-collapsed');
      document.getElementById('tab-chat')?.classList.remove('chat-input-focused');
      window.DuduChatUI?.updateNavChatBadge?.();
    }
    updateNotificationBellBadge();
    updateBottomNavHeightVar();

    if (updateHash && window.location.hash !== `#${tabName}`) {
      window.location.hash = `#${tabName}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 1. OUR SPACE (HOME SCREEN - timeline.jpg) ---
  function renderOurSpaceHome() {
    const days = getDaysTogether();
    const daysEl = document.getElementById('home-days-count');
    if (daysEl) daysEl.textContent = `${days} days ♡`;

    const subEl = document.getElementById('home-anniversary-sub');
    if (subEl) {
      const [y, m, d] = (appData.anniversaryDate || '2025-11-04').split('-').map(Number);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      subEl.textContent = `Since ${d} ${months[m - 1]} ${y}`;
    }

    // Update Home Calendar Portal subtitle dynamically
    const portalCalNext = document.getElementById('home-portal-calendar-next');
    if (portalCalNext) {
      const milestone = getNextAnniversaryMilestone(appData.anniversaryDate);
      portalCalNext.textContent = milestone.shortLabel || 'Next: 1 Year (Nov 4)';
    }

    updateLoveBatteryUI();
    updateBadmoodUI();

    const duduStatusEl = document.getElementById('home-status-dudu');
    const bubuStatusEl = document.getElementById('home-status-bubu');
    if (duduStatusEl) duduStatusEl.textContent = appData.statuses.dudu;
    if (bubuStatusEl) bubuStatusEl.textContent = appData.statuses.bubu;

    // Bar 1: Love Battery Button
    const batteryBtn = document.getElementById('btn-boost-battery');
    if (batteryBtn) {
      batteryBtn.onclick = () => {
        if (appData.loveBattery < 100) {
          appData.loveBattery = Math.min(100, (Number(appData.loveBattery) || 0) + 10);
          saveState();
          updateLoveBatteryUI();
          window.DuduChatSocket?.sendUpdateCoupleSpace?.({ loveBattery: appData.loveBattery });
          sendSaveRest('/api/couple-space', { loveBattery: appData.loveBattery });
        }
        triggerHeartBurst();
        const notif = getLoveNotificationContent(appData.loveBattery);
        showInAppNotification(notif.title, notif.message, notif.icon);
        window.duduAudio?.playPop?.(650);
      };
    }

    const adjustBatteryBtn = document.getElementById('btn-open-battery-adjust');
    if (adjustBatteryBtn) {
      adjustBatteryBtn.onclick = (e) => {
        e.stopPropagation();
        openLoveBatteryModal();
      };
    }

    // Bar 2: Badmood Meter Button
    const badmoodBtn = document.getElementById('btn-boost-badmood');
    if (badmoodBtn) {
      badmoodBtn.onclick = () => {
        const notif = getBadmoodNotificationContent(appData.badmoodLevel);
        showInAppNotification(notif.title, notif.message, notif.icon);
        window.duduAudio?.playPop?.(520);
      };
    }

    const adjustBadmoodBtn = document.getElementById('btn-open-badmood-adjust');
    if (adjustBadmoodBtn) {
      adjustBadmoodBtn.onclick = (e) => {
        e.stopPropagation();
        openBadmoodModal();
      };
    }

    const statusCard = document.getElementById('home-status-card');
    if (statusCard) {
      statusCard.onclick = () => openStatusEditModal();
    }

    const daysPill = document.getElementById('home-anniversary-pill');
    if (daysPill) {
      daysPill.onclick = () => openAnniversaryModal();
    }
  }

  // --- IN-APP FLOATING NOTIFICATION SYSTEM ---
  let inAppNotifTimer = null;
  function showInAppNotification(title, message, icon = '💖') {
    const banner = document.getElementById('in-app-notification-banner');
    const titleEl = document.getElementById('in-app-notif-title');
    const bodyEl = document.getElementById('in-app-notif-body');
    const iconEl = document.getElementById('in-app-notif-icon-box');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    if (banner) {
      banner.classList.remove('hidden');
      void banner.offsetWidth; // force reflow
      banner.classList.add('notif-banner-visible');

      if (inAppNotifTimer) clearTimeout(inAppNotifTimer);
      inAppNotifTimer = setTimeout(() => {
        banner.classList.remove('notif-banner-visible');
        setTimeout(() => banner.classList.add('hidden'), 350);
      }, 3500);

      banner.onclick = () => {
        if (inAppNotifTimer) clearTimeout(inAppNotifTimer);
        banner.classList.remove('notif-banner-visible');
        setTimeout(() => banner.classList.add('hidden'), 350);
      };
    }

    showFeedbackToast(`${icon} ${title}`);
    if (window.DuduChatUI?.notifyUser) {
      window.DuduChatUI.notifyUser(title, message);
    }
  }

  function getLoveNotificationContent(val) {
    const current = Math.max(0, Math.min(100, Number(val) || 100));
    if (current >= 100) {
      return {
        title: 'Love Battery: 100% Full! 💖',
        message: 'Cinta Bubu & Dudu penuh melimpah ruah! Kasih sayang kita tak terbatas hari ini 🥰',
        icon: '💖'
      };
    } else if (current >= 75) {
      return {
        title: `Love Battery: ${current}% 🥰`,
        message: 'Hati lagi berbunga-bunga dan senang banget dekat kamu! Semangat terus ya sayang ♡',
        icon: '🥰'
      };
    } else if (current >= 50) {
      return {
        title: `Love Battery: ${current}% 🤗`,
        message: 'Energi cinta stabil, tapi tetap butuh recharge pelukan hangat ekstra dari ayang!',
        icon: '🤗'
      };
    } else if (current >= 25) {
      return {
        title: `Love Battery: ${current}% 🥺`,
        message: 'Baterai cinta mulai low! Butuh disayang, dipuk-puk, dan ditemenin ngobrol manis ♡',
        icon: '🥺'
      };
    } else {
      return {
        title: `Love Battery: ${current}% Darurat! 🔋`,
        message: 'Baterai cinta kritis! Segera peluk erat dan manjakan ayang sekarang juga!',
        icon: '🔋'
      };
    }
  }

  function getBadmoodNotificationContent(val) {
    const current = Math.max(0, Math.min(100, Number(val) || 0));
    if (current <= 0) {
      return {
        title: 'Badmood: 0% (Super Happy!) ✨',
        message: 'Mood lagi ceria dan berbunga-bunga! Tidak ada badmood sama sekali hari ini 🥰🌸',
        icon: '✨'
      };
    } else if (current <= 25) {
      return {
        title: `Badmood: ${current}% (Sedikit Bete) ☁️`,
        message: 'Ada sedikit rasa bete nih, kalau disemangatin manis atau dicium pasti langsung senyum! 🥺',
        icon: '☁️'
      };
    } else if (current <= 50) {
      return {
        title: `Badmood: ${current}% (Mood Mendung) 🌧️`,
        message: 'Mood agak mendung dan sensitif. Butuh dipuk-puk, didengerin curhatnya, plus es krim! 🍨',
        icon: '🌧️'
      };
    } else if (current <= 75) {
      return {
        title: `Badmood: ${current}% (Ngambek Berat) 🌩️`,
        message: 'Lagi ngambek! Tolong jangan bikin kesel dulu ya, wajib dibujuk dengan sabar dan beliin boba 🧋😤',
        icon: '🌩️'
      };
    } else {
      return {
        title: `Badmood: ${current}% (DARURAT LEVEL 5!) ⚡`,
        message: 'BAHAYA NGAMBEK MAKSIMAL! Segera peluk erat, minta maaf, dan bawakan makanan kesukaan! 🌋💔',
        icon: '⚡'
      };
    }
  }

  function openLoveBatteryModal() {
    const slider = document.getElementById('input-love-battery-slider');
    const valText = document.getElementById('slider-battery-val');
    const bar = document.getElementById('slider-battery-bar');
    const current = Math.max(0, Math.min(100, Number(appData.loveBattery) || 100));

    const updateSliderDisplay = (val) => {
      if (valText) valText.textContent = `${val}%`;
      if (bar) bar.style.width = `${val}%`;
    };

    if (slider) {
      slider.value = current;
      updateSliderDisplay(current);
      slider.oninput = () => updateSliderDisplay(slider.value);
    }

    document.querySelectorAll('.btn-battery-preset').forEach(btn => {
      btn.onclick = () => {
        const v = Number(btn.getAttribute('data-val'));
        if (slider) slider.value = v;
        updateSliderDisplay(v);
        window.duduAudio?.playPop?.(520);
      };
    });

    const closeBtn = document.getElementById('btn-close-battery-modal');
    if (closeBtn) closeBtn.onclick = () => closeSheet('modal-adjust-battery');

    const saveBtn = document.getElementById('btn-save-battery-slider');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const newVal = Number(slider?.value ?? appData.loveBattery ?? 100);
        appData.loveBattery = Math.max(0, Math.min(100, newVal));
        saveState();
        updateLoveBatteryUI();
        window.DuduChatSocket?.sendUpdateCoupleSpace?.({ loveBattery: appData.loveBattery });
        sendSaveRest('/api/couple-space', { loveBattery: appData.loveBattery });
        triggerHeartBurst();
        closeSheet('modal-adjust-battery');
        const notif = getLoveNotificationContent(appData.loveBattery);
        showInAppNotification(notif.title, notif.message, notif.icon);
        window.duduAudio?.playPop?.(650);
      };
    }

    openSheet('modal-adjust-battery');
  }

  function openBadmoodModal() {
    const slider = document.getElementById('input-badmood-slider');
    const valText = document.getElementById('slider-badmood-val');
    const bar = document.getElementById('slider-badmood-bar');
    const current = Math.max(0, Math.min(100, Number(appData.badmoodLevel) || 0));

    const updateSliderDisplay = (val) => {
      if (valText) valText.textContent = `${val}%`;
      if (bar) bar.style.width = `${val}%`;
    };

    if (slider) {
      slider.value = current;
      updateSliderDisplay(current);
      slider.oninput = () => updateSliderDisplay(slider.value);
    }

    document.querySelectorAll('.btn-badmood-preset').forEach(btn => {
      btn.onclick = () => {
        const v = Number(btn.getAttribute('data-val'));
        if (slider) slider.value = v;
        updateSliderDisplay(v);
        window.duduAudio?.playPop?.(520);
      };
    });

    const closeBtn = document.getElementById('btn-close-badmood-modal');
    if (closeBtn) closeBtn.onclick = () => closeSheet('modal-adjust-badmood');

    const saveBtn = document.getElementById('btn-save-badmood-slider');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const newVal = Number(slider?.value ?? appData.badmoodLevel ?? 0);
        appData.badmoodLevel = Math.max(0, Math.min(100, newVal));
        saveState();
        updateBadmoodUI();
        window.DuduChatSocket?.sendUpdateCoupleSpace?.({ badmoodLevel: appData.badmoodLevel });
        sendSaveRest('/api/couple-space', { badmoodLevel: appData.badmoodLevel });
        closeSheet('modal-adjust-badmood');
        const notif = getBadmoodNotificationContent(appData.badmoodLevel);
        showInAppNotification(notif.title, notif.message, notif.icon);
        window.duduAudio?.playPop?.(650);
      };
    }

    openSheet('modal-adjust-badmood');
  }

  function updateLoveBatteryUI() {
    const val = Math.max(0, Math.min(100, Number(appData.loveBattery) || 100));
    const txt = document.getElementById('home-battery-text');
    const fill = document.getElementById('home-battery-fill');
    if (txt) txt.textContent = `${val}%`;
    if (fill) fill.style.width = `${val}%`;
  }

  function updateBadmoodUI() {
    const val = Math.max(0, Math.min(100, Number(appData.badmoodLevel) || 0));
    const txt = document.getElementById('home-badmood-text');
    const fill = document.getElementById('home-badmood-fill');
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
  const expandedNoteIds = new Set();

  function formatNoteBodyHtml(noteId, bodyText, fontClass = 'font-handwriting text-lg text-primary dark:text-stone-100') {
    const isExpanded = expandedNoteIds.has(noteId);
    const raw = String(bodyText || '');
    const isLong = raw.length > 130 || raw.includes('\n\n') || (raw.match(/\n/g) || []).length >= 3;

    if (!isLong) {
      return `
        <p class="${fontClass} leading-snug whitespace-pre-wrap">
          "${escapeHtml(raw)}"
        </p>
      `;
    }

    if (!isExpanded) {
      const preview = raw.slice(0, 115).trim() + '...';
      return `
        <p class="${fontClass} leading-snug whitespace-pre-wrap">
          "${escapeHtml(preview)}"
        </p>
        <button type="button" class="btn-toggle-note-expand text-[11px] font-heading font-bold text-[#8D5B4C] hover:text-[#5A3825] dark:text-amber-200 mt-1 inline-flex items-center gap-0.5 cursor-pointer button-press" data-id="${noteId}">
          <span>Show more</span>
          <span class="material-symbols-outlined text-[13px]">expand_more</span>
        </button>
      `;
    }

    return `
      <p class="${fontClass} leading-snug whitespace-pre-wrap">
        "${escapeHtml(raw)}"
      </p>
      <button type="button" class="btn-toggle-note-expand text-[11px] font-heading font-bold text-[#8D5B4C] hover:text-[#5A3825] dark:text-amber-200 mt-1 inline-flex items-center gap-0.5 cursor-pointer button-press" data-id="${noteId}">
        <span>Show less</span>
        <span class="material-symbols-outlined text-[13px]">expand_less</span>
      </button>
    `;
  }

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
        <div class="p-6 text-center text-on-surface-variant text-xs bg-white/60 dark:bg-stone-800/60 rounded-3xl border border-[#E8DACB] dark:border-stone-700">
          <span class="text-3xl block mb-2">💌</span>
          No love notes in this folder yet. Write a sweet note above!
        </div>
      `;
    } else {
      filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = 'button-press cursor-pointer relative';

        const unreadBadgeHtml = !note.isRead
          ? `<span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">Unread</span>`
          : '';
        const favBtnHtml = `
          <button type="button" class="btn-fav-note w-6 h-6 rounded-full ${note.isFavorite ? 'text-rose-500' : 'text-stone-400'} hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Toggle favorite">
            <span class="text-sm">${note.isFavorite ? '♥' : '♡'}</span>
          </button>
        `;

        if (note.style === 'envelope') {
          card.innerHTML = `
            <div class="bg-[#FAF4ED] dark:bg-stone-800 rounded-3xl p-4 plush-shadow border border-[#E8DACB] dark:border-stone-700 relative flex flex-col gap-2.5">
              <div class="flex items-start gap-3">
                <div class="w-16 h-14 bg-[#F2E5D5] dark:bg-stone-700 rounded-xl flex items-center justify-center border border-[#DFCBB7] dark:border-stone-600 relative shadow-inner shrink-0">
                  <span class="wax-seal w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-md">♥</span>
                </div>
                <div class="flex-1 min-w-0">
                  ${formatNoteBodyHtml(note.id, note.body, 'font-handwriting text-lg text-primary dark:text-stone-100')}
                </div>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-[#DFCBB7]/40 dark:border-stone-700 text-[11px] text-on-surface-variant">
                <span class="font-bold text-[#8D5B4C] dark:text-stone-300 flex items-center gap-1.5">
                  <span>Written by ${escapeHtml(note.sender)}</span>
                  ${unreadBadgeHtml}
                </span>
                <div class="flex items-center gap-1.5">
                  <span>${escapeHtml(note.time)}</span>
                  ${favBtnHtml}
                  <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                    <span class="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        } else if (note.style === 'craft') {
          card.innerHTML = `
            <div class="bg-[#EBD2B4] dark:bg-stone-700 text-[#4A3222] dark:text-stone-100 rounded-3xl p-4.5 plush-shadow border border-[#D8BC9B] dark:border-stone-600 relative flex flex-col gap-2.5">
              ${formatNoteBodyHtml(note.id, note.body, 'font-handwriting text-lg leading-snug font-medium')}
              <div class="flex items-center justify-between text-[11px] font-bold opacity-90">
                <span class="flex items-center gap-1.5">
                  <span>From ${escapeHtml(note.sender)}</span>
                  ${unreadBadgeHtml}
                </span>
                <div class="flex items-center gap-1.5">
                  <span>${escapeHtml(note.time)}</span>
                  ${favBtnHtml}
                  <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-[#4A3222]/60 dark:text-stone-300 hover:text-rose-700 hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                    <span class="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="bg-[#FAF4ED] dark:bg-stone-800 rounded-3xl p-4 plush-shadow border border-[#E8DACB] dark:border-stone-700 relative flex flex-col gap-2">
              <div class="bg-[#FFFDF9] dark:bg-stone-700/60 rounded-2xl p-3 border border-[#E5D7C7] dark:border-stone-600 shadow-sm">
                ${formatNoteBodyHtml(note.id, note.body, 'font-handwriting text-lg text-primary dark:text-stone-100 text-center')}
              </div>
              <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-bold px-1">
                <span class="flex items-center gap-1.5">
                  <span>From ${escapeHtml(note.sender)}</span>
                  ${unreadBadgeHtml}
                </span>
                <div class="flex items-center gap-1.5">
                  <span>${escapeHtml(note.time)}</span>
                  ${favBtnHtml}
                  <button type="button" class="btn-delete-note w-6 h-6 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${note.id}" title="Delete note">
                    <span class="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        card.querySelector('.btn-toggle-note-expand')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (expandedNoteIds.has(note.id)) expandedNoteIds.delete(note.id);
          else expandedNoteIds.add(note.id);
          renderLoveNotes();
        });

        card.querySelector('.btn-fav-note')?.addEventListener('click', (e) => {
          e.stopPropagation();
          note.isFavorite = !note.isFavorite;
          saveState();
          renderLoveNotes();
          window.DuduChatSocket?.sendSaveNote?.(note);
          sendSaveRest('/api/notes', note);
          showFeedbackToast(note.isFavorite ? 'Added to Favorites ♥' : 'Removed from Favorites');
          window.duduAudio?.playPop?.(620);
        });

        card.querySelector('.btn-delete-note')?.addEventListener('click', (e) => {
          e.stopPropagation();
          appData.notes = appData.notes.filter(n => n.id !== note.id);
          saveState();
          renderLoveNotes();
          updateNotificationBellBadge();
          window.DuduChatSocket?.sendDeleteNote?.(note.id);
          sendDeleteRest('/api/notes', note.id);
          showFeedbackToast('Love note deleted 🗑️');
          window.duduAudio?.playPop?.(400);
        });

        card.onclick = () => {
          const wasUnread = !note.isRead;
          note.isRead = true;
          saveState();
          if (wasUnread) {
            renderLoveNotes();
            updateNotificationBellBadge();
            window.DuduChatSocket?.sendSaveNote?.(note);
            sendSaveRest('/api/notes', note);
          }
          showNoteDetailsModal(note);
        };

        listEl.appendChild(card);
      });
    }

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

    if (appData.polaroids.length === 0) {
      polaroidGrid.innerHTML = `
        <div class="col-span-2 p-6 text-center text-xs text-on-surface-variant">
          No polaroids in the jar yet. Tap the camera button above to add one! 📸
        </div>
      `;
    } else {
      appData.polaroids.forEach(p => {
        const card = document.createElement('div');
        card.className = `polaroid-card rounded-2xl p-2.5 flex flex-col gap-1.5 cursor-pointer relative`;
        card.style.transform = `rotate(${p.rotate || 0}deg)`;

        card.innerHTML = `
          <div class="washi-tape ${p.tape || 'washi-tape-grid'} -top-2.5 left-1/2 -translate-x-1/2"></div>
          <div class="absolute top-2 right-2 z-10 flex items-center gap-1">
            <button type="button" class="btn-edit-polaroid-grid w-6 h-6 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-500 hover:text-[#8D5B4C] flex items-center justify-center opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-xs button-press" data-id="${p.id}" title="Edit caption">
              <span class="material-symbols-outlined text-[13px]">edit</span>
            </button>
            <button type="button" class="btn-delete-polaroid w-6 h-6 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-400 hover:text-rose-500 flex items-center justify-center opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-xs button-press" data-id="${p.id}" title="Delete photo">
              <span class="material-symbols-outlined text-[13px]">delete</span>
            </button>
          </div>
          <div class="aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
            <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover">
          </div>
          <div class="text-center pt-1 px-1">
            <span class="font-handwriting text-base text-primary dark:text-stone-100 font-bold tracking-wide line-clamp-1">
              ${escapeHtml(p.title)} • ${escapeHtml(p.date)}
            </span>
          </div>
        `;

        card.querySelector('.btn-edit-polaroid-grid')?.addEventListener('click', (e) => {
          e.stopPropagation();
          showPolaroidPreviewModal(p, true);
        });

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
    }

    const viewAllBtn = document.getElementById('btn-view-all-polaroids');
    if (viewAllBtn) {
      viewAllBtn.textContent = appData.polaroids.length > 0 ? `All (${appData.polaroids.length}) ✨` : '+ Add Photo';
      viewAllBtn.onclick = () => {
        if (appData.polaroids.length > 0) {
          polaroidGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          showFeedbackToast(`Showing all ${appData.polaroids.length} memories in your jar 📸🍯`);
          window.duduAudio?.playPop?.(640);
        } else {
          openSheet('modal-add-polaroid');
        }
      };
    }

    // Memory Timeline milestones
    const timelineList = document.getElementById('memory-timeline-nodes');
    if (!timelineList) return;
    timelineList.innerHTML = '';

    if (appData.milestones.length === 0) {
      timelineList.innerHTML = `
        <div class="py-4 text-center text-xs text-on-surface-variant italic">
          No milestones recorded yet. Tap "+ Add" to capture a special moment! ✨
        </div>
      `;
      return;
    }

    appData.milestones.forEach((m, idx) => {
      const node = document.createElement('div');
      node.className = 'flex gap-3 relative pb-4 last:pb-0';
      node.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-[#8D5B4C] bg-[#FAF5EE] dark:bg-stone-700 z-10"></div>
          ${idx < appData.milestones.length - 1 ? '<div class="w-0.5 flex-1 border-l-2 border-dashed border-[#8D5B4C]/50 mt-1"></div>' : ''}
        </div>
        <div class="flex-1 -mt-0.5 flex items-start justify-between gap-2">
          <div>
            <h4 class="font-heading font-bold text-xs text-primary dark:text-stone-100">${escapeHtml(m.title)}</h4>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              <span class="font-semibold">${escapeHtml(m.date)}</span> • ${escapeHtml(m.desc)}
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
    const indoorCount = appData.bucketList.filter(b => b.category === 'indoor').length;
    const outdoorCount = appData.bucketList.filter(b => b.category === 'outdoor').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Progress bar & header badge update
    const percentEl = document.getElementById('bucket-progress-percent');
    const barFillEl = document.getElementById('bucket-progress-fill');
    const countEl = document.getElementById('bucket-progress-count');
    const headerBadgeEl = document.getElementById('bucket-header-badge');
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (barFillEl) barFillEl.style.width = `${percent}%`;
    if (countEl) countEl.textContent = `${completedCount} of ${totalCount} Completed`;
    if (headerBadgeEl) headerBadgeEl.textContent = `Lvl 8 | ${completedCount} Completed ✨`;

    // Update filter chip counts dynamically
    document.querySelectorAll('.bucket-filter-chip').forEach(btn => {
      const f = btn.getAttribute('data-filter');
      if (f === 'all') btn.textContent = `All Dates (${totalCount})`;
      else if (f === 'indoor') btn.textContent = `Cozy Indoor (${indoorCount})`;
      else if (f === 'outdoor') btn.textContent = `Outdoor (${outdoorCount})`;
    });

    const filtered = appData.bucketList.filter(item => {
      if (activeBucketFilter === 'indoor') return item.category === 'indoor';
      if (activeBucketFilter === 'outdoor') return item.category === 'outdoor';
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="p-6 text-center text-xs text-on-surface-variant bg-white dark:bg-stone-800 rounded-3xl border border-[#E8DACB] dark:border-stone-700">
          No date ideas in this category yet. Tap "+" below to add a new adventure! ✨
        </div>
      `;
    } else {
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
              <span class="text-[10px] text-[#8D5B4C] dark:text-stone-300 font-semibold mt-1">Planned: ${escapeHtml(item.plannedDate)}</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <div class="flex items-center gap-1.5">
              ${item.image ? `<img src="${item.image}" alt="date" class="w-12 h-10 rounded-xl object-cover border border-[#E8DACB]">` : ''}
              <button type="button" class="btn-delete-bucket w-7 h-7 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer button-press" data-id="${item.id}" title="Delete date idea">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${item.completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-[#FBE4D5] text-[#8D5B4C] dark:bg-stone-700 dark:text-stone-200'}">
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
    }

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

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'h-10 border border-[#EFE5DB]/40 dark:border-stone-700/20 rounded-lg opacity-20';
      gridEl.appendChild(blank);
    }

    const monthEvents = (appData.calendarEvents || []).filter(e => Number(e.month) === calMonth && Number(e.year) === calYear);

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'h-11 border border-[#EFE5DB] dark:border-stone-700/50 rounded-xl p-1 flex flex-col justify-between relative cursor-pointer button-press transition-colors';

      const dayEvents = monthEvents.filter(e => Number(e.date) === day);
      let stickerIcon = '';
      let highlightClass = '';

      if (dayEvents.length > 0) {
        const latestEvent = dayEvents[dayEvents.length - 1];
        stickerIcon = `<span class="text-[10px] block -mt-1">${escapeHtml(latestEvent.icon || '❤️')}</span>`;
        highlightClass = 'bg-[#FCDFD0] dark:bg-stone-700 border-[#E5A88B] dark:border-stone-500 text-[#5C3D2E] dark:text-stone-100 font-bold';
      }

      if (highlightClass) cell.className += ` ${highlightClass}`;

      cell.innerHTML = `
        <span class="text-[11px] font-heading font-semibold text-primary dark:text-stone-100 leading-none">${day}</span>
        <div class="flex items-center justify-end">${stickerIcon}</div>
      `;

      cell.onclick = () => showCalendarDayEvents(day, calMonth, calYear);
      gridEl.appendChild(cell);
    }

    // Dynamically render Upcoming Events list
    const upcomingListEl = document.getElementById('calendar-upcoming-list');
    if (upcomingListEl) {
      const sortedEvents = [...(appData.calendarEvents || [])].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return a.date - b.date;
      });
      const displayEvents = monthEvents.length > 0 ? monthEvents : sortedEvents.slice(0, 4);

      if (displayEvents.length === 0) {
        upcomingListEl.innerHTML = `
          <div class="py-2 text-center text-xs text-on-surface-variant italic">
            No upcoming moments scheduled for this month yet. Tap any date above to add one! ♡
          </div>
        `;
      } else {
        upcomingListEl.innerHTML = displayEvents.map(ev => {
          const mName = monthNames[ev.month] || 'October';
          return `
            <div class="upcoming-cal-row flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-surface-container/60 dark:hover:bg-stone-700/50 cursor-pointer transition-colors" data-day="${ev.date}" data-month="${ev.month}" data-year="${ev.year}">
              <div class="flex items-start gap-2.5 min-w-0">
                <span class="text-base shrink-0">${escapeHtml(ev.icon || '❤️')}</span>
                <div class="min-w-0">
                  <span class="font-bold block truncate text-primary dark:text-stone-100">${escapeHtml(ev.title)}</span>
                  <p class="text-[11px] text-on-surface-variant">${mName} ${ev.date}, ${ev.year} • Tap to view or edit 🐾</p>
                </div>
              </div>
              <span class="text-[10px] font-bold text-[#8D5B4C] dark:text-stone-300 shrink-0">${mName.slice(0, 3)} ${ev.date}</span>
            </div>
          `;
        }).join('');

        upcomingListEl.querySelectorAll('.upcoming-cal-row').forEach(row => {
          row.onclick = () => {
            const d = Number(row.getAttribute('data-day'));
            const m = Number(row.getAttribute('data-month'));
            const y = Number(row.getAttribute('data-year'));
            showCalendarDayEvents(d, m, y);
          };
        });
      }
    }

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
    const customIconEl = document.getElementById('input-cal-custom-icon');
    if (customIconEl) customIconEl.value = '';

    openSheet('modal-calendar-day');
  }

  function renderCalendarDayModalEvents() {
    if (!activeCalSelection) return;
    const { day, month, year } = activeCalSelection;
    const listEl = document.getElementById('modal-cal-events-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const events = appData.calendarEvents.filter(e => Number(e.date) === day && Number(e.month) === month && Number(e.year) === year);
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
      itemEl.className = 'flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-700/80 border border-[#E8DACB] dark:border-stone-600 gap-2 button-press shadow-2xs';
      itemEl.innerHTML = `
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-base">${escapeHtml(e.icon || '❤️')}</span>
          <span class="text-xs font-bold text-primary dark:text-stone-100 truncate">${escapeHtml(e.title)}</span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-edit-cal-event p-1 text-stone-400 hover:text-[#8D5B4C] rounded-lg hover:bg-stone-100 dark:hover:bg-stone-600 cursor-pointer button-press transition-colors" data-id="${e.id}" title="Edit event">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button type="button" class="btn-del-cal-event p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer button-press transition-colors" data-id="${e.id}" title="Delete event">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      `;

      itemEl.querySelector('.btn-edit-cal-event')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const newTitle = prompt('Edit Moment Title:', e.title);
        if (newTitle !== null && newTitle.trim()) {
          const newIcon = prompt('Edit Emoji (or leave blank to keep):', e.icon || '❤️');
          e.title = newTitle.trim();
          if (newIcon && newIcon.trim()) e.icon = newIcon.trim();
          saveState();
          renderOurCalendar();
          renderOurSpaceHome();
          renderCalendarDayModalEvents();
          window.DuduChatSocket?.sendSaveCalendarEvent?.(e);
          sendSaveRest('/api/calendar', e);
          showFeedbackToast('Event updated! 🗓️✨');
        }
      });

      itemEl.querySelector('.btn-del-cal-event').onclick = (ev) => {
        ev.stopPropagation();
        appData.calendarEvents = appData.calendarEvents.filter(item => item.id !== e.id);
        saveState();
        renderOurCalendar();
        renderOurSpaceHome();
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
    const volBar = document.getElementById('lofi-volume-bar');

    if (playBtn) playBtn.onclick = () => lofiEngine.toggle();
    if (prevBtn) prevBtn.onclick = () => lofiEngine.prevTrack();
    if (nextBtn) nextBtn.onclick = () => lofiEngine.nextTrack();

    if (volBar) {
      volBar.onclick = (e) => {
        const rect = volBar.getBoundingClientRect();
        if (!rect.width) return;
        const pct = Math.max(0.05, Math.min(1, (e.clientX - rect.left) / rect.width));
        lofiEngine.setVolume(pct);
        window.duduAudio?.playPop?.(Math.round(350 + pct * 400));
        showFeedbackToast(`Lofi volume: ${Math.round(pct * 100)}% 🎵`);
      };
    }

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
    const volFill = document.getElementById('lofi-volume-fill');
    const volStar = document.getElementById('lofi-volume-star');
    const volLabel = document.getElementById('lofi-volume-label');

    if (titleEl) titleEl.textContent = cur.title;
    if (subEl) subEl.textContent = cur.subtitle;

    if (discEl) {
      if (lofiEngine.isPlaying) discEl.classList.add('vinyl-spinning');
      else discEl.classList.remove('vinyl-spinning');
    }

    if (iconEl) {
      iconEl.textContent = lofiEngine.isPlaying ? 'pause' : 'play_arrow';
      syncOfflineIcons();
    }

    const pct = Math.round((lofiEngine.volume ?? 0.65) * 100);
    if (volFill) volFill.style.width = `${pct}%`;
    if (volStar) volStar.style.left = `${pct}%`;
    if (volLabel) volLabel.textContent = `${pct}%`;
  }

  function startBedtimeCountdownTimer() {
    function tick() {
      const now = new Date();
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
  let activeWardrobeSlot = 'hat'; // 'hat', 'outfit', 'accs', 'shoes'
  let activeStageView = 'dudu'; // 'dudu', 'bubu', 'couple'
  let activePresetIdx = 0;

  const LEGACY_VAL_MAP = {
    beanie: 'dudu_hat_pompom',
    cable: 'dudu_outfit_cardigan',
    duffle: 'dudu_outfit_corduroy',
    scarf: 'dudu_accs_round_glasses',
    earflap: 'bubu_hat_earflap',
    cream: 'bubu_outfit_sweater_skirt',
    winter: 'bubu_outfit_trench',
    pompom: 'bubu_accs_hair_bow',
    earmuffs: 'dudu_hat_sleep_beanie',
    cardigan: 'dudu_outfit_cardigan',
    puffer: 'bubu_outfit_trench',
    mitten: 'dudu_shoes_bear_slippers',
    beret: 'dudu_hat_beret',
    hoodie: 'bubu_outfit_tennis_skirt',
    trench: 'bubu_outfit_trench',
    satchel: 'bubu_accs_bear_satchel'
  };

  const COUPLE_OUTFIT_PRESETS = [
    {
      name: 'Bears Asli Mentahan 🐻🐼',
      dudu: { hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' },
      bubu: { hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' }
    },
    {
      name: 'Piyama Malam Manis 🌙💤',
      dudu: { hat: 'dudu_hat_sleep_beanie', outfit: 'dudu_outfit_pajamas', accs: 'dudu_accs_eyemask', shoes: 'dudu_shoes_bear_slippers' },
      bubu: { hat: 'bubu_hat_nightcap', outfit: 'bubu_outfit_strawberry_pj', accs: 'bubu_accs_panda_mask', shoes: 'bubu_shoes_bunny_slippers' }
    },
    {
      name: 'Kencan Romantis Mewah 🌹✨',
      dudu: { hat: 'dudu_hat_beret', outfit: 'dudu_outfit_tuxedo', accs: 'dudu_accs_round_glasses', shoes: 'dudu_shoes_oxfords' },
      bubu: { hat: 'bubu_hat_artist_beret', outfit: 'bubu_outfit_ruffle_dress', accs: 'bubu_accs_heart_glasses', shoes: 'bubu_shoes_mary_janes' }
    },
    {
      name: 'Liburan Pantai Tropis 🏖️🌴',
      dudu: { hat: 'dudu_hat_bucket', outfit: 'dudu_outfit_hawaiian', accs: 'dudu_accs_retro_sunglasses', shoes: 'dudu_shoes_sandals' },
      bubu: { hat: 'bubu_hat_straw_hat', outfit: 'bubu_outfit_floral_dress', accs: 'bubu_accs_straw_bag', shoes: 'bubu_shoes_pink_sandals' }
    },
    {
      name: 'Santai di Kafe Kopi ☕🍂',
      dudu: { hat: 'dudu_hat_newsboy', outfit: 'dudu_outfit_overalls', accs: 'dudu_accs_sunglasses', shoes: 'dudu_shoes_sneakers' },
      bubu: { hat: 'bubu_accs_hair_bow', outfit: 'bubu_outfit_apron_dress', accs: 'bubu_accs_bear_satchel', shoes: 'bubu_shoes_ankle_boots' }
    },
    {
      name: 'Musim Dingin Hangat ❄️🧣',
      dudu: { hat: 'dudu_hat_pompom', outfit: 'dudu_outfit_cardigan', accs: 'dudu_accs_round_glasses', shoes: 'dudu_shoes_winter_boots' },
      bubu: { hat: 'bubu_hat_earflap', outfit: 'bubu_outfit_sweater_skirt', accs: 'bubu_accs_heart_glasses', shoes: 'bubu_shoes_mary_janes' }
    }
  ];

  function syncWardrobeToServer() {
    const payload = {
      wardrobe: {
        dudu: {
          ...appData.wardrobe.dudu,
          sweater: appData.wardrobe.dudu.outfit,
          coat: appData.wardrobe.dudu.shoes
        },
        bubu: {
          ...appData.wardrobe.bubu,
          sweater: appData.wardrobe.bubu.outfit,
          coat: appData.wardrobe.bubu.shoes
        }
      },
      miniGameHighScore: appData.miniGameHighScore || 420,
      updatedBy: appData.userRole || 'dudu'
    };
    window.DuduChatSocket?.sendUpdateWardrobe?.(payload);
    sendSaveRest('/api/wardrobe', payload);
  }

  function getItemMeta(slot, rawVal, char) {
    let resolvedSlot = slot;
    if (resolvedSlot === 'sweater') resolvedSlot = 'outfit';
    if (resolvedSlot === 'coat') resolvedSlot = 'shoes';

    const charKey = (char === 'bubu') ? 'bubu' : 'dudu';
    let val = rawVal;
    if (LEGACY_VAL_MAP[val]) {
      val = LEGACY_VAL_MAP[val];
    }
    const catList = WARDROBE_CATALOG[charKey]?.[resolvedSlot] || WARDROBE_CATALOG.dudu[resolvedSlot] || [];
    if (!val || val === 'none') {
      return { val: 'none', label: 'Polos Mentahan', shortLabel: 'Polos', icon: charKey === 'bubu' ? '🐼' : '🐻', img: '', theme: 'natural' };
    }
    const match = catList.find(o => o.val === val);
    if (match) return match;
    const otherChar = charKey === 'bubu' ? 'dudu' : 'bubu';
    const altMatch = WARDROBE_CATALOG[otherChar]?.[resolvedSlot]?.find(o => o.val === val);
    if (altMatch) return altMatch;

    return catList[0] || { val: 'none', label: 'Polos Mentahan', shortLabel: 'Polos', icon: '✨', img: '', theme: 'natural' };
  }

  function computeCoupleMatchBanner() {
    const d = appData.wardrobe?.dudu || {};
    const b = appData.wardrobe?.bubu || {};
    const slots = ['hat', 'outfit', 'accs', 'shoes'];
    let exactMatches = 0;
    let themeMatches = 0;
    const themes = [];

    slots.forEach(s => {
      const dm = getItemMeta(s, d[s] || d[s === 'outfit' ? 'sweater' : s === 'shoes' ? 'coat' : s], 'dudu');
      const bm = getItemMeta(s, b[s] || b[s === 'outfit' ? 'sweater' : s === 'shoes' ? 'coat' : s], 'bubu');
      if (dm.val !== 'none' && dm.val === bm.val) exactMatches++;
      if (dm.theme !== 'natural' && dm.theme === bm.theme) themeMatches++;
      themes.push(dm.theme, bm.theme);
    });

    const sleepCount = themes.filter(t => t === 'sleep').length;
    const chicCount = themes.filter(t => t === 'chic').length;
    const summerCount = themes.filter(t => t === 'summer').length;
    const winterCount = themes.filter(t => t === 'winter').length;
    const naturalCount = themes.filter(t => t === 'natural').length;

    if (naturalCount >= 6) {
      return 'Bears Asli Mentahan! (Raw Cute Bears 🐻🐼✨)';
    }
    if (sleepCount >= 4) {
      return 'Piyama Tidur Berdua! (Sweet Sleepy Match 🌙💤✨)';
    }
    if (chicCount >= 4) {
      return 'Kencan Mewah Berdua! (Chic Date Match 🌹✨)';
    }
    if (summerCount >= 4) {
      return 'Liburan Tropis Serasi! (Summer Holiday Match 🏖️🌴✨)';
    }
    if (winterCount >= 4) {
      return 'Hangat di Musim Dingin! (Cozy Winter Match ❄️✨)';
    }
    if (exactMatches >= 2 || themeMatches >= 2) {
      return 'Pasangan Serasi! (Perfect Couple Match 💖✨)';
    }
    return 'Mix & Match Menggemaskan! (Cozy Playful Match 🧸💕)';
  }

  function applyLayerStyle(imgEl, slot, itemVal, char, mode) {
    if (!imgEl) return;
    const meta = getItemMeta(slot, itemVal, char);
    if (!meta || !meta.img || meta.val === 'none') {
      imgEl.style.display = 'none';
      imgEl.removeAttribute('src');
      return;
    }

    imgEl.src = meta.img;
    imgEl.style.display = 'block';

    let w = 39;
    let l = 30.5;
    let t = 62.5;

    if (char === 'dudu') {
      if (slot === 'hat') {
        if (meta.val === 'dudu_hat_bucket') { w = 44; l = 28; t = 34; }
        else if (meta.val === 'dudu_hat_sleep_beanie') { w = 39; l = 31; t = 31; }
        else { w = 38; l = 31; t = 36.5; }
      } else if (slot === 'accs') {
        if (meta.val === 'dudu_accs_eyemask') { w = 42; l = 29; t = 48.5; }
        else { w = 34; l = 33; t = 51.5; }
      } else if (slot === 'outfit') {
        if (meta.val === 'dudu_outfit_overalls') { w = 39; l = 30.5; t = 62.8; }
        else if (meta.val === 'dudu_outfit_pajamas') { w = 40; l = 30; t = 61.5; }
        else if (meta.val === 'dudu_outfit_nightshirt') { w = 41; l = 29.5; t = 61; }
        else if (meta.val === 'dudu_outfit_tuxedo') { w = 42; l = 29; t = 61; }
        else if (meta.val === 'dudu_outfit_cardigan') { w = 42; l = 29; t = 61; }
        else { w = 40; l = 30; t = 62; }
      } else if (slot === 'shoes') {
        w = 34; l = 33; t = 83.5;
      }
    } else {
      // Bubu
      if (slot === 'hat') {
        if (meta.val === 'bubu_hat_straw_hat' || meta.val === 'bubu_hat_straw_hat_2') { w = 44; l = 28; t = 32.5; }
        else if (meta.val === 'bubu_hat_nightcap') { w = 42; l = 29; t = 29.5; }
        else if (meta.val === 'bubu_hat_earflap') { w = 33; l = 33.5; t = 33; }
        else if (meta.val === 'bubu_accs_hair_bow') { w = 20; l = 48; t = 36; }
        else { w = 36; l = 32; t = 34.5; }
      } else if (slot === 'accs') {
        if (meta.val === 'bubu_accs_panda_mask') { w = 42; l = 29; t = 48; }
        else if (meta.val === 'bubu_accs_straw_bag') { w = 28; l = 17; t = 63; }
        else if (meta.val === 'bubu_accs_bear_satchel') { w = 25; l = 56; t = 63; }
        else { w = 36; l = 32; t = 50.5; }
      } else if (slot === 'outfit') {
        if (meta.val === 'bubu_outfit_ruffle_dress') { w = 40; l = 30; t = 63; }
        else if (meta.val === 'bubu_outfit_trench') { w = 41; l = 29.5; t = 61.5; }
        else { w = 39; l = 30.5; t = 62; }
      } else if (slot === 'shoes') {
        w = 35; l = 32.5; t = 83.5;
      }
    }

    if (mode === 'couple') {
      const coupleW = w / 2;
      const coupleL = (char === 'dudu') ? (l / 2) : (50 + (l / 2));
      imgEl.style.width = `${coupleW.toFixed(1)}%`;
      imgEl.style.left = `${coupleL.toFixed(1)}%`;
      imgEl.style.top = `${t.toFixed(1)}%`;
    } else {
      imgEl.style.width = `${w}%`;
      imgEl.style.left = `${l}%`;
      imgEl.style.top = `${t}%`;
    }
  }

  function renderWardrobeRoom() {
    if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
    if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
    if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };

    const duduBadge = document.getElementById('wardrobe-badge-dudu');
    const bubuBadge = document.getElementById('wardrobe-badge-bubu');
    const prevPresetBtn = document.getElementById('btn-wardrobe-prev-preset');
    const nextPresetBtn = document.getElementById('btn-wardrobe-next-preset');
    const matchCoupleBtn = document.getElementById('btn-wardrobe-match-couple');
    const undressAllBtn = document.getElementById('btn-wardrobe-undress-all');
    const viewDuduBtn = document.getElementById('btn-stage-view-dudu');
    const viewBubuBtn = document.getElementById('btn-stage-view-bubu');
    const viewCoupleBtn = document.getElementById('btn-stage-view-couple');
    const stageHitDudu = document.getElementById('wardrobe-stage-hit-dudu');
    const stageHitBubu = document.getElementById('wardrobe-stage-hit-bubu');
    const highScoreEl = document.getElementById('wardrobe-high-score');
    if (highScoreEl) highScoreEl.textContent = String(appData.miniGameHighScore || 420);

    const selectChar = (char) => {
      activeWardrobeChar = (char === 'bubu') ? 'bubu' : 'dudu';
      if (activeStageView !== 'couple') {
        activeStageView = activeWardrobeChar;
      }
      updateWardrobeTabs();
      window.duduAudio?.playPop?.(520);
    };

    if (duduBadge) duduBadge.onclick = () => selectChar('dudu');
    if (bubuBadge) bubuBadge.onclick = () => selectChar('bubu');

    if (viewDuduBtn) {
      viewDuduBtn.onclick = () => {
        activeStageView = 'dudu';
        activeWardrobeChar = 'dudu';
        updateWardrobeTabs();
        window.duduAudio?.playPop?.(500);
      };
    }
    if (viewBubuBtn) {
      viewBubuBtn.onclick = () => {
        activeStageView = 'bubu';
        activeWardrobeChar = 'bubu';
        updateWardrobeTabs();
        window.duduAudio?.playPop?.(500);
      };
    }
    if (viewCoupleBtn) {
      viewCoupleBtn.onclick = () => {
        activeStageView = 'couple';
        updateWardrobeTabs();
        window.duduAudio?.playPop?.(600);
      };
    }

    if (stageHitDudu) {
      stageHitDudu.onclick = () => {
        if (activeStageView === 'couple') {
          activeWardrobeChar = 'dudu';
          updateWardrobeTabs();
        }
        window.duduAudio?.playPop?.(650);
        showFeedbackToast('Dudu 🐻 siap didandani!');
      };
    }
    if (stageHitBubu) {
      stageHitBubu.onclick = () => {
        if (activeStageView === 'couple') {
          activeWardrobeChar = 'bubu';
          updateWardrobeTabs();
        }
        window.duduAudio?.playPop?.(650);
        showFeedbackToast('Bubu 🐼 siap didandani!');
      };
    }

    const applyPreset = (idx) => {
      activePresetIdx = (idx + COUPLE_OUTFIT_PRESETS.length) % COUPLE_OUTFIT_PRESETS.length;
      const preset = COUPLE_OUTFIT_PRESETS[activePresetIdx];
      appData.wardrobe.dudu = { ...preset.dudu };
      appData.wardrobe.bubu = { ...preset.bubu };
      saveState();
      updateWardrobeTabs();
      syncWardrobeToServer();
      window.duduAudio?.playPop?.(820);
      showFeedbackToast(`✨ Memakai set: "${preset.name}"!`);
    };

    if (prevPresetBtn) prevPresetBtn.onclick = () => applyPreset(activePresetIdx - 1);
    if (nextPresetBtn) nextPresetBtn.onclick = () => applyPreset(activePresetIdx + 1);
    if (matchCoupleBtn) matchCoupleBtn.onclick = () => applyPreset(activePresetIdx + 1);

    if (undressAllBtn) {
      undressAllBtn.onclick = () => {
        if (activeStageView === 'couple') {
          appData.wardrobe.dudu = { hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' };
          appData.wardrobe.bubu = { hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' };
          showFeedbackToast('Semua pakaian dilepas! 🐻🐼 Mentahan polos');
        } else {
          const char = (activeWardrobeChar === 'bubu') ? 'bubu' : 'dudu';
          appData.wardrobe[char] = { hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' };
          showFeedbackToast(`${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} kembali ke mentahan polos!`);
        }
        saveState();
        updateWardrobeTabs();
        syncWardrobeToServer();
        window.duduAudio?.playPop?.(400);
      };
    }

    document.querySelectorAll('.wardrobe-item-card').forEach(card => {
      card.onclick = () => {
        let itemType = card.getAttribute('data-type');
        if (itemType === 'sweater') itemType = 'outfit';
        if (itemType === 'coat') itemType = 'shoes';
        activeWardrobeSlot = itemType;

        const char = (activeWardrobeChar === 'bubu') ? 'bubu' : 'dudu';
        const catalog = WARDROBE_CATALOG[char]?.[activeWardrobeSlot] || [];
        if (catalog && catalog.length > 0) {
          if (!appData.wardrobe[char]) appData.wardrobe[char] = { ...defaultMockupData.wardrobe[char] };
          const currentVal = appData.wardrobe[char][activeWardrobeSlot] || appData.wardrobe[char][activeWardrobeSlot === 'outfit' ? 'sweater' : activeWardrobeSlot === 'shoes' ? 'coat' : activeWardrobeSlot];
          const curIdx = catalog.findIndex(o => o.val === currentVal);
          const nextOpt = catalog[(curIdx + 1) % catalog.length];
          appData.wardrobe[char][activeWardrobeSlot] = nextOpt.val;
          saveState();
          updateWardrobeTabs();
          syncWardrobeToServer();
          window.duduAudio?.playPop?.(750);
          showFeedbackToast(`${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} memakai ${nextOpt.label}! ${nextOpt.icon}`);
        }
      };
    });

    updateWardrobeTabs();

    const playMiniGameBtn = document.getElementById('btn-play-minigame');
    if (playMiniGameBtn) {
      playMiniGameBtn.onclick = () => startOutfitMatcherGame();
    }
  }

  function updateWardrobeTabs() {
    const isDudu = activeWardrobeChar !== 'bubu';
    const char = isDudu ? 'dudu' : 'bubu';
    activeWardrobeChar = char;

    if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
    if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
    if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };

    const duduBadge = document.getElementById('wardrobe-badge-dudu');
    const bubuBadge = document.getElementById('wardrobe-badge-bubu');
    const viewDuduBtn = document.getElementById('btn-stage-view-dudu');
    const viewBubuBtn = document.getElementById('btn-stage-view-bubu');
    const viewCoupleBtn = document.getElementById('btn-stage-view-couple');
    const stageArt = document.getElementById('wardrobe-stage-art');
    const stageEl = document.getElementById('wardrobe-stage');
    const duduLayers = document.getElementById('wardrobe-dudu-layers');
    const bubuLayers = document.getElementById('wardrobe-bubu-layers');
    const stageHitDudu = document.getElementById('wardrobe-stage-hit-dudu');
    const stageHitBubu = document.getElementById('wardrobe-stage-hit-bubu');

    // Wardrobe character badges
    if (duduBadge && bubuBadge) {
      if (isDudu) {
        duduBadge.className = 'px-2.5 py-1 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer';
        bubuBadge.className = 'px-2.5 py-1 rounded-full bg-surface-container text-primary button-press cursor-pointer';
      } else {
        bubuBadge.className = 'px-2.5 py-1 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer';
        duduBadge.className = 'px-2.5 py-1 rounded-full bg-surface-container text-primary button-press cursor-pointer';
      }
    }

    // View switcher buttons styling
    if (viewDuduBtn && viewBubuBtn && viewCoupleBtn) {
      const activeClass = 'px-2 py-0.5 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer shadow-xs';
      const inactiveClass = 'px-2 py-0.5 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 button-press cursor-pointer';
      viewDuduBtn.className = (activeStageView === 'dudu') ? activeClass : inactiveClass;
      viewBubuBtn.className = (activeStageView === 'bubu') ? activeClass : inactiveClass;
      viewCoupleBtn.className = (activeStageView === 'couple') ? activeClass : inactiveClass;
    }

    // Stage Background and Aspect Ratio
    if (stageArt && stageEl) {
      if (activeStageView === 'dudu') {
        stageArt.src = 'assets/mockup_art/wardrobe/stage_dudu_room.jpg';
        stageEl.className = 'relative w-full rounded-2xl overflow-hidden bg-stone-100 select-none shadow-inner aspect-[900/1006] transition-all duration-300';
      } else if (activeStageView === 'bubu') {
        stageArt.src = 'assets/mockup_art/wardrobe/stage_bubu_room.jpg';
        stageEl.className = 'relative w-full rounded-2xl overflow-hidden bg-stone-100 select-none shadow-inner aspect-[900/1006] transition-all duration-300';
      } else {
        stageArt.src = 'assets/mockup_art/wardrobe/stage_couple_room.jpg';
        stageEl.className = 'relative w-full rounded-2xl overflow-hidden bg-stone-100 select-none shadow-inner aspect-[1400/781] transition-all duration-300';
      }
    }

    // Hitboxes
    if (stageHitDudu && stageHitBubu) {
      if (activeStageView === 'couple') {
        stageHitDudu.style.cssText = 'top: 30%; left: 10%; width: 30%; height: 60%;';
        stageHitBubu.style.cssText = 'top: 30%; right: 10%; width: 30%; height: 60%;';
        stageHitDudu.style.display = 'block';
        stageHitBubu.style.display = 'block';
      } else if (activeStageView === 'dudu') {
        stageHitDudu.style.cssText = 'top: 30%; left: 25%; width: 50%; height: 60%;';
        stageHitDudu.style.display = 'block';
        stageHitBubu.style.display = 'none';
      } else {
        stageHitBubu.style.cssText = 'top: 30%; left: 25%; width: 50%; height: 60%;';
        stageHitBubu.style.display = 'block';
        stageHitDudu.style.display = 'none';
      }
    }

    // Overlay Layers Rendering
    const dOut = appData.wardrobe?.dudu || {};
    const bOut = appData.wardrobe?.bubu || {};

    const dHat = dOut.hat;
    const dOutfit = dOut.outfit || dOut.sweater;
    const dAccs = dOut.accs;
    const dShoes = dOut.shoes || dOut.coat;

    const bHat = bOut.hat;
    const bOutfit = bOut.outfit || bOut.sweater;
    const bAccs = bOut.accs;
    const bShoes = bOut.shoes || bOut.coat;

    if (activeStageView === 'couple') {
      if (duduLayers) duduLayers.style.display = 'block';
      if (bubuLayers) bubuLayers.style.display = 'block';
      applyLayerStyle(document.getElementById('layer-dudu-shoes'), 'shoes', dShoes, 'dudu', 'couple');
      applyLayerStyle(document.getElementById('layer-dudu-outfit'), 'outfit', dOutfit, 'dudu', 'couple');
      applyLayerStyle(document.getElementById('layer-dudu-accs'), 'accs', dAccs, 'dudu', 'couple');
      applyLayerStyle(document.getElementById('layer-dudu-hat'), 'hat', dHat, 'dudu', 'couple');

      applyLayerStyle(document.getElementById('layer-bubu-shoes'), 'shoes', bShoes, 'bubu', 'couple');
      applyLayerStyle(document.getElementById('layer-bubu-outfit'), 'outfit', bOutfit, 'bubu', 'couple');
      applyLayerStyle(document.getElementById('layer-bubu-accs'), 'accs', bAccs, 'bubu', 'couple');
      applyLayerStyle(document.getElementById('layer-bubu-hat'), 'hat', bHat, 'bubu', 'couple');
    } else if (activeStageView === 'dudu') {
      if (duduLayers) duduLayers.style.display = 'block';
      if (bubuLayers) bubuLayers.style.display = 'none';
      applyLayerStyle(document.getElementById('layer-dudu-shoes'), 'shoes', dShoes, 'dudu', 'solo');
      applyLayerStyle(document.getElementById('layer-dudu-outfit'), 'outfit', dOutfit, 'dudu', 'solo');
      applyLayerStyle(document.getElementById('layer-dudu-accs'), 'accs', dAccs, 'dudu', 'solo');
      applyLayerStyle(document.getElementById('layer-dudu-hat'), 'hat', dHat, 'dudu', 'solo');
    } else {
      if (duduLayers) duduLayers.style.display = 'none';
      if (bubuLayers) bubuLayers.style.display = 'block';
      applyLayerStyle(document.getElementById('layer-bubu-shoes'), 'shoes', bShoes, 'bubu', 'solo');
      applyLayerStyle(document.getElementById('layer-bubu-outfit'), 'outfit', bOutfit, 'bubu', 'solo');
      applyLayerStyle(document.getElementById('layer-bubu-accs'), 'accs', bAccs, 'bubu', 'solo');
      applyLayerStyle(document.getElementById('layer-bubu-hat'), 'hat', bHat, 'bubu', 'solo');
    }

    // Match text
    const matchTextEl = document.getElementById('wardrobe-match-text');
    if (matchTextEl) {
      matchTextEl.textContent = computeCoupleMatchBanner();
    }

    // Category Cards UI for active character
    const currentOutfit = appData.wardrobe[char] || {};
    const equippedLabels = [];

    document.querySelectorAll('.wardrobe-item-card').forEach(card => {
      let type = card.getAttribute('data-type');
      if (type === 'sweater') type = 'outfit';
      if (type === 'coat') type = 'shoes';
      const catalog = WARDROBE_CATALOG[char]?.[type] || [];
      const curVal = currentOutfit[type] || currentOutfit[type === 'outfit' ? 'sweater' : type === 'shoes' ? 'coat' : type];
      const activeIdx = Math.max(0, catalog.findIndex(o => o.val === curVal));
      const activeOpt = catalog[activeIdx] || catalog[0] || { val: 'none', label: 'Polos', shortLabel: 'Polos', icon: '🐾', img: '' };
      const isSelectedSlot = type === activeWardrobeSlot;

      card.classList.toggle('border-2', isSelectedSlot);
      card.classList.toggle('border-[#8D5B4C]', isSelectedSlot);
      card.classList.toggle('shadow-sm', isSelectedSlot);

      if (activeOpt.val !== 'none') {
        equippedLabels.push(`${activeOpt.icon} ${activeOpt.shortLabel || activeOpt.label}`);
      }

      const imgEl = card.querySelector('.wardrobe-card-img');
      const iconSpan = card.querySelector('.wardrobe-card-icon');
      const labelSpan = card.querySelector('.wardrobe-card-label');
      const idxSpan = card.querySelector('.wardrobe-card-idx');

      if (labelSpan) labelSpan.textContent = activeOpt.shortLabel || activeOpt.label;
      if (idxSpan) idxSpan.textContent = `${activeIdx + 1}/${catalog.length}`;

      if (activeOpt.img && imgEl) {
        imgEl.src = activeOpt.img;
        imgEl.style.display = 'block';
        if (iconSpan) iconSpan.classList.add('hidden');
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (iconSpan) {
          iconSpan.classList.remove('hidden');
          iconSpan.textContent = activeOpt.icon || (char === 'bubu' ? '🐼' : '🐻');
        }
      }
    });

    // Populate direct item picker pills/chips for activeWardrobeSlot
    const slotPicker = document.getElementById('wardrobe-slot-picker');
    if (slotPicker) {
      const catalog = WARDROBE_CATALOG[char]?.[activeWardrobeSlot] || [];
      const curVal = currentOutfit[activeWardrobeSlot] || currentOutfit[activeWardrobeSlot === 'outfit' ? 'sweater' : activeWardrobeSlot === 'shoes' ? 'coat' : activeWardrobeSlot];

      slotPicker.innerHTML = catalog.map(opt => {
        const active = opt.val === curVal;
        const isNone = opt.val === 'none';
        return `
          <button type="button" data-pick-val="${opt.val}" class="wardrobe-slot-chip px-2.5 py-1.5 rounded-2xl text-[11px] font-bold shrink-0 flex items-center gap-2 cursor-pointer button-press transition-all border ${active ? 'bg-[#8D5B4C] text-white shadow-xs border-[#78493C]' : 'bg-[#FAF5EE] dark:bg-stone-700 text-[#4A3222] dark:text-stone-200 border-[#E8DACB] dark:border-stone-600 hover:border-[#8D5B4C]'}">
            ${opt.img ? `<img src="${opt.img}" class="w-7 h-7 object-contain drop-shadow-xs" alt="${opt.shortLabel}" />` : `<span class="text-lg">${opt.icon}</span>`}
            <span class="truncate max-w-[120px]">${isNone ? '❌ Lepas / Polos' : opt.label}</span>
          </button>
        `;
      }).join('');

      slotPicker.querySelectorAll('button[data-pick-val]').forEach(btn => {
        btn.onclick = () => {
          const val = btn.getAttribute('data-pick-val');
          const opt = catalog.find(o => o.val === val);
          if (opt) {
            appData.wardrobe[char][activeWardrobeSlot] = opt.val;
            saveState();
            updateWardrobeTabs();
            syncWardrobeToServer();
            window.duduAudio?.playPop?.(780);
            if (opt.val === 'none') {
              showFeedbackToast(`${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} melepas pakaian!`);
            } else {
              showFeedbackToast(`${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} memakai ${opt.label}! ${opt.icon}`);
            }
          }
        };
      });
    }

    const summaryEl = document.getElementById('wardrobe-equipped-summary');
    if (summaryEl) {
      const charLabel = isDudu ? 'Dudu 🐻' : 'Bubu 🐼';
      summaryEl.textContent = `${charLabel}: ${equippedLabels.length > 0 ? equippedLabels.join(' • ') : 'Polos Mentahan 🐾'}`;
    }
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

    const deck = [...cardItems, ...cardItems].sort(() => Math.random() - 0.5);
    board.innerHTML = '';

    let timeLeft = 45;
    if (timeEl) timeEl.textContent = `${timeLeft}s`;
    if (gameTimer) clearInterval(gameTimer);

    deck.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'flip-card aspect-square cursor-pointer';
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front bg-[#8D5B4C] rounded-2xl flex items-center justify-center text-white font-bold text-xl plush-shadow border border-[#A66F5E]">
            🐾
          </div>
          <div class="flip-card-back bg-[#FAF4ED] dark:bg-stone-700 rounded-2xl flex flex-col items-center justify-center p-2 plush-shadow border border-[#E8DACB] dark:border-stone-600">
            <span class="text-2xl">${item.icon}</span>
            <span class="text-[9px] font-bold text-[#8D5B4C] dark:text-stone-200 mt-1 truncate">${item.label}</span>
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
            gameMatchedPairs++;
            gameScore += 100;
            if (scoreEl) scoreEl.textContent = String(gameScore);
            gameFlippedCards = [];
            window.duduAudio?.playPop?.(900);

            if (gameMatchedPairs === cardItems.length) {
              clearInterval(gameTimer);
              const bonusScore = gameScore + (timeLeft * 5);
              if (bonusScore > (appData.miniGameHighScore || 0)) {
                appData.miniGameHighScore = bonusScore;
                saveState();
                syncWardrobeToServer();
                const hsEl = document.getElementById('wardrobe-high-score');
                if (hsEl) hsEl.textContent = String(bonusScore);
              }
              setTimeout(() => {
                showFeedbackToast(`🎉 All pairs matched! Score: ${bonusScore} 🐻❤️`);
                modal.classList.add('hidden');
              }, 400);
            }
          } else {
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
        updateNotificationBellBadge();
        window.DuduChatSocket?.sendSaveNote?.(newNote);
        sendSaveRest('/api/notes', newNote);
        closeSheet('modal-write-love-note');
        document.getElementById('input-love-note-body').value = '';
        showFeedbackToast('Love note sent to Honey! 💌');
        window.duduAudio?.playPop?.(850);
      };
    }

    // 2. Add Polaroid Modal
    let activeCustomPolaroidImage = null;
    const btnUploadPol = document.getElementById('btn-upload-polaroid-file');
    const filePolInput = document.getElementById('input-polaroid-file');
    const previewBox = document.getElementById('polaroid-custom-preview-box');
    const previewImg = document.getElementById('polaroid-custom-preview-img');
    const btnRemoveCustom = document.getElementById('btn-remove-polaroid-custom');

    const clearCustomPolaroid = () => {
      activeCustomPolaroidImage = null;
      if (filePolInput) filePolInput.value = '';
      if (previewBox) previewBox.classList.add('hidden');
      if (previewImg) previewImg.src = '';
    };

    if (btnUploadPol && filePolInput) {
      btnUploadPol.onclick = () => filePolInput.click();
      filePolInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEv) => {
          const rawDataUrl = loadEv.target.result;
          const img = new Image();
          img.onload = () => {
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            activeCustomPolaroidImage = canvas.toDataURL('image/jpeg', 0.82);
            if (previewImg) previewImg.src = activeCustomPolaroidImage;
            if (previewBox) previewBox.classList.remove('hidden');
            showFeedbackToast('Custom photo selected! 📸');
          };
          img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
      };
    }

    if (btnRemoveCustom) {
      btnRemoveCustom.onclick = () => clearCustomPolaroid();
    }

    const btnAddPol = document.getElementById('btn-add-polaroid');
    if (btnAddPol) {
      btnAddPol.onclick = () => {
        const titleInput = document.getElementById('input-polaroid-title');
        const dateInput = document.getElementById('input-polaroid-date');
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = '';
        clearCustomPolaroid();
        openSheet('modal-add-polaroid');
      };
    }
    const closeAddPol = document.getElementById('btn-close-add-polaroid');
    if (closeAddPol) {
      closeAddPol.onclick = () => {
        clearCustomPolaroid();
        closeSheet('modal-add-polaroid');
      };
    }

    const submitPolBtn = document.getElementById('btn-submit-polaroid');
    if (submitPolBtn) {
      submitPolBtn.onclick = () => {
        const title = document.getElementById('input-polaroid-title')?.value?.trim() || 'Cozy Date';
        const date = document.getElementById('input-polaroid-date')?.value?.trim() || 'Today';
        const artSelect = document.getElementById('select-polaroid-art');
        const image = activeCustomPolaroidImage || artSelect?.value || 'assets/mockup_art/polaroid_picnic.png';

        const newPol = {
          id: 'pol_' + Date.now(),
          title: title,
          date: date,
          image: image,
          tape: 'washi-tape-peach',
          rotate: Number((Math.random() * 4 - 2).toFixed(2))
        };

        appData.polaroids.unshift(newPol);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendSavePolaroid?.(newPol);
        sendSaveRest('/api/memories/polaroids', newPol);
        clearCustomPolaroid();
        closeSheet('modal-add-polaroid');
        showFeedbackToast('Polaroid added to jar! 📸');
        window.duduAudio?.playPop?.(750);
      };
    }

    // 2b. Add Milestone Modal
    const btnAddMs = document.getElementById('btn-add-milestone');
    if (btnAddMs) {
      btnAddMs.onclick = () => {
        const t = document.getElementById('input-milestone-title');
        const d = document.getElementById('input-milestone-date');
        const desc = document.getElementById('input-milestone-desc');
        if (t) t.value = '';
        if (d) d.value = '';
        if (desc) desc.value = '';
        openSheet('modal-add-milestone');
      };
    }
    const closeAddMs = document.getElementById('btn-close-add-milestone');
    if (closeAddMs) closeAddMs.onclick = () => closeSheet('modal-add-milestone');

    const submitMsBtn = document.getElementById('btn-submit-milestone');
    if (submitMsBtn) {
      submitMsBtn.onclick = () => {
        const title = document.getElementById('input-milestone-title')?.value?.trim();
        if (!title) {
          showFeedbackToast('Please enter a milestone title! ✨');
          return;
        }
        const date = document.getElementById('input-milestone-date')?.value?.trim() || 'Today';
        const desc = document.getElementById('input-milestone-desc')?.value?.trim() || 'a special memory together ♡';

        const newMs = {
          id: 'ms_' + Date.now(),
          title,
          date,
          desc
        };

        appData.milestones.push(newMs);
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendSaveMilestone?.(newMs);
        sendSaveRest('/api/memories/milestones', newMs);
        closeSheet('modal-add-milestone');
        showFeedbackToast('Milestone added to timeline! ⌛✨');
        window.duduAudio?.playPop?.(780);
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

        const customIcon = document.getElementById('input-cal-custom-icon')?.value?.trim();
        const iconEl = document.querySelector('input[name="cal-icon"]:checked');
        const icon = customIcon || (iconEl ? iconEl.value : '❤️');

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
        renderOurSpaceHome();
        renderCalendarDayModalEvents();
        window.DuduChatSocket?.sendSaveCalendarEvent?.(newEvent);
        sendSaveRest('/api/calendar', newEvent);
        if (input) input.value = '';
        const customIconEl = document.getElementById('input-cal-custom-icon');
        if (customIconEl) customIconEl.value = '';
        showFeedbackToast('Event added to calendar! 🗓️✨');
        window.duduAudio?.playPop?.(750);
      };
    }

    // 5. View Love Note Modal
    const closeViewNote = document.getElementById('btn-close-view-note');
    if (closeViewNote) closeViewNote.onclick = () => closeSheet('modal-view-love-note');

    const dismissViewNote = document.getElementById('btn-dismiss-view-note');
    if (dismissViewNote) dismissViewNote.onclick = () => closeSheet('modal-view-love-note');

    const favViewNote = document.getElementById('btn-fav-view-note');
    if (favViewNote) {
      favViewNote.onclick = () => {
        if (!activeViewingNote) return;
        activeViewingNote.isFavorite = !activeViewingNote.isFavorite;
        favViewNote.innerHTML = activeViewingNote.isFavorite ? '<span>♥ Favorited</span>' : '<span>♡ Favorite</span>';
        saveState();
        renderLoveNotes();
        window.DuduChatSocket?.sendSaveNote?.(activeViewingNote);
        sendSaveRest('/api/notes', activeViewingNote);
        showFeedbackToast(activeViewingNote.isFavorite ? 'Added to Favorites ♥' : 'Removed from Favorites');
      };
    }

    const delViewNote = document.getElementById('btn-delete-view-note');
    if (delViewNote) {
      delViewNote.onclick = () => {
        if (!activeViewingNote) return;
        const id = activeViewingNote.id;
        appData.notes = appData.notes.filter(n => n.id !== id);
        saveState();
        renderLoveNotes();
        updateNotificationBellBadge();
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

    const editCaptionTrigger = document.getElementById('btn-edit-polaroid-caption');
    const editViewPol = document.getElementById('btn-edit-view-polaroid');
    const cancelEditPol = document.getElementById('btn-cancel-polaroid-caption');
    const saveEditPol = document.getElementById('btn-save-polaroid-caption');
    const displayBox = document.getElementById('polaroid-caption-display');
    const editBox = document.getElementById('polaroid-caption-edit-box');
    const captionInput = document.getElementById('input-edit-polaroid-caption');

    const enterEditMode = () => {
      if (!activeViewingPolaroid) return;
      if (displayBox) displayBox.classList.add('hidden');
      if (editBox) editBox.classList.remove('hidden');
      if (captionInput) {
        captionInput.value = activeViewingPolaroid.title || '';
        captionInput.focus();
        captionInput.select();
      }
      window.duduAudio?.playPop?.(480);
    };

    const exitEditMode = () => {
      if (displayBox) displayBox.classList.remove('hidden');
      if (editBox) editBox.classList.add('hidden');
    };

    if (editCaptionTrigger) editCaptionTrigger.onclick = enterEditMode;
    if (editViewPol) editViewPol.onclick = enterEditMode;
    if (cancelEditPol) cancelEditPol.onclick = exitEditMode;

    if (saveEditPol) {
      saveEditPol.onclick = () => {
        if (!activeViewingPolaroid) return;
        const newCaption = captionInput?.value?.trim();
        if (!newCaption) {
          showFeedbackToast('Please enter a caption! 📸');
          return;
        }
        activeViewingPolaroid.title = newCaption;
        const polInList = appData.polaroids.find(p => p.id === activeViewingPolaroid.id);
        if (polInList) polInList.title = newCaption;
        saveState();
        renderMemoryJar();
        window.DuduChatSocket?.sendSavePolaroid?.(activeViewingPolaroid);
        sendSaveRest('/api/memories/polaroids', activeViewingPolaroid);

        const titleEl = document.getElementById('modal-polaroid-title');
        if (titleEl) titleEl.textContent = newCaption;
        exitEditMode();
        showFeedbackToast('Polaroid caption updated! 📸✨');
        window.duduAudio?.playPop?.(640);
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

    const annivInput = document.getElementById('input-anniversary-iso');
    annivInput?.addEventListener('input', () => {
      const previewEl = document.getElementById('anniversary-preview-days');
      const val = annivInput.value?.trim();
      if (previewEl && val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        previewEl.textContent = `Together for ${getDaysTogether(val)} sweet days ♡`;
      }
    });

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

    // Backdrop click & Escape key to close modals (Accessibility R-32)
    const modalIds = [
      'modal-write-love-note',
      'modal-add-polaroid',
      'modal-add-milestone',
      'modal-minigame',
      'modal-calendar-day',
      'modal-add-planner',
      'modal-view-love-note',
      'modal-view-polaroid',
      'modal-edit-status',
      'modal-adjust-battery',
      'modal-edit-anniversary',
      'modal-chat-settings'
    ];
    modalIds.forEach(id => {
      const m = document.getElementById(id);
      m?.addEventListener('click', (e) => {
        if (e.target === m) {
          if (id === 'modal-minigame' && gameTimer) clearInterval(gameTimer);
          closeSheet(id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalIds.forEach(id => {
          const m = document.getElementById(id);
          if (m && !m.classList.contains('hidden')) {
            if (id === 'modal-minigame' && gameTimer) clearInterval(gameTimer);
            closeSheet(id);
          }
        });
      }
    });

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

    const chatTitleEl = document.getElementById('chat-partner-name');
    if (chatTitleEl) chatTitleEl.textContent = isDudu ? 'Bubu 🐼❤️' : 'Dudu 🐻❤️';

    window.DuduChatUI?.refreshPresence?.();
  }

  function openStatusEditModal() {
    const isDudu = appData.userRole === 'dudu';
    const current = isDudu ? appData.statuses.dudu : appData.statuses.bubu;
    const inputEl = document.getElementById('input-partner-status');
    if (inputEl) {
      inputEl.value = current || '';
      inputEl.placeholder = isDudu ? "What's Dudu doing? 💭" : "What's Bubu doing? 🐼";
    }
    openSheet('modal-edit-status');
  }

  function openAnniversaryModal() {
    const inputEl = document.getElementById('input-anniversary-iso');
    const previewEl = document.getElementById('anniversary-preview-days');
    if (inputEl) inputEl.value = appData.anniversaryDate || '2025-11-04';
    if (previewEl) previewEl.textContent = `Together for ${getDaysTogether()} sweet days ♡`;
    openSheet('modal-edit-anniversary');
  }

  function showPolaroidPreviewModal(p, startInEdit = false) {
    activeViewingPolaroid = p;
    const imgEl = document.getElementById('modal-polaroid-img');
    const titleEl = document.getElementById('modal-polaroid-title');
    const dateEl = document.getElementById('modal-polaroid-date');
    if (imgEl) imgEl.src = p.image;
    if (titleEl) titleEl.textContent = p.title;
    if (dateEl) dateEl.textContent = p.date;

    const displayBox = document.getElementById('polaroid-caption-display');
    const editBox = document.getElementById('polaroid-caption-edit-box');
    const captionInput = document.getElementById('input-edit-polaroid-caption');

    if (startInEdit) {
      if (displayBox) displayBox.classList.add('hidden');
      if (editBox) editBox.classList.remove('hidden');
      if (captionInput) {
        captionInput.value = p.title || '';
        setTimeout(() => {
          captionInput.focus();
          captionInput.select();
        }, 150);
      }
    } else {
      if (displayBox) displayBox.classList.remove('hidden');
      if (editBox) editBox.classList.add('hidden');
    }

    openSheet('modal-view-polaroid');
  }

  function showNoteDetailsModal(note) {
    activeViewingNote = note;
    const senderEl = document.getElementById('modal-view-note-sender');
    const timeEl = document.getElementById('modal-view-note-time');
    const bodyEl = document.getElementById('modal-view-note-body');
    const favBtn = document.getElementById('btn-fav-view-note');
    if (senderEl) senderEl.textContent = `Love Note from ${note.sender}`;
    if (timeEl) timeEl.textContent = `${note.date || 'Today'} • ${note.time || ''}`;
    if (bodyEl) bodyEl.textContent = `"${note.body}"`;
    if (favBtn) favBtn.innerHTML = note.isFavorite ? '<span>♥ Favorited</span>' : '<span>♡ Favorite</span>';
    openSheet('modal-view-love-note');
  }

  let toastTimer = null;
  function showFeedbackToast(msg) {
    const toast = document.getElementById('feedback-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
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
    getDaysTogether,
    updateNotificationBellBadge,
    renderLoveNotes,
    renderOurCalendar
  };
  window.duduMockup = window.DuduMockup;
  window.showFeedbackToast = showFeedbackToast;
  window.showToast = showFeedbackToast;

})();
