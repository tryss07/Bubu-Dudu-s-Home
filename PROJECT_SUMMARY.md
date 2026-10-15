# Dudu Project (For Nana) — Complete Architecture & Handoff Handbook

> **Project Version**: 1.2.0  
> **Last Updated**: 2026-10-13  
> **Target Audience**: Full-Stack / Mobile Engineers & AI Agents picking up development on a new device.

---

## 1. Project Overview & Mission

**Dudu Companion & Private Duo Chat** is a custom romantic companion and private communication progressive web & native Android mobile application designed exclusively for **Kevin (Dudu)** and **Nana (Bubu)**.

### Core Value Pillars:
1. **Interactive Mascot Companion (Sanctuary)**: Virtual pet simulation of Dudu with state decay (Hunger, Mood, Energy, Belly), 95 custom animated WebP stickers, care/affection actions, habit trackers ("Eat veggies", warm water, rest eyes), and a "Honey" reward currency economy.
2. **Health Guardian (Bubu's Belly Headquarters)**: Gamified stomach health tracker monitoring spicy food and oily junk snacks, daily honey pool deductions, defense items (Spice Shield 120 Honey, Junk Shield 95 Honey), calendar history logging, and split weekly spicy quotas (max 5x/week each for Bubu & Dudu).
3. **Private Duo Chat ("Talk")**: Zero-Knowledge, End-to-End Encrypted (AES-GCM 256-bit via WebCrypto SubtleCrypto) multi-topic private messenger, synced via a lightweight Node.js WebSocket relay server running behind a Cloudflare Tunnel on an old home laptop.
4. **Native Android Companion Service**: 100% private, zero-Firebase foreground service with interactive status widget (`Food • Sleep • Unread`), partial WakeLock, 20s active ping keepalive, and instant background heads-up notifications.

---

## 2. Tech Stack & Dependencies

| Layer | Technologies | Key Libraries |
|---|---|---|
| **Mobile Runtime** | Android 8.0+ (Capacitor 8.x) | `@capacitor/core`, `@capacitor/android`, `@capacitor/local-notifications`, `@capacitor/app` |
| **Android Native Service** | Java 21 / Android SDK 34 | OkHttp 4.12.0, Androidx Core, WakeLock, Foreground Service |
| **Frontend UI/UX** | Vanilla JS (ES6+), HTML5, CSS3, Tailwind CSS (via CDN) | Material Symbols, Canvas Confetti, Web Audio API |
| **Client Storage** | IndexedDB (`dudu_chat_db`), `localStorage` | Pure Web APIs (`IDBDatabase`, `IDBTransaction`) |
| **End-to-End Encryption** | WebCrypto API (`window.crypto.subtle`) | AES-GCM 256-bit, PBKDF2-SHA256 (100k iterations) |
| **Backend Relay Server** | Node.js (v18+ / v20+ / v22+ / v26+) | `ws` (WebSocket), `dotenv`, built-in `node:sqlite` (with JSON fallback) |
| **Hosting & Networking** | Home Laptop Server (PM2) + Cloudflare Tunnel | `cloudflared`, Cloudflare Zero Trust, Nameservers |
| **Testing / QA** | Playwright (Automated Headless Test Suites) | `playwright` (Chromium multi-client simulation) |

---

## 3. Directory Structure

```text
Dudu-Project_(For Nana)/
├── PROJECT_SUMMARY.md            # This handoff handbook (Architecture & Guide)
├── index.html                    # Single Page Application core UI (Sanctuary, Belly, Talk tabs)
├── capacitor.config.json         # Capacitor configuration (App ID: com.honeyandbear.dudu, Name: Dudu)
├── package.json                  # Root dependencies & build scripts (npm / pnpm compatible)
├── Dudu.apk                      # Compiled Android release/debug APK (~23.4 MB)
├── Dudu-Project-Full.zip         # Full deployable archive
│
├── assets/                       # Static app icons, sounds, navigation mascots
│   ├── dudu_icon.png             # Finger-heart Dudu mascot app launcher icon
│   └── nav_chat.png              # Custom couple chat tab icon
│
├── Dudu Stickers/                # 95 high-resolution WebP animated stickers (STK-*.webp)
│
├── css/
│   └── custom.css                # Custom styles, transitions, keyboard viewport fixes, dark mode
│
├── js/
│   ├── app.js                    # Mascot logic, habits, belly health, honey economy, debug mode
│   ├── stickers.js               # 95-sticker taxonomy & pool assignment (Dance, Annoy, Hug, etc.)
│   └── chat/                     # Private Duo Chat subsystem:
│       ├── crypto.js             # SubtleCrypto AES-GCM 256-bit encryption & key derivation
│       ├── socket.js             # Resilient WebSocket client (backoff reconnect, heartbeat)
│       ├── storage.js            # IndexedDB multi-topic storage, pending queue, media caching
│       └── ui.js                 # Chat UI: bubble perspectives, swipe-to-reply, selection mode, wallpaper
│
├── server/                       # Standalone zero-knowledge backend relay server
│   ├── server.js                 # HTTP + WebSocket relay, chunked blob handler (Port 3000)
│   ├── db.js                     # SQLite persistence (messages, topics, presence, server ACKs)
│   ├── chat-server.service       # Systemd service unit template for Linux server
│   ├── package.json              # Relay dependencies (`ws`, `dotenv`)
│   └── data/                     # Stored server data (git-ignored):
│       ├── chat.db               # SQLite database in WAL mode
│       └── blobs/                # Encrypted 2MB video/photo chunks
│
├── android/                      # Native Android Studio / Gradle project
│   └── app/src/main/
│       ├── AndroidManifest.xml   # Permissions (Notifications, WakeLock, Network, Foreground Service)
│       ├── java/com/honeyandbear/dudu/
│       │   ├── MainActivity.java           # Capacitor bridge, edge-to-edge system bars
│       │   ├── DuduCompanionPlugin.java    # Bridge plugin for stats & identity sync
│       │   ├── DuduCompanionService.java   # 24/7 background foreground service & OkHttp listener
│       │   └── DuduBootReceiver.java       # Boot completed & package replace restarter
│       ├── res/                  # Mipmap launcher icons & notification drawables
│       └── assets/public/        # Bundled web assets (built from root)
│
└── tests/                        # Automated Playwright test suites
    ├── test_duo_chat.js          # Multi-client E2EE chat, topics, swipe-to-reply, selection test
    └── test_companion.js         # Companion app habits, tummy logs, shop, audio, stickers test
```

---

## 4. Subsystem Deep-Dive

### A. Private Duo Chat Architecture
- **Zero-Knowledge Principle**: The relay server (`server.js`) only ever sees opaque ciphertext (`iv`, `ciphertext`) and metadata (`id`, `sessionId`, `sender`, `timestamp`). It CANNOT decrypt any message, sticker, or photo.
- **Passphrase & Key Derivation**: Both devices derive the 256-bit AES-GCM CryptoKey using PBKDF2 with 100,000 SHA-256 iterations from a shared passphrase (`dudu-and-bubu-forever`).
- **Dynamic Identity Switcher**:
  - The chat dynamically adapts bubble orientation and labels:
    - If active profile is **Dudu**: Dudu's messages appear on the right (sent), Bubu's on the left (received).
    - If active profile is **Bubu**: Bubu's messages appear on the right (sent), Dudu's on the left (received).
  - Tapping the top header title ("Dudu" / "Bubu") opens `#modal-identity-picker` to switch perspectives instantly without data alteration.
- **Mobile Layout & Bubble Fixes**:
  - Inline action bar hidden on mobile touchscreens (`hidden md:group-hover:flex`), preventing phantom width from pushing sent bubbles off-screen.
  - Seamless transparent chat container (`bg-transparent border-0 shadow-none`) eliminating awkward empty cardboard voids on short message histories.
  - Multiline auto-expanding textarea with Enter key newline support and hidden scrollbars.
- **Wallpaper & Personalization**:
  - Chat wallpaper manager with 5 curated cozy presets and custom photo upload with opacity slider.
- **Topic Synchronization**:
  - Topics are persisted in backend SQLite (`topics` table in `server/db.js`).
  - When a client creates or deletes a topic, the event is broadcast over WebSocket in real time.
  - New/reconnecting clients receive `topic_sync` with the full topic catalog.
- **Chunked Encrypted Blob Streaming**:
  - Media > 2MB (photos/videos) are sliced into 2MB chunks, encrypted locally with AES-GCM, and streamed to `POST /api/blobs/:blobId/chunk/:chunkIndex`.
  - Recipient downloads chunks on demand via `GET /api/blobs/:blobId/chunk/:chunkIndex` and reassembles/decrypts them in memory.
- **Message Actions**:
  - **Swipe-to-Reply**: Touch swipe right to quote messages.
  - **Selection Mode**: 450ms long-press enters selection mode for batch topic forwarding and batch deletion.
  - **Delivery Receipts**: Single check (`done`) = saved locally; double check (`done_all`) = acknowledged by server SQLite; double blue check = read by partner.

### B. Native Android Background Companion Service
- **100% Private & Zero-Firebase**: No Google accounts, no Firebase Console, and no external push servers required.
- **Interactive Foreground Widget**: Notification displays live stats (`🍎 Food: X% • 💤 Sleep: Y% • 💌 Z unread`) and quick action buttons (`[💬 Open Chat]`, `[🐾 Check Dudu]`).
- **Low-Power WakeLock**: Holds `PowerManager.PARTIAL_WAKE_LOCK` to ensure Android CPU sleep does not freeze the background socket when the screen is locked.
- **Active 20-Second Ping Loop**: Sends `{"type":"ping"}` text frames every 20 seconds, preventing Cloudflare Tunnel and mobile carriers from severing the connection.
- **Auto-Sync on Reconnect**: Automatically sends `{"type":"sync", "sinceTimestamp": lastSeen}` upon reconnecting to immediately fetch and alert any missed messages.
- **Honest Visual Presence**:
  - Screen active in app = **Online** (Green dot).
  - Screen closed / minimized = **Offline** (Gray dot).
  - Background service continues receiving and notifying 24/7 regardless of visual "offline" status.

### C. Mascot Companion & Bubu's Belly
- **State Persistence**: Stored in `localStorage` keys `'dudu_companion_bubu_en_v2'` and `'DUDU_BELLY_LOGS'`.
- **Decay Engine**: Decays Hunger, Mood, and Energy over real offline time when the app is closed.
- **Health Tracking**: Split weekly spicy quotas (max 5x/week each for Bubu & Dudu) with honey defense shields.
- **Bilingual Support**: Instant English/Indonesian toggle in the top sticky bar.
- **Dark Mode**: Warm espresso dark mode with full chat and mascot contrast.
- **Debug Mode**: Tapping the top couple profile avatar (`#profile-avatar-btn`) **5 times within 1 second** unlocks Debug Mode:
  - Displays live Sticker ID pill on Dudu mascot.
  - Shows floating launcher for the 95-Sticker Gallery modal.
  - Reveals E2EE Settings & Server Relay URL switcher in Duo Chat.

---

## 5. Live Server & Cloudflare Network Setup

The live backend is currently deployed and functional:

- **Server Hardware**: Old laptop running Ubuntu/Linux on home WiFi.
- **Process Manager**: PM2 running `server.js` on port `3000`.
  - Restart command on server: `pm2 restart all`
  - Logs command: `pm2 logs`
- **Lid Closed 24/7 Setup**: Configured via `/etc/systemd/logind.conf` with `HandleLidSwitch=ignore`.
- **Public Domain**: `nexora-v1.my.id`
  - Nameservers: `colin.ns.cloudflare.com`, `fay.ns.cloudflare.com` (delegated via PANDI).
- **Subdomain & CNAME**: `chat.nexora-v1.my.id` -> `<TUNNEL_ID>.cfargotunnel.com`.
- **Cloudflare Tunnel**:
  - Published service: `HTTP -> localhost:3000`
  - Public WebSocket URL: `wss://chat.nexora-v1.my.id/chat-socket`
  - Health check endpoint: `https://chat.nexora-v1.my.id/health`

---

## 6. Development & Build Commands

All commands below work with `npm` or `pnpm` (prefix with `rtk` if using Rust Token Killer on Linux):

```bash
# 1. Install root dependencies (Capacitor & Playwright)
pnpm install   # or npm install

# 2. Run local web preview server (port 3000)
python3 -m http.server 3000

# 3. Run server dependencies (in server/ folder)
cd server && pnpm install && node server.js

# 4. Sync web assets to Capacitor Android project
npx cap copy android
npx cap sync android

# 5. Build Android debug APK
cd android && ./gradlew assembleDebug && cd ..
# (Output APK is located at ./Dudu.apk)
```

---

## 7. How to Transfer and Resume on a New Device

### Option 1: Git Repository
1. Commit and push:
   ```bash
   git add .
   git commit -m "feat: complete dudu companion v1.2"
   git push origin main
   ```
2. Clone on new machine and install:
   ```bash
   git clone <repo-url>
   cd dudu-project
   pnpm install
   ```

### Option 2: Full Project Archive (`Dudu-Project-Full.zip`)
- Extract `Dudu-Project-Full.zip`.
- Run `pnpm install` in root.
- The pre-compiled `Dudu.apk` is already in the root folder, ready to install on Android.

### Resuming Work with an AI Assistant:
When opening the project in Antigravity or any agentic coding assistant on the new device, simply provide this prompt:
> *"Read `PROJECT_SUMMARY.md`. This contains the complete architecture, test suite, server setup, and rules for the Dudu Project. We are resuming development here."*
