# Graph Report - Dudu-Duo_Project  (2026-10-30)

## Corpus Check
- 161 files · ~128,494 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .xml 10, (none) 3, .properties 2)

## Summary
- 864 nodes · 1801 edges · 53 communities (34 shown, 19 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 221 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ui.js & related
- app.js & related
- dudu_mockup.js & related
- socket.js & related
- stickers_center.js & related
- android.app.Service & related
- package.json & related
- ref_node_sqlite & related
- BedtimeLofiEngine & related
- storage.js & related
- crypto.js & related
- generate_stickers.js & related
- .onReceive() & related
- DuduBootReceiver.java & related
- audio.js & related
- clearAllTummyLogs() & related
- server.js & related
- ref_react & related
- .clearUnread() & related
- wallpaper.js & related
- ref_assert & related
- generate_wallpapers.js & related
- ref_fs & related
- ref_http & related
- playwright & related
- ExampleInstrumentedTest.java & related
- ref_child_process & related
- ref_path & related
- server/package.json & related
- chatSocket.ts & related
- convert_gifs.js & related
- webCrypto.ts & related
- stickers_catalog.js & related
- clearAllMessages() & related
- test_panel_chat_topics.js & related
- i18n.js & related
- scripts/prepare_dist.js & related
- review_stickers.js & related
- getCoupleSpace() & related
- chatStorage.ts & related
- test_sticker_suggestions_and_favs.js & related
- getAllPresence() & related

## God Nodes (most connected - your core abstractions)
1. `setupEventListeners()` - 47 edges
2. `DuduCompanionService` - 28 edges
3. `saveState()` - 25 edges
4. `setDuduSticker()` - 24 edges
5. `init()` - 22 edges
6. `BedtimeLofiEngine` - 20 edges
7. `playwright` - 20 edges
8. `persistFallbackState()` - 20 edges
9. `openDB()` - 19 edges
10. `DuduAudioEngine` - 18 edges

## Surprising Connections (you probably didn't know these)
- `PrivateChatView()` --calls--> `ChatInputBar()`  [EXTRACTED]
  src/features/chat/components/PrivateChatView.tsx → src/features/chat/components/ChatInputBar.tsx
- `PrivateChatView()` --calls--> `MessageList()`  [EXTRACTED]
  src/features/chat/components/PrivateChatView.tsx → src/features/chat/components/MessageList.tsx
- `PrivateChatView()` --calls--> `SessionBar()`  [EXTRACTED]
  src/features/chat/components/PrivateChatView.tsx → src/features/chat/components/SessionBar.tsx
- `PrivateChatView()` --calls--> `StickerTray()`  [EXTRACTED]
  src/features/chat/components/PrivateChatView.tsx → src/features/chat/components/StickerTray.tsx

## Import Cycles
- None detected.

## Communities (53 total, 19 thin omitted)

### Community 0 - "ui.js & related"
Cohesion: 0.06
Nodes (95): advanceOrExecuteDelete(), attachTopicLongPress(), cancelReply(), closeAllTopicsModal(), closeDeleteConfirmModal(), closeDeleteModal(), closeForwardTopicModal(), closeMsgActionsModal() (+87 more)

### Community 1 - "app.js & related"
Cohesion: 0.08
Nodes (76): applyOfflineSimulation(), checkDayChange(), closeCravingModal(), closeIdentityPicker(), closePantryModal(), closeStickerGallery(), completeHabit(), deleteTummyLog() (+68 more)

### Community 2 - "dudu_mockup.js & related"
Cohesion: 0.10
Nodes (58): addNotification(), autoMigrateLegacyItems(), clearNotificationHistory(), closeSheet(), computeCoupleMatchBanner(), escapeHtml(), formatNoteBodyHtml(), formatTimeAgo() (+50 more)

### Community 3 - "socket.js & related"
Cohesion: 0.08
Nodes (14): connect(), disconnect(), fetchAllFeaturesRest(), getAuthToken(), getHttpBaseUrl(), getServerUrl(), maybeDecrypt(), maybeDecryptList() (+6 more)

### Community 4 - "stickers_center.js & related"
Cohesion: 0.15
Nodes (27): buildPacks(), checkStartupCoreDownload(), deletePack(), deleteStoredBlob(), dispatchProgress(), dispatchStickersUpdated(), downloadPack(), throttleProgress() (+19 more)

### Community 5 - "android.app.Service & related"
Cohesion: 0.14
Nodes (4): DuduCompanionService, WebSocketListener, Runnable, Runnable

### Community 6 - "package.json & related"
Cohesion: 0.08
Nodes (29): author, dependencies, @capacitor/android@^8.5.3, @capacitor/cli@^8.5.3, @capacitor/core@^8.5.3, @capacitor/local-notifications@^8.3.1, dotenv@^18.0.8, ws@^8.22.0 (+21 more)

### Community 7 - "ref_node_sqlite & related"
Cohesion: 0.07
Nodes (17): BACKUP_JSON_PATH, DATA_DIR, DEFAULT_WARDROBE, fallbackCalendarEvents, fallbackCoupleSpace, fallbackMemoryMessages, fallbackMilestones, fallbackNotes (+9 more)

### Community 8 - "BedtimeLofiEngine & related"
Cohesion: 0.25
Nodes (7): BedtimeLofiEngine, formatTrackTime(), renderBedtimeMusic(), renderBedtimePlaylist(), syncMusicNotification(), updateLofiProgressUI(), updateLofiUI()

### Community 10 - "storage.js & related"
Cohesion: 0.17
Nodes (19): archiveSession(), createSession(), deleteBlob(), deleteMessage(), deleteSession(), getBlob(), getLastMessageTimestamp(), getMessage() (+11 more)

### Community 11 - "crypto.js & related"
Cohesion: 0.23
Nodes (17): base64ToUint8Array(), computeFallbackTag(), decrypt(), decryptChunk(), decryptList(), decryptPayload(), deriveFallbackKeyBytes(), deriveKey() (+9 more)

### Community 12 - "generate_stickers.js & related"
Cohesion: 0.10
Nodes (11): BUBU_DIR, BUBU_STICKERS, COUPLE_DIR, COUPLE_STICKERS, DUDU_DIR, DUDU_STICKERS, { execSync }, fs (+3 more)

### Community 16 - "clearAllTummyLogs() & related"
Cohesion: 0.12
Nodes (17): clearAllTummyLogs(), deleteCalendarEvent(), deleteMilestone(), deleteNote(), deletePlannerItem(), deletePolaroid(), deleteTummyLog(), persistFallbackState() (+9 more)

### Community 17 - "server.js & related"
Cohesion: 0.13
Nodes (13): broadcastToOthers(), fs, heartbeatInterval, http, isAuthorized(), MIME_TYPES, path, PORT (+5 more)

### Community 18 - "ref_react & related"
Cohesion: 0.23
Nodes (10): ChatInputBar(), ChatInputBarProps, ChatMessageItem, MessageList(), MessageListProps, PrivateChatView(), SessionBar(), SessionBarProps (+2 more)

### Community 20 - "wallpaper.js & related"
Cohesion: 0.33
Nodes (14): applyWallpaper(), closeWallpaperModal(), compressImage(), init(), loadSavedWallpaper(), openWallpaperModal(), renderWallpaperOptions(), resetWallpaper() (+6 more)

### Community 21 - "ref_assert & related"
Cohesion: 0.14
Nodes (10): assert, { chromium }, runBilingualAndFreshDefaultsTest(), assert, { chromium }, path, assert, { chromium } (+2 more)

### Community 22 - "generate_wallpapers.js & related"
Cohesion: 0.27
Nodes (13): bubuMini(), duduMini(), { execSync }, fs, generateCozyRoomSvg(), generateDoodleHeartsSvg(), generateSpringPicnicSvg(), generateStargazingSvg() (+5 more)

### Community 23 - "ref_fs & related"
Cohesion: 0.15
Nodes (7): { chromium }, fs, path, { chromium }, fs, { chromium }, fs

### Community 24 - "ref_http & related"
Cohesion: 0.15
Nodes (7): assert, http, path, assert, http, path, WebSocket

### Community 25 - "playwright & related"
Cohesion: 0.15
Nodes (9): playwright, { chromium }, { chromium }, { chromium }, fs, path, { chromium }, fs (+1 more)

### Community 27 - "ref_child_process & related"
Cohesion: 0.17
Nodes (8): path, { spawnSync }, testSuites, { chromium }, fs, http, path, { spawn }

### Community 28 - "ref_path & related"
Cohesion: 0.17
Nodes (8): { chromium }, fs, path, { chromium }, path, { chromium }, fs, path

### Community 29 - "server/package.json & related"
Cohesion: 0.20
Nodes (11): dependencies, dotenv@^16.4.7, ws@^8.18.0, description, dotenv, ws, main, name (+3 more)

### Community 31 - "convert_gifs.js & related"
Cohesion: 0.25
Nodes (6): { exec }, files, fs, OUT_DIR, path, SRC_DIR

### Community 32 - "webCrypto.ts & related"
Cohesion: 0.32
Nodes (6): base64ToUint8Array(), decryptPayload(), EncryptedPacket, encryptPayload(), PBKDF2_SALT, uint8ArrayToBase64()

### Community 33 - "stickers_catalog.js & related"
Cohesion: 0.52
Nodes (4): getCanonical(), getCategory(), handleImageError(), resolveStickerPath()

### Community 34 - "clearAllMessages() & related"
Cohesion: 0.29
Nodes (7): clearAllMessages(), clearAllTopics(), deleteMessage(), deleteTopic(), deleteTopicMessages(), persistFallback(), saveMessage()

### Community 35 - "test_panel_chat_topics.js & related"
Cohesion: 0.29
Nodes (5): { chromium }, fs, http, mimeTypes, path

### Community 36 - "i18n.js & related"
Cohesion: 0.47
Nodes (3): applyTranslations(), setLanguage(), toggleLanguage()

### Community 37 - "scripts/prepare_dist.js & related"
Cohesion: 0.33
Nodes (5): coreStickers, DIST, fs, path, ROOT

### Community 39 - "review_stickers.js & related"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 41 - "getCoupleSpace() & related"
Cohesion: 0.50
Nodes (4): getCoupleSpace(), getWardrobe(), saveCoupleSpace(), saveWardrobe()

### Community 43 - "test_sticker_suggestions_and_favs.js & related"
Cohesion: 0.50
Nodes (3): { chromium }, fs, path

## Knowledge Gaps
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright` connect `playwright & related` to `test_panel_chat_topics.js & related`, `package.json & related`, `review_stickers.js & related`, `test_sticker_suggestions_and_favs.js & related`, `ref_assert & related`, `ref_fs & related`, `ref_child_process & related`, `ref_path & related`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `setupEventListeners()` (e.g. with `closeRenameTopicModal()` and `closeStickerTray()`) actually correct?**
  _`setupEventListeners()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `ui.js & related` be split into smaller, more focused modules?**
  _Cohesion score 0.05996212918156953 - nodes in this community are weakly interconnected._
- **Why does `DuduCompanionService` connect `android.app.Service & related` to `alarmmanager & related`, `.clearUnread() & related`, `.onReceive() & related`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `app.js & related` be split into smaller, more focused modules?**
  _Cohesion score 0.08081791626095423 - nodes in this community are weakly interconnected._
- **Should `dudu_mockup.js & related` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Should `socket.js & related` be split into smaller, more focused modules?**
  _Cohesion score 0.08250355618776671 - nodes in this community are weakly interconnected._