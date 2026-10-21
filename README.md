# 🐾 Dudu & Bubu ♡ Our Space

> A cozy, private couple companion, shared memories sanctuary, and zero-knowledge encrypted duo chat application engineered for Android and the Web.

[![Android](https://img.shields.io/badge/Android-8.0%2B-3DDC84?logo=android&logoColor=white)](#native-android-apk)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?logo=capacitor&logoColor=white)](#architecture--tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](#backend-relay-server)
[![Encryption](https://img.shields.io/badge/Encryption-AES--GCM--256-blueviolet)](#8-private-duo-chat-talk)
[![Tests](https://img.shields.io/badge/Tests-Playwright-2EAD33?logo=playwright&logoColor=white)](#automated-testing)

---

## 📱 Application Overview

**Dudu & Bubu ♡ Our Space** is an all-in-one private couple space crafted for **Nana & Kevin (Bubu & Dudu)**. It merges romantic shared couple spaces (days counter, love batteries, shared love notes, polaroid memory jar, bucket list date planner, calendar countdowns, bedtime lofi radio, dressing room) with a private, zero-knowledge end-to-end encrypted messenger and a modular in-app sticker repository.

---

## ✨ Core Modules & Feature Breakdown

### 1. 🏠 Our Space (Home)
- **Anniversary & Days Counter**: Tracks relationship milestones (*"We've been together for X days ♡ since 4 November 2025"*) with an interactive anniversary date editor.
- **Dual Love Batteries**: Independent live battery indicators for **Dudu 🐻** and **Bubu 🐼** with tap-to-boost/adjust dialogs and floating heart-burst particle animations.
- **Current Status Chips**: Quick live status badges for both partners (e.g., *"Syududu"*, *"Syububu"*) with customizable status editor.
- **Cozy Room Portals**: Direct navigation hub granting quick access to all shared spaces.

### 2. 💌 Love Notes
- **Shared Digital Letters**: Cozy handwritten-style notes and letters exchanged between Dudu and Bubu.
- **Write Modal**: Compose new love notes with tags, mood icons, and custom content.
- **Filter Chips**: Filter notes by **All Notes**, **Unread**, and **Favorites**.
- **Interactive Actions**: Mark notes as read, toggle favorites, and manage entries.

### 3. 🍯 Memory Jar (Our Polaroids & Timeline)
- **Our Polaroids**: Pinterest-style masonry grid featuring polaroid photo cards, washi tape decorations, captions, dates, and full-screen view.
- **Add Polaroid**: Upload photos from gallery or snap directly via camera.
- **Memory Timeline**: Chronological milestone tracker rendered with handwritten styling and milestone creation modal.

### 4. 📋 Bucket List & Date Planner
- **Adventure Progress**: Real-time adventure completion bar tracking finished milestones (e.g., *24 of 60 Completed*).
- **Categorized Adventures**: Filter by **All Dates**, **Cozy Indoor**, and **Outdoor**.
- **Checklist**: Interactive check/uncheck completion toggles with partner sync.
- **Date Idea Generator**: Quick *"Next Date Idea?"* recommendation card with custom idea submission.

### 5. 🗓️ Our Calendar & Anniversaries
- **Anniversary Countdown Banner**: Live countdown to the next anniversary milestone (*"1 Year Anniversary! 🎂🎉 Only X days left!"*).
- **Interactive Monthly Calendar**: Full calendar view with month navigation (`<` and `>`), active date indicators, and scheduled events.
- **Upcoming Events Scrapbook**: Scrapbook card listing upcoming dates, reminders, and celebration plans.

### 6. 🌙 Bedtime & Music (Bedtime Lofi)
- **24/7 Lofi Live Stream**: Embedded streaming audio player powered by `lofi.radio` chill beats.
- **Spinning Vinyl Animation**: Retro animated vinyl record disc that spins smoothly while audio plays.
- **Audio Controls**: Play/Pause, track skip controls, and volume slider with a draggable circular handle.
- **Nighttime Ambiance**: Cozy bedtime illustration creating a calming night routine environment.

### 7. 🎮 Couple Closet & Mini Game (Wardrobe)
- **Dressing Room Stage**: Interactive outfit viewer with 3 stage view modes:
  - **Dudu 🐻 Room**
  - **Bubu 🐼 Room**
  - **Together ✨ Room** (duo side-by-side view)
- **Closet Outfits**: Costumes and seasonal clothes catalog (baby clothes, winter coats, cozy sweaters).
- **Equipped Summary**: Live equipped status badges tracking each mascot's active outfit.
- **Mini Game Hub**: Portal for couple games.

### 8. 💬 Private Duo Chat ("Talk")
- **True Zero-Knowledge E2EE**: All messages, stickers, and media are encrypted on-device via **AES-GCM 256-bit** (derived with PBKDF2 using 100,000 SHA-256 iterations) through the WebCrypto `SubtleCrypto` API. The relay server never has access to plaintext.
- **Dynamic Identity Switcher**: Seamlessly switch perspectives between **Dudu 🐻** and **Bubu 🐼**; sent bubbles align right and received bubbles align left dynamically without altering stored chat history.
- **Media Uploads with Progress Bar**: Send encrypted photos and videos with real-time percentage indicators and animated upload progress bar (`#chat-upload-bar`).
- **Voice Notes**: In-chat encrypted audio recorder and custom voice memo player.
- **Swipe-to-Reply**: Touch gesture swiping to quote messages with an inline reply banner (`#chat-reply-bar`).
- **Selection Mode**: Long-press activation for batch message forwarding, selection, and deletion.
- **Custom Wallpapers**: 5 curated aesthetic cozy presets plus custom photo background upload with adjustable opacity.
- **Resilient Offline Sync**: IndexedDB (`dudu_chat_db`) client storage with auto-reconnect backoff and delivery receipts (`done` / `done_all`).

### 9. 🎨 In-App Sticker Centre (Pusat Stiker)
- **1,472 Curated WebP Stickers**: 22 modular packs covering Dudu, Bubu, and Couple themes.
- **Default Core 300 Pack**: Pre-indexed essential stickers ready on startup.
- **In-App On-Demand Downloads**: Modular packs download inside the app over HTTP with a live download progress bar, keeping the base app package lean.
- **Local IndexedDB Blob Persistence**: Downloaded packs are permanently cached into client-side IndexedDB (`DuduStickersDB`) with `navigator.storage.persist()`, enabling instant 100% offline access.
- **Sticker Management**: Filter packs by **All**, **Dudu**, **Bubu**, **Couple**, and **Downloaded**, plus emotion search and in-chat sticker keyboard tray.

### 10. 🌐 Bilingual Localization & Theming
- **Dynamic Language Toggle**: Instant switching between **Bahasa Indonesia (ID)** and **English (EN)** via top header toggle (`js/i18n.js`).
- **Dark & Light Modes**: Warm cream light theme and espresso dark mode (`#btn-theme-toggle`).
- **Native Android Foreground Service**: Zero-Firebase background service holding `PARTIAL_WAKE_LOCK` with 20-second OkHttp keepalive pings for instant notification alerts.

---

## 📂 Repository Structure

```text
Dudu-Duo_Project/
├── index.html                    # Single Page Application core UI (Home, Notes, Memories, Calendar, Bucket, Music, Closet, Chat, Stickers)
├── capacitor.config.json         # Capacitor configuration (App ID: com.honeyandbear.dudu, Name: Dudu)
├── package.json                  # Dependencies, test runners, & build scripts
├── Dudu.apk                      # Ready-to-install Android debug/release APK (~39.3 MB)
│
├── css/
│   └── custom.css                # Cozy styles, animations, vinyl spin, and theme tokens
│
├── js/
│   ├── dudu_mockup.js            # Core UI controller (Home, Notes, Memories, Calendar, Bucket, Music, Closet)
│   ├── i18n.js                   # Bilingual dictionary (ID / EN) & reactive DOM translator
│   ├── stickers_catalog.js       # Sticker taxonomy, canonical names, & pack associations
│   ├── stickers_center.js        # In-app pack downloader, IndexedDB store, & progress engine
│   ├── audio.js                  # Sound effects & notification audio synthesizer
│   └── chat/                     # Private Duo Chat subsystem:
│       ├── crypto.js             # WebCrypto AES-GCM 256-bit encryption & key derivation
│       ├── socket.js             # Resilient WebSocket client with exponential backoff & ping loop
│       ├── storage.js            # IndexedDB message history, topics, & offline queue
│       ├── ui.js                 # Chat interface, gestures, selection, media upload bar, & quotes
│       └── wallpaper.js          # Chat background presets & custom photo opacity engine
│
├── server/                       # Standalone zero-knowledge Node.js relay server
│   ├── server.js                 # HTTP + WebSocket relay, chunked blob handler (Port 3000)
│   ├── db.js                     # SQLite database in WAL mode (stores encrypted payloads only)
│   └── data/                     # Local server data directory
│
├── android/                      # Native Android Studio / Gradle project (Capacitor 8)
│   └── app/src/main/
│       ├── java/com/honeyandbear/dudu/
│       │   ├── MainActivity.java           # Capacitor bridge with edge-to-edge system bars
│       │   ├── DuduCompanionPlugin.java    # Bridge plugin for stats & notifications
│       │   ├── DuduCompanionService.java   # 24/7 foreground service & OkHttp WebSocket listener
│       │   └── DuduBootReceiver.java       # Boot completed receiver
│       └── res/                            # Android launcher icons & drawables
│
└── tests/                        # Automated Playwright test suites
    ├── run_all_tests.js                    # Comprehensive test runner orchestrator
    ├── test_sticker_centre_and_upload.js   # Sticker pack download & media progress bar tests
    ├── test_sticker_suggestions_and_favs.js# Sticker suggestions & favorites test
    ├── test_bilingual_and_fresh_defaults.js# Language localization & defaults test
    └── test_sticker_click_modal.js         # Sticker actions modal test
```

---

## 🛠️ Getting Started & Development

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ / v22+ / v26+)
- **Package Manager**: `pnpm` (or `npm`)
- **Java**: OpenJDK 21 (for Android APK builds)
- **Android SDK**: API Level 34 or 35

### 1. Installation
```bash
git clone https://github.com/tryss07/Dudu-Duo_Project.git
cd Dudu-Duo_Project
pnpm install
```

### 2. Run Local Web Preview
```bash
pnpm run start:static
# Open http://localhost:3000 in your browser
```

### 3. Run Backend Relay Server
```bash
cd server
pnpm install
pnpm start
# Server listens on http://localhost:3000 and ws://localhost:3000/chat-socket
```

---

## 🤖 Native Android APK

The native Android app is packaged with Capacitor 8 and includes a background companion service.

Build the APK directly:
```bash
pnpm run build:apk
```

**Build Pipeline Details**:
1. Prepares distribution assets in `dist/` via `scripts/prepare_dist.js`.
2. Syncs assets and plugins with Android (`pnpm exec cap sync android`).
3. Compiles the project using Gradle (`./gradlew assembleDebug`) with `JAVA_HOME` and `ANDROID_HOME`.
4. Outputs the fresh APK to `./Dudu.apk` (~39.3 MB).

---

## 🧪 Automated Testing

The project includes an end-to-end integration test suite using Playwright:

```bash
# Start local static server (in background)
python3 -m http.server 3000 &

# Run all test suites
pnpm test
```

### Verified Test Suites:
- `test_sticker_centre_and_upload.js`: Verifies Sticker Centre pack division, on-demand download progress, and media upload progress bar.
- `test_sticker_suggestions_and_favs.js`: Tests sticker keywords, emotion suggestions, and favorites.
- `test_bilingual_and_fresh_defaults.js`: Validates English and Indonesian localization and initial data onboarding.
- `test_sticker_click_modal.js`: Confirms sticker preview modal, quick reply, and interaction behaviors.

---

## 🔒 Privacy & Architecture Guarantees

- **100% Zero Knowledge**: Server never stores or observes plaintext messages, photos, or voice notes.
- **Zero Firebase / Cloud Relays**: No third-party push notification relays or telemetry libraries are bundled.
- **Local Persistence**: All couple data and downloaded sticker packs reside inside device `localStorage` and `IndexedDB`.

---

## 📄 License
Private repository crafted with love for Nana & Kevin ♡. All rights reserved.
