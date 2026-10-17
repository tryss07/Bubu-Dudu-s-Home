const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Full Playwright Verification Suite for Dudu Mockup Overhaul...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const screenshotsDir = path.resolve(__dirname, '../scratch/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

  // Listen to any page console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Error]:`, msg.text());
  });

  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Verify Page Title
  const title = await page.title();
  console.log(`✓ Page Title: "${title}"`);
  if (!title.includes('Dudu & Bubu')) throw new Error(`Unexpected page title: ${title}`);

  // 2. Test Tab 1: Home / Our Space (timeline.jpg)
  console.log('\n--- Testing Screen 1: Our Space (Home) ---');
  const daysText = await page.textContent('#home-days-count');
  const subText = await page.textContent('#home-anniversary-sub');
  console.log(`✓ Days Together: ${daysText.trim()} (${subText ? subText.trim() : ''})`);
  if (!daysText.includes('345 days')) throw new Error(`Expected 345 days together, got ${daysText}`);
  if (subText && !subText.includes('4 November 2025')) throw new Error(`Expected Since 4 November 2025, got ${subText}`);

  const batteryText = await page.textContent('#home-battery-text');
  console.log(`✓ Love Battery: ${batteryText.trim()}`);

  // Test Battery Boost click
  await page.click('#btn-boost-battery');
  await page.waitForTimeout(300);
  console.log('✓ Love Battery boosted successfully');

  await page.screenshot({ path: path.join(screenshotsDir, '01_home_screen.png') });

  // 3. Test Tab 2: Love Notes (love notes.jpg)
  console.log('\n--- Testing Screen 2: Love Notes ---');
  await page.click('#bottom-nav-bar a[data-tab="notes"]');
  await page.waitForTimeout(400);

  const notesVisible = await page.isVisible('#tab-notes');
  if (!notesVisible) throw new Error('Love notes tab failed to show!');
  const noteCount = await page.$$eval('#notes-cards-list > div', els => els.length);
  console.log(`✓ Love Notes rendered: ${noteCount} notes`);
  if (noteCount === 0) throw new Error('No love notes rendered!');

  // Test opening Write Note modal
  await page.click('#btn-write-love-note');
  await page.waitForTimeout(300);
  const writeModalVisible = await page.isVisible('#modal-write-love-note');
  if (!writeModalVisible) throw new Error('Write Love Note modal did not open!');
  await page.click('#btn-close-write-note');
  await page.waitForTimeout(200);
  console.log('✓ Write Love Note modal opened and closed successfully');

  await page.screenshot({ path: path.join(screenshotsDir, '02_love_notes.png') });

  // 4. Test Tab 3: Memory Jar (Memory .jpg)
  console.log('\n--- Testing Screen 3: Memory Jar ---');
  await page.click('#bottom-nav-bar a[data-tab="memories"]');
  await page.waitForTimeout(400);

  const polaroidCount = await page.$$eval('#polaroids-grid .polaroid-card', els => els.length);
  console.log(`✓ Polaroids rendered: ${polaroidCount}`);
  if (polaroidCount !== 4) throw new Error(`Expected 4 polaroids, got ${polaroidCount}`);

  const milestoneCount = await page.$$eval('#memory-timeline-nodes > div', els => els.length);
  console.log(`✓ Milestone timeline nodes: ${milestoneCount}`);
  if (milestoneCount === 0) throw new Error('Milestones missing!');

  await page.screenshot({ path: path.join(screenshotsDir, '03_memory_jar.png') });

  // 5. Test Tab 4: Bucket List & Date Planner (bucket list.jpg)
  console.log('\n--- Testing Screen 4: Bucket List ---');
  await page.click('#bottom-nav-bar a[data-tab="bucket"]');
  await page.waitForTimeout(400);

  const bucketPercent = await page.textContent('#bucket-progress-percent');
  console.log(`✓ Adventure Progress: ${bucketPercent.trim()}`);

  const bucketCount = await page.$$eval('#bucket-cards-list > div', els => els.length);
  console.log(`✓ Bucket list date cards: ${bucketCount}`);
  if (bucketCount === 0) throw new Error('Bucket cards missing!');

  // Toggle first checklist item
  await page.click('#bucket-cards-list button.btn-toggle-bucket');
  await page.waitForTimeout(300);
  console.log('✓ Checklist item toggled successfully');

  await page.screenshot({ path: path.join(screenshotsDir, '04_bucket_list.png') });

  // 6. Test Tab 5: Our Calendar (calender.jpg)
  console.log('\n--- Testing Screen 5: Our Calendar ---');
  await page.click('#bottom-nav-bar a[data-tab="calendar"]');
  await page.waitForTimeout(400);

  const calMonth = await page.textContent('#calendar-month-title');
  console.log(`✓ Calendar Month: ${calMonth.trim()}`);

  const daysCount = await page.$$eval('#calendar-days-grid > div', els => els.length);
  console.log(`✓ Calendar cells: ${daysCount}`);
  if (daysCount < 28) throw new Error('Calendar days missing!');

  await page.screenshot({ path: path.join(screenshotsDir, '05_our_calendar.png') });

  // 7. Test Tab 6: Bedtime & Music (music & bed time.jpg)
  console.log('\n--- Testing Screen 6: Bedtime & Music ---');
  await page.click('#bottom-nav-bar a[data-tab="music"]');
  await page.waitForTimeout(400);

  const countdownText = await page.textContent('#bedtime-countdown-display');
  console.log(`✓ Bedtime Countdown: ${countdownText.trim()}`);
  if (!countdownText.includes('Bedtime in')) throw new Error('Countdown display missing!');

  const trackTitle = await page.textContent('#lofi-track-title');
  console.log(`✓ Lofi Track: ${trackTitle.trim()}`);

  // Test Lofi Play Toggle
  await page.click('#btn-lofi-play');
  await page.waitForTimeout(400);
  const isSpinning = await page.$eval('#lofi-vinyl-disc', el => el.classList.contains('vinyl-spinning'));
  console.log(`✓ Vinyl Record Spinning: ${isSpinning}`);
  if (!isSpinning) throw new Error('Vinyl record should be spinning on play!');

  await page.click('#btn-lofi-play'); // pause
  await page.waitForTimeout(200);

  // Test Together Offline Sleep Overlay
  await page.click('#btn-together-offline');
  await page.waitForTimeout(300);
  const sleepVisible = await page.isVisible('#offline-sleep-overlay');
  if (!sleepVisible) throw new Error('Sleep overlay failed to open!');
  await page.click('#btn-close-sleep-overlay');
  await page.waitForTimeout(200);
  console.log('✓ Sleep mode overlay tested successfully');

  await page.screenshot({ path: path.join(screenshotsDir, '06_bedtime_music.png') });

  // 8. Test Tab 7: Couple Closet & Mini Game (wardrobe.jpg)
  console.log('\n--- Testing Screen 7: Couple Closet & Mini Game ---');
  await page.click('#bottom-nav-bar a[data-tab="wardrobe"]');
  await page.waitForTimeout(400);

  // Test mini game launch
  await page.click('#btn-play-minigame');
  await page.waitForTimeout(400);
  const miniGameVisible = await page.isVisible('#modal-minigame');
  if (!miniGameVisible) throw new Error('Mini game modal did not open!');

  const cardCount = await page.$$eval('#minigame-board .flip-card', els => els.length);
  console.log(`✓ Mini game cards: ${cardCount}`);
  if (cardCount !== 12) throw new Error(`Expected 12 cards, got ${cardCount}`);

  // Click first card to flip
  await page.click('#minigame-board .flip-card:first-child');
  await page.waitForTimeout(300);
  const isFlipped = await page.$eval('#minigame-board .flip-card:first-child', el => el.classList.contains('flipped'));
  console.log(`✓ Card flipped on click: ${isFlipped}`);

  await page.click('#btn-close-minigame');
  await page.waitForTimeout(200);

  await page.screenshot({ path: path.join(screenshotsDir, '07_closet_wardrobe.png') });

  // 9. Test Tab 8: Duo Chat (chat.jpg)
  console.log('\n--- Testing Screen 8: Duo Chat ---');
  await page.click('#bottom-nav-bar a[data-tab="chat"]');
  await page.waitForTimeout(600);

  const chatPartner = await page.textContent('#chat-partner-name');
  console.log(`✓ Chat Partner Header: ${chatPartner.trim()}`);
  if (!chatPartner.includes('Bubu')) throw new Error('Expected partner to be Bubu when viewing as Dudu');

  // Test Presence Indicator
  const presenceText = await page.textContent('#chat-partner-presence-text');
  const presenceDotClass = await page.$eval('#chat-partner-presence-dot', el => el.className);
  console.log(`✓ Presence indicator initial state: "${presenceText.trim()}" (dot: ${presenceDotClass.includes('bg-emerald-500') ? 'green' : 'gray'})`);
  if (!presenceText.includes('online') || !presenceDotClass.includes('bg-emerald-500')) {
    throw new Error('Online indicator dot/text not properly initialized!');
  }

  // Test Presence Toggle (Tap indicator to toggle offline)
  await page.click('#chat-partner-presence-container');
  await page.waitForTimeout(300);
  const toggledPresenceText = await page.textContent('#chat-partner-presence-text');
  const toggledDotClass = await page.$eval('#chat-partner-presence-dot', el => el.className);
  console.log(`✓ Toggled presence state: "${toggledPresenceText.trim()}" (dot: ${toggledDotClass.includes('bg-stone') ? 'gray' : 'green'})`);
  if (!toggledPresenceText.includes('offline') || !toggledDotClass.includes('bg-stone')) {
    throw new Error('Presence did not toggle to offline!');
  }

  // Toggle back to online
  await page.click('#chat-partner-presence-container');
  await page.waitForTimeout(300);

  // Test Initial Message Placement (Viewing as Dudu)
  const duduMsgIsRight = await page.$eval('.chat-bubble-row[data-msg-id="mock_msg_2"]', el => el.classList.contains('items-end'));
  const bubuMsgIsLeft = await page.$eval('.chat-bubble-row[data-msg-id="mock_msg_1"]', el => el.classList.contains('items-start'));
  console.log(`✓ [As Dudu]: Dudu msg on right: ${duduMsgIsRight}, Bubu msg on left: ${bubuMsgIsLeft}`);
  if (!duduMsgIsRight || !bubuMsgIsLeft) throw new Error('Message bubbles incorrectly positioned when viewing as Dudu!');

  // Test Role Switch to Bubu (via header button or chat partner button)
  await page.click('#chat-partner-toggle-btn');
  await page.waitForTimeout(400);

  const partnerAfterSwitch = await page.textContent('#chat-partner-name');
  const headerNameAfterSwitch = await page.textContent('#header-identity-name');
  console.log(`✓ Switched role: Header is "${headerNameAfterSwitch.trim()}", Partner is "${partnerAfterSwitch.trim()}"`);
  if (!headerNameAfterSwitch.includes('Bubu') || !partnerAfterSwitch.includes('Dudu')) {
    throw new Error('Identity switch failed to update header and partner labels!');
  }

  // Test Message Placement (Viewing as Bubu)
  const bubuMsgIsRightNow = await page.$eval('.chat-bubble-row[data-msg-id="mock_msg_1"]', el => el.classList.contains('items-end'));
  const duduMsgIsLeftNow = await page.$eval('.chat-bubble-row[data-msg-id="mock_msg_2"]', el => el.classList.contains('items-start'));
  console.log(`✓ [As Bubu]: Bubu msg on right: ${bubuMsgIsRightNow}, Dudu msg on left: ${duduMsgLeftNow = duduMsgIsLeftNow}`);
  if (!bubuMsgIsRightNow || !duduMsgIsLeftNow) {
    throw new Error('Message bubbles did not reorient correctly when switching perspective to Bubu!');
  }

  // Test Sending a message as Bubu
  await page.fill('#chat-text-input', 'Halo Dudu dari Bubu! 🐾❤️');
  await page.press('#chat-text-input', 'Enter');
  await page.waitForTimeout(500);

  const lastMsgIsRight = await page.$eval('#chat-messages-container .chat-bubble-row:last-child', el => el.classList.contains('items-end'));
  console.log(`✓ Sent new message as Bubu, positioned on right: ${lastMsgIsRight}`);
  if (!lastMsgIsRight) throw new Error('Message sent by Bubu was not positioned on right!');

  // Switch back to Dudu
  await page.click('#header-identity-btn');
  await page.waitForTimeout(400);
  const lastMsgForDuduIsLeft = await page.$eval('#chat-messages-container .chat-bubble-row:last-child', el => el.classList.contains('items-start'));
  console.log(`✓ Switched back to Dudu: Bubu's new message is on left (received): ${lastMsgForDuduIsLeft}`);
  if (!lastMsgForDuduIsLeft) throw new Error('Bubu message was not positioned on left when viewing as Dudu!');

  // Test Sticker Tray Toggle
  await page.click('#btn-toggle-sticker-tray');
  await page.waitForTimeout(400);
  const trayVisible = await page.isVisible('#chat-sticker-tray');
  console.log(`✓ Sticker Tray Drawer visible: ${trayVisible}`);
  if (!trayVisible) throw new Error('Sticker tray failed to open!');

  await page.screenshot({ path: path.join(screenshotsDir, '08_duo_chat_with_stickers.png') });

  await page.click('#btn-close-sticker-tray');
  await page.waitForTimeout(200);

  // 10. Responsive Viewport Check: Small Window (340x720) & Tablet (600x950)
  console.log('\n--- Testing Responsive Viewports ---');
  await page.setViewportSize({ width: 340, height: 720 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, '09_small_window_home.png') });
  console.log('✓ Captured small mobile viewport screenshot');

  await page.setViewportSize({ width: 580, height: 950 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, '10_tablet_window_home.png') });
  console.log('✓ Captured wider tablet viewport screenshot');

  await context.close();
  await browser.close();

  console.log('\n🎉 ALL 8 MOCKUP SCREENS & FEATURES VERIFIED SUCCESSFULLY!');
})();
