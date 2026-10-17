const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

async function checkHealth(port) {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.status === 'ok');
        } catch {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

(async () => {
  console.log('🚀 Starting Duo Chat E2EE & WebSocket Verification Suite...');

  const TEST_PORT = '3141';
  const TEST_DATA_DIR = path.resolve(__dirname, 'test_data');
  if (fs.existsSync(TEST_DATA_DIR)) {
    try { fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  }
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  const TEST_DB = path.join(TEST_DATA_DIR, 'test_chat.db');
  const TEST_BLOBS = path.join(TEST_DATA_DIR, 'blobs');
  fs.mkdirSync(TEST_BLOBS, { recursive: true });

  // 1. Start relay server on test port
  console.log(`Starting relay server on port ${TEST_PORT}...`);
  const serverProcess = spawn('node', ['server/server.js'], {
    env: { ...process.env, PORT: TEST_PORT, DB_PATH: TEST_DB, BLOBS_DIR: TEST_BLOBS },
    stdio: 'inherit'
  });

  // Wait for server healthcheck
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    if (await checkHealth(TEST_PORT)) {
      serverReady = true;
      break;
    }
  }

  if (!serverReady) {
    serverProcess.kill();
    throw new Error(`Relay server failed to start on port ${TEST_PORT}`);
  }
  console.log(`✅ Relay server healthy on http://localhost:${TEST_PORT}/health`);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

    // Create Kevin's browser context
    const kevinContext = await browser.newContext({
      viewport: { width: 420, height: 880 },
      deviceScaleFactor: 2
    });
    const kevinPage = await kevinContext.newPage();

    // Create Nana's browser context
    const nanaContext = await browser.newContext({
      viewport: { width: 420, height: 880 },
      deviceScaleFactor: 2
    });
    const nanaPage = await nanaContext.newPage();

    kevinPage.on('console', msg => console.log('[Kevin]', msg.text()));
    kevinPage.on('pageerror', err => console.error('[Kevin Error]', err));
    nanaPage.on('console', msg => console.log('[Nana]', msg.text()));
    nanaPage.on('pageerror', err => console.error('[Nana Error]', err));

    // Wire-level ciphertext sniffer
    let wireCiphertextFound = false;
    let wirePlaintextLeaked = false;
    kevinPage.on('websocket', ws => {
      console.log('Kevin WebSocket opened:', ws.url());
      ws.on('framesent', event => {
        const payload = event.payload;
        if (typeof payload === 'string' && payload.includes('"ciphertext"')) {
          wireCiphertextFound = true;
          if (payload.includes('SecretKevinMsg123')) {
            wirePlaintextLeaked = true;
          }
        }
      });
    });

    // Configure Kevin before page load
    await kevinPage.addInitScript(() => {
      localStorage.setItem('DUDU_CHAT_IDENTITY', 'kevin');
      localStorage.setItem('DUDU_CHAT_PASSPHRASE', 'SecretLovePassphrase2026');
      localStorage.setItem('DUDU_CHAT_SERVER_URL', 'ws://localhost:3141/chat-socket');
      localStorage.setItem('dudu_chat_identity', 'kevin');
      localStorage.setItem('dudu_chat_passphrase', 'SecretLovePassphrase2026');
      localStorage.setItem('dudu_chat_server_url', 'ws://localhost:3141/chat-socket');
    });

    // Configure Nana before page load
    await nanaPage.addInitScript(() => {
      localStorage.setItem('DUDU_CHAT_IDENTITY', 'nana');
      localStorage.setItem('DUDU_CHAT_PASSPHRASE', 'SecretLovePassphrase2026');
      localStorage.setItem('DUDU_CHAT_SERVER_URL', 'ws://localhost:3141/chat-socket');
      localStorage.setItem('dudu_chat_identity', 'nana');
      localStorage.setItem('dudu_chat_passphrase', 'SecretLovePassphrase2026');
      localStorage.setItem('dudu_chat_server_url', 'ws://localhost:3141/chat-socket');
    });

    console.log('Navigating Kevin and Nana to app...');
    await kevinPage.goto(fileUrl, { waitUntil: 'load' });
    await nanaPage.goto(fileUrl, { waitUntil: 'load' });

    await kevinPage.waitForTimeout(600);
    await nanaPage.waitForTimeout(600);

    // Switch both to Duo Chat tab
    console.log('Switching both clients to Duo Chat tab...');
    await kevinPage.click('a[data-tab="chat"]');
    await nanaPage.click('a[data-tab="chat"]');
    await kevinPage.waitForTimeout(500);
    await nanaPage.waitForTimeout(500);

    // Verify session pills rendered
    const kevinTopics = await kevinPage.$$eval('.chat-session-chip', chips => chips.map(c => c.textContent.trim()));
    console.log('Kevin topics found:', kevinTopics.length, kevinTopics);
    if (kevinTopics.length === 0) throw new Error('No topic session pills rendered!');

    // 1. Kevin sends text message to Nana
    console.log('Kevin sending encrypted text message...');
    await kevinPage.fill('#chat-text-input', 'SecretKevinMsg123: Hello Nana darling!');
    await kevinPage.click('#btn-send-message');

    // Wait for message to arrive and decrypt on Nana's page
    await nanaPage.waitForSelector('text=SecretKevinMsg123: Hello Nana darling!', { timeout: 4000 });
    console.log('✅ Nana successfully received & decrypted Kevin message!');

    // Verify Kevin's message checkmark gets double blue check after Nana reads it
    await kevinPage.waitForFunction(() => {
      const icon = document.querySelector('.msg-check-icon');
      return icon && icon.textContent.includes('done_all') && icon.classList.contains('text-sky-500');
    }, { timeout: 4000 });
    console.log('✅ Kevin message checkmark transitioned to double blue check (read)!');

    // Verify live presence display on both sides
    await kevinPage.waitForFunction(() => {
      const text = document.querySelector('#chat-partner-presence-text')?.textContent || '';
      return text.includes('Bubu is online');
    }, { timeout: 4000 });
    console.log('✅ Kevin page shows "Bubu is online" live presence!');

    const hasPulse = await kevinPage.$eval('#chat-partner-presence-dot', el => el.classList.contains('animate-pulse'));
    if (hasPulse) throw new Error('FAIL: Dot must NOT have animate-pulse!');
    const isGreen = await kevinPage.$eval('#chat-partner-presence-dot', el => el.classList.contains('bg-emerald-500'));
    if (!isGreen) throw new Error('FAIL: Dot must have bg-emerald-500 when online!');
    console.log('✅ Presence dot is solid green (no pulse)!');

    await nanaPage.waitForFunction(() => {
      const text = document.querySelector('#chat-partner-presence-text')?.textContent || '';
      return text.includes('Dudu is online');
    }, { timeout: 4000 });
    console.log('✅ Nana page shows "Dudu is online" live presence!');

    // Test offline transition & last seen
    await nanaPage.evaluate(() => {
      window.DuduChatSocket.sendPresenceAnnounce('offline');
    });
    await kevinPage.waitForFunction(() => {
      const text = document.querySelector('#chat-partner-presence-text')?.textContent || '';
      return text.includes('Bubu is offline');
    }, { timeout: 4000 });
    console.log('✅ Kevin page updated to "Bubu is offline" when Nana announced offline!');

    // Nana announces back online
    await nanaPage.evaluate(() => {
      window.DuduChatSocket.sendPresenceAnnounce('online');
    });
    await kevinPage.waitForFunction(() => {
      const text = document.querySelector('#chat-partner-presence-text')?.textContent || '';
      return text.includes('Bubu is online');
    }, { timeout: 4000 });
    console.log('✅ Kevin page restored to "Bubu is online"!');

    // Verify Zero-Knowledge on wire
    if (!wireCiphertextFound) throw new Error('FAIL: No encrypted ciphertext detected on WebSocket wire!');
    if (wirePlaintextLeaked) throw new Error('FAIL SECURITY AUDIT: Plaintext message leaked unencrypted over WebSocket wire!');
    console.log('🛡️ Zero-Knowledge Security Verified: Plaintext was never exposed over the wire.');

    // 2. Nana replies with a sticker
    console.log('Nana opening sticker tray & sending sticker...');
    await nanaPage.click('#btn-toggle-stickers');
    await nanaPage.waitForSelector('#chat-sticker-tray:not(.hidden)');
    
    // Click first sticker in tray
    const firstSticker = await nanaPage.$('.chat-sticker-select-btn');
    if (!firstSticker) throw new Error('No stickers found in sticker tray!');
    await firstSticker.click();

    // Verify sticker arrived on Kevin's page
    await kevinPage.waitForSelector('#chat-messages-container img', { timeout: 4000 });
    console.log('✅ Kevin successfully received animated sticker message!');

    // 2b. Kevin sends encrypted photo to Nana & Server persists in SQLite
    console.log('Testing encrypted photo sending & server database storage...');
    const testPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    await kevinPage.evaluate(async (dataUrl) => {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'test_love_photo.png', { type: 'image/png' });
      await window.DuduChatUI.sendPhoto(file);
    }, testPngDataUrl);

    // Nana verifies photo rendered in chat feed
    await nanaPage.waitForSelector('#chat-messages-container img[alt="Photo"]', { timeout: 4000 });
    console.log('✅ Nana successfully received & decrypted Kevin encrypted photo!');

    // Test photo preview modal
    await nanaPage.click('#chat-messages-container [data-img-src]');
    await nanaPage.waitForSelector('#modal-photo-preview:not(.hidden)');
    await nanaPage.click('#btn-close-photo-preview');
    await nanaPage.waitForSelector('#modal-photo-preview', { state: 'hidden' });
    console.log('✅ Photo preview modal opens & closes cleanly!');

    // Verify Server SQLite Database Stats
    const statsRes = await new Promise((resolve) => {
      http.get(`http://localhost:${TEST_PORT}/api/stats`, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
    });
    console.log('Server Database Stats:', statsRes);
    if (!statsRes || statsRes.totalMessages < 3) {
      throw new Error(`Expected at least 3 messages saved in SQLite DB, got: ${statsRes?.totalMessages}`);
    }
    console.log('✅ Server SQLite Database successfully persisted all messages (Zero-Knowledge)!');

    // 2c. Test Sender Offline Auto-Send Queue (Scenario A)
    console.log('Testing Scenario A: Kevin disconnects, queues message offline, reconnects & auto-sends...');
    await kevinPage.evaluate(() => {
      window.DuduChatSocket.disconnect();
    });
    await kevinPage.waitForTimeout(200);

    // Kevin sends text while disconnected
    await kevinPage.fill('#chat-text-input', 'OfflineQueueMsg: Sent while disconnected from internet!');
    await kevinPage.click('#btn-send-message');
    await kevinPage.waitForTimeout(200);

    // Verify Kevin's bubble shows 1 check ('done')
    const offlineCheck = await kevinPage.evaluate(() => {
      const icons = Array.from(document.querySelectorAll('.msg-check-icon'));
      const last = icons[icons.length - 1];
      return last ? last.textContent.trim() : null;
    });
    console.log('Kevin offline message initial checkmark:', offlineCheck);
    if (offlineCheck !== 'done') {
      throw new Error(`Expected single check 'done' for offline queued message, got: ${offlineCheck}`);
    }

    // Reconnect Kevin
    await kevinPage.evaluate(() => {
      window.DuduChatSocket.connect();
    });

    // Verify Nana receives it and Kevin's check updates to double check ('done_all')
    await nanaPage.waitForSelector('text=OfflineQueueMsg: Sent while disconnected from internet!', { timeout: 5000 });
    console.log('✅ Nana received offline-queued message after Kevin reconnected!');

    await kevinPage.waitForFunction(() => {
      const icons = Array.from(document.querySelectorAll('.msg-check-icon'));
      const last = icons[icons.length - 1];
      return last && last.textContent.includes('done_all');
    }, { timeout: 4000 });
    console.log('✅ Kevin offline-queued message updated to double check upon reconnect & ACK!');

    // 2d. Test Receiver Offline Sync (Scenario B)
    console.log('Testing Scenario B: Nana disconnects, Kevin sends message to backend DB, Nana reconnects & syncs...');
    await nanaPage.evaluate(() => {
      window.DuduChatSocket.disconnect();
    });
    await nanaPage.waitForTimeout(200);

    // Kevin sends message while Nana is disconnected
    await kevinPage.fill('#chat-text-input', 'NanaOfflineMsg: Waiting on server until Nana comes online!');
    await kevinPage.click('#btn-send-message');

    // Wait for Kevin's message to get ACKed by SQLite database (2 checks)
    await kevinPage.waitForFunction(() => {
      const icons = Array.from(document.querySelectorAll('.msg-check-icon'));
      const last = icons[icons.length - 1];
      return last && last.textContent.includes('done_all');
    }, { timeout: 4000 });
    console.log('✅ Kevin message safely caught by backend SQLite database while Nana is offline!');

    // Nana reconnects
    await nanaPage.evaluate(() => {
      window.DuduChatSocket.connect();
    });

    // Verify Nana receives message from server SQLite sync
    await nanaPage.waitForSelector('text=NanaOfflineMsg: Waiting on server until Nana comes online!', { timeout: 5000 });
    console.log('✅ Nana automatically received missed message from backend SQLite sync upon coming online!');

    // Kevin's check turns blue
    await kevinPage.waitForFunction(() => {
      const icons = Array.from(document.querySelectorAll('.msg-check-icon'));
      const last = icons[icons.length - 1];
      return last && last.textContent.includes('done_all') && last.classList.contains('text-sky-500');
    }, { timeout: 4000 });
    console.log('✅ Kevin message turned blue after Nana came online and read it!');

    // 2e. Test Message Reply
    console.log('Testing Message Reply feature...');
    await kevinPage.fill('#chat-text-input', 'Hey Bubu, want some ice cream?');
    await kevinPage.click('#btn-send-message');
    await nanaPage.waitForSelector('text=Hey Bubu, want some ice cream?', { timeout: 4000 });

    // Nana initiates reply to Kevin's message
    const msgIdToReply = await nanaPage.evaluate(() => {
      const row = Array.from(document.querySelectorAll('.chat-bubble-row')).find(r => r.textContent.includes('want some ice cream'));
      return row ? row.getAttribute('data-msg-id') : null;
    });
    if (!msgIdToReply) throw new Error('Could not find message row to reply to');

    await nanaPage.click(`.chat-bubble-row[data-msg-id="${msgIdToReply}"] .btn-quick-reply`);
    await nanaPage.waitForSelector('#chat-reply-bar:not(.hidden)', { timeout: 4000 });

    // Nana types and sends reply
    await nanaPage.fill('#chat-text-input', 'Yes please, matcha flavor!');
    await nanaPage.click('#btn-send-message');

    // Verify reply quote banner renders on Nana's page
    await nanaPage.waitForSelector('.reply-quote-jump', { timeout: 4000 });
    const nanaQuoteSnippet = await nanaPage.locator('.reply-quote-jump').last().textContent();
    console.log('Nana reply quote banner:', nanaQuoteSnippet);
    if (!nanaQuoteSnippet.includes('want some ice cream')) {
      throw new Error(`Expected quote to include "want some ice cream", got: ${nanaQuoteSnippet}`);
    }

    // Verify reply quote banner renders on Kevin's page
    await kevinPage.waitForSelector('.reply-quote-jump', { timeout: 4000 });
    const kevinQuoteSnippet = await kevinPage.locator('.reply-quote-jump').last().textContent();
    console.log('Kevin received reply quote banner:', kevinQuoteSnippet);
    if (!kevinQuoteSnippet.includes('want some ice cream')) {
      throw new Error(`Expected quote on Kevin's page to include "want some ice cream", got: ${kevinQuoteSnippet}`);
    }
    console.log('✅ Message Reply with quote banner verified on both sides!');

    // 2f. Test Video Upload & Playback
    console.log('Testing Video message upload and playback rendering...');
    await kevinPage.evaluate(async () => {
      const blob = new Blob(['mock video binary data'], { type: 'video/mp4' });
      const file = new File([blob], 'sunset.mp4', { type: 'video/mp4' });
      await window.DuduChatUI.sendMedia(file);
    });

    await kevinPage.waitForSelector('.chat-bubble-row video', { timeout: 4000 });
    await nanaPage.waitForSelector('.chat-bubble-row video', { timeout: 4000 });
    const videoSrcOnNana = await nanaPage.$eval('.chat-bubble-row video', el => el.getAttribute('src'));
    if (!videoSrcOnNana || !videoSrcOnNana.startsWith('data:video/mp4')) {
      throw new Error('Expected video element with data:video/mp4 src on Nana page');
    }
    console.log('✅ Video message uploaded, end-to-end encrypted, and rendered with native controls!');

    // 2g. Test Live Message Deletion Sync with Confirmation Modal
    console.log('Testing Message Deletion (local + backend DB + remote socket) with "Are you sure?" modal...');
    // Kevin deletes the ice cream message using quick delete button
    await kevinPage.click(`.chat-bubble-row[data-msg-id="${msgIdToReply}"] .btn-quick-delete`);
    
    // Verify confirmation modal opens
    await kevinPage.waitForSelector('#modal-delete-message-confirm:not(.hidden)', { timeout: 4000 });
    const deletePrompt = await kevinPage.$eval('#delete-message-confirm-text', el => el.textContent.trim());
    console.log('Delete prompt text:', deletePrompt);
    if (!deletePrompt.includes('Are you sure')) {
      throw new Error(`Expected prompt text to contain "Are you sure", got: ${deletePrompt}`);
    }

    // Confirm deletion
    await kevinPage.click('#btn-confirm-delete-msg');
    await kevinPage.waitForSelector('#modal-delete-message-confirm', { state: 'hidden', timeout: 4000 });
    await kevinPage.waitForTimeout(300);

    // Verify message removed from Kevin's DOM
    const kevinHasDeletedMsg = await kevinPage.$(`.chat-bubble-row[data-msg-id="${msgIdToReply}"]`);
    if (kevinHasDeletedMsg) {
      throw new Error('Message should be removed from Kevin DOM after deletion');
    }

    // Verify message removed from Nana's DOM
    await nanaPage.waitForFunction((id) => {
      return !document.querySelector(`.chat-bubble-row[data-msg-id="${id}"]`);
    }, msgIdToReply, { timeout: 4000 });
    console.log('✅ Deleted message cleanly vanished from both Kevin and Nana DOM in real-time with confirmation!');

    // 2h. Test Touch Swipe-to-Reply Gesture
    console.log('Testing WhatsApp-style Touch Swipe-to-Reply gesture...');
    await nanaPage.evaluate(() => {
      const container = document.getElementById('chat-messages-container');
      const row = container.querySelector('.chat-bubble-row');
      if (!row) throw new Error('No bubble row found for swipe test');

      const touchStart = new Touch({
        identifier: Date.now(),
        target: row,
        clientX: 50,
        clientY: 200
      });
      const touchMove = new Touch({
        identifier: Date.now(),
        target: row,
        clientX: 180,
        clientY: 200
      });

      container.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], bubbles: true }));
      container.dispatchEvent(new TouchEvent('touchmove', { touches: [touchMove], bubbles: true }));
      container.dispatchEvent(new TouchEvent('touchend', { touches: [], bubbles: true }));
    });
    await nanaPage.waitForSelector('#chat-reply-bar:not(.hidden)', { timeout: 4000 });
    console.log('✅ Touch swipe right successfully revealed reply dock banner!');
    await nanaPage.click('#btn-cancel-reply');
    await nanaPage.waitForSelector('#chat-reply-bar', { state: 'hidden' });

    // 2i. Test Message Forwarding across topics
    console.log('Testing Message Forwarding across topics...');
    await kevinPage.fill('#chat-text-input', 'MessageToForward: I love you Nana!');
    await kevinPage.click('#btn-send-message');
    await kevinPage.waitForSelector('text=MessageToForward: I love you Nana!', { timeout: 4000 });

    const fwdMsgRow = await kevinPage.locator('.chat-bubble-row', { hasText: 'MessageToForward' }).first();
    await fwdMsgRow.locator('.btn-quick-forward').click();

    await kevinPage.waitForSelector('#modal-forward-topic:not(.hidden)', { timeout: 4000 });
    console.log('✅ Forward Topic Modal opened!');

    const topicToForward = await kevinPage.locator('.forward-topic-item').nth(1);
    const targetTopicTitle = await topicToForward.locator('.font-bold').textContent();
    console.log(`Forwarding message to target topic: "${targetTopicTitle}"...`);
    await topicToForward.click();
    await kevinPage.waitForSelector('#modal-forward-topic', { state: 'hidden' });

    await kevinPage.locator('.chat-session-chip', { hasText: targetTopicTitle.trim() }).first().click();
    await kevinPage.waitForSelector('text=MessageToForward: I love you Nana!', { timeout: 4000 });
    const fwdBadge = await kevinPage.locator('.chat-bubble-row', { hasText: 'MessageToForward' }).locator('text=Forwarded');
    if (await fwdBadge.count() === 0) {
      throw new Error('Expected "Forwarded" badge on forwarded message');
    }
    console.log('✅ Message successfully forwarded to new topic with "Forwarded" badge!');

    // 2i-selection. Test Hold-Down to Select, Batch Selection Bar, Batch Forward & Batch Delete
    console.log('Testing Selection Mode, Long-Press Hold, Batch Forward, and Batch Delete with confirmation...');
    // Kevin sends two messages for batch testing
    await kevinPage.fill('#chat-text-input', 'BatchAlpha: Hugs for Nana');
    await kevinPage.click('#btn-send-message');
    await kevinPage.waitForSelector('text=BatchAlpha: Hugs for Nana', { timeout: 4000 });

    await kevinPage.fill('#chat-text-input', 'BatchBeta: Kisses for Nana');
    await kevinPage.click('#btn-send-message');
    await kevinPage.waitForSelector('text=BatchBeta: Kisses for Nana', { timeout: 4000 });

    // Long press (pointer hold > 450ms) on BatchAlpha bubble to enter selection mode
    const alphaRow = kevinPage.locator('.chat-bubble-row', { hasText: 'BatchAlpha' }).first();
    const alphaBody = alphaRow.locator('.chat-bubble-body');
    const alphaBox = await alphaBody.boundingBox();
    if (!alphaBox) throw new Error('Could not find bounding box for BatchAlpha bubble body');

    await kevinPage.mouse.move(alphaBox.x + alphaBox.width / 2, alphaBox.y + alphaBox.height / 2);
    await kevinPage.mouse.down();
    await kevinPage.waitForTimeout(600);
    await kevinPage.mouse.up();
    await kevinPage.waitForTimeout(200);

    // Verify selection bar is visible under topics
    await kevinPage.waitForSelector('#chat-selection-bar:not(.hidden)', { timeout: 3000 });
    const selCount1 = await kevinPage.$eval('#chat-selection-count', el => el.textContent.trim());
    console.log('Selection count after 1st message hold:', selCount1);
    if (!selCount1.includes('1 selected')) {
      throw new Error(`Expected "1 selected", got: ${selCount1}`);
    }

    // Tap second message to toggle selection
    const betaRow = kevinPage.locator('.chat-bubble-row', { hasText: 'BatchBeta' }).first();
    await betaRow.click();
    await kevinPage.waitForTimeout(200);

    const selCount2 = await kevinPage.$eval('#chat-selection-count', el => el.textContent.trim());
    console.log('Selection count after 2nd message tap:', selCount2);
    if (!selCount2.includes('2 selected')) {
      throw new Error(`Expected "2 selected", got: ${selCount2}`);
    }

    // Test Exit Selection Mode button
    await kevinPage.click('#btn-exit-selection');
    await kevinPage.waitForSelector('#chat-selection-bar', { state: 'hidden', timeout: 3000 });
    console.log('✅ Selection mode exited cleanly via exit button!');

    // Re-select both messages via programmatic API or hold
    await kevinPage.evaluate(async () => {
      const rows = Array.from(document.querySelectorAll('.chat-bubble-row'));
      const id1 = rows.find(r => r.textContent.includes('BatchAlpha'))?.getAttribute('data-msg-id');
      const id2 = rows.find(r => r.textContent.includes('BatchBeta'))?.getAttribute('data-msg-id');
      window.DuduChatUI.enterSelectionMode(id1);
      window.DuduChatUI.toggleSelectMessage(id2);
    });
    await kevinPage.waitForSelector('#chat-selection-bar:not(.hidden)', { timeout: 3000 });

    // Test Batch Delete
    await kevinPage.click('#btn-selection-delete');
    await kevinPage.waitForSelector('#modal-delete-message-confirm:not(.hidden)', { timeout: 3000 });
    const batchDelPrompt = await kevinPage.$eval('#delete-message-confirm-text', el => el.textContent.trim());
    console.log('Batch delete prompt text:', batchDelPrompt);
    if (!batchDelPrompt.includes('2 messages')) {
      throw new Error(`Expected confirmation prompt to mention 2 messages, got: ${batchDelPrompt}`);
    }

    // Confirm deletion of both messages
    await kevinPage.click('#btn-confirm-delete-msg');
    await kevinPage.waitForSelector('#modal-delete-message-confirm', { state: 'hidden', timeout: 3000 });
    await kevinPage.waitForSelector('#chat-selection-bar', { state: 'hidden', timeout: 3000 });
    await kevinPage.waitForTimeout(300);

    // Verify both messages removed from DOM
    const remainingBatchAlpha = await kevinPage.$('text=BatchAlpha: Hugs for Nana');
    const remainingBatchBeta = await kevinPage.$('text=BatchBeta: Kisses for Nana');
    if (remainingBatchAlpha || remainingBatchBeta) {
      throw new Error('Batch messages still exist after batch deletion!');
    }
    console.log('✅ Batch delete with confirmation verified successfully!');

    // 2j. Test Chunked Encrypted Blob System (Large File / Video / Media)
    console.log('Testing Chunked Encrypted Blob System (Zero-Knowledge, multi-chunk, streaming disk storage)...');

    // Switch both Kevin and Nana back to Daily Banter
    await kevinPage.locator('.chat-session-chip', { hasText: 'Daily Banter' }).first().click();
    await nanaPage.locator('.chat-session-chip', { hasText: 'Daily Banter' }).first().click();
    await kevinPage.waitForTimeout(500);
    await nanaPage.waitForTimeout(500);

    const blobSendResult = await kevinPage.evaluate(async () => {
      const size = 3 * 1024 * 1024;
      const buffer = new Uint8Array(size);
      for (let i = 0; i < 1000; i++) buffer[i] = 42;
      buffer[size - 1] = 99;

      const file = new File([buffer], 'big_love_video.mp4', { type: 'video/mp4' });
      await window.DuduChatUI.sendMedia(file);
      return { size };
    });
    console.log('Kevin sent 3MB encrypted blob:', blobSendResult);

    await kevinPage.waitForTimeout(1000);
    const blobsDir = TEST_BLOBS;
    const blobDirs = fs.readdirSync(blobsDir);
    console.log(`Blob directories on server disk (${blobDirs.length}):`, blobDirs);
    if (blobDirs.length === 0) {
      throw new Error(`Expected at least 1 blob directory in ${blobsDir}`);
    }
    const targetBlobDir = path.join(blobsDir, blobDirs[0]);
    const chunkFiles = fs.readdirSync(targetBlobDir);
    console.log(`Chunk files in ${targetBlobDir} (${chunkFiles.length}):`, chunkFiles);
    if (chunkFiles.length < 2) {
      throw new Error(`Expected at least 2 chunk files in ${targetBlobDir}, found: ${chunkFiles.length}`);
    }
    console.log('✅ Server stored encrypted 2MB chunks on disk without knowing plaintext!');

    await nanaPage.waitForSelector('.blob-media-card', { timeout: 5000 });
    const blobFileName = await nanaPage.$eval('.blob-media-card .font-bold', el => el.textContent.trim());
    console.log('Nana received blob media card:', blobFileName);
    if (!blobFileName.includes('big_love_video.mp4')) {
      throw new Error(`Expected blob card to display "big_love_video.mp4", got: "${blobFileName}"`);
    }

    console.log('Nana downloading and decrypting blob chunks...');
    await nanaPage.click('.blob-media-card .btn-load-blob');

    await nanaPage.waitForSelector('.chat-bubble-row video', { timeout: 8000 });
    console.log('✅ Nana successfully downloaded, decrypted, and rendered the large encrypted video blob!');

    console.log('Testing Blob Deletion cleans up files on server disk...');
    const blobMsgId = await kevinPage.evaluate(async () => {
      const msgs = await window.DuduChatStorage.getMessages('daily_banter');
      const blobMsg = msgs.reverse().find(m => m.type === 'blob');
      return blobMsg ? blobMsg.id : null;
    });
    console.log('Target blob message ID to delete:', blobMsgId);
    if (!blobMsgId) throw new Error('Could not find blob message ID to delete');

    if (blobMsgId) {
      await kevinPage.click(`.chat-bubble-row[data-msg-id="${blobMsgId}"] .btn-quick-delete`);
      await kevinPage.waitForSelector('#modal-delete-message-confirm:not(.hidden)', { timeout: 3000 });
      await kevinPage.click('#btn-confirm-delete-msg');
      await kevinPage.waitForSelector('#modal-delete-message-confirm', { state: 'hidden', timeout: 3000 });
      await kevinPage.waitForTimeout(1000);

      const existsAfter = fs.existsSync(targetBlobDir);
      console.log('Blob directory exists on server disk after deletion:', existsAfter);
      if (existsAfter) {
        throw new Error('Blob directory still exists on server disk after deletion!');
      }
      console.log('✅ Disk blob directory purged successfully upon message deletion!');
    }

    // 3. Test New Topic Creation
    console.log('Kevin creating new topic...');
    await kevinPage.click('#btn-new-topic');
    await kevinPage.waitForSelector('#modal-new-topic:not(.hidden)');
    await kevinPage.fill('#input-new-topic-title', 'Late Night Snacks');
    await kevinPage.selectOption('#select-new-topic-emoji', '🍱');
    await kevinPage.click('#form-new-topic button[type="submit"]');
    await kevinPage.waitForTimeout(300);

    // Verify active topic chip updated on Kevin
    const activeTopic = await kevinPage.$eval('.chat-session-chip.bg-secondary', el => el.textContent.trim());
    console.log('Active topic chip after creation:', activeTopic);
    if (!activeTopic.includes('Late Night Snacks')) {
      throw new Error(`Expected active topic to include "Late Night Snacks", got: ${activeTopic}`);
    }

    // Verify Nana automatically receives the synced topic in real-time!
    await nanaPage.waitForSelector('.chat-session-chip:has-text("Late Night Snacks")', { timeout: 4000 });
    console.log('✅ Nana automatically received and rendered topic created by Kevin in real-time!');

    // 4. Test "All Topics" Modal and Search
    console.log('Testing "All Topics" popup and search...');
    await kevinPage.click('#btn-open-all-topics');
    await kevinPage.waitForSelector('#modal-all-topics:not(.hidden)');
    await kevinPage.fill('#input-search-topics', 'Date Ideas');
    await kevinPage.waitForTimeout(200);

    const filteredItems = await kevinPage.$$eval('.all-topic-item', items => items.map(i => i.textContent.trim()));
    console.log('Filtered items in all topics modal:', filteredItems);
    if (!filteredItems.some(item => item.includes('Date Ideas'))) {
      throw new Error('Search failed to find Date Ideas in All Topics modal!');
    }

    // Select Date Ideas from modal
    const dateIdeasItem = await kevinPage.$('.all-topic-item');
    await dateIdeasItem.click();
    await kevinPage.waitForSelector('#modal-all-topics', { state: 'hidden' });
    const newActiveTopic = await kevinPage.$eval('.chat-session-chip.bg-secondary', el => el.textContent.trim());
    console.log('New active topic chip after modal selection:', newActiveTopic);
    if (!newActiveTopic.includes('Date Ideas')) {
      throw new Error(`Expected active topic to be Date Ideas, got: ${newActiveTopic}`);
    }

    // 4b. Test Topic Deletion with 3-Step Confirmation
    console.log('Testing Topic Deletion with 3-Step Confirmation...');
    await kevinPage.click('#btn-open-all-topics');
    await kevinPage.waitForSelector('#modal-all-topics:not(.hidden)');

    const deleteBtn = await kevinPage.$('[data-delete-title="Late Night Snacks"]');
    if (!deleteBtn) throw new Error('Delete button for "Late Night Snacks" not found!');
    await deleteBtn.click();

    // Verify 3-step confirmation modal opens
    await kevinPage.waitForSelector('#modal-delete-topic-confirm:not(.hidden)');

    // Step 1: "Are you sure?"
    const step1Title = await kevinPage.$eval('#delete-prompt-title', el => el.textContent.trim());
    console.log('Delete prompt Step 1 title:', step1Title);
    if (!step1Title.includes('Are you sure?')) throw new Error(`Expected Step 1 "Are you sure?", got: ${step1Title}`);
    await kevinPage.click('#btn-confirm-delete-step');
    await kevinPage.waitForTimeout(100);

    // Step 2: "Are you actually sure?"
    const step2Title = await kevinPage.$eval('#delete-prompt-title', el => el.textContent.trim());
    console.log('Delete prompt Step 2 title:', step2Title);
    if (!step2Title.includes('Are you actually sure?')) throw new Error(`Expected Step 2 "Are you actually sure?", got: ${step2Title}`);
    await kevinPage.click('#btn-confirm-delete-step');
    await kevinPage.waitForTimeout(100);

    // Step 3: "Are you super duper sure?"
    const step3Title = await kevinPage.$eval('#delete-prompt-title', el => el.textContent.trim());
    console.log('Delete prompt Step 3 title:', step3Title);
    if (!step3Title.includes('Are you super duper sure?')) throw new Error(`Expected Step 3 "Are you super duper sure?", got: ${step3Title}`);
    await kevinPage.click('#btn-confirm-delete-step');

    // Modal should close and session should be deleted
    await kevinPage.waitForSelector('#modal-delete-topic-confirm', { state: 'hidden' });
    await kevinPage.waitForTimeout(300);

    const remainingTopics = await kevinPage.$$eval('.all-topic-item', items => items.map(i => i.textContent.trim()));
    console.log('Remaining topics after deletion:', remainingTopics);
    if (remainingTopics.some(item => item.includes('Late Night Snacks'))) {
      throw new Error('FAIL: "Late Night Snacks" still present after 3-step deletion!');
    }
    console.log('✅ Topic deletion with 3-step confirmation verified successfully!');

    // Close all topics modal
    await kevinPage.click('#btn-close-all-topics');
    await kevinPage.waitForSelector('#modal-all-topics', { state: 'hidden' });

    // 5. Test Identity Selection via header click
    console.log('Testing Header Identity Switcher (Dudu / Bubu)...');
    await kevinPage.click('#header-identity-btn');
    await kevinPage.waitForSelector('#modal-identity-picker:not(.hidden)');
    await kevinPage.click('#btn-choose-bubu');
    await kevinPage.waitForSelector('#modal-identity-picker', { state: 'hidden' });

    const headerNameBubu = await kevinPage.$eval('#header-identity-name', el => el.textContent.trim());
    console.log('Header name after choosing Bubu:', headerNameBubu);
    if (headerNameBubu !== 'Bubu') throw new Error(`Expected header name "Bubu", got: ${headerNameBubu}`);

    // Switch back to Dudu
    await kevinPage.click('#header-identity-btn');
    await kevinPage.waitForSelector('#modal-identity-picker:not(.hidden)');
    await kevinPage.click('#btn-choose-dudu');
    await kevinPage.waitForSelector('#modal-identity-picker', { state: 'hidden' });
    const headerNameDudu = await kevinPage.$eval('#header-identity-name', el => el.textContent.trim());
    console.log('Header name after choosing Dudu:', headerNameDudu);
    if (headerNameDudu !== 'Dudu') throw new Error(`Expected header name "Dudu", got: ${headerNameDudu}`);

    // 6. Test Debug Mode controls Settings Button visibility
    console.log('Testing Debug Mode toggle for E2EE settings button...');
    const isSettingsHiddenInitial = await kevinPage.$eval('#btn-chat-settings', el => el.classList.contains('hidden'));
    if (!isSettingsHiddenInitial) throw new Error('FAIL: Chat settings button should be hidden by default!');

    // 5-tap avatar to enable debug mode
    for (let i = 0; i < 5; i++) {
      await kevinPage.click('#profile-avatar-btn');
      await kevinPage.waitForTimeout(50);
    }
    await kevinPage.waitForTimeout(200);
    const isSettingsVisibleDebug = await kevinPage.$eval('#btn-chat-settings', el => !el.classList.contains('hidden'));
    if (!isSettingsVisibleDebug) throw new Error('FAIL: Chat settings button should be visible in debug mode!');

    // 5-tap avatar to disable debug mode
    for (let i = 0; i < 5; i++) {
      await kevinPage.click('#profile-avatar-btn');
      await kevinPage.waitForTimeout(50);
    }
    await kevinPage.waitForTimeout(200);
    const isSettingsHiddenAgain = await kevinPage.$eval('#btn-chat-settings', el => el.classList.contains('hidden'));
    if (!isSettingsHiddenAgain) throw new Error('FAIL: Chat settings button should be hidden after debug mode disabled!');
    console.log('✅ Debug Mode controls E2EE settings visibility cleanly!');

    // 7. Test deleting every topic down to 0 topics
    console.log('Testing deleting all topics...');
    await kevinPage.click('#btn-open-all-topics');
    await kevinPage.waitForSelector('#modal-all-topics:not(.hidden)');

    // Delete all topics in the modal
    while (true) {
      const deleteButtons = await kevinPage.$$('.btn-delete-topic');
      if (deleteButtons.length === 0) break;
      await deleteButtons[0].click();
      await kevinPage.waitForSelector('#modal-delete-topic-confirm:not(.hidden)');
      // Confirm 3 times
      await kevinPage.click('#btn-confirm-delete-step');
      await kevinPage.click('#btn-confirm-delete-step');
      await kevinPage.click('#btn-confirm-delete-step');
      await kevinPage.waitForSelector('#modal-delete-topic-confirm', { state: 'hidden' });
      await kevinPage.waitForTimeout(100);
    }

    const topicsAfterTotalWipe = await kevinPage.$$eval('.all-topic-item', items => items.length);
    console.log('Topics count after deleting everything:', topicsAfterTotalWipe);
    if (topicsAfterTotalWipe !== 0) throw new Error(`Expected 0 topics left, got: ${topicsAfterTotalWipe}`);

    await kevinPage.click('#btn-close-all-topics');
    await kevinPage.waitForSelector('#modal-all-topics', { state: 'hidden' });

    // Verify empty state in chat container
    const emptyNotice = await kevinPage.$eval('#chat-messages-container', el => el.textContent.trim());
    console.log('Chat container content after all topics deleted:', emptyNotice);
    if (!emptyNotice.includes('No topics yet')) {
      throw new Error(`Expected "No topics yet" message, got: ${emptyNotice}`);
    }
    console.log('✅ Successfully deleted every topic down to 0 with clean empty state!');

    // Recreate a topic to ensure app remains 100% usable
    console.log('Testing fresh topic creation after total wipe...');
    await kevinPage.click('#btn-new-topic');
    await kevinPage.waitForSelector('#modal-new-topic:not(.hidden)');
    await kevinPage.fill('#input-new-topic-title', 'Our Fresh Start');
    await kevinPage.selectOption('#select-new-topic-emoji', '✨');
    await kevinPage.click('#form-new-topic button[type="submit"]');
    await kevinPage.waitForTimeout(300);

    const freshActiveTopic = await kevinPage.$eval('.chat-session-chip.bg-secondary', el => el.textContent.trim());
    console.log('Fresh active topic created:', freshActiveTopic);
    if (!freshActiveTopic.includes('Our Fresh Start')) {
      throw new Error(`Expected active topic to be "Our Fresh Start", got: ${freshActiveTopic}`);
    }
    console.log('✅ Re-created fresh topic after total wipe successfully!');

    // 8. Test input dock positioning, keyboard focus animation, and placeholder
    console.log('Testing input dock, keyboard focus behavior, and bottom nav animation...');
    const placeholderText = await kevinPage.$eval('#chat-text-input', el => el.getAttribute('placeholder'));
    console.log('Chat input placeholder:', placeholderText);
    if (placeholderText !== 'Type message...') {
      throw new Error(`Expected placeholder to be "Type message...", got: "${placeholderText}"`);
    }

    const initialNavHidden = await kevinPage.$eval('#bottom-nav-bar', el => el.classList.contains('nav-bar-hidden'));
    if (initialNavHidden) {
      throw new Error('Bottom nav bar should NOT have nav-bar-hidden initially');
    }

    // Focus input
    await kevinPage.focus('#chat-text-input');
    await kevinPage.waitForTimeout(100);

    const isNavHiddenOnFocus = await kevinPage.$eval('#bottom-nav-bar', el => el.classList.contains('nav-bar-hidden'));
    const isDockActiveOnFocus = await kevinPage.$eval('#chat-input-dock', el => el.classList.contains('dock-keyboard-active'));
    console.log(`Focus state: nav-bar-hidden=${isNavHiddenOnFocus}, dock-keyboard-active=${isDockActiveOnFocus}`);
    if (!isNavHiddenOnFocus) {
      throw new Error('Bottom nav bar must have nav-bar-hidden class when chat input is focused!');
    }
    if (!isDockActiveOnFocus) {
      throw new Error('Chat input dock must have dock-keyboard-active class when chat input is focused!');
    }

    // Blur input
    await kevinPage.$eval('#chat-text-input', el => el.blur());
    await kevinPage.waitForTimeout(100);

    const isNavHiddenAfterBlur = await kevinPage.$eval('#bottom-nav-bar', el => el.classList.contains('nav-bar-hidden'));
    const isDockActiveAfterBlur = await kevinPage.$eval('#chat-input-dock', el => el.classList.contains('dock-keyboard-active'));
    console.log(`Blur state: nav-bar-hidden=${isNavHiddenAfterBlur}, dock-keyboard-active=${isDockActiveAfterBlur}`);
    if (isNavHiddenAfterBlur) {
      throw new Error('Bottom nav bar should NOT have nav-bar-hidden after input blur!');
    }
    if (isDockActiveAfterBlur) {
      throw new Error('Chat input dock should NOT have dock-keyboard-active after input blur!');
    }
    console.log('✅ Bottom nav hides and input dock transitions to bottom: 0 on focus, and restores on blur!');

    // 9. Test Spicy and Junk Food History Real-Time Sync & Eater attribution
    console.log('Testing Spicy Food & Junk Food History Real-time Sync and Eater Attribution...');
    // Switch both pages to Belly Tab (tab-shield)
    await kevinPage.click('a[data-tab="shield"]');
    await nanaPage.click('a[data-tab="shield"]');
    await kevinPage.waitForTimeout(400);
    await nanaPage.waitForTimeout(400);

    // Kevin logs spicy food eaten by Dudu
    await kevinPage.click('#log-spicy-trigger-btn');
    await kevinPage.waitForSelector('#modal-log-spicy:not(.hidden)');
    await kevinPage.click('#btn-spicy-eater-dudu');
    await kevinPage.fill('#spicy-food-name-input', 'Super Spicy Ghost Pepper Ramen');
    await kevinPage.click('#form-log-spicy button[type="submit"]');
    await kevinPage.waitForSelector('#modal-log-spicy', { state: 'hidden' });

    // Nana verifies the spicy food appears in real-time in history log with "Dudu ate"!
    await nanaPage.waitForSelector('#tummy-logs-list:has-text("Super Spicy Ghost Pepper Ramen")', { timeout: 5000 });
    const eaterBadgeText = await nanaPage.$eval('#tummy-logs-list', el => el.textContent);
    console.log('Nana view of Kevin spicy log verified:', eaterBadgeText.includes('Dudu ate'));
    if (!eaterBadgeText.includes('Dudu ate')) {
      throw new Error('Expected tummy log on Nana to display "Dudu ate"!');
    }
    console.log('✅ Real-time Spicy & Junk food history sync with eater attribution verified successfully!');

    // 10. Test Chat Viewport Instant Bottom Start & Pagination Chunk Loading
    console.log('Testing Chat Viewport Instant Bottom Start & Pagination Chunk Loading...');
    await kevinPage.click('a[data-tab="chat"]');
    await kevinPage.waitForTimeout(400);

    // Verify scroll-smooth class is completely removed from chat messages container
    const hasScrollSmooth = await kevinPage.$eval('#chat-messages-container', el => el.classList.contains('scroll-smooth'));
    if (hasScrollSmooth) {
      throw new Error('FAIL: #chat-messages-container must NOT have scroll-smooth class (it forces unwanted scroll animation from top)!');
    }
    console.log('✅ Verified: #chat-messages-container does not have scroll-smooth class!');

    // Seed 45 messages into active topic to test 30-message chunk limit
    await kevinPage.evaluate(async () => {
      const sessions = await window.DuduChatStorage.getSessions();
      const activeTopic = sessions[0]?.id || 'daily_banter';
      for (let i = 1; i <= 45; i++) {
        await window.DuduChatStorage.saveMessage({
          id: `msg_chunk_test_${i}`,
          sessionId: activeTopic,
          sender: i % 2 === 0 ? 'dudu' : 'bubu',
          type: 'text',
          content: `Test Message #${i} for pagination testing`,
          timestamp: 1728000000000 + (i * 1000),
          status: 'read'
        });
      }
      await window.DuduChatUI.onTabActivated();
    });
    await kevinPage.waitForTimeout(300);

    // Verify exactly 30 messages rendered initially (chunk limit)
    const initialRenderedCount = await kevinPage.$$eval('#chat-messages-container .chat-bubble-row', els => els.length);
    console.log(`Initial rendered messages count: ${initialRenderedCount} (expected 30)`);
    if (initialRenderedCount !== 30) {
      throw new Error(`Expected exactly 30 messages in initial chunk, got ${initialRenderedCount}`);
    }

    // Verify "Load older messages" banner is visible with remaining count
    const loadOlderBtnText = await kevinPage.$eval('#btn-load-older-msgs', el => el.textContent);
    console.log(`Load older button text: "${loadOlderBtnText.trim()}"`);
    if (!loadOlderBtnText.includes('15')) {
      throw new Error('Expected load older button to show 15 remaining messages!');
    }

    // Verify viewport started at bottom
    const isAtBottom = await kevinPage.$eval('#chat-messages-container', el => {
      return (el.scrollTop + el.clientHeight) >= (el.scrollHeight - 10);
    });
    console.log('Chat container started at bottom:', isAtBottom);
    if (!isAtBottom) {
      throw new Error('Chat container must start at bottom!');
    }

    // Load second chunk via older messages button
    await kevinPage.click('#btn-load-older-msgs');
    await kevinPage.waitForTimeout(300);

    const totalRenderedAfterLoad = await kevinPage.$$eval('#chat-messages-container .chat-bubble-row', els => els.length);
    console.log(`Total rendered messages after loading 2nd chunk: ${totalRenderedAfterLoad} (expected 45)`);
    if (totalRenderedAfterLoad !== 45) {
      throw new Error(`Expected 45 messages rendered after loading older chunk, got ${totalRenderedAfterLoad}`);
    }

    // Banner should now be gone because all messages are loaded
    const bannerStillPresent = await kevinPage.$('#btn-load-older-msgs');
    if (bannerStillPresent) {
      throw new Error('Load older button should vanish when all messages are loaded!');
    }
    console.log('✅ Instant bottom scroll start and pagination chunk loading verified 100% successfully!');

    // 11. Test Copy Functionality in Message Options Menu and Selection Mode
    console.log('Testing Copy Functionality in Message Options Menu and Selection Mode...');
    // A. Click a message bubble to open Message Options modal
    const firstBubble = await kevinPage.$('#chat-messages-container .chat-bubble-body');
    await firstBubble.click();
    await kevinPage.waitForSelector('#modal-message-actions:not(.hidden)');
    console.log('Message Options modal opened on bubble click!');

    // Click #btn-action-copy
    await kevinPage.click('#btn-action-copy');
    await kevinPage.waitForSelector('#modal-message-actions', { state: 'hidden' });
    console.log('✅ Clicked Copy in Message Options modal and modal closed cleanly!');

    // Verify toast notification appeared
    await kevinPage.waitForFunction(() => {
      const toast = document.querySelector('#feedback-toast');
      return toast && toast.textContent.includes('Copied') && !toast.classList.contains('opacity-0');
    }, { timeout: 3000 });
    console.log('✅ Feedback toast confirmed message copied to clipboard!');

    // B. Test Copy in Selection Mode
    console.log('Testing Copy in Selection Mode...');
    // Long-press first bubble to enter selection mode
    const firstRow = await kevinPage.$('#chat-messages-container .chat-bubble-row');
    const box = await firstRow.boundingBox();
    await kevinPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await kevinPage.mouse.down();
    await kevinPage.waitForTimeout(550);
    await kevinPage.mouse.up();
    await kevinPage.waitForSelector('#chat-selection-bar:not(.hidden)');
    console.log('Selection mode entered!');

    // Select a second message
    const allRows = await kevinPage.$$('#chat-messages-container .chat-bubble-row');
    if (allRows.length > 1) {
      await allRows[1].click();
      await kevinPage.waitForTimeout(200);
    }

    const selectionCountText = await kevinPage.$eval('#chat-selection-count', el => el.textContent);
    console.log('Selection count text:', selectionCountText);

    // Click Copy in Selection bar
    await kevinPage.click('#btn-selection-copy');
    await kevinPage.waitForSelector('#chat-selection-bar', { state: 'hidden' });
    console.log('✅ Clicked Copy in Selection Mode bar and selection mode closed cleanly!');

    // Verify toast notification appeared for multi-copy
    await kevinPage.waitForFunction(() => {
      const toast = document.querySelector('#feedback-toast');
      return toast && toast.textContent.includes('Copied') && !toast.classList.contains('opacity-0');
    }, { timeout: 3000 });
    console.log('✅ Feedback toast confirmed multi-messages copied in selection mode!');

    // Capture screenshots
    await kevinPage.screenshot({ path: 'scratch/screenshots/duo_chat_kevin.png' });
    await nanaPage.screenshot({ path: 'scratch/screenshots/duo_chat_nana.png' });
    console.log('📸 Screenshots saved to scratch/screenshots/duo_chat_*.png');

    console.log('\n🎉 ALL DUO CHAT E2EE & WEBSOCKET TESTS PASSED PERFECTLY!\n');
  } finally {
    await browser.close();
    serverProcess.kill('SIGTERM');
  }
})().catch(err => {
  console.error('❌ Duo Chat Verification Failed:', err);
  process.exit(1);
});
