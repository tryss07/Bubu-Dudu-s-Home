const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runStickerReview() {
  console.log('🔍 Starting Playwright Self-Review for Dudu & Bubu Stickers...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.5 // High-DPI mobile emulation (like Pixel 7 / iPhone Pro)
  });
  const page = await context.newPage();

  const screenshotsDir = path.resolve(__dirname, '../tests/screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  await page.goto('http://localhost:3000/#chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Open sticker tray
  const btnStkToggle = page.locator('#btn-toggle-sticker-tray');
  await btnStkToggle.click();
  await page.waitForTimeout(500);

  const tray = page.locator('#chat-sticker-tray');
  await tray.waitFor({ state: 'visible' });

  // Screenshot: Category 1 (All)
  await page.screenshot({ path: path.join(screenshotsDir, '01_sticker_tray_all.png') });
  console.log('📸 Captured: 01_sticker_tray_all.png');

  // 2. Tab: 🐼 Only Bubu
  const tabBubu = page.locator('.stk-cat-btn[data-cat="bubu"]');
  await tabBubu.click();
  await page.waitForTimeout(400);
  const bubuCount = await page.locator('.chat-mockup-stk-btn').count();
  console.log(`🐼 Only Bubu count: ${bubuCount} (Expected: 15)`);
  if (bubuCount !== 15) throw new Error(`Expected 15 Bubu stickers, got ${bubuCount}`);
  await page.screenshot({ path: path.join(screenshotsDir, '02_sticker_tray_bubu.png') });
  console.log('📸 Captured: 02_sticker_tray_bubu.png');

  // Send first Bubu sticker
  await page.locator('.chat-mockup-stk-btn').first().click();
  await page.waitForTimeout(500);

  // 3. Tab: 🐻 Only Dudu
  await btnStkToggle.click();
  await page.waitForTimeout(300);
  const tabDudu = page.locator('.stk-cat-btn[data-cat="dudu"]');
  await tabDudu.click();
  await page.waitForTimeout(400);
  const duduWebp = await page.locator('.chat-sticker-select-btn').count();
  const duduCustom = await page.locator('.chat-mockup-stk-btn').count();
  console.log(`🐻 Only Dudu count: ${duduWebp} animated + ${duduCustom} custom = ${duduWebp + duduCustom} (Expected: 83)`);
  if (duduWebp + duduCustom !== 83) throw new Error(`Expected 83 Dudu stickers, got ${duduWebp + duduCustom}`);
  await page.screenshot({ path: path.join(screenshotsDir, '03_sticker_tray_dudu.png') });
  console.log('📸 Captured: 03_sticker_tray_dudu.png');

  // Send first custom Dudu sticker
  await page.locator('.chat-mockup-stk-btn').first().click();
  await page.waitForTimeout(500);

  // 4. Tab: 🐻🐼 Bubu & Dudu (Together)
  await btnStkToggle.click();
  await page.waitForTimeout(300);
  const tabCouple = page.locator('.stk-cat-btn[data-cat="couple"]');
  await tabCouple.click();
  await page.waitForTimeout(400);
  const coupleWebp = await page.locator('.chat-sticker-select-btn').count();
  const coupleCustom = await page.locator('.chat-mockup-stk-btn').count();
  console.log(`🐻🐼 Together count: ${coupleWebp} animated + ${coupleCustom} custom = ${coupleWebp + coupleCustom} (Expected: 39)`);
  if (coupleWebp + coupleCustom !== 39) throw new Error(`Expected 39 Couple stickers, got ${coupleWebp + coupleCustom}`);
  await page.screenshot({ path: path.join(screenshotsDir, '04_sticker_tray_couple.png') });
  console.log('📸 Captured: 04_sticker_tray_couple.png');

  // Send first custom Couple sticker
  await page.locator('.chat-mockup-stk-btn').first().click();
  await page.waitForTimeout(500);

  // 5. Tab: ✨ Sticker GIF
  await btnStkToggle.click();
  await page.waitForTimeout(300);
  const tabGif = page.locator('.stk-cat-btn[data-cat="gif"]');
  await tabGif.click();
  await page.waitForTimeout(400);
  const gifCount = await page.locator('.chat-gif-stk-btn').count();
  console.log(`✨ GIF stickers count: ${gifCount} (Expected: 95)`);
  if (gifCount !== 95) throw new Error(`Expected 95 GIF stickers, got ${gifCount}`);
  await page.screenshot({ path: path.join(screenshotsDir, '05_sticker_tray_gif.png') });
  console.log('📸 Captured: 05_sticker_tray_gif.png');

  // Send first GIF sticker
  await page.locator('.chat-gif-stk-btn').first().click();
  await page.waitForTimeout(800);

  // 6. Screenshot Chat with all sent stickers (High-DPI 2.5x sharp inspection)
  await page.screenshot({ path: path.join(screenshotsDir, '06_chat_sent_stickers_sharp.png') });
  console.log('📸 Captured: 06_chat_sent_stickers_sharp.png');

  console.log('🎉 Playwright Sticker Review completed with 100% success!');
  await browser.close();
}

runStickerReview().catch(err => {
  console.error('❌ Review failed:', err);
  process.exit(1);
});
