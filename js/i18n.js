// Bilingual Support (English & Bahasa Indonesia) for Dudu & Bubu Companion
(() => {
  const translations = {
    en: {
      nav_sanctuary: "Sanctuary",
      nav_shield: "Bubu's Belly",
      nav_shop: "Shop",
      nav_talk: "Talk",
      
      stat_food: "Food",
      stat_mood: "Mood",
      stat_sleep: "Sleep",
      stat_belly: "Bubu's Belly",
      
      care_title: "Care & Affection",
      care_subtitle: "Gentle touch",
      btn_feed: "Feed",
      btn_hug: "Hug",
      btn_kiss: "Kiss",
      btn_gift: "Gift",
      btn_sleep: "Sleep",
      
      action_title: "Action",
      action_subtitle: "When Bubu needs fun",
      btn_dance: "Dance",
      btn_annoy: "Annoy",
      btn_fight: "Fight",
      btn_scold: "Scold",
      btn_squish: "Squish",
      btn_massage: "Massage",
      
      intentions_title: "Daily Cozy Intentions",
      intentions_sub: "Earn Honey Points",
      
      belly_hq: "Bubu's Belly Headquarters",
      honey_pool_title: "Today's Daily Honey Pool",
      honey_pool_desc: "Each day Bubu receives a fresh pool of 120 Honey Points. Every time she eats spicy or junk food, Honey points decrease. Protect Bubu's belly to claim full sweet honey! 🍯",
      btn_spicy_food: "Spicy Food",
      sub_spicy_food: "Log chili heat",
      btn_junk_food: "Junk Food",
      sub_junk_food: "Log snack portion",
      
      weekly_spicy_title: "Weekly Spicy Meter",
      weekly_spicy_sub: "Max 5x / week (Schedule tracker - cannot be shielded)",
      bubu_label: "Bubu",
      dudu_label: "Dudu",
      limit_reached: "Limit Reached ⚠️",
      remaining_quota: "left this week",
      
      history_title: "Spicy & Junk Food History",
      history_sub: "Daily food & spice tracking",
      filter_today: "Today",
      filter_yesterday: "Yesterday",
      filter_2days: "2 Days Ago",
      filter_all: "All History",
      
      shop_title: "Belly Guardian Shop",
      shop_desc: "Spend saved Honey points on protective shields for Bubu!",
      shield_spice_title: "Spice Shield",
      shield_spice_desc: "Absorbs 50% penalty on spicy food intake.",
      shield_junk_title: "Junk Food Shield",
      shield_junk_desc: "Absorbs 50% penalty on oily / junk food snacking.",
      btn_buy: "Buy Shield",
      owned_badge: "Owned",
      
      chat_space_title: "Dudu Bubu's Space",
      chat_placeholder: "Type message...",
      chat_no_topics: "No topics yet",
      chat_no_topics_sub: "Tap '+' to create a new chat space!",
      chat_no_messages: "No messages yet",
      chat_no_messages_sub: "Say something sweet to Bubu, share an idea, or send a cute Dudu sticker!",
      chat_all_topics: "All Topics",
      chat_new_topic: "New Topic",
      chat_wallpaper: "Chat Wallpaper",
      she_is_typing: "bubu is typing",
      dudu_is_typing: "dudu is typing",
      btn_copy: "Copy",
      btn_forward: "Forward",
      btn_delete: "Delete",
      btn_reply: "Reply",
      copied_toast: "Copied to clipboard",
      wallpaper_saved: "Wallpaper updated"
    },
    id: {
      nav_sanctuary: "Tempat Damai",
      nav_shield: "Perut Bubu",
      nav_shop: "Toko",
      nav_talk: "Obrolan",
      
      stat_food: "Kenyang",
      stat_mood: "Suasana Hati",
      stat_sleep: "Tidur",
      stat_belly: "Perut Bubu",
      
      care_title: "Kasih Sayang",
      care_subtitle: "Sentuhan lembut",
      btn_feed: "Makan",
      btn_hug: "Peluk",
      btn_kiss: "Cium",
      btn_gift: "Hadiah",
      btn_sleep: "Tidur",
      
      action_title: "Aksi Lucu",
      action_subtitle: "Saat butuh hiburan",
      btn_dance: "Joget",
      btn_annoy: "Jailin",
      btn_fight: "Gelut",
      btn_scold: "Ocehin",
      btn_squish: "Pencet",
      btn_massage: "Pijat",
      
      intentions_title: "Niat Baik Harian",
      intentions_sub: "Kumpulkan Madu",
      
      belly_hq: "Pusat Perut Bubu",
      honey_pool_title: "Pool Madu Harian",
      honey_pool_desc: "Setiap hari Bubu dapat pool segar 120 Poin Madu. Jika makan pedas atau junkfood, madu berkurang. Jaga perut Bubu untuk dapatkan madu manis penuh! 🍯",
      btn_spicy_food: "Makanan Pedas",
      sub_spicy_food: "Catat level pedas",
      btn_junk_food: "Junk Food",
      sub_junk_food: "Catat porsi snack",
      
      weekly_spicy_title: "Meter Makan Pedas Mingguan",
      weekly_spicy_sub: "Maksimal 5x / minggu (Jadwal Tetap - Tidak dapat dilindungi tameng)",
      bubu_label: "Bubu",
      dudu_label: "Dudu",
      limit_reached: "Batas Tercapai ⚠️",
      remaining_quota: "tersisa minggu ini",
      
      history_title: "Riwayat Makan Pedas & Junk Food",
      history_sub: "Pelacakan makanan & pedas harian",
      filter_today: "Hari Ini",
      filter_yesterday: "Kemarin",
      filter_2days: "2 Hari Lalu",
      filter_all: "Semua Riwayat",
      
      shop_title: "Toko Penjaga Perut",
      shop_desc: "Gunakan poin Madu untuk membeli tameng pelindung perut Bubu!",
      shield_spice_title: "Tameng Pedas",
      shield_spice_desc: "Menyerap 50% penalti saat makan pedas.",
      shield_junk_title: "Tameng Junk Food",
      shield_junk_desc: "Menyerap 50% penalti saat ngemil berminyak.",
      btn_buy: "Beli Tameng",
      owned_badge: "Dimiliki",
      
      chat_space_title: "Ruang Dudu & Bubu",
      chat_placeholder: "Ketik pesan...",
      chat_no_topics: "Belum ada topik",
      chat_no_topics_sub: "Ketuk '+' untuk membuat ruang obrolan baru!",
      chat_no_messages: "Belum ada pesan",
      chat_no_messages_sub: "Kirim pesan manis ke Bubu, bagikan ide, atau kirim stiker lucu Dudu!",
      chat_all_topics: "Semua Topik",
      chat_new_topic: "Topik Baru",
      chat_wallpaper: "Wallpaper Chat",
      she_is_typing: "bubu is typing",
      dudu_is_typing: "dudu is typing",
      btn_copy: "Salin",
      btn_forward: "Teruskan",
      btn_delete: "Hapus",
      btn_reply: "Balas",
      copied_toast: "Disalin ke papan klip",
      wallpaper_saved: "Wallpaper diperbarui"
    }
  };

  let currentLang = localStorage.getItem('dudu_lang') || 'en';

  function t(key) {
    return translations[currentLang]?.[key] || translations.en[key] || key;
  }

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'id') lang = 'en';
    currentLang = lang;
    localStorage.setItem('dudu_lang', lang);
    applyTranslations();
  }

  function getLanguage() {
    return currentLang;
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'id' : 'en');
    return currentLang;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    
    // Elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && translations[currentLang]?.[key]) {
        el.textContent = translations[currentLang][key];
      }
    });

    // Elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && translations[currentLang]?.[key]) {
        el.placeholder = translations[currentLang][key];
      }
    });

    // Update toggle button text if present
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.innerHTML = currentLang === 'en' 
        ? `<span id="lang-indicator-text" class="text-[11px] font-bold">EN</span>`
        : `<span id="lang-indicator-text" class="text-[11px] font-bold">ID</span>`;
      langBtn.title = currentLang === 'en' ? 'Switch to Bahasa Indonesia' : 'Ganti ke Bahasa Inggris';
    }

    // Dispatch event so other modules can re-render dynamic content
    window.dispatchEvent(new CustomEvent('dudu-language-changed', { detail: { lang: currentLang } }));
  }

  window.DuduI18n = {
    t,
    setLanguage,
    getLanguage,
    toggleLanguage,
    applyTranslations
  };

  // Auto-apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
