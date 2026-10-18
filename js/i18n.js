// Bilingual Support (English & Bahasa Indonesia) for Dudu & Bubu Companion
// Strict separation: No mixed language when EN or ID is active.
(() => {
  const translations = {
    en: {
      // Navigation
      nav_home: "Home",
      nav_notes: "Notes",
      nav_chat: "Chat",
      nav_memories: "Memories",
      nav_calendar: "Calendar",
      nav_bucket: "Planner",
      nav_music: "Music",
      nav_wardrobe: "Closet",
      nav_more: "More",

      // Top Header
      header_shared_space: "our shared space ♡",
      header_synced: "synced ♡",
      header_notif_title: "Notifications",
      header_theme_title: "Toggle Theme",
      header_lang_title: "Switch to Bahasa Indonesia",

      // Home Screen
      home_our_space: "Our Space",
      home_days_count: "Day",
      home_days_together: "together",
      home_since_hello: "since our first hello",
      home_battery_love: "Love Battery",
      home_battery_love_sub: "Full of affection ♡",
      home_battery_mood: "Mood Battery",
      home_battery_mood_sub: "Cozy & Happy",
      home_adjust: "adjust",
      home_status_title: "Current Status",
      home_cozy_rooms: "Our Cozy Rooms",
      home_portal_notes: "Love Notes",
      home_portal_notes_sub: "Shared letters",
      home_portal_memories: "Memory Jar",
      home_portal_memories_sub: "Our Polaroids",
      home_portal_calendar: "Our Calendar",
      home_portal_bucket: "Bucket List",
      home_portal_bucket_sub: "Date Planner",
      home_portal_music: "Bedtime Lofi",
      home_portal_music_sub: "Soothing beats",
      home_portal_closet: "Couple Closet",
      home_portal_closet_sub: "Outfits & Games",
      home_quick_memories: "Daily Memories",
      home_quick_memories_sub: "Add a sweet polaroid photo",
      home_quick_notes: "Love Letter",
      home_quick_notes_sub: "Leave a sweet note for Bubu",
      home_quick_chat: "Chat Now",
      home_quick_chat_sub: "Talk, send stickers and GIFs",

      // Love Notes Screen
      notes_title: "Our Love Notes",
      notes_subtitle: "Sweet letters saved forever",
      notes_write_btn: "Write New Note",
      notes_empty_title: "No Love Notes Yet",
      notes_empty_desc: "Be the first to write a sweet letter to your partner!",
      notes_filter_all: "All Notes",
      notes_filter_unread: "Unread",
      notes_filter_favorites: "Favorites",

      // Memory Jar Screen
      memories_title: "Our Memory Jar",
      memories_subtitle: "Special moments frozen in time",
      memories_add_btn: "Add New Memory",
      memories_empty_title: "Memory Jar is Empty",
      memories_empty_desc: "Tap '+ Add New Memory' to save sweet moments together!",

      // Calendar Screen
      calendar_title: "Our Calendar",
      calendar_subtitle: "Upcoming anniversaries and date nights",
      calendar_empty: "No dates scheduled yet. Plan your next romantic outing!",

      // Bucket List Screen
      bucket_title: "Our Bucket List",
      bucket_subtitle: "Dreams we will achieve together",
      bucket_add_btn: "Add New Dream",
      bucket_empty: "No goals added yet. Start dreaming together!",

      // Music & Bedtime Screen
      music_title: "Bedtime & Music",
      music_countdown_title: "Bedtime Countdown 🌙",
      music_offline_btn: "Together Offline 💤",
      music_player_title: "✨ Soothing Bedtime Lofi ✨",
      music_track_title: "Lofi Night Whispers 🌙",
      music_track_sub: "Lo-fi Beats for Two",

      // Closet Screen
      closet_title: "Couple Closet & Mini Game 🎮🧥",
      closet_subtitle: "Lvl 8 | Cozy Room • Live Synced",
      closet_match_btn: "Match Us ✨",
      closet_room_title: "Dressing Room",
      closet_view_dudu: "Dudu 🐻",
      closet_view_bubu: "Bubu 🐼",
      closet_view_couple: "Together ✨",
      closet_choose_clothes: "Choose Clothes",
      closet_cat_hat: "Hat",
      closet_cat_outfit: "Outfit",
      closet_cat_accs: "Accessories",
      closet_cat_shoes: "Shoes",
      closet_minigame_title: "⏳ Mini Game Room 🕹️",
      closet_reset_btn: "Undress All",
      closet_tab_all: "All",
      closet_tab_outfits: "Outfits",
      closet_tab_hats: "Hats",
      closet_tab_glasses: "Glasses",
      closet_tab_shoes: "Shoes",

      // Duo Chat Screen
      chat_online: "online 💫",
      chat_offline: "offline",
      chat_typing_dudu: "dudu is typing...",
      chat_typing_bubu: "she is typing...",
      chat_placeholder: "Send a message...",
      chat_topic_daily: "Daily Chat",
      chat_topic_makeup: "Making Up Time",
      chat_topic_date: "Date Ideas",
      chat_all_topics: "All Topics",
      chat_new_topic: "New Topic",
      chat_no_messages: "No messages yet",
      chat_no_messages_sub: "Say something sweet, share an idea, or send a cute sticker!",
      chat_wallpaper_title: "Change Wallpaper",
      btn_copy: "Copy",
      btn_forward: "Forward",
      btn_delete: "Delete",
      btn_reply: "Reply",

      // Sticker Drawer
      stk_title: "Dudu & Bubu Stickers",
      stk_author: "art by Huang Xiao B",
      stk_tab_all: "🌟 All (135+)",
      stk_tab_dudu: "🐻 Only Dudu (83)",
      stk_tab_bubu: "🐼 Only Bubu (15)",
      stk_tab_couple: "🐻🐼 Together (39)",
      stk_tab_gif: "✨ GIF Stickers (95)",
      stk_gif_all: "All GIFs (95)",
      stk_gif_dudu: "🐻 Only Dudu (68)",
      stk_gif_couple: "🐻🐼 Together (27)",
      stk_footer: "Tap any sticker or GIF to send directly to chat ♡",

      // Wallpaper Modal
      wp_modal_title: "Chat & App Wallpaper",
      wp_modal_subtitle: "Dudu & Bubu Collection & Custom Photos",
      wp_custom_photo_title: "Custom Photo",
      wp_gallery_btn: "Choose From Gallery",
      wp_custom_active: "Custom Photo Active ✓",
      wp_remove_custom: "Remove custom photo",
      wp_scope_label: "Apply To:",
      wp_scope_chat: "Chat Only",
      wp_scope_all: "Entire App",
      wp_opacity_label: "Opacity / Brightness",
      wp_tab_dudububu: "🐻🐼 Dudu & Bubu Wallpapers (Huang Xiao B)",
      wp_tab_aesthetic: "🎨 Aesthetic & Pastel",
      wp_tab_custom: "Custom Upload",
      wp_reset_btn: "Reset to Default Wallpaper",
      wp_close_btn: "Close",
      wp_saved_toast: "Wallpaper updated successfully! ✨",

      // Battery Boost Toasts
      toast_love_full: "Love Battery: 100% Full! 💖",
      toast_love_full_desc: "Bubu & Dudu love is overflowing! Endless affection today 🥰",
      toast_love_high: "Love Battery is high! Feeling so happy near you ♡",
      toast_love_medium: "Love Battery: 50%. A warm hug is always welcome!",
      toast_love_low: "Love Battery is low! Needs cuddles and sweet talks 🥺",
      toast_badmood_zero: "Badmood: 0% (Super Happy!) ✨",
      toast_badmood_zero_desc: "Mood is joyful and calm! Zero badmood today 🥰🌸",
      toast_badmood_slight: "Badmood: Slight annoyance ☁️ Sweet kisses will fix it!",
      toast_badmood_rainy: "Badmood: Cloudy mood 🌧️ Needs pampering and ice cream!",
      toast_badmood_heavy: "Badmood: Pouting! Please be patient and buy boba 🧋😤",
      toast_badmood_alert: "EMERGENCY BADMOOD! Give hugs and favorite treats! 🌋💔"
    },
    id: {
      // Navigation
      nav_home: "Beranda",
      nav_notes: "Surat",
      nav_chat: "Obrolan",
      nav_memories: "Kenangan",
      nav_calendar: "Kalender",
      nav_bucket: "Impian",
      nav_music: "Musik",
      nav_wardrobe: "Lemari",
      nav_more: "Lainnya",

      // Top Header
      header_shared_space: "ruang bersama kita ♡",
      header_synced: "tersinkron ♡",
      header_notif_title: "Pemberitahuan",
      header_theme_title: "Ganti Tema",
      header_lang_title: "Ganti ke Bahasa Inggris",

      // Home Screen
      home_our_space: "Ruang Kita",
      home_days_count: "Hari",
      home_days_together: "bersama",
      home_since_hello: "sejak sapaan pertama kita",
      home_battery_love: "Baterai Cinta",
      home_battery_love_sub: "Penuh kasih sayang ♡",
      home_battery_mood: "Baterai Mood",
      home_battery_mood_sub: "Tenang & Bahagia",
      home_adjust: "atur",
      home_status_title: "Status Saat Ini",
      home_cozy_rooms: "Ruangan Nyaman Kita",
      home_portal_notes: "Surat Cinta",
      home_portal_notes_sub: "Surat bersama",
      home_portal_memories: "Toples Kenangan",
      home_portal_memories_sub: "Polaroid Kita",
      home_portal_calendar: "Kalender Kita",
      home_portal_bucket: "Daftar Impian",
      home_portal_bucket_sub: "Rencana Kencan",
      home_portal_music: "Lofi Pengantar Tidur",
      home_portal_music_sub: "Irama menenangkan",
      home_portal_closet: "Lemari Bersama",
      home_portal_closet_sub: "Pakaian & Permainan",
      home_quick_memories: "Kenangan Harian",
      home_quick_memories_sub: "Tambah foto polaroid manis",
      home_quick_notes: "Surat Cinta",
      home_quick_notes_sub: "Tulis pesan manis untuk Bubu",
      home_quick_chat: "Mulai Mengobrol",
      home_quick_chat_sub: "Kirim stiker dan GIF lucu",

      // Love Notes Screen
      notes_title: "Surat Cinta Kita",
      notes_subtitle: "Pesan manis tersimpan selamanya",
      notes_write_btn: "Tulis Surat Baru",
      notes_empty_title: "Belum Ada Surat Cinta",
      notes_empty_desc: "Jadilah yang pertama menulis surat cinta manis untuk pasanganmu!",
      notes_filter_all: "Semua Surat",
      notes_filter_unread: "Belum Dibaca",
      notes_filter_favorites: "Favorit",

      // Memory Jar Screen
      memories_title: "Toples Kenangan Kita",
      memories_subtitle: "Momen manis yang tak terlupakan",
      memories_add_btn: "Tambah Kenangan Baru",
      memories_empty_title: "Toples Kenangan Masih Kosong",
      memories_empty_desc: "Ketuk '+ Tambah Kenangan Baru' untuk menyimpan momen manis bersama!",

      // Calendar Screen
      calendar_title: "Kalender Kita",
      calendar_subtitle: "Hari jadian dan rencana kencan",
      calendar_empty: "Belum ada rencana kencan terjadwal. Rencanakan kencan romantismu!",

      // Bucket List Screen
      bucket_title: "Daftar Impian Kita",
      bucket_subtitle: "Mimpi yang akan kita capai bersama",
      bucket_add_btn: "Tambah Impian Baru",
      bucket_empty: "Belum ada impian tersimpan. Mulai tulis mimpi bersama!",

      // Music & Bedtime Screen
      music_title: "Waktu Tidur & Musik",
      music_countdown_title: "Hitung Mundur Tidur 🌙",
      music_offline_btn: "Tidur Bersama 💤",
      music_player_title: "✨ Lofi Pengantar Tidur ✨",
      music_track_title: "Bisikan Malam Lofi 🌙",
      music_track_sub: "Irama Santai Berdua",

      // Closet Screen
      closet_title: "Lemari Bersama & Permainan 🎮🧥",
      closet_subtitle: "Lvl 8 | Ruangan Nyaman • Tersinkron",
      closet_match_btn: "Serasikan ✨",
      closet_room_title: "Kamar Ganti",
      closet_view_dudu: "Dudu 🐻",
      closet_view_bubu: "Bubu 🐼",
      closet_view_couple: "Berdua ✨",
      closet_choose_clothes: "Pilih Pakaian",
      closet_cat_hat: "Topi",
      closet_cat_outfit: "Baju",
      closet_cat_accs: "Aksesoris",
      closet_cat_shoes: "Sepatu",
      closet_minigame_title: "⏳ Ruang Permainan 🕹️",
      closet_reset_btn: "Lepas Semua",
      closet_tab_all: "Semua",
      closet_tab_outfits: "Pakaian",
      closet_tab_hats: "Topi",
      closet_tab_glasses: "Kacamata",
      closet_tab_shoes: "Sepatu",

      // Duo Chat Screen
      chat_online: "online 💫",
      chat_offline: "offline",
      chat_typing_dudu: "dudu sedang mengetik...",
      chat_typing_bubu: "dia sedang mengetik...",
      chat_placeholder: "Ketik pesan manis...",
      chat_topic_daily: "Obrolan Harian",
      chat_topic_makeup: "Waktu Baikan",
      chat_topic_date: "Ide Kencan",
      chat_all_topics: "Semua Topik",
      chat_new_topic: "Topik Baru",
      chat_no_messages: "Belum ada pesan",
      chat_no_messages_sub: "Kirim pesan manis, bagikan ide, atau kirim stiker lucu!",
      chat_wallpaper_title: "Ganti Wallpaper",
      btn_copy: "Salin",
      btn_forward: "Teruskan",
      btn_delete: "Hapus",
      btn_reply: "Balas",

      // Sticker Drawer
      stk_title: "Stiker Dudu & Bubu",
      stk_author: "karya Huang Xiao B",
      stk_tab_all: "🌟 Semua (135+)",
      stk_tab_dudu: "🐻 Hanya Dudu (83)",
      stk_tab_bubu: "🐼 Hanya Bubu (15)",
      stk_tab_couple: "🐻🐼 Berdua (39)",
      stk_tab_gif: "✨ Stiker GIF (95)",
      stk_gif_all: "Semua GIF (95)",
      stk_gif_dudu: "🐻 Hanya Dudu (68)",
      stk_gif_couple: "🐻🐼 Berdua (27)",
      stk_footer: "Sentuh stiker atau GIF untuk langsung mengirim ke obrolan ♡",

      // Wallpaper Modal
      wp_modal_title: "Wallpaper Obrolan & Aplikasi",
      wp_modal_subtitle: "Koleksi Dudu Bubu & Custom Foto",
      wp_custom_photo_title: "Foto Custom Sendiri",
      wp_gallery_btn: "Pilih Dari Galeri",
      wp_custom_active: "Foto Custom Aktif ✓",
      wp_remove_custom: "Hapus foto custom",
      wp_scope_label: "Terapkan Ke:",
      wp_scope_chat: "Hanya Obrolan",
      wp_scope_all: "Seluruh Aplikasi",
      wp_opacity_label: "Transparansi / Kecerahan",
      wp_tab_dudububu: "🐻🐼 Wallpaper Dudu & Bubu (Huang Xiao B)",
      wp_tab_aesthetic: "🎨 Aesthetic & Pastel",
      wp_tab_custom: "Unggah Kustom",
      wp_reset_btn: "Kembalikan ke Wallpaper Default",
      wp_close_btn: "Tutup",
      wp_saved_toast: "Wallpaper berhasil diperbarui! ✨",

      // Battery Boost Toasts
      toast_love_full: "Baterai Cinta: 100% Penuh! 💖",
      toast_love_full_desc: "Cinta Bubu & Dudu penuh melimpah ruah! Kasih sayang kita tak terbatas hari ini 🥰",
      toast_love_high: "Baterai Cinta tinggi! Hati senang dan berbunga-bunga dekat kamu ♡",
      toast_love_medium: "Baterai Cinta: 50%. Pelukan hangat ekstra selalu dinanti!",
      toast_love_low: "Baterai Cinta mulai rendah! Butuh disayang dan ditemani mengobrol 🥺",
      toast_badmood_zero: "Suasana Hati Buruk: 0% (Sangat Ceria!) ✨",
      toast_badmood_zero_desc: "Mood lagi ceria dan berbunga-bunga! Tidak ada rasa kesal sama sekali hari ini 🥰🌸",
      toast_badmood_slight: "Suasana Hati: Sedikit bete ☁️ Ciuman manis pasti bikin senyum!",
      toast_badmood_rainy: "Suasana Hati: Mood mendung 🌧️ Butuh dimanjakan dan es krim!",
      toast_badmood_heavy: "Suasana Hati: Lagi ngambek! Tolong sabar dan belikan boba 🧋😤",
      toast_badmood_alert: "DARURAT RASA KESAL! Segera peluk dan bawakan makanan kesukaan! 🌋💔"
    }
  };

  let currentLang = localStorage.getItem('dudu_lang') || 'id';

  function t(key) {
    return translations[currentLang]?.[key] || translations.id[key] || translations.en[key] || key;
  }

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'id') lang = 'id';
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

    // Elements with data-i18n-html attribute
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && translations[currentLang]?.[key]) {
        el.innerHTML = translations[currentLang][key];
      }
    });

    // Elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && translations[currentLang]?.[key]) {
        el.placeholder = translations[currentLang][key];
      }
    });

    // Elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key && translations[currentLang]?.[key]) {
        el.title = translations[currentLang][key];
      }
    });

    // Update toggle buttons text & titles
    const langIndicators = document.querySelectorAll('.lang-indicator-text');
    langIndicators.forEach(ind => {
      ind.textContent = currentLang.toUpperCase();
    });

    const langBtns = document.querySelectorAll('.btn-lang-toggle');
    langBtns.forEach(btn => {
      btn.title = currentLang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English';
    });

    // Notify modules to re-render dynamic content
    window.dispatchEvent(new CustomEvent('dudu-language-changed', { detail: { lang: currentLang } }));
  }

  // Delegated click handler for language toggles
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-lang-toggle, #btn-lang-toggle, #btn-chat-lang-toggle');
    if (btn) {
      e.preventDefault();
      toggleLanguage();
    }
  });

  window.DuduI18n = {
    t,
    setLanguage,
    getLanguage,
    toggleLanguage,
    applyTranslations
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
