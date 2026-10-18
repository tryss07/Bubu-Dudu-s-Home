const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Bilingual Support & Wallpaper Verification...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 } // Standard mobile viewport
  });

  const page = await context.newPage();

  // Listen to any console errors
  const pageErrors = [];
  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    pageErrors.push(err.message);
  });

  const failedRequests = [];
  page.on('requestfailed', req => {
    console.error(`Request failed: ${req.url()} (${req.failure()?.errorText})`);
    failedRequests.push(req.url());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('✅ Page loaded successfully');

  // 1. Force set language to ID first and check pure Indonesian strings
  await page.evaluate(() => {
    window.DuduI18n.setLanguage('id');
  });
  await page.waitForTimeout(500);

  const idHomeText = await page.textContent('[data-i18n="home_our_space"]');
  const idNavHome = await page.textContent('[data-i18n="nav_home"]');
  const idNavNotes = await page.textContent('[data-i18n="nav_notes"]');
  const idNavChat = await page.textContent('[data-i18n="nav_chat"]');
  const idBatteryLove = await page.textContent('[data-i18n="home_battery_love"]');

  console.log(`[ID Check] home_our_space: "${idHomeText}"`);
  console.log(`[ID Check] nav_home: "${idNavHome}"`);
  console.log(`[ID Check] nav_notes: "${idNavNotes}"`);
  console.log(`[ID Check] nav_chat: "${idNavChat}"`);
  console.log(`[ID Check] home_battery_love: "${idBatteryLove}"`);

  if (idHomeText !== 'Ruang Kita' || idNavHome !== 'Beranda' || idBatteryLove !== 'Baterai Cinta') {
    throw new Error(`ID translation mismatch! Received: ${idHomeText}, ${idNavHome}, ${idBatteryLove}`);
  }

  // 2. Switch to English by clicking #btn-lang-toggle
  console.log('🔄 Clicking #btn-lang-toggle to switch to English...');
  await page.click('#btn-lang-toggle');
  await page.waitForTimeout(500);

  const currentLang = await page.evaluate(() => window.DuduI18n.getLanguage());
  console.log(`Current language after toggle: "${currentLang}"`);
  if (currentLang !== 'en') {
    throw new Error(`Expected currentLang to be 'en' but got '${currentLang}'`);
  }

  const enHomeText = await page.textContent('[data-i18n="home_our_space"]');
  const enNavHome = await page.textContent('[data-i18n="nav_home"]');
  const enNavNotes = await page.textContent('[data-i18n="nav_notes"]');
  const enNavChat = await page.textContent('[data-i18n="nav_chat"]');
  const enBatteryLove = await page.textContent('[data-i18n="home_battery_love"]');

  console.log(`[EN Check] home_our_space: "${enHomeText}"`);
  console.log(`[EN Check] nav_home: "${enNavHome}"`);
  console.log(`[EN Check] nav_notes: "${enNavNotes}"`);
  console.log(`[EN Check] nav_chat: "${enNavChat}"`);
  console.log(`[EN Check] home_battery_love: "${enBatteryLove}"`);

  if (enHomeText !== 'Our Space' || enNavHome !== 'Home' || enBatteryLove !== 'Love Battery') {
    throw new Error(`EN translation mismatch! Received: ${enHomeText}, ${enNavHome}, ${enBatteryLove}`);
  }

  // Screenshot English Home
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, '01_home_screen_en.png'), fullPage: false });
  console.log('📸 Screenshot saved: 01_home_screen_en.png');

  // 3. Switch to Chat tab
  console.log('💬 Navigating to Duo Chat screen...');
  await page.click('a[data-tab="chat"]');
  await page.waitForTimeout(500);

  // Check Chat top header language toggle
  const chatLangIndicator = await page.textContent('#btn-chat-lang-toggle .lang-indicator-text');
  console.log(`Chat header language indicator: "${chatLangIndicator}"`);
  if (chatLangIndicator.trim().toUpperCase() !== 'EN') {
    throw new Error(`Expected chatLangIndicator to be 'EN' but got '${chatLangIndicator}'`);
  }

  // 4. Open Sticker Drawer & test tabs and titles
  console.log('🐻 Opening Sticker Drawer...');
  await page.click('#btn-toggle-sticker-tray');
  await page.waitForTimeout(500);

  const stkTitle = await page.textContent('[data-i18n="stk_title"]');
  const stkTabDudu = await page.textContent('[data-i18n="stk_tab_dudu"]');
  const stkTabBubu = await page.textContent('[data-i18n="stk_tab_bubu"]');
  const stkTabCouple = await page.textContent('[data-i18n="stk_tab_couple"]');
  const stkTabGif = await page.textContent('[data-i18n="stk_tab_gif"]');

  console.log(`Sticker Drawer Title: "${stkTitle}"`);
  console.log(`Tabs: Dudu="${stkTabDudu}", Bubu="${stkTabBubu}", Couple="${stkTabCouple}", GIF="${stkTabGif}"`);

  // Check that Bubu sticker titles do not contain parentheses with Indonesian/English mixed
  const bubuStkBtn = await page.locator('.chat-mockup-stk-btn').first();
  const bubuStkTitle = await bubuStkBtn.getAttribute('title');
  console.log(`First Bubu sticker title: "${bubuStkTitle}"`);
  if (bubuStkTitle && bubuStkTitle.includes('(')) {
    throw new Error(`Mixed language found in sticker title: ${bubuStkTitle}`);
  }

  // Check GIF tab and sub-pills
  await page.click('button[data-cat="gif"]');
  await page.waitForTimeout(500);

  const gifPillAll = await page.textContent('button[data-gif-sub="all"]');
  const gifPillDudu = await page.textContent('button[data-gif-sub="dudu"]');
  const gifPillCouple = await page.textContent('button[data-gif-sub="couple"]');

  console.log(`GIF sub-pills: "${gifPillAll}", "${gifPillDudu}", "${gifPillCouple}"`);
  if (!gifPillAll.includes('All GIFs') || !gifPillCouple.includes('Together')) {
    throw new Error(`Expected pure English GIF pills, got: ${gifPillAll}, ${gifPillCouple}`);
  }

  await page.screenshot({ path: path.join(screenshotDir, '02_chat_stickers_en.png'), fullPage: false });
  console.log('📸 Screenshot saved: 02_chat_stickers_en.png');

  // Close sticker drawer
  await page.click('#btn-close-sticker-tray');
  await page.waitForTimeout(300);

  // 5. Open Wallpaper Modal
  console.log('🎨 Opening Wallpaper Modal...');
  await page.click('#btn-chat-wallpaper');
  await page.waitForTimeout(500);

  const wpModalTitle = await page.textContent('#modal-chat-wallpaper h3');
  const wpScopeChat = await page.textContent('#btn-scope-chat');
  const wpScopeAll = await page.textContent('#btn-scope-all');

  console.log(`Wallpaper Modal Title: "${wpModalTitle}"`);
  console.log(`Scope: Chat="${wpScopeChat}", All="${wpScopeAll}"`);

  // Check presets in grid
  const presetCards = await page.locator('#wallpaper-dudububu-grid .preset-wallpaper-card').all();
  console.log(`Found ${presetCards.length} Dudu & Bubu wallpaper preset cards in modal`);
  if (presetCards.length < 7) {
    throw new Error(`Expected at least 7 Dudu & Bubu wallpapers, found ${presetCards.length}`);
  }

  // Verify preset names in English
  const firstPresetName = await presetCards[1].locator('span.truncate').textContent();
  console.log(`Second preset name (Cozy Bedroom): "${firstPresetName}"`);
  if (!firstPresetName.includes('Bedroom') && !firstPresetName.includes('Kamar')) {
    throw new Error(`Unexpected preset name: ${firstPresetName}`);
  }

  await page.screenshot({ path: path.join(screenshotDir, '03_wallpaper_modal_en.png'), fullPage: false });
  console.log('📸 Screenshot saved: 03_wallpaper_modal_en.png');

  // 6. Test setting a wallpaper preset (Cozy Bedroom)
  console.log('🖼️ Selecting Cozy Bedroom wallpaper preset...');
  await presetCards[1].click();
  await page.waitForTimeout(400);

  // Close wallpaper modal
  await page.click('#btn-close-wallpaper-modal');
  await page.waitForTimeout(300);

  // 7. Toggle back to Indonesian from Chat header
  console.log('🇮🇩 Toggling back to Indonesian via #btn-chat-lang-toggle...');
  await page.click('#btn-chat-lang-toggle');
  await page.waitForTimeout(500);

  const langBackToId = await page.evaluate(() => window.DuduI18n.getLanguage());
  console.log(`Language after second toggle: "${langBackToId}"`);
  if (langBackToId !== 'id') {
    throw new Error(`Expected 'id', got '${langBackToId}'`);
  }

  // Re-open wallpaper modal to verify Indonesian preset names
  await page.click('#btn-chat-wallpaper');
  await page.waitForTimeout(500);

  const idWpModalTitle = await page.textContent('#modal-chat-wallpaper h3');
  const idPresetCards = await page.locator('#wallpaper-dudububu-grid .preset-wallpaper-card').all();
  const idSecondPresetName = await idPresetCards[1].locator('span.truncate').textContent();

  console.log(`[ID Check] Wallpaper Modal Title: "${idWpModalTitle}"`);
  console.log(`[ID Check] Second preset name: "${idSecondPresetName}"`);

  if (!idSecondPresetName.includes('Kamar')) {
    throw new Error(`Expected Indonesian preset name containing 'Kamar', got: ${idSecondPresetName}`);
  }

  await page.screenshot({ path: path.join(screenshotDir, '04_wallpaper_modal_id.png'), fullPage: false });
  console.log('📸 Screenshot saved: 04_wallpaper_modal_id.png');

  await page.click('#btn-close-wallpaper-modal');
  await page.waitForTimeout(300);

  // Navigate to Closet to verify no mixed language in dressing room
  console.log('👗 Navigating to Closet tab...');
  await page.evaluate(() => { window.switchTab('wardrobe'); });
  await page.waitForTimeout(600);

  const closetTitle = await page.textContent('[data-i18n="closet_title"]');
  const matchText = await page.textContent('#wardrobe-match-text');
  console.log(`Closet Title (ID): "${closetTitle}"`);
  console.log(`Couple Match Text (ID): "${matchText}"`);

  if (matchText.includes('(')) {
    throw new Error(`Mixed language found in wardrobe match text: ${matchText}`);
  }

  await page.screenshot({ path: path.join(screenshotDir, '05_closet_id.png'), fullPage: false });
  console.log('📸 Screenshot saved: 05_closet_id.png');

  await browser.close();

  if (failedRequests.length > 0) {
    console.error(`⚠️ Found ${failedRequests.length} failed requests:`, failedRequests);
    process.exit(1);
  }

  if (pageErrors.length > 0) {
    console.error(`⚠️ Found ${pageErrors.length} page errors:`, pageErrors);
    process.exit(1);
  }

  console.log('🎉 ALL BILINGUAL & WALLPAPER TESTS PASSED PERFECTLY!');
})();
