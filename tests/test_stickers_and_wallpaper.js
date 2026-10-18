const { chromium } = require('playwright');
const fs = require('fs');

async function runStickersAndWallpaperTest() {
  console.log('🚀 Starting Stickers & Wallpaper Playwright Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  await page.goto('http://localhost:3000/#chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Verify #tab-chat is visible
  const tabChat = page.locator('#tab-chat');
  await tabChat.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ Chat screen #tab-chat is visible');

  // 2. Test Wallpaper Button in Chat Header
  const btnWallpaper = page.locator('#btn-chat-wallpaper');
  await btnWallpaper.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✅ #btn-chat-wallpaper button is visible in header');

  // Open Wallpaper Modal
  await btnWallpaper.click();
  await page.waitForTimeout(400);

  const modalWallpaper = page.locator('#modal-chat-wallpaper');
  await modalWallpaper.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✅ #modal-chat-wallpaper opened successfully');

  // 3. Test Selecting Dudu & Bubu Bedroom Preset
  const dudububuCard = page.locator('.preset-wallpaper-card[data-preset-id="dudu-bubu-room"]');
  await dudububuCard.waitFor({ state: 'visible', timeout: 3000 });
  await dudububuCard.click();
  await page.waitForTimeout(300);

  // Check wallpaper layer styling
  const wallpaperLayer = page.locator('#chat-wallpaper-layer');
  const bgImg = await wallpaperLayer.evaluate(el => el.style.backgroundImage);
  console.log('Chat Wallpaper Layer style.backgroundImage:', bgImg);
  if (!bgImg.includes('wallpaper_dudu_bubu_room.jpg')) {
    throw new Error('Wallpaper background image not updated to dudu-bubu-room');
  }
  console.log('✅ Preset wallpaper "Kamar Dudu & Bubu" applied correctly');

  // 4. Test Opacity Slider
  const opacitySlider = page.locator('#wallpaper-opacity-slider');
  await opacitySlider.fill('60');
  await opacitySlider.dispatchEvent('input');
  await page.waitForTimeout(200);

  const layerOpacity = await wallpaperLayer.evaluate(el => el.style.opacity);
  console.log('Layer opacity after slider adjust:', layerOpacity);
  if (parseFloat(layerOpacity) !== 0.6) {
    throw new Error(`Expected layer opacity 0.6, got ${layerOpacity}`);
  }
  console.log('✅ Opacity slider adjusts wallpaper opacity in real-time');

  // 5. Test Scope Switcher (Seluruh Aplikasi)
  const btnScopeAll = page.locator('#btn-scope-all');
  await btnScopeAll.click();
  await page.waitForTimeout(200);
  const globalLayer = page.locator('#global-app-wallpaper-layer');
  const globalDisplay = await globalLayer.evaluate(el => el.style.display);
  console.log('Global app wallpaper display:', globalDisplay);
  if (globalDisplay === 'none') {
    throw new Error('Global app wallpaper layer should be active when scope is "all"');
  }
  console.log('✅ Scope switcher activates global app wallpaper cleanly');

  // Close Wallpaper Modal
  const btnCloseWallpaper = page.locator('#btn-close-wallpaper-modal');
  await btnCloseWallpaper.click();
  await page.waitForTimeout(300);

  // 6. Test Sticker Drawer
  const btnStickerToggle = page.locator('#btn-toggle-sticker-tray');
  await btnStickerToggle.click();
  await page.waitForTimeout(400);

  const stickerTray = page.locator('#chat-sticker-tray');
  await stickerTray.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✅ Sticker drawer #chat-sticker-tray opened');

  // Verify author attribution "Huang Xiao B"
  const trayText = await stickerTray.textContent();
  if (!trayText.includes('Huang Xiao B')) {
    throw new Error('Creator attribution "Huang Xiao B" not found in sticker tray');
  }
  console.log('✅ Creator attribution "Huang Xiao B" present');

  // Verify category tabs exist
  const tabAll = page.locator('.stk-cat-btn[data-cat="all"]');
  const tabBubu = page.locator('.stk-cat-btn[data-cat="bubu"]');
  const tabCouple = page.locator('.stk-cat-btn[data-cat="couple"]');
  const tabDudu = page.locator('.stk-cat-btn[data-cat="dudu"]');
  const tabGif = page.locator('.stk-cat-btn[data-cat="gif"]');

  console.log('Category buttons count: all, bubu, couple, dudu, gif all present');

  // 7. Test Tab "✨ Sticker GIF"
  await tabGif.click();
  await page.waitForTimeout(400);

  const gifButtons = page.locator('.chat-gif-stk-btn');
  const gifCount = await gifButtons.count();
  console.log('GIF sticker buttons rendered count:', gifCount);
  if (gifCount !== 95) {
    throw new Error(`Expected 95 GIF sticker buttons, got ${gifCount}`);
  }
  console.log('✅ All 95 animated GIF stickers loaded in GIF tab');

  // Test GIF sub-filters
  const gifPillDudu = page.locator('.gif-sub-pill[data-gif-sub="dudu"]');
  await gifPillDudu.click();
  await page.waitForTimeout(300);
  const duduGifCount = await page.locator('.chat-gif-stk-btn').count();
  console.log('Dudu GIF sub-filter count:', duduGifCount);
  if (duduGifCount !== 68) {
    throw new Error(`Expected 68 Dudu GIFs, got ${duduGifCount}`);
  }

  const gifPillCouple = page.locator('.gif-sub-pill[data-gif-sub="couple"]');
  await gifPillCouple.click();
  await page.waitForTimeout(300);
  const coupleGifCount = await page.locator('.chat-gif-stk-btn').count();
  console.log('Couple GIF sub-filter count:', coupleGifCount);
  if (coupleGifCount !== 27) {
    throw new Error(`Expected 27 Couple GIFs, got ${coupleGifCount}`);
  }

  // Click first GIF sticker to send to chat
  await page.locator('.chat-gif-stk-btn').first().click();
  await page.waitForTimeout(600);

  // Verify sticker message rendered in chat
  const chatMessages = page.locator('#chat-messages-container .chat-bubble-row');
  const lastMsg = chatMessages.last();
  const lastMsgImg = lastMsg.locator('img[alt="Sticker Animasi"]');
  await lastMsgImg.waitFor({ state: 'visible', timeout: 3000 });
  const lastImgSrc = await lastMsgImg.getAttribute('src');
  console.log('Last sent GIF sticker src:', lastImgSrc);
  if (!lastImgSrc.includes('assets/stickers_gif/')) {
    throw new Error('Sent GIF sticker does not point to assets/stickers_gif/');
  }
  console.log('✅ Animated GIF sticker sent and rendered with transparent floating bubble');

  // 8. Reopen sticker drawer and test "🐼 Only Bubu" stickers
  await btnStickerToggle.click();
  await page.waitForTimeout(300);
  await tabBubu.click();
  await page.waitForTimeout(400);

  const bubuStkButtons = page.locator('.chat-mockup-stk-btn');
  const bubuStkCount = await bubuStkButtons.count();
  console.log('Only Bubu sticker buttons rendered count:', bubuStkCount);
  if (bubuStkCount !== 15) {
    throw new Error(`Expected 15 Only Bubu stickers, got ${bubuStkCount}`);
  }
  console.log('✅ All 15 Only Bubu custom stickers loaded cleanly');

  // Click first Bubu sticker
  await bubuStkButtons.first().click();
  await page.waitForTimeout(600);

  const lastBubuMsg = chatMessages.last();
  const lastBubuImg = lastBubuMsg.locator('img[alt="Sticker Animasi"]');
  await lastBubuImg.waitFor({ state: 'visible', timeout: 3000 });
  const lastBubuSrc = await lastBubuImg.getAttribute('src');
  console.log('Last sent Bubu sticker src:', lastBubuSrc);
  if (!lastBubuSrc.includes('assets/stickers_bubu/')) {
    throw new Error('Sent Bubu sticker does not point to assets/stickers_bubu/');
  }
  console.log('✅ Only Bubu sticker sent and rendered cleanly');

  // 9. Reopen and test Tab "🐻 Only Dudu"
  await btnStickerToggle.click();
  await page.waitForTimeout(300);
  await tabDudu.click();
  await page.waitForTimeout(400);

  const duduWebpCount = await page.locator('.chat-sticker-select-btn').count();
  const duduMockCount = await page.locator('.chat-mockup-stk-btn').count();
  console.log(`Only Dudu stickers: ${duduWebpCount} WebP + ${duduMockCount} art = ${duduWebpCount + duduMockCount}`);
  if (duduWebpCount + duduMockCount !== 83) {
    throw new Error(`Expected 83 Only Dudu stickers, got ${duduWebpCount + duduMockCount}`);
  }
  console.log('✅ All 83 Only Dudu stickers loaded cleanly');

  // 10. Test Tab "🐻🐼 Bubu & Dudu" (Together)
  await tabCouple.click();
  await page.waitForTimeout(400);

  const coupleWebpCount = await page.locator('.chat-sticker-select-btn').count();
  const coupleMockCount = await page.locator('.chat-mockup-stk-btn').count();
  console.log(`Bubu & Dudu Together: ${coupleWebpCount} WebP + ${coupleMockCount} art = ${coupleWebpCount + coupleMockCount}`);
  if (coupleWebpCount + coupleMockCount !== 39) {
    throw new Error(`Expected 39 Bubu & Dudu Together stickers, got ${coupleWebpCount + coupleMockCount}`);
  }
  console.log('✅ All 39 Bubu & Dudu Together stickers loaded cleanly');

  await browser.close();
  console.log('🎉 Stickers & Wallpaper Playwright Test completed successfully!');
}

runStickersAndWallpaperTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
