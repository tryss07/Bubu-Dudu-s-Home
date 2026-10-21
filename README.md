# 🐾 Dudu & Bubu: Companion & Private Duo Chat

> A private, zero-knowledge romantic mascot companion, stomach health guardian, and encrypted duo messenger engineered for Android and the Web.

[![Android](https://img.shields.io/badge/Android-8.0%2B-3DDC84?logo=android&logoColor=white)](#native-android-service)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?logo=capacitor&logoColor=white)](#architecture)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](#backend-relay-server)
[![Encryption](https://img.shields.io/badge/Encryption-AES--GCM--256-blueviolet)](#private-duo-chat)
[![Tests](https://img.shields.io/badge/Tests-Playwright-2EAD33?logo=playwright&logoColor=white)](#testing)

---

## 🌟 Key Features

### 1. 🐾 Mascot Sanctuary (Interactive Companion)
- **Real-Time State Simulation**: Realistic decay engine for **Hunger**, **Mood**, **Energy**, and **Belly Health** over offline intervals.
- **Affection & Care Routines**: Feed meals, hydrate with warm water, rest eyes, and tuck into bedtime with live lofi stream.
- **Closet & Wardrobe**: Equip seasonal outfits, accessories, and hats unlocked via Honey currency.
- **Honey Economy**: Earn honey drops by completing daily habits, self-care routines, and tummy protection goals.

### 2. 🥣 Bubu's Belly Headquarters (Health Guardian)
- **Stomach Defense & Logging**: Track spicy food intake and oily/junk snacks with split quotas (max 5x/week each for Bubu & Dudu).
- **Gamified Defense Shields**: Redeem *Spice Shield* (120 Honey) and *Junk Shield* (95 Honey) to prevent stat penalty deductions.
- **Health History & Analytics**: Visual calendar log tracking stomach status and daily habits.

### 3. 💬 Zero-Knowledge Private Duo Chat ("Talk")
- **End-to-End Encryption (E2EE)**: True zero-knowledge communication using **AES-GCM 256-bit** derived via PBKDF2 (100,000 iterations of SHA-256) with WebCrypto `SubtleCrypto`. The server cannot decrypt messages, media, or stickers.
- **Perspective Switcher**: Instant profile perspective toggling (Dudu ↔ Bubu) dynamically adjusting bubble alignment, sender indicators, and themes.
- **Rich Media & Chunked Uploads**: Send encrypted photos and videos with real-time percentage progress bar and 2MB chunked streaming.
- **Voice Notes & Audio**: Record and stream crisp encrypted voice memos directly inside conversation bubbles.
- **Gestures & Controls**: Swipe-to-reply quoting banner, long-press selection mode for multi-message actions, and delivery status receipts.
- **Aesthetic Customization**: 5 cozy preset wallpapers and custom user photo background support with opacity controls.

### 4. 🎨 In-App Sticker Centre & Local Storage Engine
- **Sticker Centre**: Comprehensive repository featuring **1,470+ WebP animated stickers** grouped into 22 thematic packs (Core 300, Dudu 1..4, Bubu 1..8, Couple 1..9).
- **On-Demand Downloads**: Modular packs download inside the app on demand, keeping the initial APK lightweight and lean.
- **IndexedDB Persistence**: Automatically caches downloaded sticker packs into client-side IndexedDB (`DuduStickersDB`), enabling instant offline rendering.
- **Search & Filter**: Search stickers by emotion keyword, category chips, or quick suggestion pills.

### 5. 🔔 24/7 Zero-Firebase Android Foreground Service
- **Zero Third-Party Dependency**: No Firebase Cloud Messaging, Google Play Services, or external push relays.
- **Companion Background Service**: Low-overhead native Android foreground service holding `PARTIAL_WAKE_LOCK` and a 20-second WebSocket heartbeat loop.
- **Heads-Up Notifications**: Instant alert banners on incoming messages, missed chat sync, and companion status updates.

### 6. 🌐 Bilingual & Dark Mode
- **Dual Language**: Seamless instant toggle between **Indonesian (Bahasa Indonesia)** and **English**.
- **Dark Mode**: Hand-tuned warm espresso palette designed for high contrast and low night-time eye fatigue.

---

## 🏗️ Architecture & Tech Stack

```text
Dudu-Duo_Project/
├── index.html                    # Single Page Application core UI (Sanctuary, Belly, Chat, Stickers)
├── capacitor.config.json         # Capacitor mobile wrapper configuration
├── package.json                  # Root dependencies, test runners, & build scripts
├── Dudu.apk                      # Ready-to-install compiled Android APK (~39 MB)
│
├── css/                          # Custom animations, transitions, responsive UI styles
├── js/
│   ├── app.js                    # Mascot lifecycle, decay timers, habits, & honey store
│   ├── dudu_mockup.js            # Companion UI animations, sound effects, & bedtime lofi
│   ├── i18n.js                   # Bilingual dictionary (EN / ID) & reactive translator
│   ├── stickers_catalog.js       # Sticker taxonomy, canonical paths, & emotion indices
│   ├── stickers_center.js        # In-app pack downloader, progress tracker, & IndexedDB store
│   └── chat/                     # Private Duo Chat subsystem:
│       ├── crypto.js             # WebCrypto AES-GCM 256-bit key derivation & encryption
│       ├── socket.js             # Resilient WebSocket client with automatic exponential backoff
│       ├── storage.js            # IndexedDB multi-topic store & media cache
│       └── ui.js                 # Chat layout, gestures, voice recorder, & upload bar
│
├── server/                       # Zero-knowledge Node.js WebSocket relay server
│   ├── server.js                 # HTTP server, chunked blob handler, & WS message broker (Port 3000)
│   ├── db.js                     # SQLite database in WAL mode (stores encrypted payloads only)
│   └── data/                     # Local data directory for blobs and SQLite DB
│
├── android/                      # Native Android Studio project (Capacitor 8)
│   └── app/src/main/
│       ├── java/com/honeyandbear/dudu/
│       │   ├── MainActivity.java           # Capacitor bridge with edge-to-edge system bars
│       │   ├── DuduCompanionPlugin.java    # Bridge plugin for stats & notifications
│       │   ├── DuduCompanionService.java   # 24/7 background service & OkHttp WebSocket listener
│       │   └── DuduBootReceiver.java       # Automatic start on device boot
│       └── res/                            # Native icons, drawables, & layout definitions
│
└── tests/                        # Automated Playwright end-to-end test suites
    ├── run_all_tests.js                    # Test runner orchestrator
    ├── test_sticker_centre_and_upload.js   # Sticker pack downloads & media upload tests
    ├── test_sticker_suggestions_and_favs.js# Sticker auto-suggest and favorites test
    ├── test_bilingual_and_fresh_defaults.js# Language localization and fresh user onboarding test
    └── test_sticker_click_modal.js         # Sticker preview modal tests
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ / v22+ / v26+ recommended)
- **Package Manager**: `pnpm` (or `npm`)
- **Java**: OpenJDK 21 (for Android APK compilation)
- **Android SDK**: API Level 34 or 35

### 1. Installation
Clone the repository and install root dependencies:
```bash
git clone https://github.com/tryss07/Dudu-Duo_Project.git
cd Dudu-Duo_Project
pnpm install
```

### 2. Running Local Web Preview
Launch a local static web server to preview in your browser:
```bash
pnpm run start:static
# Accessible at http://localhost:3000
```

### 3. Running Backend Relay Server
To test live duo chat messaging, topic synchronization, and media uploads locally:
```bash
cd server
pnpm install
pnpm start
# Server listens on http://localhost:3000 and ws://localhost:3000/chat-socket
```

---

## 📱 Building the Android APK

The project uses Capacitor 8 to compile a native Android application with foreground notification capabilities.

Run the build script:
```bash
pnpm run build:apk
```

This automated pipeline:
1. Executes `scripts/prepare_dist.js` to create a lean web distribution bundle in `dist/`.
2. Syncs assets and plugins with Android (`pnpm exec cap sync android`).
3. Invokes Gradle (`./gradlew assembleDebug`) with configured `JAVA_HOME` and `ANDROID_HOME`.
4. Copies the finished output directly to `./Dudu.apk`.

---

## 🧪 Testing

Comprehensive headless Playwright integration tests verify UI functionality, sticker pack management, and duo chat encryption.

```bash
# Start local static server (in background)
python3 -m http.server 3000 &

# Run full test suite
pnpm test
```

---

## 🔐 Security & Privacy

- **Zero Third-Party Telemetry**: Contains no analytics, no tracking pixels, and no third-party CDNs on sensitive chat data paths.
- **Client-Side Encryption**: Message contents, stickers, voice memos, and media blobs are encrypted on the client device before touching any network interface.
- **Self-Hostable**: The lightweight WebSocket server can run on any low-power VPS, home server, or behind a Cloudflare Tunnel.

---

## 📄 License
Private project crafted exclusively for Nana & Kevin. All rights reserved.
