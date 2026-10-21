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
        { val: 'none', label: 'Tanpa Topi', label_en: 'No Hat', label_id: 'Tanpa Topi', shortLabel: 'Polos', shortLabel_en: 'None', shortLabel_id: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_hat_newsboy', label: 'Topi Newsboy Tweed', label_en: 'Tweed Newsboy Cap', label_id: 'Topi Newsboy Tweed', shortLabel: 'Newsboy', shortLabel_en: 'Newsboy', shortLabel_id: 'Newsboy', icon: '🎩', img: 'assets/mockup_art/wardrobe/items/dudu_hat_newsboy.png', theme: 'vintage' },
        { val: 'dudu_hat_pompom', label: 'Kupluk Rajut Pom-Pom', label_en: 'Pompom Knit Beanie', label_id: 'Kupluk Rajut Pom-Pom', shortLabel: 'Pom-Pom', shortLabel_en: 'Pom-Pom', shortLabel_id: 'Pom-Pom', icon: '🧶', img: 'assets/mockup_art/wardrobe/items/dudu_hat_pompom.png', theme: 'cozy' },
        { val: 'dudu_hat_plaid_beret', label: 'Topi Beret Kotak Tweed', label_en: 'Plaid Tweed Beret', label_id: 'Topi Beret Kotak Tweed', shortLabel: 'Beret Kotak', shortLabel_en: 'Plaid Beret', shortLabel_id: 'Beret Kotak', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/dudu_hat_plaid_beret.png', theme: 'chic' },
        { val: 'dudu_hat_beret', label: 'Topi Beret Cokelat Polos', label_en: 'Classic Brown Beret', label_id: 'Topi Beret Cokelat Polos', shortLabel: 'Beret', shortLabel_en: 'Beret', shortLabel_id: 'Beret', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/dudu_hat_beret.png', theme: 'chic' },
        { val: 'dudu_hat_earmuffs', label: 'Earmuffs Bulu Hangat', label_en: 'Warm Fluffy Earmuffs', label_id: 'Earmuffs Bulu Hangat', shortLabel: 'Earmuffs', shortLabel_en: 'Earmuffs', shortLabel_id: 'Earmuffs', icon: '🎧', img: 'assets/mockup_art/wardrobe/items/dudu_hat_earmuffs.png', theme: 'winter' }
      ],
      outfit: [
        { val: 'none', label: 'Tanpa Baju (Mentahan)', label_en: 'No Outfit (Raw Base)', label_id: 'Tanpa Baju (Mentahan)', shortLabel: 'Polos', shortLabel_en: 'Raw', shortLabel_id: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_outfit_overalls', label: 'Baju Kodok Denim Biru', label_en: 'Denim Dungarees', label_id: 'Baju Kodok Denim Biru', shortLabel: 'Overalls', shortLabel_en: 'Overalls', shortLabel_id: 'Overalls', icon: '👖', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_overalls.png', theme: 'casual' },
        { val: 'dudu_outfit_cable_sweater', label: 'Sweater Rajut Nordic', label_en: 'Nordic Cable Sweater', label_id: 'Sweater Rajut Nordic', shortLabel: 'Sweater', shortLabel_en: 'Sweater', shortLabel_id: 'Sweater', icon: '🧶', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_cable_sweater.png', theme: 'cozy' },
        { val: 'dudu_outfit_trench', label: 'Mantel Trench Klasik Elegan', label_en: 'Classic Trench Coat', label_id: 'Mantel Trench Klasik Elegan', shortLabel: 'Trench', shortLabel_en: 'Trench', shortLabel_id: 'Trench', icon: '🧥', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_trench.png', theme: 'chic' },
        { val: 'dudu_outfit_varsity', label: 'Jaket Varsity Cokelat Sporty', label_en: 'Varsity Baseball Jacket', label_id: 'Jaket Varsity Cokelat Sporty', shortLabel: 'Varsity', shortLabel_en: 'Varsity', shortLabel_id: 'Varsity', icon: '⚾', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_varsity.png', theme: 'casual' },
        { val: 'dudu_outfit_shorts', label: 'Celana Corduroy Vintage', label_en: 'Vintage Corduroy Shorts', label_id: 'Celana Corduroy Vintage', shortLabel: 'Shorts', shortLabel_en: 'Shorts', shortLabel_id: 'Shorts', icon: '🩳', img: 'assets/mockup_art/wardrobe/items/dudu_outfit_shorts.png', theme: 'summer' }
      ],
      accs: [
        { val: 'none', label: 'Tanpa Aksesoris', label_en: 'No Accessories', label_id: 'Tanpa Aksesoris', shortLabel: 'Polos', shortLabel_en: 'None', shortLabel_id: 'Polos', icon: '🐻', img: '', theme: 'natural' },
        { val: 'dudu_accs_sunglasses', label: 'Kacamata Hitam Keren', label_en: 'Cool Dark Sunglasses', label_id: 'Kacamata Hitam Keren', shortLabel: 'Sunglasses', shortLabel_en: 'Sunglasses', shortLabel_id: 'Sunglasses', icon: '🕶️', img: 'assets/mockup_art/wardrobe/items/dudu_accs_sunglasses.png', theme: 'chic' },
        { val: 'dudu_accs_satchel', label: 'Tas Selempang Bulat Kulit', label_en: 'Round Leather Satchel', label_id: 'Tas Selempang Bulat Kulit', shortLabel: 'Satchel', shortLabel_en: 'Satchel', shortLabel_id: 'Satchel', icon: '👜', img: 'assets/mockup_art/wardrobe/items/dudu_accs_satchel.png', theme: 'vintage' },
        { val: 'dudu_accs_crossbody', label: 'Tas Bahu Kulit Cokelat', label_en: 'Crossbody Messenger Bag', label_id: 'Tas Bahu Kulit Cokelat', shortLabel: 'Crossbody', shortLabel_en: 'Crossbody', shortLabel_id: 'Crossbody', icon: '👝', img: 'assets/mockup_art/wardrobe/items/dudu_accs_crossbody.png', theme: 'chic' }
      ],
      shoes: [
        { val: 'none', label: 'Tanpa Alas Kaki', label_en: 'Barefoot', label_id: 'Tanpa Alas Kaki', shortLabel: 'Nyeker', shortLabel_en: 'Barefoot', shortLabel_id: 'Nyeker', icon: '🐾', img: '', theme: 'natural' },
        { val: 'dudu_shoes_sneakers', label: 'Sepatu Kets Sneakers Cokelat', label_en: 'Brown Lace Sneakers', label_id: 'Sepatu Kets Sneakers Cokelat', shortLabel: 'Sneakers', shortLabel_en: 'Sneakers', shortLabel_id: 'Sneakers', icon: '👟', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_sneakers.png', theme: 'casual' },
        { val: 'dudu_shoes_winter_boots', label: 'Sepatu Boot Musim Dingin', label_en: 'Warm Winter Boots', label_id: 'Sepatu Boot Musim Dingin', shortLabel: 'Winter Boots', shortLabel_en: 'Boots', shortLabel_id: 'Winter Boots', icon: '🥾', img: 'assets/mockup_art/wardrobe/items/dudu_shoes_winter_boots.png', theme: 'winter' }
      ]
    },
    bubu: {
      hat: [
        { val: 'none', label: 'Tanpa Topi', label_en: 'No Hat', label_id: 'Tanpa Topi', shortLabel: 'Polos', shortLabel_en: 'None', shortLabel_id: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_hat_artist_beret', label: 'Topi Beret Bunga Manis', label_en: 'Floral Artist Beret', label_id: 'Topi Beret Bunga Manis', shortLabel: 'Beret Seni', shortLabel_en: 'Beret', shortLabel_id: 'Beret Seni', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/bubu_hat_artist_beret.png', theme: 'chic' },
        { val: 'bubu_hat_earmuffs', label: 'Earmuffs Bulu Pom-Pom', label_en: 'Fluffy Pompom Earmuffs', label_id: 'Earmuffs Bulu Pom-Pom', shortLabel: 'Earmuffs', shortLabel_en: 'Earmuffs', shortLabel_id: 'Earmuffs', icon: '🎧', img: 'assets/mockup_art/wardrobe/items/bubu_hat_earmuffs.png', theme: 'winter' },
        { val: 'bubu_hat_straw_hat', label: 'Topi Jerami Pita Cokelat', label_en: 'Straw Sun Hat with Bow', label_id: 'Topi Jerami Pita Cokelat', shortLabel: 'Topi Jerami', shortLabel_en: 'Straw Hat', shortLabel_id: 'Topi Jerami', icon: '👒', img: 'assets/mockup_art/wardrobe/items/bubu_hat_straw_hat.png', theme: 'summer' }
      ],
      outfit: [
        { val: 'none', label: 'Tanpa Baju (Mentahan)', label_en: 'No Outfit (Raw Base)', label_id: 'Tanpa Baju (Mentahan)', shortLabel: 'Polos', shortLabel_en: 'Raw', shortLabel_id: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_outfit_floral_dress', label: 'Dress Bunga Musim Panas', label_en: 'Floral Summer Dress', label_id: 'Dress Bunga Musim Panas', shortLabel: 'Floral Dress', shortLabel_en: 'Floral', shortLabel_id: 'Floral Dress', icon: '🌸', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_floral_dress.png', theme: 'summer' },
        { val: 'bubu_outfit_maid_dress', label: 'Gaun Celemek Maid Pink', label_en: 'Pink Maid Apron Dress', label_id: 'Gaun Celemek Maid Pink', shortLabel: 'Maid Dress', shortLabel_en: 'Maid Dress', shortLabel_id: 'Maid Dress', icon: '🎀', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_maid_dress.png', theme: 'chic' },
        { val: 'bubu_outfit_trench', label: 'Mantel Trench Klasik Elegan', label_en: 'Classic Trench Coat', label_id: 'Mantel Trench Klasik Elegan', shortLabel: 'Trench', shortLabel_en: 'Trench', shortLabel_id: 'Trench', icon: '🧥', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_trench.png', theme: 'chic' },
        { val: 'bubu_outfit_sweater_skirt', label: 'Sweater Rajut & Rok Lipit', label_en: 'Knit Sweater & Pleated Skirt', label_id: 'Sweater Rajut & Rok Lipit', shortLabel: 'Sweater & Rok', shortLabel_en: 'Sweater', shortLabel_id: 'Sweater & Rok', icon: '🧶', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_sweater_skirt.png', theme: 'cozy' },
        { val: 'bubu_outfit_overalls', label: 'Baju Kodok Denim Biru', label_en: 'Denim Dungarees', label_id: 'Baju Kodok Denim Biru', shortLabel: 'Overalls', shortLabel_en: 'Overalls', shortLabel_id: 'Overalls', icon: '👖', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_overalls.png', theme: 'casual' },
        { val: 'bubu_outfit_artist_apron', label: 'Celemek Lukis Artistik', label_en: 'Paint Splatter Apron Pinafore', label_id: 'Celemek Lukis Artistik', shortLabel: 'Artist Apron', shortLabel_en: 'Apron', shortLabel_id: 'Artist Apron', icon: '🎨', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_artist_apron.png', theme: 'chic' },
        { val: 'bubu_outfit_cardigan', label: 'Kardigan Rajut Merah Muda', label_en: 'Pink Cable Cardigan', label_id: 'Kardigan Rajut Merah Muda', shortLabel: 'Kardigan', shortLabel_en: 'Cardigan', shortLabel_id: 'Kardigan', icon: '🧣', img: 'assets/mockup_art/wardrobe/items/bubu_outfit_cardigan.png', theme: 'cozy' }
      ],
      accs: [
        { val: 'none', label: 'Tanpa Aksesoris', label_en: 'No Accessories', label_id: 'Tanpa Aksesoris', shortLabel: 'Polos', shortLabel_en: 'None', shortLabel_id: 'Polos', icon: '🐼', img: '', theme: 'natural' },
        { val: 'bubu_accs_heart_glasses', label: 'Kacamata Hati Merah Muda', label_en: 'Pink Heart Sunglasses', label_id: 'Kacamata Hati Merah Muda', shortLabel: 'Kacamata Hati', shortLabel_en: 'Heart Shades', shortLabel_id: 'Kacamata Hati', icon: '💖', img: 'assets/mockup_art/wardrobe/items/bubu_accs_heart_glasses.png', theme: 'chic' },
        { val: 'bubu_accs_bear_satchel', label: 'Tas Selempang Beruang Lucu', label_en: 'Cute Bear Sling Bag', label_id: 'Tas Selempang Beruang Lucu', shortLabel: 'Tas Beruang', shortLabel_en: 'Bear Bag', shortLabel_id: 'Tas Beruang', icon: '👝', img: 'assets/mockup_art/wardrobe/items/bubu_accs_bear_satchel.png', theme: 'cozy' },
        { val: 'bubu_accs_heart_bag', label: 'Tas Selempang Hati Merah Muda', label_en: 'Pink Heart Crossbody Bag', label_id: 'Tas Selempang Hati Merah Muda', shortLabel: 'Tas Hati', shortLabel_en: 'Heart Bag', shortLabel_id: 'Tas Hati', icon: '👜', img: 'assets/mockup_art/wardrobe/items/bubu_accs_heart_bag.png', theme: 'chic' }
      ],
      shoes: [
        { val: 'none', label: 'Tanpa Alas Kaki', label_en: 'Barefoot', label_id: 'Tanpa Alas Kaki', shortLabel: 'Nyeker', shortLabel_en: 'Barefoot', shortLabel_id: 'Nyeker', icon: '🐾', img: '', theme: 'natural' },
        { val: 'bubu_shoes_mary_janes', label: 'Sepatu Tali Mary Jane', label_en: 'Brown Strap Mary Janes', label_id: 'Sepatu Tali Mary Jane', shortLabel: 'Mary Janes', shortLabel_en: 'Mary Janes', shortLabel_id: 'Mary Janes', icon: '🥿', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_mary_janes.png', theme: 'chic' },
        { val: 'bubu_shoes_winter_boots', label: 'Sepatu Boot Musim Dingin', label_en: 'Warm Winter Boots', label_id: 'Sepatu Boot Musim Dingin', shortLabel: 'Winter Boots', shortLabel_en: 'Boots', shortLabel_id: 'Winter Boots', icon: '🥾', img: 'assets/mockup_art/wardrobe/items/bubu_shoes_winter_boots.png', theme: 'winter' }
      ]
    }
  };

  const defaultMockupData = {
    userRole: 'dudu', // 'dudu' (Kevin) or 'bubu' (Nana)
    anniversaryDate: defaultAnniversaryIso,
    loveBattery: {
      dudu: 95,
      bubu: 95
    },
    badmoodLevel: 0,
    statuses: {
      dudu: 'Syududu',
      bubu: 'Syububu'
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
      dudu: { outfit_set: 'dudu_01_baby_clothes', hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' },
      bubu: { outfit_set: 'bubu_02_winter_clothes', hat: 'none', outfit: 'none', accs: 'none', shoes: 'none' }
    },
    miniGameHighScore: 705
  };

  function normalizeLoveBattery(val) {
    if (typeof val === 'number') {
      const n = Math.max(0, Math.min(100, val));
      return { dudu: n, bubu: n };
    }
    if (val && typeof val === 'object') {
      const d = val.dudu !== undefined ? Number(val.dudu) : (val.bubu !== undefined ? Number(val.bubu) : 100);
      const b = val.bubu !== undefined ? Number(val.bubu) : (val.dudu !== undefined ? Number(val.dudu) : 100);
      return {
        dudu: Math.max(0, Math.min(100, isNaN(d) ? 100 : d)),
        bubu: Math.max(0, Math.min(100, isNaN(b) ? 100 : b))
      };
    }
    return { dudu: 100, bubu: 100 };
  }

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
        if (parsed.statuses) {
          if (parsed.statuses.dudu === 'Thinking of you! 💭') parsed.statuses.dudu = 'Syududu';
          if (parsed.statuses.bubu === 'Eating snacks! 🐼') parsed.statuses.bubu = 'Syububu';
        }
        if (parsed.loveBattery && parsed.loveBattery.dudu === 100 && parsed.loveBattery.bubu === 100) {
          parsed.loveBattery = { dudu: 95, bubu: 95 };
        }
        if (sessionRole && (sessionRole === 'dudu' || sessionRole === 'bubu')) {
          parsed.userRole = sessionRole;
        }
        const merged = Object.assign({}, defaultMockupData, parsed);
        merged.loveBattery = normalizeLoveBattery(merged.loveBattery);
        return merged;
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
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';
    const [y, m, d] = (anniversaryDateStr || '2025-11-04').split('-').map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(y, m - 1, d);
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const fullMonthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const months = isEn ? monthsEn : monthsId;
    const fullMonths = isEn ? fullMonthsEn : fullMonthsId;

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
        title: isEn ? `${yearsCount} Year Anniversary! 🎂🎉` : `Ulang Tahun Hubungan ke-${yearsCount}! 🎂🎉`,
        subtitle: diffAnniv === 0
          ? (isEn ? `Today is our ${yearsCount} Year Anniversary! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️` : `Hari ini adalah ulang tahun jadian ke-${yearsCount}! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️`)
          : (isEn ? `Only ${diffAnniv} days left! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️` : `Tinggal ${diffAnniv} hari lagi! (${d} ${fullMonths[m - 1]} ${nextYear}) 🐻❤️`),
        shortLabel: isEn ? `Next: ${yearsCount} Year (${months[m - 1]} ${d})` : `Berikutnya: Tahun ke-${yearsCount} (${d} ${months[m - 1]})`
      };
    }

    const daysSoFar = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
    const nextBlock = (Math.floor(daysSoFar / 100) + 1) * 100;
    const daysLeft = nextBlock - daysSoFar;
    return {
      title: isEn ? `${nextBlock} Days! 🎉` : `${nextBlock} Hari! 🎉`,
      subtitle: isEn ? `Only ${daysLeft} days left! 🐻❤️` : `Tinggal ${daysLeft} hari lagi! 🐻❤️`,
      shortLabel: isEn ? `Next: ${nextBlock} Days (${daysLeft}d left)` : `Berikutnya: ${nextBlock} Hari (sisa ${daysLeft}h)`
    };
  }

  // --- BEDTIME LOFI ENGINE WITH 24/7 LOFI.RADIO INTEGRATION ---
  const LOFI_RADIO_SONGS = ["3 A.M. Radio.mp3", "A Place to Hide.mp3", "Adrift.mp3", "Aether.mp3", "After Hours.mp3", "All Curled Up.mp3", "Alley Cat.mp3", "Artifact.mp3", "Astral Projection.mp3", "Aurora.mp3", "Awakenings.mp3", "Bayou Blues.mp3", "Beautiful Day.mp3", "Bird Bath.mp3", "Birdhouse.mp3", "Blood Moon.mp3", "Bloom.mp3", "Breathing Underwater.mp3", "Cable Car.mp3", "Calm Waters.mp3", "Can't Sleep.mp3", "Carousel.mp3", "Cave of Solace.mp3", "Celestial Sands.mp3", "Changes.mp3", "Chasing Snowflakes.mp3", "Chugging Along.mp3", "Come One, Come All.mp3", "Comfy.mp3", "Constellations.mp3", "Contact.mp3", "Convergence.mp3", "Cool Breeze.mp3", "Corner Store.mp3", "Cosmic Echoes.mp3", "Cosmic Web.mp3", "Creation.mp3", "Creatures of the Night.mp3", "Crescent Moon.mp3", "Crossroads.mp3", "Cruisin'.mp3", "Dance of the Cacti.mp3", "Dancing Dandelions.mp3", "Dancing Shadows.mp3", "Dark Corners.mp3", "Dark Forest.mp3", "Day's End.mp3", "Day_s End.mp3", "Defunct.mp3", "Deja Vu.mp3", "Desert Rain.mp3", "Desolate.mp3", "Discovery.mp3", "Distant Ships.mp3", "Dont Look Back.mp3", "Downpour.mp3", "Downtown.mp3", "Dream Machine.mp3", "Dream State.mp3", "Drifting.mp3", "Dune Drifter.mp3", "Ebb and Flow.mp3", "Echoes of Yesterday.mp3", "Eerie Glow.mp3", "Egress.mp3", "Elevated.mp3", "Embrace.mp3", "Empty Sidewalks.mp3", "End of the Line.mp3", "Epiphany.mp3", "Equinox.mp3", "Ethereal.mp3", "Everchanging.mp3", "Exhale.mp3", "Exploration.mp3", "Eye of the Storm.mp3", "Eyes in the Dark.mp3", "Fading.mp3", "Fallen.mp3", "Familiar Faces.mp3", "Field Of Fireflies.mp3", "Flourish.mp3", "Fog Blanket.mp3", "Forget-Me-Not.mp3", "Fourth Dimension.mp3", "Fragments.mp3", "Frolic.mp3", "Frosted Evergreen.mp3", "Frozen Flowers.mp3", "Gentle Breeze.mp3", "Ghost Planet.mp3", "Ghost Town.mp3", "Ghosties.mp3", "Gingerbread House.mp3", "Glowing Tides.mp3", "Going With The Flow.mp3", "Goosebumps.mp3", "Green Tea.mp3", "Half Awake.mp3", "Happy Trails.mp3", "Heart of the Ocean.mp3", "Ice Palace.mp3", "Icicles.mp3", "In Between.mp3", "In the Moment.mp3", "In the Past.mp3", "In the Walls.mp3", "Infinite.mp3", "Insomnia.mp3", "Intertwined.mp3", "Labyrinth.mp3", "Lazy Afternoon.mp3", "Leviathan.mp3", "Lighthouse.mp3", "Lonely.mp3", "Long Day.mp3", "Looking Up.mp3", "Lost Paradise.mp3", "Lost Souls.mp3", "Lost and Found.mp3", "Lost at Sea.mp3", "Low Tide.mp3", "Lullaby.mp3", "Luminous.mp3", "Lurking in the Shadows.mp3", "Lush.mp3", "Maelstrom.mp3", "Magical Moments.mp3", "Mesa's Edge.mp3", "Message in a Bottle.mp3", "Meteorites.mp3", "Mirage.mp3", "Missing Pieces.mp3", "Morning Dew.mp3", "Moving Landscapes.mp3", "Mysterious Passenger.mp3", "Nevermore.mp3", "Nexus.mp3", "Night Light.mp3", "Night Owls.mp3", "Night Train.mp3", "Nightfall.mp3", "Not Alone.mp3", "Nowhere to Hide.mp3", "Oddity.mp3", "On the Brink.mp3", "Once in a Lifetime.mp3", "Otherworldly.mp3", "Out of Place.mp3", "Out of the Blue.mp3", "Palm Tree.mp3", "Paradox.mp3", "Passing Time.mp3", "Peppermint Mocha.mp3", "Phantom Waltz.mp3", "Pineapple Popsicle.mp3", "Pitter Patter.mp3", "Planetary Alignment.mp3", "Rainy Streets.mp3", "Refractions.mp3", "Rewind.mp3", "Rift in Time.mp3", "Rocky Shores.mp3", "Rooftop Rendezvous.mp3", "Running Late.mp3", "Sandstorm.mp3", "Satellite.mp3", "Sea Foam.mp3", "Sea of Stars.mp3", "Seashells.mp3", "Secret Of The Forest.mp3", "Serendipity.mp3", "Serenity Now.mp3", "Shelter.mp3", "Signs of Life.mp3", "Silent Wood.mp3", "Siren's Song.mp3", "Skeleton Dance.mp3", "Skyscrapers.mp3", "Snow Pillow.mp3", "Soft.mp3", "Solitude.mp3", "Sonder.mp3", "Spring Showers.mp3", "Star Bright.mp3", "Starlit Beach.mp3", "Starry Night.mp3", "Stars Collide.mp3", "Starseed.mp3", "Stasis.mp3", "Step Right Up.mp3", "Still of the Night.mp3", "Stranded.mp3", "Strange Fog.mp3", "Stray.mp3", "Streetlights.mp3", "Strike of Midnight.mp3", "Sunken Secrets.mp3", "Supernova.mp3", "Take Me With You.mp3", "The Bells.mp3", "The Dungeon.mp3", "The Midnight Diner.mp3", "The Murk.mp3", "The Portal.mp3", "The Toymaker.mp3", "Through the Trees.mp3", "Thunderous Waves.mp3", "Time Loop.mp3", "Time to Think.mp3", "Timeless.mp3", "Toasty.mp3", "Torn.mp3", "Tracks to Nowhere.mp3", "Transformation.mp3", "Tumbleweeds.mp3", "Tunnels.mp3", "Twilight Market.mp3", "UFO.mp3", "Under the Canopy.mp3", "Undertow.mp3", "Underwater Cavern.mp3", "Uninvited.mp3", "Unreality.mp3", "Upside Down.mp3", "Verdant.mp3", "Visions.mp3", "Waiting for the Sun.mp3", "Wanderlust.mp3", "Warm Horizon.mp3", "Weightless.mp3", "Weird Dream.mp3", "What Lies Beyond.mp3", "Wild Strawberry.mp3", "Window Seat.mp3", "Wish You Were Here.mp3", "Wishes.mp3", "Wishing Well.mp3", "Wonderland.mp3", "Wonderment.mp3", "Zero Gravity.mp3", "Zzz....mp3"];

  const LOFI_STORAGE_TRACK_KEY = 'dudu_lofi_last_track_index';
  const LOFI_STORAGE_POS_KEY = 'dudu_lofi_last_position_sec';
  const LOFI_STORAGE_LOOP_KEY = 'dudu_lofi_loop_mode';
  const LOFI_STORAGE_SHUFFLE_KEY = 'dudu_lofi_is_shuffle';

  class BedtimeLofiEngine {
    constructor() {
      this.isPlaying = false;
      this.isBuffering = false;
      this.volume = 0.65;
      this.audio = null;
      this.preloadAudio = null;
      this.lastPositionSaveTime = 0;

      this.tracks = LOFI_RADIO_SONGS.map(file => ({
        title: `${file.replace(/\.mp3$/i, '')} 🌙`,
        subtitle: 'lofi.radio • 24/7 Chill Beats',
        filename: file,
        url: `https://lofi.radio/songs/${encodeURIComponent(file)}`
      }));

      // Restore saved state (last track, last duration point, loop mode, shuffle)
      const savedTrack = localStorage.getItem(LOFI_STORAGE_TRACK_KEY);
      const savedPos = parseFloat(localStorage.getItem(LOFI_STORAGE_POS_KEY) || '0');
      const savedLoop = localStorage.getItem(LOFI_STORAGE_LOOP_KEY);
      const savedShuffle = localStorage.getItem(LOFI_STORAGE_SHUFFLE_KEY);

      const songIntervalMs = 180000;
      const defaultIndex = Math.floor(Date.now() / songIntervalMs) % this.tracks.length;

      const parsedIdx = savedTrack !== null ? parseInt(savedTrack, 10) : defaultIndex;
      this.currentTrackIndex = (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < this.tracks.length) ? parsedIdx : defaultIndex;
      this.savedPosition = (!isNaN(savedPos) && savedPos > 0) ? savedPos : 0;
      this.loopMode = (savedLoop === 'one' || savedLoop === 'off') ? savedLoop : 'all';
      this.isShuffle = (savedShuffle === 'true');
      this.history = [];
      this.playedHistory = [this.currentTrackIndex];
    }

    get currentTrack() {
      return this.tracks[this.currentTrackIndex] || this.tracks[0];
    }

    get liveTrack() {
      return this.currentTrack;
    }

    initAudio() {
      if (this.audio) return;
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      this.attachAudioListeners(this.audio);

      const track = this.currentTrack;
      if (!this.audio.src || !this.audio.src.includes(encodeURIComponent(track.filename))) {
        this.audio.src = track.url;
      }
    }

    attachAudioListeners(audioEl) {
      if (!audioEl) return;

      audioEl.addEventListener('ended', () => {
        this.handleTrackEnded();
      });

      audioEl.addEventListener('error', (e) => {
        console.warn('[LofiRadio] Track error, skipping to next:', e);
        this.isBuffering = false;
        updateLofiProgressUI();
        if (this.isPlaying) {
          setTimeout(() => {
            if (this.isPlaying) this.nextTrack(true);
          }, 1200);
        }
      });

      audioEl.addEventListener('waiting', () => {
        this.isBuffering = true;
        updateLofiProgressUI();
      });

      audioEl.addEventListener('playing', () => {
        this.isPlaying = true;
        this.isBuffering = false;
        updateLofiUI();
        updateLofiProgressUI();
        syncMusicNotification(this.currentTrack, true, 'playing');
      });

      audioEl.addEventListener('canplay', () => {
        this.isBuffering = false;
        updateLofiProgressUI();
      });

      audioEl.addEventListener('pause', () => {
        this.isPlaying = false;
        this.isBuffering = false;
        updateLofiUI();
        updateLofiProgressUI();
        syncMusicNotification(this.currentTrack, false, 'pause');
      });

      audioEl.addEventListener('timeupdate', () => {
        updateLofiProgressUI();
        this.throttleSavePosition();
      });

      audioEl.addEventListener('loadedmetadata', () => {
        if (this.savedPosition > 0 && audioEl.currentTime < 1) {
          try {
            audioEl.currentTime = Math.min(this.savedPosition, (audioEl.duration || 100) - 1);
          } catch (_) {}
        }
        updateLofiProgressUI();
      });
    }

    throttleSavePosition() {
      const now = Date.now();
      if (now - this.lastPositionSaveTime > 1500) {
        this.lastPositionSaveTime = now;
        this.savePlaybackState();
      }
    }

    savePlaybackState() {
      try {
        localStorage.setItem(LOFI_STORAGE_TRACK_KEY, String(this.currentTrackIndex));
        localStorage.setItem(LOFI_STORAGE_LOOP_KEY, this.loopMode);
        localStorage.setItem(LOFI_STORAGE_SHUFFLE_KEY, String(this.isShuffle));
        if (this.audio && this.audio.currentTime > 0) {
          localStorage.setItem(LOFI_STORAGE_POS_KEY, String(this.audio.currentTime));
          this.savedPosition = this.audio.currentTime;
        }
      } catch (_) {}
    }

    seek(pct) {
      this.initAudio();
      const dur = this.audio.duration;
      if (!dur || isNaN(dur) || !isFinite(dur)) return;
      const targetSec = Math.max(0, Math.min(dur - 0.5, pct * dur));
      try {
        this.audio.currentTime = targetSec;
      } catch (_) {}
      this.savedPosition = targetSec;
      this.savePlaybackState();
      updateLofiProgressUI();
      if (!this.isPlaying) {
        this.start();
      }
    }

    preloadNextTrack() {
      try {
        let nextIdx;
        if (this.loopMode === 'one') {
          nextIdx = this.currentTrackIndex;
        } else if (this.isShuffle) {
          const pool = this.tracks.map((_, i) => i).filter(i => i !== this.currentTrackIndex);
          nextIdx = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 0;
        } else {
          nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
        }

        const nextTrack = this.tracks[nextIdx];
        if (!nextTrack) return;

        if (!this.preloadAudio) {
          this.preloadAudio = new Audio();
          this.preloadAudio.preload = 'auto';
        }
        if (!this.preloadAudio.src || !this.preloadAudio.src.includes(encodeURIComponent(nextTrack.filename))) {
          this.preloadAudio.src = nextTrack.url;
          this.preloadAudio.load();
        }
      } catch (err) {
        console.warn('[LofiPreload] error:', err);
      }
    }

    handleTrackEnded() {
      if (this.loopMode === 'one') {
        // Mode 2: Repeat single song
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().then(() => {
            this.isPlaying = true;
            updateLofiUI();
            updateLofiProgressUI();
          }).catch(e => console.warn(e));
        }
        return;
      }

      if (this.isShuffle) {
        // Shuffle Mode
        if (this.playedHistory.length >= this.tracks.length) {
          if (this.loopMode === 'off') {
            // Mode 3: Stop when all songs played
            this.stop();
            return;
          }
          this.playedHistory = [];
        }
        const remaining = this.tracks
          .map((_, i) => i)
          .filter(i => !this.playedHistory.includes(i) && i !== this.currentTrackIndex);
        const nextIdx = remaining.length > 0
          ? remaining[Math.floor(Math.random() * remaining.length)]
          : Math.floor(Math.random() * this.tracks.length);
        this.playTrack(nextIdx, true, 'next');
        return;
      }

      // Linear Mode
      if (this.currentTrackIndex >= this.tracks.length - 1) {
        if (this.loopMode === 'off') {
          // Mode 3: Stop after last song in playlist
          this.stop();
          return;
        }
        // Mode 1: Loop playlist back to start
        this.playTrack(0, true, 'next');
      } else {
        this.playTrack(this.currentTrackIndex + 1, true, 'next');
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, Number(val)));
      if (this.audio) {
        this.audio.volume = this.volume;
      }
      updateLofiUI();
    }

    async start() {
      this.initAudio();
      const track = this.currentTrack;
      if (!this.audio.src || !this.audio.src.includes(encodeURIComponent(track.filename))) {
        this.audio.src = track.url;
      }
      this.audio.volume = this.volume;
      this.isBuffering = true;
      updateLofiProgressUI();
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.isBuffering = false;
        setTimeout(() => this.preloadNextTrack(), 1500);
      } catch (err) {
        console.warn('[LofiRadio] play() blocked or failed:', err);
        this.isPlaying = false;
        this.isBuffering = false;
      }
      this.savePlaybackState();
      updateLofiUI();
      updateLofiProgressUI();
      syncMusicNotification(this.currentTrack, this.isPlaying, 'playing');
    }

    stop() {
      if (this.audio) {
        this.audio.pause();
      }
      this.isPlaying = false;
      this.isBuffering = false;
      this.savePlaybackState();
      updateLofiUI();
      updateLofiProgressUI();
      syncMusicNotification(this.currentTrack, false, 'pause');
    }

    toggle() {
      if (this.isPlaying) this.stop();
      else this.start();
    }

    playTrack(index, autoPlay = true, action = 'playing') {
      this.initAudio();
      if (index < 0 || index >= this.tracks.length) return;
      if (this.currentTrackIndex !== index) {
        this.history.push(this.currentTrackIndex);
        this.savedPosition = 0;
      }
      this.currentTrackIndex = index;
      if (!this.playedHistory.includes(index)) {
        this.playedHistory.push(index);
      }

      const track = this.currentTrack;

      // Seamless swap if standby preloader already has next track ready
      if (this.preloadAudio && this.preloadAudio.src.includes(encodeURIComponent(track.filename)) && this.preloadAudio.readyState >= 2) {
        const oldAudio = this.audio;
        oldAudio.pause();
        oldAudio.src = '';
        this.audio = this.preloadAudio;
        this.preloadAudio = null;
        this.attachAudioListeners(this.audio);
      } else {
        if (!this.audio.src || !this.audio.src.includes(encodeURIComponent(track.filename))) {
          this.audio.src = track.url;
        }
      }

      this.audio.volume = this.volume;
      this.savePlaybackState();

      if (autoPlay || this.isPlaying) {
        this.isBuffering = true;
        updateLofiProgressUI();
        this.audio.play()
          .then(() => {
            this.isPlaying = true;
            this.isBuffering = false;
            updateLofiUI();
            updateLofiProgressUI();
            setTimeout(() => this.preloadNextTrack(), 1500);
          })
          .catch((err) => {
            console.warn('[LofiRadio] play() error:', err);
            this.isPlaying = false;
            this.isBuffering = false;
            updateLofiUI();
            updateLofiProgressUI();
          });
      }
      updateLofiUI();
      updateLofiProgressUI();
      syncMusicNotification(this.currentTrack, this.isPlaying, action);
    }

    nextTrack(autoPlay = undefined) {
      this.initAudio();
      const shouldPlay = autoPlay !== undefined ? autoPlay : this.isPlaying;

      if (this.isShuffle) {
        const pool = this.tracks.map((_, i) => i).filter(i => i !== this.currentTrackIndex);
        const nextIdx = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 0;
        this.playTrack(nextIdx, shouldPlay, 'next');
        return;
      }

      const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
      this.playTrack(nextIdx, shouldPlay, 'next');
    }

    prevTrack() {
      this.initAudio();
      const shouldPlay = this.isPlaying;
      if (this.audio && this.audio.currentTime > 3) {
        this.audio.currentTime = 0;
        if (shouldPlay) this.audio.play().catch(e => console.warn(e));
        updateLofiProgressUI();
        return;
      }

      if (this.history.length > 0) {
        const prevIdx = this.history.pop();
        this.playTrack(prevIdx, shouldPlay, 'prev');
      } else {
        const prevIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.playTrack(prevIdx, shouldPlay, 'prev');
      }
    }

    cycleLoopMode() {
      // 1: Loop playlist ('all') -> 2: Repeat single song ('one') -> 3: Loop off ('off') -> 1
      if (this.loopMode === 'all') {
        this.loopMode = 'one';
        showFeedbackToast('Repeat Current Song 🔂', 'Ulang 1 Lagu Ini 🔂');
      } else if (this.loopMode === 'one') {
        this.loopMode = 'off';
        showFeedbackToast('Loop Off ⏹️', 'Ulang Dimatikan ⏹️');
      } else {
        this.loopMode = 'all';
        showFeedbackToast('Loop All Songs 🔁', 'Ulang Seluruh Lagu 🔁');
      }
      this.savePlaybackState();
      window.duduAudio?.playPop?.(480);
      updateLofiUI();
    }

    toggleShuffle() {
      this.isShuffle = !this.isShuffle;
      if (this.isShuffle) {
        this.playedHistory = [this.currentTrackIndex];
        showFeedbackToast('Shuffle On 🔀', 'Acak Lagu Aktif 🔀');
      } else {
        showFeedbackToast('Shuffle Off ➡️', 'Acak Lagu Mati ➡️');
      }
      this.savePlaybackState();
      window.duduAudio?.playPop?.(420);
      updateLofiUI();
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

  // --- NOTIFICATION HISTORY (Latest 5) ---
  const NOTIF_HISTORY_STORAGE_KEY = 'dudu_notification_history';
  const NOTIF_UNREAD_STORAGE_KEY = 'dudu_has_unread_notifs';

  function getNotificationHistory() {
    try {
      const raw = localStorage.getItem(NOTIF_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch (_) {}
    return [];
  }

  function saveNotificationHistory(list) {
    try {
      localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify((list || []).slice(0, 5)));
    } catch (_) {}
  }

  function formatTimeAgo(ts) {
    if (!ts) return 'Just now';
    const diffMs = Math.max(0, Date.now() - Number(ts));
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function addNotification(item) {
    if (!item) return;
    const history = getNotificationHistory();
    const notifItem = {
      id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      icon: item.icon || '💖',
      title: item.title || 'Space update',
      message: item.message || '',
      timestamp: item.timestamp || Date.now()
    };
    const updated = [notifItem, ...history.filter(h => h.id !== notifItem.id)].slice(0, 5);
    saveNotificationHistory(updated);
    try {
      localStorage.setItem(NOTIF_UNREAD_STORAGE_KEY, 'true');
    } catch (_) {}
    updateNotificationBellBadge();
    renderNotificationHistory();
  }

  function clearNotificationHistory() {
    saveNotificationHistory([]);
    try {
      localStorage.removeItem(NOTIF_UNREAD_STORAGE_KEY);
    } catch (_) {}
    updateNotificationBellBadge();
    renderNotificationHistory();
  }

  function renderNotificationHistory() {
    const listEl = document.getElementById('notif-history-list');
    if (!listEl) return;
    const history = getNotificationHistory();

    if (history.length === 0) {
      listEl.innerHTML = `
        <div class="py-8 text-center text-stone-400 dark:text-stone-500">
          <span class="text-3xl block mb-2 opacity-60">📭</span>
          <p class="text-xs font-heading font-bold text-[#4A3222] dark:text-stone-200">No notifications yet ♡</p>
          <p class="text-[10px] text-[#8D5B4C] dark:text-stone-400 mt-1">Updates and chat alerts will appear here</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = history.map(item => `
      <div class="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white dark:bg-stone-700/60 border border-[#E8DACB] dark:border-stone-600/60 shadow-2xs">
        <div class="w-8 h-8 rounded-full bg-[#FAF5EE] dark:bg-stone-600 flex items-center justify-center text-base shrink-0 border border-[#E8DACB]/80 dark:border-stone-500">
          ${escapeHtml(item.icon || '💖')}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span class="font-heading font-bold text-xs text-[#4A3222] dark:text-stone-100 truncate">${escapeHtml(item.title)}</span>
            <span class="text-[9px] text-stone-400 dark:text-stone-400 shrink-0 font-medium">${formatTimeAgo(item.timestamp)}</span>
          </div>
          <p class="text-[11px] text-[#8D5B4C] dark:text-stone-300 font-medium leading-snug mt-0.5 break-words">${escapeHtml(item.message)}</p>
        </div>
      </div>
    `).join('');
  }

  function updateNotificationBellBadge() {
    const bellBtn = document.getElementById('btn-header-bell');
    const chatBellBtn = document.getElementById('btn-chat-bell');

    const hasUnreadNotes = Array.isArray(appData.notes) && appData.notes.some(n => !n.isRead);
    let hasUnreadChat = false;
    try {
      const raw = localStorage.getItem('dudu_unread_topics');
      if (raw) hasUnreadChat = JSON.parse(raw).length > 0;
    } catch (_) {}
    const hasUnreadNotifs = localStorage.getItem(NOTIF_UNREAD_STORAGE_KEY) === 'true';

    const showBadge = hasUnreadNotes || hasUnreadChat || hasUnreadNotifs;

    [bellBtn, chatBellBtn].forEach(btn => {
      if (!btn) return;
      const dot = btn.querySelector('span.bg-rose-500');
      if (dot) dot.classList.toggle('hidden', !showBadge);
    });
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
        if (data.coupleSpace.loveBattery !== undefined) appData.loveBattery = normalizeLoveBattery(data.coupleSpace.loveBattery);
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
    attach_file: '📎',
    shuffle: '🔀',
    repeat: '🔁',
    repeat_one: '🔂',
    queue_music: '🎵',
    equalizer: '📊'
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
    const chatThemeBtn = document.getElementById('btn-chat-theme-toggle');
    const bellBtn = document.getElementById('btn-header-bell');
    const chatBellBtn = document.getElementById('btn-chat-bell');

    const applyTheme = (isDark) => {
      document.documentElement.classList.toggle('dark', isDark);
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', isDark ? '#1C1917' : '#FAF5EE');
      try {
        window.Capacitor?.Plugins?.DuduCompanion?.setStatusBarStyle?.({ isDark });
      } catch (_) {}
      [themeBtn, chatThemeBtn].forEach(btn => {
        const iconSpan = btn?.querySelector('.material-symbols-outlined');
        if (iconSpan) {
          iconSpan.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
      });
      syncOfflineIcons();
    };

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
      applyTheme(true);
    } else if (savedTheme === 'light') {
      applyTheme(false);
    }

    const toggleTheme = () => {
      const nextDark = !document.documentElement.classList.contains('dark');
      applyTheme(nextDark);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
      } catch (_) {}
      window.duduAudio?.playPop?.(nextDark ? 420 : 620);
      showFeedbackToast(
        nextDark ? 'Cozy night mode active 🌙' : 'Warm daylight mode active ☀️',
        nextDark ? 'Mode malam nyaman aktif 🌙' : 'Mode siang hangat aktif ☀️'
      );
    };

    themeBtn?.addEventListener('click', toggleTheme);
    chatThemeBtn?.addEventListener('click', toggleTheme);

    const openNotifModal = () => {
      window.duduAudio?.playPop?.(540);
      renderNotificationHistory();
      const modal = document.getElementById('modal-notification-history');
      if (modal) modal.classList.remove('hidden');
      try {
        localStorage.removeItem(NOTIF_UNREAD_STORAGE_KEY);
      } catch (_) {}
      updateNotificationBellBadge();
    };

    bellBtn?.addEventListener('click', openNotifModal);
    chatBellBtn?.addEventListener('click', openNotifModal);

    const notifModal = document.getElementById('modal-notification-history');
    const closeBtn = document.getElementById('btn-close-notif-modal');
    const dismissBtn = document.getElementById('btn-dismiss-notif-modal');
    const clearBtn = document.getElementById('btn-clear-notif-history');

    const closeNotifModal = () => {
      if (notifModal) notifModal.classList.add('hidden');
    };

    closeBtn?.addEventListener('click', closeNotifModal);
    dismissBtn?.addEventListener('click', closeNotifModal);
    notifModal?.addEventListener('click', (e) => {
      if (e.target === notifModal) closeNotifModal();
    });
    clearBtn?.addEventListener('click', () => {
      clearNotificationHistory();
      window.duduAudio?.playPop?.(380);
      showFeedbackToast('Notification history cleared ♡', 'Riwayat notifikasi dibersihkan ♡');
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
      showFeedbackToast(`New calendar event: ${event.title} 🗓️`, `Acara kalender baru: ${event.title} 🗓️`);
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
      showFeedbackToast(`Partner updated date planner! 📝✨`, `Pasangan memperbarui rencana kencan! 📝✨`);
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
      showFeedbackToast(`New love note from ${note.sender}! 💌`, `Surat cinta baru dari ${note.sender}! 💌`);
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
      showFeedbackToast(`Partner added a memory to the jar! 📸🍯`, `Pasangan menambahkan kenangan ke toples! 📸🍯`);
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
      if (data.loveBattery !== undefined) {
        const norm = normalizeLoveBattery(data.loveBattery);
        if (!appData.loveBattery || norm.dudu !== appData.loveBattery.dudu || norm.bubu !== appData.loveBattery.bubu) {
          appData.loveBattery = norm;
          changed = true;
        }
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
          showFeedbackToast(
            `${partnerName} updated the Couple Closet! 🧥✨`,
            `${partnerName} memperbarui Lemari Pasangan! 🧥✨`
          );
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
    const tabs = ['home', 'notes', 'chat', 'memories', 'calendar', 'bucket', 'music', 'wardrobe', 'stickers'];
    if (!tabs.includes(tabName)) tabName = 'home';
    const isSameTab = (currentActiveTab === tabName);
    currentActiveTab = tabName;

    if (tabName === 'stickers') {
      window.DuduStickerStore?.renderStickerCenterUI?.();
    }
    if (tabName === 'music') {
      updateLofiUI();
    }
    if (tabName === 'chat') {
      window.DuduChatUI?.dismissDeliveredChatNotifications?.();
    }

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
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';
    const days = getDaysTogether();
    const daysEl = document.getElementById('home-days-count');
    if (daysEl) daysEl.textContent = isEn ? `${days} days ♡` : `${days} hari ♡`;

    const subEl = document.getElementById('home-anniversary-sub');
    if (subEl) {
      const [y, m, d] = (appData.anniversaryDate || '2025-11-04').split('-').map(Number);
      const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const months = isEn ? monthsEn : monthsId;
      subEl.textContent = isEn ? `Since ${d} ${months[m - 1]} ${y}` : `Sejak ${d} ${months[m - 1]} ${y}`;
    }

    // Update Home Calendar Portal subtitle dynamically
    const portalCalNext = document.getElementById('home-portal-calendar-next');
    if (portalCalNext) {
      const milestone = getNextAnniversaryMilestone(appData.anniversaryDate);
      portalCalNext.textContent = milestone.shortLabel || (isEn ? 'Next: 1 Year (Nov 4)' : 'Berikutnya: Tahun ke-1 (4 Nov)');
    }

    updateLoveBatteryUI();

    const duduStatusEl = document.getElementById('home-status-dudu');
    const bubuStatusEl = document.getElementById('home-status-bubu');
    if (duduStatusEl) duduStatusEl.textContent = appData.statuses.dudu;
    if (bubuStatusEl) bubuStatusEl.textContent = appData.statuses.bubu;

    // Bar 1: Dudu Love Battery Meter (Tap to view/adjust Dudu's slider)
    const duduBatteryBtn = document.getElementById('btn-boost-battery-dudu') || document.getElementById('btn-boost-battery');
    if (duduBatteryBtn) {
      duduBatteryBtn.onclick = () => {
        openLoveBatteryModal('dudu');
      };
    }

    const adjustDuduBtn = document.getElementById('btn-open-battery-adjust') || document.getElementById('btn-open-battery-dudu-adjust');
    if (adjustDuduBtn) {
      adjustDuduBtn.onclick = (e) => {
        e.stopPropagation();
        openLoveBatteryModal('dudu');
      };
    }

    // Bar 2: Bubu Love Battery Meter (Tap to view/adjust Bubu's slider)
    const bubuBatteryBtn = document.getElementById('btn-boost-battery-bubu');
    if (bubuBatteryBtn) {
      bubuBatteryBtn.onclick = () => {
        openLoveBatteryModal('bubu');
      };
    }

    const adjustBubuBtn = document.getElementById('btn-open-battery-bubu-adjust');
    if (adjustBubuBtn) {
      adjustBubuBtn.onclick = (e) => {
        e.stopPropagation();
        openLoveBatteryModal('bubu');
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
    addNotification({ title, message, icon, timestamp: Date.now() });

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

  function getLoveNotificationContent(roleOrVal, maybeVal) {
    let role = 'dudu';
    let val = 100;
    if (typeof roleOrVal === 'string') {
      role = roleOrVal;
      val = Number(maybeVal) || 100;
    } else {
      val = Number(roleOrVal) || 100;
      role = (appData?.userRole === 'bubu') ? 'bubu' : 'dudu';
    }
    const current = Math.max(0, Math.min(100, val));
    const name = role === 'bubu' ? 'Bubu 🐼' : 'Dudu 🐻';
    const partnerName = role === 'bubu' ? 'Dudu' : 'Bubu';
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';

    if (current >= 100) {
      return {
        title: isEn ? `${name} Love Battery: 100% Full! 💖` : `Baterai Cinta ${name}: 100% Penuh! 💖`,
        message: isEn
          ? `${name} love is overflowing for ${partnerName}! Endless affection today 🥰`
          : `Cinta ${name} penuh melimpah ruah untuk ${partnerName}! Kasih sayang kita tak terbatas hari ini 🥰`,
        icon: '💖'
      };
    } else if (current >= 75) {
      return {
        title: isEn ? `${name} Love Battery: ${current}% 🥰` : `Baterai Cinta ${name}: ${current}% 🥰`,
        message: isEn
          ? `${name}'s heart is fluttering with joy! Sending warm love to ${partnerName} ♡`
          : `Hati ${name} lagi berbunga-bunga dan senang banget! Semangat terus ya sayang ♡`,
        icon: '🥰'
      };
    } else if (current >= 50) {
      return {
        title: isEn ? `${name} Love Battery: ${current}% 🤗` : `Baterai Cinta ${name}: ${current}% 🤗`,
        message: isEn
          ? `${name}'s love energy is steady, but extra cuddles from ${partnerName} are needed!`
          : `Energi cinta ${name} stabil, tapi tetap butuh recharge pelukan hangat ekstra dari ${partnerName}!`,
        icon: '🤗'
      };
    } else if (current >= 25) {
      return {
        title: isEn ? `${name} Love Battery: ${current}% 🥺` : `Baterai Cinta ${name}: ${current}% 🥺`,
        message: isEn
          ? `${name}'s love battery is running low! Needs sweet affection and comforting chats ♡`
          : `Baterai cinta ${name} mulai low! Butuh disayang, dipuk-puk, dan ditemenin ngobrol manis ♡`,
        icon: '🥺'
      };
    } else {
      return {
        title: isEn ? `${name} Love Battery: ${current}% Alert! 🔋` : `Baterai Cinta ${name}: ${current}% Darurat! 🔋`,
        message: isEn
          ? `Critical love battery! Please give ${name} warm hugs and pamper right now!`
          : `Baterai cinta ${name} kritis! Segera peluk erat dan manjakan sekarang juga!`,
        icon: '🔋'
      };
    }
  }

  function getBadmoodNotificationContent(val) {
    const current = Math.max(0, Math.min(100, Number(val) || 0));
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';

    if (current <= 0) {
      return {
        title: isEn ? 'Mood: 0% (Super Happy!) ✨' : 'Suasana Hati: 0% (Sangat Ceria!) ✨',
        message: isEn
          ? 'Mood is joyful and blooming! Zero badmood today 🥰🌸'
          : 'Mood lagi ceria dan berbunga-bunga! Tidak ada rasa kesal sama sekali hari ini 🥰🌸',
        icon: '✨'
      };
    } else if (current <= 25) {
      return {
        title: isEn ? `Mood: ${current}% (Slight Pout) ☁️` : `Suasana Hati: ${current}% (Sedikit Bete) ☁️`,
        message: isEn
          ? 'A tiny bit grumpy, but sweet kisses and smiles will fix it instantly! 🥺'
          : 'Ada sedikit rasa bete nih, kalau disemangatin manis atau dicium pasti langsung senyum! 🥺',
        icon: '☁️'
      };
    } else if (current <= 50) {
      return {
        title: isEn ? `Mood: ${current}% (Cloudy Mood) 🌧️` : `Suasana Hati: ${current}% (Mood Mendung) 🌧️`,
        message: isEn
          ? 'A bit cloudy and sensitive. Needs pampering, listening, plus sweet ice cream! 🍨'
          : 'Mood agak mendung dan sensitif. Butuh dipuk-puk, didengerin curhatnya, plus es krim! 🍨',
        icon: '🌧️'
      };
    } else if (current <= 75) {
      return {
        title: isEn ? `Mood: ${current}% (Deep Pout) 🌩️` : `Suasana Hati: ${current}% (Ngambek Berat) 🌩️`,
        message: isEn
          ? 'Pouting heavily! Please be gentle, patient, and bring favorite boba tea 🧋😤'
          : 'Lagi ngambek! Tolong jangan bikin kesel dulu ya, wajib dibujuk dengan sabar dan beliin boba 🧋😤',
        icon: '🌩️'
      };
    } else {
      return {
        title: isEn ? `Mood: ${current}% (LEVEL 5 ALERT!) ⚡` : `Suasana Hati: ${current}% (DARURAT LEVEL 5!) ⚡`,
        message: isEn
          ? 'MAXIMUM BADMOOD DANGER! Give tight cuddles, heartfelt apologies, and yummy treats! 🌋💔'
          : 'BAHAYA NGAMBEK MAKSIMAL! Segera peluk erat, minta maaf, dan bawakan makanan kesukaan! 🌋💔',
        icon: '⚡'
      };
    }
  }

  let activeBatteryModalRole = 'dudu';

  function openLoveBatteryModal(targetRole = null) {
    if (targetRole && (targetRole === 'dudu' || targetRole === 'bubu')) {
      activeBatteryModalRole = targetRole;
    } else {
      activeBatteryModalRole = (appData?.userRole === 'bubu') ? 'bubu' : 'dudu';
    }

    const isOwnBattery = (activeBatteryModalRole === (appData?.userRole || 'dudu'));
    const isDudu = activeBatteryModalRole === 'dudu';
    const batt = normalizeLoveBattery(appData.loveBattery);
    appData.loveBattery = batt;
    const curVal = isDudu ? batt.dudu : batt.bubu;

    const slider = document.getElementById('input-love-battery-slider');
    const valText = document.getElementById('slider-battery-val');
    const bar = document.getElementById('slider-battery-bar');
    const avatar = document.getElementById('battery-modal-avatar');
    const title = document.getElementById('battery-modal-title');
    const subtitle = document.getElementById('battery-modal-subtitle');
    const presetsBox = document.getElementById('battery-modal-presets');
    const saveBtn = document.getElementById('btn-save-battery-slider');

    if (avatar) avatar.textContent = isDudu ? '🐻' : '🐼';

    if (isOwnBattery) {
      if (title) title.textContent = isDudu ? "Adjust Dudu's Love Battery" : "Adjust Bubu's Love Battery";
      if (subtitle) subtitle.textContent = isDudu ? "how full is Dudu's heart right now? ♡" : "how full is Bubu's heart right now? ♡";

      if (slider) {
        slider.disabled = false;
        slider.className = isDudu ? 'w-full accent-[#8D5B4C] cursor-pointer' : 'w-full accent-[#EAA684] cursor-pointer';
      }

      if (presetsBox) presetsBox.classList.remove('hidden');

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Love Level ♡';
        saveBtn.className = isDudu
          ? 'w-full py-2.5 rounded-full bg-[#8D5B4C] hover:bg-[#794B3D] text-white font-heading font-bold text-xs button-press cursor-pointer shadow-xs'
          : 'w-full py-2.5 rounded-full bg-[#EAA684] hover:bg-[#d8926f] text-white font-heading font-bold text-xs button-press cursor-pointer shadow-xs';
      }
    } else {
      // Partner's battery: Read-only! Dudu can only adjust Dudu, Bubu can only adjust Bubu
      if (title) title.textContent = isDudu ? "Dudu's Love Battery 🐻" : "Bubu's Love Battery 🐼";
      if (subtitle) subtitle.textContent = isDudu ? "Only Dudu can adjust Dudu's battery ♡" : "Only Bubu can adjust Bubu's battery ♡";

      if (slider) {
        slider.disabled = true;
        slider.className = 'w-full opacity-60 cursor-not-allowed';
      }

      if (presetsBox) presetsBox.classList.add('hidden');

      if (saveBtn) {
        const isEn = window.DuduI18n?.getLanguage() === 'en';
        saveBtn.disabled = true;
        saveBtn.textContent = isEn
          ? (isDudu ? "Only Dudu can adjust this 🐻" : "Only Bubu can adjust this 🐼")
          : (isDudu ? "Hanya Dudu yang dapat mengatur ini 🐻" : "Hanya Bubu yang dapat mengatur ini 🐼");
        saveBtn.className = 'w-full py-2.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 font-heading font-bold text-xs cursor-not-allowed opacity-80';
      }

      showFeedbackToast(
        isDudu ? "Viewing Dudu's battery (Only Dudu can adjust) 🐻" : "Viewing Bubu's battery (Only Bubu can adjust) 🐼",
        isDudu ? "Melihat baterai Dudu (Hanya Dudu yang dapat mengatur) 🐻" : "Melihat baterai Bubu (Hanya Bubu yang dapat mengatur) 🐼"
      );
    }

    if (bar) {
      bar.className = isDudu
        ? 'h-full bg-gradient-to-r from-amber-500 via-[#8D5B4C] to-[#EAA684] rounded-full transition-all'
        : 'h-full bg-gradient-to-r from-rose-400 to-[#FDA4AF] rounded-full transition-all';
    }

    const updateSliderDisplay = (val) => {
      const v = Math.max(0, Math.min(100, Number(val) || 0));
      if (valText) valText.textContent = `${v}%`;
      if (bar) bar.style.width = `${v}%`;
    };

    if (slider) {
      slider.value = curVal;
      updateSliderDisplay(curVal);
      slider.oninput = () => {
        if (!isOwnBattery) return;
        updateSliderDisplay(slider.value);
      };
    }

    document.querySelectorAll('.btn-battery-preset').forEach(btn => {
      btn.onclick = () => {
        if (!isOwnBattery) return;
        const v = Number(btn.getAttribute('data-val'));
        if (slider) slider.value = v;
        updateSliderDisplay(v);
        window.duduAudio?.playPop?.(520);
      };
    });

    const closeBtn = document.getElementById('btn-close-battery-modal');
    if (closeBtn) closeBtn.onclick = () => closeSheet('modal-adjust-battery');

    if (saveBtn) {
      saveBtn.onclick = () => {
        if (!isOwnBattery) return;
        const newVal = Math.max(0, Math.min(100, Number(slider?.value ?? 100)));
        if (activeBatteryModalRole === 'bubu') {
          appData.loveBattery.bubu = newVal;
        } else {
          appData.loveBattery.dudu = newVal;
        }
        saveState();
        updateLoveBatteryUI();
        window.DuduChatSocket?.sendUpdateCoupleSpace?.({ loveBattery: appData.loveBattery });
        sendSaveRest('/api/couple-space', { loveBattery: appData.loveBattery });
        triggerHeartBurst();
        closeSheet('modal-adjust-battery');
        const notif = getLoveNotificationContent(activeBatteryModalRole, newVal);
        showInAppNotification(notif.title, notif.message, notif.icon);
        window.duduAudio?.playPop?.(650);
      };
    }

    openSheet('modal-adjust-battery');
  }

  function openBadmoodModal() {
    openLoveBatteryModal('bubu');
  }

  function updateLoveBatteryUI() {
    const batt = normalizeLoveBattery(appData.loveBattery);
    appData.loveBattery = batt;

    // Bar 1: Dudu
    const duduTxt = document.getElementById('home-battery-dudu-text') || document.getElementById('home-battery-text');
    const duduFill = document.getElementById('home-battery-dudu-fill') || document.getElementById('home-battery-fill');
    if (duduTxt) duduTxt.textContent = `${batt.dudu}%`;
    if (duduFill) duduFill.style.width = `${batt.dudu}%`;

    // Bar 2: Bubu
    const bubuTxt = document.getElementById('home-battery-bubu-text');
    const bubuFill = document.getElementById('home-battery-bubu-fill');
    if (bubuTxt) bubuTxt.textContent = `${batt.bubu}%`;
    if (bubuFill) bubuFill.style.width = `${batt.bubu}%`;
  }

  function updateBadmoodUI() {
    // legacy stub
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
          showFeedbackToast(
            note.isFavorite ? 'Added to Favorites ♥' : 'Removed from Favorites',
            note.isFavorite ? 'Ditambahkan ke Favorit ♥' : 'Dihapus dari Favorit'
          );
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
          showFeedbackToast('Love note deleted 🗑️', 'Surat cinta dihapus 🗑️');
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
        <div class="col-span-full p-6 text-center text-xs text-on-surface-variant w-full" style="column-span: all; -webkit-column-span: all;">
          No polaroids in the jar yet. Tap the camera button above to add one! 📸
        </div>
      `;
    } else {
      appData.polaroids.forEach(p => {
        const card = document.createElement('div');
        card.className = `polaroid-card rounded-2xl p-2.5 flex flex-col gap-1.5 cursor-pointer relative break-inside-avoid mb-3.5 inline-block w-full align-top`;
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
          <div class="w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
            <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-auto max-h-80 object-cover rounded-xl block" loading="lazy">
          </div>
          <div class="text-center pt-1 px-1">
            <span class="font-handwriting text-base text-primary dark:text-stone-100 font-bold tracking-wide line-clamp-1 block">
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
          showFeedbackToast('Photo removed from jar 🗑️', 'Foto dihapus dari toples 🗑️');
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
          showFeedbackToast(
            `Showing all ${appData.polaroids.length} memories in your jar 📸🍯`,
            `Menampilkan semua ${appData.polaroids.length} kenangan di toples 📸🍯`
          );
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
        showFeedbackToast('Milestone removed 🗑️', 'Momen penting dihapus 🗑️');
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
    if (headerBadgeEl) headerBadgeEl.textContent = `${completedCount} Completed ✨`;

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
          showFeedbackToast(
            item.completed ? 'Date completed! 🥰' : 'Marked active',
            item.completed ? 'Kencan selesai! 🥰' : 'Ditandai aktif'
          );
        };

        card.querySelector('.btn-delete-bucket')?.addEventListener('click', (e) => {
          e.stopPropagation();
          appData.bucketList = appData.bucketList.filter(b => b.id !== item.id);
          saveState();
          renderBucketList();
          window.DuduChatSocket?.sendDeletePlannerItem?.(item.id);
          sendDeleteRest('/api/planner', item.id);
          showFeedbackToast('Date removed from wishlist 🗑️', 'Kencan dihapus dari daftar impian 🗑️');
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
          showFeedbackToast('Event updated! 🗓️✨', 'Acara diperbarui! 🗓️✨');
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
        showFeedbackToast('Event deleted! 🗑️', 'Acara dihapus! 🗑️');
        window.duduAudio?.playPop?.(400);
      };

      listEl.appendChild(itemEl);
    });
  }

  // --- 6. BEDTIME & MUSIC (music & bed time.jpg) ---
  let lofiPlaylistSearchQuery = '';

  function renderBedtimePlaylist() {
    const box = document.getElementById('lofi-playlist-box');
    const badge = document.getElementById('lofi-track-count-badge');
    if (!box) return;

    const query = (lofiPlaylistSearchQuery || '').trim().toLowerCase();
    const tracksWithIdx = lofiEngine.tracks.map((track, idx) => ({ track, idx }));
    const filtered = query
      ? tracksWithIdx.filter(item => item.track.title.toLowerCase().includes(query) || item.track.filename.toLowerCase().includes(query))
      : tracksWithIdx;

    if (badge) {
      badge.textContent = query ? `${filtered.length}/${lofiEngine.tracks.length}` : `${lofiEngine.tracks.length} Songs`;
    }

    if (filtered.length === 0) {
      box.innerHTML = `
        <div class="py-6 text-center text-xs text-stone-400">
          No songs found matching "${escapeHtml(lofiPlaylistSearchQuery)}"
        </div>
      `;
      return;
    }

    box.innerHTML = filtered.map(({ track, idx }) => {
      const isActive = idx === lofiEngine.currentTrackIndex;
      const isPlaying = isActive && lofiEngine.isPlaying;
      return `
        <button type="button" data-track-index="${idx}" class="lofi-track-row w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
          isActive
            ? 'bg-[#8D5B4C]/15 dark:bg-[#8D5B4C]/25 text-[#8D5B4C] dark:text-[#E8DACB] font-bold shadow-sm'
            : 'hover:bg-black/5 dark:hover:bg-white/5 text-primary dark:text-stone-300'
        }">
          <span class="material-symbols-outlined text-sm shrink-0 ${isActive ? 'text-[#8D5B4C] dark:text-[#F5C7A9]' : 'text-stone-400'}">
            ${isPlaying ? 'equalizer' : (isActive ? 'play_arrow' : 'music_note')}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-xs truncate ${isActive ? 'font-bold' : 'font-medium'}">${escapeHtml(track.title)}</div>
            <div class="text-[10px] text-stone-400 truncate">${escapeHtml(track.subtitle)}</div>
          </div>
          ${isActive ? `<span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${isPlaying ? 'bg-[#8D5B4C] text-white animate-pulse' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}">${isPlaying ? 'Playing' : 'Paused'}</span>` : ''}
        </button>
      `;
    }).join('');

    box.querySelectorAll('.lofi-track-row').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-track-index'));
        if (!isNaN(idx)) {
          window.duduAudio?.playPop?.(500);
          lofiEngine.playTrack(idx, true);
        }
      };
    });
  }

  function renderBedtimeMusic() {
    updateLofiUI();

    const playBtn = document.getElementById('btn-lofi-play');
    const prevBtn = document.getElementById('btn-lofi-prev');
    const nextBtn = document.getElementById('btn-lofi-next');
    const shuffleBtn = document.getElementById('btn-lofi-shuffle');
    const loopBtn = document.getElementById('btn-lofi-loop');
    const searchInput = document.getElementById('lofi-playlist-search');
    const offlineBtn = document.getElementById('btn-together-offline');
    const volBar = document.getElementById('lofi-volume-bar');

    if (playBtn) playBtn.onclick = () => lofiEngine.toggle();
    if (prevBtn) prevBtn.onclick = () => lofiEngine.prevTrack();
    if (nextBtn) nextBtn.onclick = () => lofiEngine.nextTrack();
    if (shuffleBtn) shuffleBtn.onclick = () => lofiEngine.toggleShuffle();
    if (loopBtn) loopBtn.onclick = () => lofiEngine.cycleLoopMode();

    if (searchInput) {
      searchInput.oninput = (e) => {
        lofiPlaylistSearchQuery = e.target.value;
        renderBedtimePlaylist();
      };
    }

    const progressBar = document.getElementById('lofi-progress-bar');
    if (progressBar) {
      progressBar.onclick = (e) => {
        const rect = progressBar.getBoundingClientRect();
        if (!rect.width) return;
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        lofiEngine.seek(pct);
        window.duduAudio?.playPop?.(450);
      };
    }

    if (volBar) {
      volBar.onclick = (e) => {
        const rect = volBar.getBoundingClientRect();
        if (!rect.width) return;
        const pct = Math.max(0.05, Math.min(1, (e.clientX - rect.left) / rect.width));
        lofiEngine.setVolume(pct);
        window.duduAudio?.playPop?.(Math.round(350 + pct * 400));
        showFeedbackToast(`Lofi volume: ${Math.round(pct * 100)}% 🎵`, `Volume lofi: ${Math.round(pct * 100)}% 🎵`);
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
    const cur = lofiEngine.liveTrack || { title: '3 A.M. Radio 🌙', subtitle: 'lofi.radio • 24/7 Live Radio' };
    const titleEl = document.getElementById('lofi-track-title');
    const subEl = document.getElementById('lofi-track-sub');
    const discEl = document.getElementById('lofi-vinyl-disc');
    const iconEl = document.getElementById('lofi-play-icon');
    const volFill = document.getElementById('lofi-volume-fill');
    const volThumb = document.getElementById('lofi-volume-thumb') || document.getElementById('lofi-volume-star');
    const volLabel = document.getElementById('lofi-volume-label');
    const shuffleBtn = document.getElementById('btn-lofi-shuffle');
    const loopBtn = document.getElementById('btn-lofi-loop');
    const loopIcon = document.getElementById('lofi-loop-icon');

    if (titleEl) titleEl.textContent = cur.title;
    if (subEl) subEl.textContent = cur.subtitle;

    if (discEl) {
      if (lofiEngine.isPlaying) discEl.classList.add('vinyl-spinning');
      else discEl.classList.remove('vinyl-spinning');
    }

    if (iconEl) {
      iconEl.textContent = lofiEngine.isPlaying ? 'pause' : 'play_arrow';
    }

    const pct = Math.round((lofiEngine.volume ?? 0.65) * 100);
    if (volFill) volFill.style.width = `${pct}%`;
    if (volThumb) volThumb.style.left = `${pct}%`;
    if (volLabel) volLabel.textContent = `${pct}%`;

    // Shuffle Button UI
    if (shuffleBtn) {
      if (lofiEngine.isShuffle) {
        shuffleBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-[#8D5B4C] bg-[#FAF5EE] dark:bg-stone-700/80 border border-[#8D5B4C]/40 shadow-sm button-press cursor-pointer transition-all duration-200';
        shuffleBtn.title = 'Shuffle Mode: ON';
      } else {
        shuffleBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-stone-400 opacity-60 hover:opacity-100 button-press cursor-pointer transition-all duration-200';
        shuffleBtn.title = 'Shuffle Mode: OFF';
      }
    }

    // Loop Button UI (3-function: playlist 'all' -> single 'one' -> off 'off')
    if (loopBtn && loopIcon) {
      if (lofiEngine.loopMode === 'all') {
        loopIcon.textContent = 'repeat';
        loopBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-[#8D5B4C] bg-[#FAF5EE] dark:bg-stone-700/80 border border-[#8D5B4C]/40 shadow-sm button-press cursor-pointer transition-all duration-200';
        loopBtn.title = 'Loop Mode: Playlist (repeat entire playlist)';
      } else if (lofiEngine.loopMode === 'one') {
        loopIcon.textContent = 'repeat_one';
        loopBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-[#8D5B4C] bg-[#FAF5EE] dark:bg-stone-700/80 border border-[#8D5B4C]/40 shadow-sm button-press cursor-pointer transition-all duration-200';
        loopBtn.title = 'Loop Mode: Single Track (repeats current track)';
      } else {
        loopIcon.textContent = 'repeat';
        loopBtn.className = 'w-9 h-9 rounded-full flex items-center justify-center text-stone-400 opacity-40 hover:opacity-80 button-press cursor-pointer transition-all duration-200';
        loopBtn.title = 'Loop Mode: OFF (stops at end of playlist)';
      }
    }

    // Render / update playlist items
    renderBedtimePlaylist();

    // Auto-scroll active track into view inside playlist box
    const box = document.getElementById('lofi-playlist-box');
    if (box) {
      const activeBtn = box.querySelector(`.lofi-track-row[data-track-index="${lofiEngine.currentTrackIndex}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    updateLofiProgressUI();
    syncOfflineIcons();
  }

  function formatTrackTime(secs) {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateLofiProgressUI() {
    const curTimeEl = document.getElementById('lofi-current-time');
    const totTimeEl = document.getElementById('lofi-total-duration');
    const fillEl = document.getElementById('lofi-progress-fill');
    const thumbEl = document.getElementById('lofi-progress-thumb');
    const bufferLabel = document.getElementById('lofi-buffering-label');

    if (bufferLabel) {
      if (lofiEngine.isBuffering) {
        bufferLabel.classList.remove('hidden');
      } else {
        bufferLabel.classList.add('hidden');
      }
    }

    const audio = lofiEngine.audio;
    const cur = (audio && audio.currentTime > 0) ? audio.currentTime : (lofiEngine.savedPosition || 0);
    const dur = (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) ? audio.duration : 0;

    if (curTimeEl) curTimeEl.textContent = formatTrackTime(cur);
    if (totTimeEl) totTimeEl.textContent = dur > 0 ? formatTrackTime(dur) : '--:--';

    const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (thumbEl) thumbEl.style.left = `${pct}%`;
  }

  async function syncMusicNotification(track, isPlaying, action = 'playing') {
    if (!track) return;
    const cleanTitle = (track.title || '3 A.M. Radio').replace(/🌙|✨|🐾/g, '').trim();
    const artist = 'Dudu Bedtime Lofi • 24/7 Chill Beats';

    // 1. DuduCompanion Native Android Notification
    try {
      if (window.Capacitor?.Plugins?.DuduCompanion?.updateMusicNotification) {
        await window.Capacitor.Plugins.DuduCompanion.updateMusicNotification({
          title: cleanTitle,
          artist,
          isPlaying,
          action
        });
      }
    } catch (_) {}

    // 2. Capacitor LocalNotifications fallback
    try {
      if (window.Capacitor?.Plugins?.LocalNotifications) {
        const notifId = 9002;
        await window.Capacitor.Plugins.LocalNotifications.createChannel({
          id: 'dudu_music_channel',
          name: 'Dudu Music Player',
          description: 'Playback status for Bedtime Lofi',
          importance: 2,
          visibility: 1,
          vibration: false
        }).catch(() => {});

        await window.Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [{
            id: notifId,
            title: isPlaying ? `🎵 ${cleanTitle}` : `⏸ ${cleanTitle} (Paused)`,
            body: `${artist} • Tap to view player`,
            channelId: 'dudu_music_channel',
            ongoing: isPlaying,
            autoCancel: !isPlaying
          }]
        });
      }
    } catch (_) {}
  }

  window.addEventListener('beforeunload', () => lofiEngine.savePlaybackState());
  window.addEventListener('pagehide', () => lofiEngine.savePlaybackState());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) lofiEngine.savePlaybackState();
  });

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
    cable: 'dudu_outfit_cable_sweater',
    duffle: 'dudu_outfit_varsity',
    scarf: 'dudu_accs_sunglasses',
    earflap: 'bubu_hat_earmuffs',
    cream: 'bubu_outfit_sweater_skirt',
    winter: 'bubu_outfit_trench',
    pompom: 'bubu_hat_artist_beret',
    earmuffs: 'dudu_hat_earmuffs',
    cardigan: 'dudu_outfit_cable_sweater',
    puffer: 'bubu_outfit_trench',
    mitten: 'dudu_shoes_sneakers',
    beret: 'dudu_hat_beret',
    hoodie: 'bubu_outfit_overalls',
    trench: 'bubu_outfit_trench',
    satchel: 'bubu_accs_bear_satchel',
    // Older item ids mapped to new clean extracted sticker pieces
    dudu_outfit_pajamas: 'dudu_outfit_cable_sweater',
    dudu_outfit_nightshirt: 'dudu_outfit_overalls',
    dudu_outfit_hawaiian: 'dudu_outfit_shorts',
    dudu_outfit_palmtree: 'dudu_outfit_shorts',
    dudu_outfit_tuxedo: 'dudu_outfit_trench',
    dudu_outfit_corduroy: 'dudu_outfit_varsity',
    dudu_hat_sleep_beanie: 'dudu_hat_pompom',
    dudu_hat_bucket: 'dudu_hat_newsboy',
    dudu_accs_eyemask: 'dudu_accs_sunglasses',
    dudu_accs_round_glasses: 'dudu_accs_sunglasses',
    dudu_accs_retro_sunglasses: 'dudu_accs_sunglasses',
    dudu_shoes_bear_slippers: 'dudu_shoes_sneakers',
    dudu_shoes_sandals: 'dudu_shoes_sneakers',
    dudu_shoes_oxfords: 'dudu_shoes_winter_boots',
    bubu_hat_nightcap: 'bubu_hat_artist_beret',
    bubu_hat_earflap: 'bubu_hat_earmuffs',
    bubu_accs_hair_bow: 'bubu_hat_artist_beret',
    bubu_outfit_ruffle_dress: 'bubu_outfit_maid_dress',
    bubu_outfit_strawberry_pj: 'bubu_outfit_cardigan',
    bubu_outfit_tennis_skirt: 'bubu_outfit_overalls',
    bubu_outfit_vintage_dress: 'bubu_outfit_floral_dress',
    bubu_outfit_apron_dress: 'bubu_outfit_artist_apron',
    bubu_accs_panda_mask: 'bubu_accs_heart_glasses',
    bubu_accs_round_glasses: 'bubu_accs_heart_glasses',
    bubu_accs_straw_bag: 'bubu_accs_bear_satchel',
    bubu_shoes_bunny_slippers: 'bubu_shoes_mary_janes',
    bubu_shoes_pink_sandals: 'bubu_shoes_mary_janes',
    bubu_shoes_ankle_boots: 'bubu_shoes_winter_boots'
  };

  const CLOSET_SETS = {
    dudu: [
      {
        id: 'dudu_01_baby_clothes',
        pairId: 'baby',
        name: 'Baju Bayi Lucu',
        name_en: 'Cute Baby Clothes',
        icon: '🍼',
        desc: 'Popok bayi & dot manis',
        desc_en: 'Baby diaper & pacifier',
        file: 'closet/dudu/dudu_01_baby_clothes.jpg'
      },
      {
        id: 'dudu_02_winter_clothes',
        pairId: 'winter',
        name: 'Musim Dingin Hangat',
        name_en: 'Warm Winter Set',
        icon: '❄️',
        desc: 'Kupluk pom-pom & mantel tebal',
        desc_en: 'Pompom beanie & winter coat',
        file: 'closet/dudu/dudu_02_winter_clothes.jpg'
      },
      {
        id: 'dudu_03_chore_clothes',
        pairId: 'chore',
        name: 'Beres-Beres Rumah',
        name_en: 'Home Chore Outfit',
        icon: '🧹',
        desc: 'Celemek rajin & sapu',
        desc_en: 'Cleaning apron & broom',
        file: 'closet/dudu/dudu_03_chore_clothes.jpg'
      },
      {
        id: 'dudu_04_work_clothes',
        pairId: 'work',
        name: 'Kemeja Kerja & Jas',
        name_en: 'Work Suit & Tie',
        icon: '💼',
        desc: 'Jas kantor & dasi merah',
        desc_en: 'Office suit & red tie',
        file: 'closet/dudu/dudu_04_work_clothes.jpg'
      },
      {
        id: 'dudu_05_sleep_pajamas',
        pairId: 'sleep',
        name: 'Piyama Tidur Nyenyak',
        name_en: 'Cozy Sleep Pajamas',
        icon: '🌙',
        desc: 'Topi tidur & bantal awan',
        desc_en: 'Nightcap & cloud pillow',
        file: 'closet/dudu/dudu_05_sleep_pajamas.jpg'
      },
      {
        id: 'dudu_06_couple_clothes',
        pairId: 'couple',
        name: 'Baju Kodok Berdua',
        name_en: 'Couple Dungarees',
        icon: '👖',
        desc: 'Topi pet & baju kodok denim',
        desc_en: 'Denim cap & dungaree overalls',
        file: 'closet/dudu/dudu_06_couple_clothes.jpg'
      },
      {
        id: 'dudu_07_love_clothes',
        pairId: 'love',
        name: 'Penuh Cinta & Hati',
        name_en: 'Sweet Heart Set',
        icon: '❤️',
        desc: 'Bando hati & bantal cinta',
        desc_en: 'Heart headband & heart pillow',
        file: 'closet/dudu/dudu_07_love_clothes.jpg'
      },
      {
        id: 'dudu_08_bubu_face_shirt',
        pairId: 'partner_shirt',
        name: 'Kaos Wajah Bubu',
        name_en: 'Bubu Face T-Shirt',
        icon: '🐼',
        desc: 'Kaos bergambar wajah Bubu',
        desc_en: 'Shirt featuring Bubu face',
        file: 'closet/dudu/dudu_08_bubu_face_shirt.jpg'
      },
      {
        id: 'dudu_09_pants_only',
        pairId: 'pants_only',
        name: 'Celana Pendek Santai',
        name_en: 'Comfy Denim Shorts',
        icon: '🩳',
        desc: 'Goyang riang santai',
        desc_en: 'Playful dance in shorts',
        file: 'closet/dudu/dudu_09_pants_only.jpg'
      },
      {
        id: 'dudu_10_tuxedo',
        pairId: 'formal',
        name: 'Tuksedo Pengantin Elegan',
        name_en: 'Elegant Tuxedo & Flowers',
        icon: '🤵',
        desc: 'Jas tuksedo & buket bunga',
        desc_en: 'Black tuxedo & flower bouquet',
        file: 'closet/dudu/dudu_10_tuxedo.jpg'
      }
    ],
    bubu: [
      {
        id: 'bubu_01_baby_clothes',
        pairId: 'baby',
        name: 'Baju Bayi Manis',
        name_en: 'Sweet Baby Clothes',
        icon: '🍼',
        desc: 'Popok pink & kerincingan',
        desc_en: 'Pink diaper & rattle toy',
        file: 'closet/bubu/bubu_01_baby_clothes.jpg'
      },
      {
        id: 'bubu_02_winter_clothes',
        pairId: 'winter',
        name: 'Mantel Musim Dingin Pink',
        name_en: 'Pink Winter Coat',
        icon: '❄️',
        desc: 'Earmuffs bulu & mantel tebal',
        desc_en: 'Fluffy earmuffs & winter coat',
        file: 'closet/bubu/bubu_02_winter_clothes.jpg'
      },
      {
        id: 'bubu_03_chore_clothes',
        pairId: 'chore',
        name: 'Beres-Beres & Lipat Baju',
        name_en: 'Home Chore & Laundry',
        icon: '🧺',
        desc: 'Celemek manis melipat cucian',
        desc_en: 'Cute apron folding fresh laundry',
        file: 'closet/bubu/bubu_03_chore_clothes.jpg'
      },
      {
        id: 'bubu_04_work_clothes',
        pairId: 'work',
        name: 'Blazer Kantor & Kopi',
        name_en: 'Office Blazer & Coffee',
        icon: '☕',
        desc: 'Blazer pink & kopi hangat',
        desc_en: 'Professional pink blazer & coffee',
        file: 'closet/bubu/bubu_04_work_clothes.jpg'
      },
      {
        id: 'bubu_05_sleep_pajamas',
        pairId: 'sleep',
        name: 'Piyama Tidur Pink',
        name_en: 'Pink Sleep Pajamas',
        icon: '🌙',
        desc: 'Topi tidur pink & bantal awan',
        desc_en: 'Pink nightcap & cloud pillow',
        file: 'closet/bubu/bubu_05_sleep_pajamas.jpg'
      },
      {
        id: 'bubu_06_couple_clothes',
        pairId: 'couple',
        name: 'Baju Kodok Berdua',
        name_en: 'Couple Dungarees',
        icon: '👖',
        desc: 'Topi pet pink & baju kodok serasi',
        desc_en: 'Pink denim cap & matching overalls',
        file: 'closet/bubu/bubu_06_couple_clothes.jpg'
      },
      {
        id: 'bubu_07_love_clothes',
        pairId: 'love',
        name: 'Penuh Cinta & Hati',
        name_en: 'Sweet Heart Set',
        icon: '❤️',
        desc: 'Bando hati & bantal hati',
        desc_en: 'Heart headband & heart pillow',
        file: 'closet/bubu/bubu_07_love_clothes.jpg'
      },
      {
        id: 'bubu_08_dudu_face_shirt',
        pairId: 'partner_shirt',
        name: 'Kaos Wajah Dudu',
        name_en: 'Dudu Face T-Shirt',
        icon: '🐻',
        desc: 'Kaos bergambar wajah Dudu',
        desc_en: 'Shirt featuring Dudu face',
        file: 'closet/bubu/bubu_08_dudu_face_shirt.jpg'
      },
      {
        id: 'bubu_09_pants_only',
        pairId: 'pants_only',
        name: 'Celana Pendek Pink',
        name_en: 'Comfy Pink Shorts',
        icon: '🩳',
        desc: 'Goyang riang gemas berkilau',
        desc_en: 'Sparkle dance in pink shorts',
        file: 'closet/bubu/bubu_09_pants_only.jpg'
      },
      {
        id: 'bubu_10_dress',
        pairId: 'formal',
        name: 'Gaun Pesta Mewah Ruffle',
        name_en: 'Elegant Party Dress',
        icon: '👗',
        desc: 'Gaun ruffle pink anggun & pita',
        desc_en: 'Pink ruffled gown with bow ribbon',
        file: 'closet/bubu/bubu_10_dress.jpg'
      }
    ]
  };

  const COUPLE_OUTFIT_PRESETS = [
    {
      name: 'Baju Kodok Berdua 👖✨',
      name_en: 'Couple Dungarees Duo 👖✨',
      name_id: 'Baju Kodok Berdua 👖✨',
      dudu: { outfit_set: 'dudu_06_couple_clothes' },
      bubu: { outfit_set: 'bubu_06_couple_clothes' }
    },
    {
      name: 'Penuh Cinta Berdua ❤️💕',
      name_en: 'Sweet Heart Pajamas ❤️💕',
      name_id: 'Penuh Cinta Berdua ❤️💕',
      dudu: { outfit_set: 'dudu_07_love_clothes' },
      bubu: { outfit_set: 'bubu_07_love_clothes' }
    },
    {
      name: 'Musim Dingin Hangat ❄️🧣',
      name_en: 'Cozy Winter Knit ❄️🧣',
      name_id: 'Musim Dingin Hangat ❄️🧣',
      dudu: { outfit_set: 'dudu_02_winter_clothes' },
      bubu: { outfit_set: 'bubu_02_winter_clothes' }
    },
    {
      name: 'Piyama Tidur Nyenyak 🌙💤',
      name_en: 'Sweet Sleep Pajamas 🌙💤',
      name_id: 'Piyama Tidur Nyenyak 🌙💤',
      dudu: { outfit_set: 'dudu_05_sleep_pajamas' },
      bubu: { outfit_set: 'bubu_05_sleep_pajamas' }
    },
    {
      name: 'Kaos Wajah Ayang 🐻🐼',
      name_en: 'Partner Face Shirts 🐻🐼',
      name_id: 'Kaos Wajah Ayang 🐻🐼',
      dudu: { outfit_set: 'dudu_08_bubu_face_shirt' },
      bubu: { outfit_set: 'bubu_08_dudu_face_shirt' }
    },
    {
      name: 'Pesta Mewah Elegan 🤵👗',
      name_en: 'Tuxedo & Party Gown 🤵👗',
      name_id: 'Pesta Mewah Elegan 🤵👗',
      dudu: { outfit_set: 'dudu_10_tuxedo' },
      bubu: { outfit_set: 'bubu_10_dress' }
    },
    {
      name: 'Beres-Beres Rumah 🧹🧺',
      name_en: 'Home Chore & Laundry 🧹🧺',
      name_id: 'Beres-Beres Rumah 🧹🧺',
      dudu: { outfit_set: 'dudu_03_chore_clothes' },
      bubu: { outfit_set: 'bubu_03_chore_clothes' }
    },
    {
      name: 'Kantoran & Kopi 💼☕',
      name_en: 'Office Work Suit & Blazer 💼☕',
      name_id: 'Kantoran & Kopi 💼☕',
      dudu: { outfit_set: 'dudu_04_work_clothes' },
      bubu: { outfit_set: 'bubu_04_work_clothes' }
    },
    {
      name: 'Baju Bayi Menggemaskan 🍼👶',
      name_en: 'Cute Baby Clothes 🍼👶',
      name_id: 'Baju Bayi Menggemaskan 🍼👶',
      dudu: { outfit_set: 'dudu_01_baby_clothes' },
      bubu: { outfit_set: 'bubu_01_baby_clothes' }
    },
    {
      name: 'Celana Pendek Santai 🩳✨',
      name_en: 'Comfy Shorts Play 🩳✨',
      name_id: 'Celana Pendek Santai 🩳✨',
      dudu: { outfit_set: 'dudu_09_pants_only' },
      bubu: { outfit_set: 'bubu_09_pants_only' }
    },
    {
      name: 'Bears Asli Mentahan 🐻🐼',
      name_en: 'Raw Natural Bears 🐻🐼',
      name_id: 'Bears Asli Mentahan 🐻🐼',
      dudu: { outfit_set: 'none' },
      bubu: { outfit_set: 'none' }
    }
  ];

  function syncWardrobeToServer() {
    if (!appData.wardrobe) appData.wardrobe = {};
    if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { outfit_set: 'dudu_06_couple_clothes' };
    if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { outfit_set: 'bubu_06_couple_clothes' };

    const payload = {
      wardrobe: {
        dudu: {
          ...appData.wardrobe.dudu,
          outfit_set: appData.wardrobe.dudu.outfit_set || 'dudu_06_couple_clothes',
          outfit: appData.wardrobe.dudu.outfit_set || 'dudu_06_couple_clothes',
          sweater: appData.wardrobe.dudu.outfit_set || 'dudu_06_couple_clothes',
          shoes: 'none',
          hat: 'none',
          accs: 'none'
        },
        bubu: {
          ...appData.wardrobe.bubu,
          outfit_set: appData.wardrobe.bubu.outfit_set || 'bubu_06_couple_clothes',
          outfit: appData.wardrobe.bubu.outfit_set || 'bubu_06_couple_clothes',
          sweater: appData.wardrobe.bubu.outfit_set || 'bubu_06_couple_clothes',
          shoes: 'none',
          hat: 'none',
          accs: 'none'
        }
      },
      miniGameHighScore: appData.miniGameHighScore || 420,
      updatedBy: appData.userRole || 'dudu'
    };
    window.DuduChatSocket?.sendUpdateWardrobe?.(payload);
    sendSaveRest('/api/wardrobe', payload);
  }

  function getClosetSet(char, setId) {
    const list = CLOSET_SETS[char] || CLOSET_SETS.dudu;
    if (!setId || setId === 'none') return null;
    return list.find(s => s.id === setId) || null;
  }

  function computeCoupleMatchBanner() {
    const dSetId = appData.wardrobe?.dudu?.outfit_set || 'dudu_06_couple_clothes';
    const bSetId = appData.wardrobe?.bubu?.outfit_set || 'bubu_06_couple_clothes';
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';

    if (dSetId === 'none' && bSetId === 'none') {
      return isEn ? 'Natural Cute Bears (Mentahan) 🐻🐼✨' : 'Bears Asli Mentahan (Natural 🐻🐼)';
    }

    const dSet = getClosetSet('dudu', dSetId);
    const bSet = getClosetSet('bubu', bSetId);

    if (dSet && bSet && dSet.pairId === bSet.pairId) {
      const setName = isEn ? dSet.name_en : dSet.name;
      return isEn ? `✨ Matching Couple: ${setName}! ${dSet.icon}💕` : `✨ Pasangan Serasi: ${setName}! ${dSet.icon}💕`;
    }

    if (dSet && bSet) {
      const dName = isEn ? dSet.name_en : dSet.name;
      const bName = isEn ? bSet.name_en : bSet.name;
      return `🐻 ${dName} • 🐼 ${bName}`;
    }

    if (dSet) {
      return `🐻 ${isEn ? dSet.name_en : dSet.name} • 🐼 ${isEn ? 'Raw Mentahan' : 'Polos Mentahan'}`;
    }
    if (bSet) {
      return `🐻 ${isEn ? 'Raw Mentahan' : 'Polos Mentahan'} • 🐼 ${isEn ? bSet.name_en : bSet.name}`;
    }

    return isEn ? 'Cozy Playful Match 🧸💕' : 'Paduan Busana Menggemaskan 🧸💕';
  }

  function getItemMeta(slot, rawVal, char) {
    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';
    return {
      val: rawVal || 'none',
      label: isEn ? 'Outfit Set' : 'Set Pakaian',
      shortLabel: isEn ? 'Set' : 'Set',
      icon: char === 'bubu' ? '🐼' : '🐻',
      img: '',
      theme: 'casual'
    };
  }

  function applyLayerStyle(imgEl, slot, itemVal, char, mode) {
    if (!imgEl) return;
    imgEl.style.display = 'none';
  }

  function renderWardrobeRoom() {
    if (!appData.wardrobe) appData.wardrobe = JSON.parse(JSON.stringify(defaultMockupData.wardrobe));
    if (!appData.wardrobe.dudu) appData.wardrobe.dudu = { ...defaultMockupData.wardrobe.dudu };
    if (!appData.wardrobe.bubu) appData.wardrobe.bubu = { ...defaultMockupData.wardrobe.bubu };
    if (!appData.wardrobe.dudu.outfit_set) appData.wardrobe.dudu.outfit_set = 'dudu_06_couple_clothes';
    if (!appData.wardrobe.bubu.outfit_set) appData.wardrobe.bubu.outfit_set = 'bubu_06_couple_clothes';

    const duduBadge = document.getElementById('wardrobe-badge-dudu');
    const bubuBadge = document.getElementById('wardrobe-badge-bubu');
    const prevPresetBtn = document.getElementById('btn-wardrobe-prev-preset');
    const nextPresetBtn = document.getElementById('btn-wardrobe-next-preset');
    const undressAllBtn = document.getElementById('btn-wardrobe-undress-all');
    const viewDuduBtn = document.getElementById('btn-stage-view-dudu');
    const viewBubuBtn = document.getElementById('btn-stage-view-bubu');
    const viewCoupleBtn = document.getElementById('btn-stage-view-couple');
    const stageHitDudu = document.getElementById('wardrobe-stage-hit-dudu');
    const stageHitBubu = document.getElementById('wardrobe-stage-hit-bubu');
    const stageCoupleDuduCard = document.getElementById('wardrobe-stage-couple-dudu-card');
    const stageCoupleBubuCard = document.getElementById('wardrobe-stage-couple-bubu-card');
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

    if (stageCoupleDuduCard) {
      stageCoupleDuduCard.onclick = () => {
        activeWardrobeChar = 'dudu';
        updateWardrobeTabs();
        window.duduAudio?.playPop?.(650);
        showFeedbackToast("Dudu's Wardrobe 🐻", "Lemari Dudu 🐻");
      };
    }
    if (stageCoupleBubuCard) {
      stageCoupleBubuCard.onclick = () => {
        activeWardrobeChar = 'bubu';
        updateWardrobeTabs();
        window.duduAudio?.playPop?.(650);
        showFeedbackToast("Bubu's Wardrobe 🐼", "Lemari Bubu 🐼");
      };
    }

    if (stageHitDudu) {
      stageHitDudu.onclick = () => {
        if (activeStageView === 'couple') {
          activeWardrobeChar = 'dudu';
          updateWardrobeTabs();
        }
        window.duduAudio?.playPop?.(650);
      };
    }
    if (stageHitBubu) {
      stageHitBubu.onclick = () => {
        if (activeStageView === 'couple') {
          activeWardrobeChar = 'bubu';
          updateWardrobeTabs();
        }
        window.duduAudio?.playPop?.(650);
      };
    }

    const applyPreset = (idx) => {
      activePresetIdx = (idx + COUPLE_OUTFIT_PRESETS.length) % COUPLE_OUTFIT_PRESETS.length;
      const preset = COUPLE_OUTFIT_PRESETS[activePresetIdx];
      appData.wardrobe.dudu = { ...appData.wardrobe.dudu, ...preset.dudu };
      appData.wardrobe.bubu = { ...appData.wardrobe.bubu, ...preset.bubu };
      saveState();
      updateWardrobeTabs();
      syncWardrobeToServer();
      window.duduAudio?.playPop?.(820);
      showFeedbackToast(`✨ Wearing set: "${preset.name}"!`, `✨ Memakai set: "${preset.name}"!`);
    };

    if (prevPresetBtn) prevPresetBtn.onclick = () => applyPreset(activePresetIdx - 1);
    if (nextPresetBtn) nextPresetBtn.onclick = () => applyPreset(activePresetIdx + 1);

    if (undressAllBtn) {
      undressAllBtn.onclick = () => {
        if (activeStageView === 'couple') {
          appData.wardrobe.dudu.outfit_set = 'none';
          appData.wardrobe.bubu.outfit_set = 'none';
          showFeedbackToast('All outfits removed! 🐻🐼 Base look', 'Semua pakaian dilepas! 🐻🐼 Mentahan polos');
        } else {
          const char = (activeWardrobeChar === 'bubu') ? 'bubu' : 'dudu';
          appData.wardrobe[char].outfit_set = 'none';
          showFeedbackToast(
            `${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} returned to base look!`,
            `${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} kembali ke mentahan polos!`
          );
        }
        saveState();
        updateWardrobeTabs();
        syncWardrobeToServer();
        window.duduAudio?.playPop?.(400);
      };
    }

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
    if (!appData.wardrobe.dudu.outfit_set) appData.wardrobe.dudu.outfit_set = 'dudu_06_couple_clothes';
    if (!appData.wardrobe.bubu.outfit_set) appData.wardrobe.bubu.outfit_set = 'bubu_06_couple_clothes';

    const duduBadge = document.getElementById('wardrobe-badge-dudu');
    const bubuBadge = document.getElementById('wardrobe-badge-bubu');
    const viewDuduBtn = document.getElementById('btn-stage-view-dudu');
    const viewBubuBtn = document.getElementById('btn-stage-view-bubu');
    const viewCoupleBtn = document.getElementById('btn-stage-view-couple');
    const stageEl = document.getElementById('wardrobe-stage');
    const stageSingle = document.getElementById('wardrobe-stage-single');
    const stageCouple = document.getElementById('wardrobe-stage-couple');
    const stageArt = document.getElementById('wardrobe-stage-art');
    const coupleDuduImg = document.getElementById('wardrobe-stage-couple-dudu-img');
    const coupleBubuImg = document.getElementById('wardrobe-stage-couple-bubu-img');
    const coupleDuduCard = document.getElementById('wardrobe-stage-couple-dudu-card');
    const coupleBubuCard = document.getElementById('wardrobe-stage-couple-bubu-card');

    const isEn = window.DuduI18n && window.DuduI18n.getLanguage() === 'en';

    // Character toggle badges
    if (duduBadge && bubuBadge) {
      if (isDudu) {
        duduBadge.className = 'px-2.5 py-1 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer shadow-2xs';
        bubuBadge.className = 'px-2.5 py-1 rounded-full bg-surface-container text-primary button-press cursor-pointer';
      } else {
        bubuBadge.className = 'px-2.5 py-1 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer shadow-2xs';
        duduBadge.className = 'px-2.5 py-1 rounded-full bg-surface-container text-primary button-press cursor-pointer';
      }
    }

    // View switcher buttons styling
    if (viewDuduBtn && viewBubuBtn && viewCoupleBtn) {
      const activeClass = 'px-2 py-0.5 rounded-full bg-[#8D5B4C] text-white button-press cursor-pointer shadow-xs font-bold';
      const inactiveClass = 'px-2 py-0.5 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 button-press cursor-pointer font-bold';
      viewDuduBtn.className = (activeStageView === 'dudu') ? activeClass : inactiveClass;
      viewBubuBtn.className = (activeStageView === 'bubu') ? activeClass : inactiveClass;
      viewCoupleBtn.className = (activeStageView === 'couple') ? activeClass : inactiveClass;
    }

    const dSetId = appData.wardrobe.dudu.outfit_set;
    const bSetId = appData.wardrobe.bubu.outfit_set;
    const dSet = getClosetSet('dudu', dSetId);
    const bSet = getClosetSet('bubu', bSetId);

    const duduImgSrc = (dSet && dSetId !== 'none') ? dSet.file : 'assets/mockup_art/wardrobe/stage_dudu_mentahan.png';
    const bubuImgSrc = (bSet && bSetId !== 'none') ? bSet.file : 'assets/mockup_art/wardrobe/stage_bubu_mentahan.png';

    // Stage Display
    if (activeStageView === 'couple') {
      if (stageSingle) stageSingle.classList.add('hidden');
      if (stageCouple) stageCouple.classList.remove('hidden');
      if (stageEl) stageEl.className = 'relative w-full rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 select-none shadow-inner aspect-square transition-all duration-300';

      if (coupleDuduImg) coupleDuduImg.src = duduImgSrc;
      if (coupleBubuImg) coupleBubuImg.src = bubuImgSrc;

      // Active character focus in couple stage
      if (coupleDuduCard && coupleBubuCard) {
        if (isDudu) {
          coupleDuduCard.className = 'relative rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 border-2 border-[#8D5B4C] p-2 flex flex-col items-center justify-center cursor-pointer shadow-sm ring-2 ring-[#8D5B4C]/20';
          coupleBubuCard.className = 'relative rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 border border-[#E8DACB] dark:border-stone-700 p-2 flex flex-col items-center justify-center cursor-pointer shadow-2xs opacity-80 hover:opacity-100 transition-opacity';
        } else {
          coupleBubuCard.className = 'relative rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 border-2 border-[#8D5B4C] p-2 flex flex-col items-center justify-center cursor-pointer shadow-sm ring-2 ring-[#8D5B4C]/20';
          coupleDuduCard.className = 'relative rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 border border-[#E8DACB] dark:border-stone-700 p-2 flex flex-col items-center justify-center cursor-pointer shadow-2xs opacity-80 hover:opacity-100 transition-opacity';
        }
      }
    } else {
      if (stageCouple) stageCouple.classList.add('hidden');
      if (stageSingle) stageSingle.classList.remove('hidden');
      if (stageEl) stageEl.className = 'relative w-full rounded-2xl overflow-hidden bg-[#FBF7EB] dark:bg-stone-800 select-none shadow-inner aspect-square transition-all duration-300';

      if (stageArt) {
        stageArt.src = isDudu ? duduImgSrc : bubuImgSrc;
      }
    }

    // Match banner text
    const matchTextEl = document.getElementById('wardrobe-match-text');
    if (matchTextEl) {
      matchTextEl.textContent = computeCoupleMatchBanner();
    }

    // Summary text pill
    const summaryEl = document.getElementById('wardrobe-equipped-summary');
    if (summaryEl) {
      const activeSet = isDudu ? dSet : bSet;
      const charLabel = isDudu ? 'Dudu 🐻' : 'Bubu 🐼';
      if (!activeSet || (isDudu ? dSetId : bSetId) === 'none') {
        summaryEl.textContent = `${charLabel}: ${isEn ? 'Bare Natural 🐾' : 'Polos Mentahan 🐾'}`;
      } else {
        const setName = isEn ? activeSet.name_en : activeSet.name;
        summaryEl.textContent = `${charLabel}: ${activeSet.icon} ${setName}`;
      }
    }

    // Populate Outfit Sets Grid
    const setsGrid = document.getElementById('wardrobe-sets-grid');
    if (setsGrid) {
      const catalog = CLOSET_SETS[char] || [];
      const curSetId = isDudu ? dSetId : bSetId;

      setsGrid.innerHTML = catalog.map(set => {
        const isEquipped = (set.id === curSetId);
        const title = isEn ? set.name_en : set.name;
        const desc = isEn ? set.desc_en : set.desc;

        return `
          <button type="button" data-set-id="${set.id}" class="wardrobe-set-card p-2 rounded-2xl flex flex-col items-center text-center cursor-pointer button-press transition-all relative border-2 ${isEquipped ? 'bg-[#F2E4D5] dark:bg-stone-700 border-[#8D5B4C] shadow-sm ring-2 ring-[#8D5B4C]/25' : 'bg-[#FAF5EE] dark:bg-stone-800 border-[#E8DACB] dark:border-stone-700 hover:border-[#8D5B4C] shadow-2xs'}">
            ${isEquipped ? `<span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#8D5B4C] text-white text-[8px] font-black z-10 shadow-2xs leading-none">✓</span>` : ''}
            <div class="w-full aspect-square rounded-xl overflow-hidden bg-white/70 dark:bg-stone-900/60 mb-1.5 border border-[#E8DACB]/60 dark:border-stone-700 flex items-center justify-center">
              <img src="${set.file}" alt="${title}" class="w-full h-full object-cover block" loading="lazy" />
            </div>
            <span class="font-heading font-extrabold text-[11px] text-[#4A3222] dark:text-stone-100 truncate w-full leading-tight">${set.icon} ${title}</span>
            <span class="text-[9px] text-[#8D5B4C] dark:text-stone-300 truncate w-full mt-0.5 opacity-80">${desc}</span>
          </button>
        `;
      }).join('');

      setsGrid.querySelectorAll('button[data-set-id]').forEach(btn => {
        btn.onclick = () => {
          const setId = btn.getAttribute('data-set-id');
          const chosenSet = catalog.find(s => s.id === setId);
          if (chosenSet) {
            appData.wardrobe[char].outfit_set = chosenSet.id;
            saveState();
            updateWardrobeTabs();
            syncWardrobeToServer();
            window.duduAudio?.playPop?.(780);
            const title = isEn ? chosenSet.name_en : chosenSet.name;
            showFeedbackToast(
              `${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} is wearing ${chosenSet.icon} ${chosenSet.name_en || chosenSet.name}!`,
              `${char === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'} memakai ${chosenSet.icon} ${chosenSet.name}!`
            );
          }
        };
      });
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
                showFeedbackToast(
                  `🎉 All pairs matched! Score: ${bonusScore} 🐻❤️`,
                  `🎉 Semua pasangan cocok! Skor: ${bonusScore} 🐻❤️`
                );
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
        showFeedbackToast(
          `Time's up! Great effort, score: ${gameScore} ✨`,
          `Waktu habis! Usaha hebat, skor: ${gameScore} ✨`
        );
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
          showFeedbackToast('Please write a note! 💌', 'Silakan tulis surat! 💌');
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
        showFeedbackToast('Love note sent to Honey! 💌', 'Surat cinta terkirim ke Sayang! 💌');
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
            showFeedbackToast('Custom photo selected! 📸', 'Foto khusus dipilih! 📸');
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
        showFeedbackToast('Polaroid added to jar! 📸', 'Polaroid ditambahkan ke toples! 📸');
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
          showFeedbackToast('Please enter a milestone title! ✨', 'Silakan masukkan judul momen penting! ✨');
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
        showFeedbackToast('Milestone added to timeline! ⌛✨', 'Momen penting ditambahkan ke garis waktu! ⌛✨');
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
          showFeedbackToast('Please enter a date idea! ✨', 'Silakan masukkan ide kencan! ✨');
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
        showFeedbackToast('Date idea added to planner! 📝✨', 'Ide kencan ditambahkan ke perencana! 📝✨');
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
          showFeedbackToast('Please enter an event title! 🗓️', 'Silakan masukkan judul acara! 🗓️');
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
        showFeedbackToast('Event added to calendar! 🗓️✨', 'Acara ditambahkan ke kalender! 🗓️✨');
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
        showFeedbackToast(
          activeViewingNote.isFavorite ? 'Added to Favorites ♥' : 'Removed from Favorites',
          activeViewingNote.isFavorite ? 'Ditambahkan ke Favorit ♥' : 'Dihapus dari Favorit'
        );
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
        showFeedbackToast('Love note removed from space 🗑️', 'Surat cinta dihapus 🗑️');
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
        showFeedbackToast('Photo removed from jar 🗑️', 'Foto dihapus dari toples 🗑️');
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
          showFeedbackToast('Please enter a caption! 📸', 'Silakan masukkan keterangan! 📸');
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
        showFeedbackToast('Polaroid caption updated! 📸✨', 'Keterangan foto diperbarui! 📸✨');
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
          showFeedbackToast('Status updated! 💭', 'Status diperbarui! 💭');
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
          showFeedbackToast(
            `Anniversary updated! (${getDaysTogether()} days) ♡`,
            `Hari jadian diperbarui! (${getDaysTogether()} hari) ♡`
          );
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

    updateIdentityUI();
  }

  function toggleUserRole() {
    setUserRole(appData.userRole === 'dudu' ? 'bubu' : 'dudu');
  }

  function setUserRole(newRole) {
    const oldRole = appData.userRole;
    if (oldRole && oldRole !== newRole) {
      window.DuduChatSocket?.sendPresenceAnnounce?.('offline', oldRole);
      window.DuduChatUI?.recordRoleOffline?.(oldRole);
    }
    appData.userRole = newRole;
    saveState();
    try {
      sessionStorage.setItem('DUDU_ACTIVE_ROLE', newRole);
    } catch (_) {}
    window.DuduChatCrypto?.setStoredIdentity?.(newRole);
    updateIdentityUI();
    window.DuduChatUI?.refreshPresence?.();
    window.DuduChatUI?.reloadActiveMessages?.();
    window.DuduChatSocket?.sendPresenceAnnounce?.('online', newRole);
    showFeedbackToast(
      `Viewing as ${appData.userRole === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'}`,
      `Melihat sebagai ${appData.userRole === 'dudu' ? 'Dudu 🐻' : 'Bubu 🐼'}`
    );
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
  function showFeedbackToast(enMsg, idMsg) {
    const toast = document.getElementById('feedback-toast');
    if (!toast) return;
    const isEn = window.DuduI18n?.getLanguage() === 'en';
    const msg = idMsg ? (isEn ? enMsg : idMsg) : enMsg;
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

  window.addEventListener('dudu-language-changed', () => {
    if (typeof renderOurSpaceHome === 'function') renderOurSpaceHome();
    if (typeof renderWardrobeRoom === 'function') renderWardrobeRoom();
    if (typeof updateWardrobeTabs === 'function') updateWardrobeTabs();
    if (typeof renderLoveNotes === 'function') renderLoveNotes();
    if (typeof renderOurCalendar === 'function') renderOurCalendar();
    if (typeof renderBucketList === 'function') renderBucketList();
    if (typeof renderMemoryJar === 'function') renderMemoryJar();
  });

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
    renderOurCalendar,
    addNotification,
    getNotificationHistory,
    clearNotificationHistory,
    renderNotificationHistory
  };
  window.duduMockup = window.DuduMockup;
  window.duduApp = window.DuduMockup;
  window.showFeedbackToast = showFeedbackToast;
  window.showToast = showFeedbackToast;

})();
