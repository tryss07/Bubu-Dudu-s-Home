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
      nav_stickers: "Stickers",
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
      chat_wallpaper: "Chat Wallpaper",
      chat_wallpaper_title: "Change Wallpaper",
      she_is_typing: "bubu is typing...",
      dudu_is_typing: "dudu is typing...",
      chat_no_messages: "No messages yet",
      chat_no_messages_sub: "Say something sweet, share an idea, or send a cute sticker!",
      msg_options: "Message Options",
      stk_options: "Sticker Options",
      btn_copy: "Copy",
      btn_forward: "Forward",
      btn_delete: "Delete",
      btn_reply: "Reply",
      btn_fav: "Favorite",
      btn_unfav: "Favorited",

      // Extra UI Keys (English)
      home_together_prefix: "We've been together for",
      home_tap_to_visit: "Tap to visit",
      home_dudu_battery: "Dudu's love battery",
      home_bubu_battery: "Bubu's love battery",
      notes_write: "+ Write",
      notes_all: "All Notes",
      notes_unread: "Unread",
      notes_favorites: "Favorites",
      notes_modal_title: "💌 Write a Love Note",
      notes_modal_desc: "Send a sweet handwritten note into our shared space:",
      notes_seal_wax: "Wax Seal",
      notes_seal_craft: "Craft Paper",
      notes_seal_card: "Sweet Card",
      notes_send_btn: "Send Love Note ♥",
      notes_delete_btn: "🗑️ Delete",
      notes_keep_btn: "Keep in Heart ♡",
      memories_subtitle_full: "Capturing our together today",
      memories_view_all: "View All",
      memories_timeline_title: "⌛ Memory Timeline ⌛",
      memories_handwritten: "Handwritten notes",
      memories_add_photo: "Add Photo",
      memories_modal_title: "Add to Memory Jar 📸",
      memories_label_title: "Memory Title",
      memories_label_date: "Date",
      memories_label_photo: "Polaroid Photo",
      memories_upload_btn: "Upload Custom Photo",
      memories_remove_photo: "✕ Remove custom photo",
      memories_choose_preset: "or choose a preset art scene:",
      memories_save_btn: "Save to Jar ✨",
      memories_cherish_btn: "Cherish Forever ✨",
      memories_edit_caption: "Edit Caption",
      memories_save_caption: "Save Caption ♡",
      memories_add_milestone: "+ Add",
      memories_milestone_title: "⌛ Add Memory Milestone",
      memories_milestone_label_title: "Milestone Title",
      memories_milestone_label_date: "Date",
      memories_milestone_label_note: "Sweet Note",
      memories_milestone_save: "Save Milestone ✨",
      cal_upcoming: "⏳ Upcoming Events 📝",
      cal_save_btn: "Save to Calendar ♡",
      cal_add_moment: "Add New Moment",
      cal_planned_moments: "Planned Moments:",
      cal_sun: "Sun",
      cal_mon: "Mon",
      cal_tue: "Tue",
      cal_wed: "Wed",
      cal_thu: "Thu",
      cal_fri: "Fri",
      cal_sat: "Sat",
      bucket_subtitle_full: "Adventures & dreams together",
      bucket_adventure_progress: "Our Adventure Progress",
      bucket_completed_suffix: "Completed",
      bucket_keep_exploring: "Keep exploring, love! 🐻🐾",
      bucket_tab_all: "All Dates",
      bucket_tab_indoor: "Cozy Indoor",
      bucket_tab_outdoor: "Outdoor",
      bucket_next_idea: "Next Date Idea?",
      bucket_modal_title: "Add Date Wishlist",
      bucket_modal_sub: "dreaming our future together ♡",
      bucket_label_title: "Date or Idea Title",
      bucket_label_desc: "Little Description (Optional)",
      bucket_label_vibe: "Vibe Category",
      bucket_vibe_outdoor: "🌸 Outdoor",
      bucket_vibe_indoor: "☕ Indoor",
      bucket_add_btn_action: "Add to Wishlist ✨",
      closet_dudu_tab: "Dudu's Wardrobe 🐻",
      closet_bubu_tab: "Bubu's Wardrobe 🐼",
      closet_minigame_desc: "Mix & match pairs! Best score:",
      closet_play_btn: "Play 🎮",
      closet_bare_btn: "Bare 🐾",
      chat_selection_copy: "Copy",
      chat_selection_forward: "Forward",
      chat_selection_delete: "Delete",
      chat_replying_to: "Replying to",
      chat_msg_preview: "Message preview",
      chat_suggestions_label: "Sticker Suggestions",
      chat_delete_modal_title: "Delete Message?",
      chat_delete_modal_desc: "Are you sure you want to delete this message? This cannot be undone.",
      chat_cancel_btn: "Cancel",
      chat_delete_confirm_btn: "Delete",
      chat_forward_title: "Forward to Topic",
      chat_search_topics_placeholder: "Search topics...",
      chat_all_topics_title: "All Chat Topics",
      chat_all_topics_sub: "explore & organize our talks ♡",
      chat_create_topic_title: "Create New Topic",
      chat_create_topic_sub: "a new thread for our thoughts ♡",
      chat_topic_name_label: "Topic Title",
      chat_topic_icon_label: "Icon / Emoji",
      chat_create_topic_btn: "Create Topic ✨",
      chat_topic_options_title: "Topic Options",
      chat_rename_topic_btn: "Rename Topic",
      chat_delete_topic_btn: "Delete Topic",
      chat_rename_topic_title: "Rename Topic",
      chat_rename_topic_sub: "give our thread a new name ♡",
      chat_save_changes_btn: "Save Changes ♡",
      sec_title: "E2EE Security & Relay",
      sec_subtitle: "AES-GCM 256-bit Zero-Knowledge",
      sec_view_role: "Viewing Role",
      sec_passphrase: "Shared Secret Passphrase",
      sec_relay_url: "Relay Server URL",
      sec_btn_local: "Local Server",
      sec_btn_remote: "Cloudflare Relay",
      sec_save_btn: "Save Security Settings ♡",
      sleep_title: "Sweet Dreams, Bubu & Dudu",
      sleep_desc: "The stars are glowing softly. Together offline, resting our hearts for tomorrow... zzz ✨",
      sleep_wake_btn: "Wake Up ☀️",
      home_next_date_idea: "Next Date Idea?",
      home_next_anniversary: "Next Anniversary:",
      home_cozy_agenda: "our cozy agenda ♡",
      game_outfit_matcher: "🎮 Outfit Matcher",
      game_match_desc: "Match pairs before time expires!",
      game_score_label: "Score:",
      game_time_label: "Time:",
      status_modal_title: "Update Your Status",
      status_modal_sub: "let your partner know what you're doing ♡",
      status_quick_label: "Quick Sweet Statuses:",
      status_update_btn: "Update Status ♡",
      battery_modal_title: "Adjust Love Battery",
      battery_modal_sub: "how full is your heart right now? ♡",
      battery_preset_low: "Low Energy (25%)",
      battery_preset_hug: "Need Hugs (50%)",
      battery_preset_happy: "Happy (75%)",
      battery_preset_full: "Full Love (100%)",
      battery_save_btn: "Save Love Level ♡",
      notif_modal_title: "Notifications",
      notif_modal_sub: "latest 5 updates from our space ♡",
      notif_clear_btn: "Clear history",
      notif_close_btn: "Close ♡",
      anni_modal_title: "Our Relationship Date",
      anni_modal_sub: "when our love story began ♡",
      anni_start_label: "Start Date",
      anni_save_btn: "Save Anniversary Date ♡",
      cal_agenda_sub: "our cozy agenda ♡",
      cal_custom_icon_ph: "Other emoji",

      // Sticker Drawer & Centre
      stk_title: "Dudu & Bubu Stickers",
      stk_author: "art by Huang Xiao B",
      stk_centre_title: "Sticker Centre",
      stk_centre_subtitle: "Download sticker packs for instant offline chat",
      stk_open_chat: "Chat",
      stk_centre_btn: "Centre",
      stk_tab_fav: "⭐ Fav (0)",
      stk_tab_all: "🌟 All (1975)",
      stk_tab_dudu: "🐻 Only Dudu (411)",
      stk_tab_bubu: "🐼 Only Bubu (683)",
      stk_tab_couple: "🐻🐼 Together (881)",
      stk_tab_gif: "✨ Animated (1975)",
      stk_gif_all: "All Animated (1975)",
      stk_gif_dudu: "🐻 Only Dudu (411)",
      stk_gif_bubu: "🐼 Only Bubu (683)",
      stk_gif_couple: "🐻🐼 Together (881)",
      stk_footer: "Tap any sticker to send directly to chat ♡",

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
      nav_stickers: "Stiker",
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
      chat_wallpaper: "Wallpaper Chat",
      chat_wallpaper_title: "Ganti Wallpaper",
      she_is_typing: "bubu sedang mengetik...",
      dudu_is_typing: "dudu sedang mengetik...",
      chat_no_messages: "Belum ada pesan",
      chat_no_messages_sub: "Kirim pesan manis, bagikan ide, atau kirim stiker lucu!",
      msg_options: "Opsi Pesan",
      stk_options: "Opsi Stiker",
      btn_copy: "Salin",
      btn_forward: "Teruskan",
      btn_delete: "Hapus",
      btn_reply: "Balas",
      btn_fav: "Favorit",
      btn_unfav: "Disukai",

      // Sticker Drawer & Centre
      stk_title: "Stiker Dudu & Bubu",
      stk_author: "karya Huang Xiao B",
      stk_centre_title: "Pusat Stiker",
      stk_centre_subtitle: "Unduh paket stiker agar chat offline instan",
      stk_open_chat: "Obrolan",
      stk_centre_btn: "Pusat",
      stk_tab_fav: "⭐ Favorit (0)",
      stk_tab_all: "🌟 Semua (1975)",
      stk_tab_dudu: "🐻 Hanya Dudu (411)",
      stk_tab_bubu: "🐼 Hanya Bubu (683)",
      stk_tab_couple: "🐻🐼 Berdua (881)",
      stk_tab_gif: "✨ Animasi (1975)",
      stk_gif_all: "Semua Animasi (1975)",
      stk_gif_dudu: "🐻 Hanya Dudu (411)",
      stk_gif_bubu: "🐼 Hanya Bubu (683)",
      stk_gif_couple: "🐻🐼 Berdua (881)",
      stk_footer: "Sentuh stiker untuk langsung mengirim ke obrolan ♡",

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
      toast_badmood_alert: "DARURAT RASA KESAL! Segera peluk dan bawakan makanan kesukaan! 🌋💔",

      // Extra UI Keys (Indonesian)
      home_together_prefix: "Kita telah bersama selama",
      home_tap_to_visit: "Sentuh untuk melihat",
      home_dudu_battery: "Baterai cinta Dudu",
      home_bubu_battery: "Baterai cinta Bubu",
      notes_write: "+ Tulis",
      notes_all: "Semua Surat",
      notes_unread: "Belum Dibaca",
      notes_favorites: "Favorit",
      notes_modal_title: "💌 Tulis Surat Cinta",
      notes_modal_desc: "Kirim pesan manis ke ruang bersama kita:",
      notes_seal_wax: "Segel Lilin",
      notes_seal_craft: "Kertas Craft",
      notes_seal_card: "Kartu Manis",
      notes_send_btn: "Kirim Surat Cinta ♥",
      notes_delete_btn: "🗑️ Hapus",
      notes_keep_btn: "Simpan di Hati ♡",
      memories_subtitle_full: "Mengabadikan kebersamaan kita hari ini",
      memories_view_all: "Lihat Semua",
      memories_timeline_title: "⌛ Linimasa Kenangan ⌛",
      memories_handwritten: "Catatan tulisan tangan",
      memories_add_photo: "Tambah Foto",
      memories_modal_title: "Tambah ke Toples Kenangan 📸",
      memories_label_title: "Judul Kenangan",
      memories_label_date: "Tanggal",
      memories_label_photo: "Foto Polaroid",
      memories_upload_btn: "Unggah Foto Sendiri",
      memories_remove_photo: "✕ Hapus foto custom",
      memories_choose_preset: "atau pilih gambar kenangan:",
      memories_save_btn: "Simpan ke Toples ✨",
      memories_cherish_btn: "Simpan Selamanya ✨",
      memories_edit_caption: "Ubah Keterangan",
      memories_save_caption: "Simpan Keterangan ♡",
      memories_add_milestone: "+ Tambah",
      memories_milestone_title: "⌛ Tambah Momen Kenangan",
      memories_milestone_label_title: "Judul Momen",
      memories_milestone_label_date: "Tanggal",
      memories_milestone_label_note: "Pesan Manis",
      memories_milestone_save: "Simpan Momen ✨",
      cal_upcoming: "⏳ Agenda Mendatang 📝",
      cal_save_btn: "Simpan ke Kalender ♡",
      cal_add_moment: "Tambah Momen Baru",
      cal_planned_moments: "Momen Terencana:",
      cal_sun: "Min",
      cal_mon: "Sen",
      cal_tue: "Sel",
      cal_wed: "Rab",
      cal_thu: "Kam",
      cal_fri: "Jum",
      cal_sat: "Sab",
      bucket_subtitle_full: "Petualangan & mimpi berdua",
      bucket_adventure_progress: "Kemajuan Petualangan Kita",
      bucket_completed_suffix: "Tercapai",
      bucket_keep_exploring: "Terus jelajahi dunia bersamaku! 🐻🐾",
      bucket_tab_all: "Semua Kencan",
      bucket_tab_indoor: "Di Dalam Rumah",
      bucket_tab_outdoor: "Luar Ruangan",
      bucket_next_idea: "Ide Kencan Selanjutnya?",
      bucket_modal_title: "Tambah Rencana Kencan",
      bucket_modal_sub: "merangkai mimpi masa depan berdua ♡",
      bucket_label_title: "Judul Kencan / Ide",
      bucket_label_desc: "Deskripsi Singkat (Opsional)",
      bucket_label_vibe: "Kategori Suasana",
      bucket_vibe_outdoor: "🌸 Luar Ruangan",
      bucket_vibe_indoor: "☕ Di Dalam Rumah",
      bucket_add_btn_action: "Tambah ke Impian ✨",
      closet_dudu_tab: "Lemari Dudu 🐻",
      closet_bubu_tab: "Lemari Bubu 🐼",
      closet_minigame_desc: "Cocokkan pasangan kartu! Skor tertinggi:",
      closet_play_btn: "Main 🎮",
      closet_bare_btn: "Polos 🐾",
      chat_selection_copy: "Salin",
      chat_selection_forward: "Teruskan",
      chat_selection_delete: "Hapus",
      chat_replying_to: "Membalas",
      chat_msg_preview: "Pratinjau pesan",
      chat_suggestions_label: "Saran Stiker",
      chat_delete_modal_title: "Hapus Pesan?",
      chat_delete_modal_desc: "Apakah kamu yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.",
      chat_cancel_btn: "Batal",
      chat_delete_confirm_btn: "Hapus",
      chat_forward_title: "Teruskan ke Topik",
      chat_search_topics_placeholder: "Cari topik...",
      chat_all_topics_title: "Semua Topik Obrolan",
      chat_all_topics_sub: "jelajahi & atur obrolan kita ♡",
      chat_create_topic_title: "Buat Topik Baru",
      chat_create_topic_sub: "ruang baru untuk obrolan kita ♡",
      chat_topic_name_label: "Judul Topik",
      chat_topic_icon_label: "Ikon / Emoji",
      chat_create_topic_btn: "Buat Topik ✨",
      chat_topic_options_title: "Opsi Topik",
      chat_rename_topic_btn: "Ubah Nama Topik",
      chat_delete_topic_btn: "Hapus Topik",
      chat_rename_topic_title: "Ubah Nama Topik",
      chat_rename_topic_sub: "beri nama baru untuk topik kita ♡",
      chat_save_changes_btn: "Simpan Perubahan ♡",
      sec_title: "Keamanan E2EE & Relay",
      sec_subtitle: "AES-GCM 256-bit Enkripsi Total",
      sec_view_role: "Peran Pengguna",
      sec_passphrase: "Kata Sandi Rahasia Bersama",
      sec_relay_url: "URL Server Relay",
      sec_btn_local: "Server Lokal",
      sec_btn_remote: "Relay Cloudflare",
      sec_save_btn: "Simpan Pengaturan Keamanan ♡",
      sleep_title: "Mimpi Indah, Bubu & Dudu",
      sleep_desc: "Bintang bersinar lembut. Tidur bersama, mengistirahatkan hati untuk esok hari... zzz ✨",
      sleep_wake_btn: "Bangun Tidur ☀️",
      home_next_date_idea: "Ide Kencan Berikutnya?",
      home_next_anniversary: "Hari Jadian Berikutnya:",
      home_cozy_agenda: "agenda hangat kita ♡",
      game_outfit_matcher: "🎮 Pencocok Pakaian",
      game_match_desc: "Cocokkan pasangan sebelum waktu habis!",
      game_score_label: "Skor:",
      game_time_label: "Waktu:",
      status_modal_title: "Perbarui Statusmu",
      status_modal_sub: "beri tahu pasangan apa yang sedang kamu lakukan ♡",
      status_quick_label: "Status Cepat & Manis:",
      status_update_btn: "Perbarui Status ♡",
      battery_modal_title: "Atur Baterai Cinta",
      battery_modal_sub: "seberapa penuh hatimu saat ini? ♡",
      battery_preset_low: "Kurang Energi (25%)",
      battery_preset_hug: "Butuh Pelukan (50%)",
      battery_preset_happy: "Bahagia (75%)",
      battery_preset_full: "Penuh Cinta (100%)",
      battery_save_btn: "Simpan Tingkat Cinta ♡",
      notif_modal_title: "Pemberitahuan",
      notif_modal_sub: "5 pembaruan terbaru dari ruang kita ♡",
      notif_clear_btn: "Bersihkan riwayat",
      notif_close_btn: "Tutup ♡",
      anni_modal_title: "Tanggal Hubungan Kita",
      anni_modal_sub: "saat kisah cinta kita dimulai ♡",
      anni_start_label: "Tanggal Mulai",
      anni_save_btn: "Simpan Tanggal Jadian ♡",
      cal_agenda_sub: "agenda hangat kita ♡",
      cal_custom_icon_ph: "Emoji lain"
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
