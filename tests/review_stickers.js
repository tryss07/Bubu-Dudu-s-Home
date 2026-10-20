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

  // 2. Tab: 🐼 Only Bubu (Temporary Notice)
  const tabBubu = page.locator('.stk-cat-btn[data-cat="bubu"]');
  await tabBubu.click();
  await page.waitForTimeout(400);
  const bubuNotice = page.locator('#bubu-stickers-empty-notice');
  await bubuNotice.waitFor({ state: 'visible', timeout: 3000 });
  console.log('🐼 Only Bubu notice verified: Stiker Bubu Belum Tersedia');
  await page.screenshot({ path: path.join(screenshotsDir, '02_sticker_tray_bubu.png') });
  console.log('📸 Captured: 02_sticker_tray_bubu.png');

  // 3. Tab: 🐻 Only Dudu
  const tabDudu = page.locator('.stk-cat-btn[data-cat="dudu"]');
  await tabDudu.click();
  await page.waitForTimeout(400);
  const duduWebp = await page.locator('.chat-sticker-select-btn').count();
  console.log(`🐻 Only Dudu count: ${duduWebp} animated WebP (Expected: 61)`);
  if (duduWebp !== 61) throw new Error(`Expected 61 Dudu stickers, got ${duduWebp}`);
  await page.screenshot({ path: path.join(screenshotsDir, '03_sticker_tray_dudu.png') });
  console.log('📸 Captured: 03_sticker_tray_dudu.png');

  // Send first Dudu sticker
  await page.locator('.chat-sticker-select-btn').first().click();
  await page.waitForTimeout(500);

  // 4. Tab: 🐻🐼 Bubu & Dudu (Together)
  await btnStkToggle.click();
  await page.waitForTimeout(300);
  const tabCouple = page.locator('.stk-cat-btn[data-cat="couple"]');
  await tabCouple.click();
  await page.waitForTimeout(400);
  const coupleWebp = await page.locator('.chat-sticker-select-btn').count();
  console.log(`🐻🐼 Together count: ${coupleWebp} animated WebP (Expected: 34)`);
  if (coupleWebp !== 34) throw new Error(`Expected 34 Couple stickers, got ${coupleWebp}`);
  await page.screenshot({ path: path.join(screenshotsDir, '04_sticker_tray_couple.png') });
  console.log('📸 Captured: 04_sticker_tray_couple.png');

  // Send first Couple sticker
  await page.locator('.chat-sticker-select-btn').first().click();
  await page.waitForTimeout(500);

  // 5. Tab: ✨ Sticker GIF / Animated
  await btnStkToggle.click();
  await page.waitForTimeout(300);
  const tabGif = page.locator('.stk-cat-btn[data-cat="gif"]');
  await tabGif.click();
  await page.waitForTimeout(400);
  const gifCount = await page.locator('.chat-gif-stk-btn').count();
  console.log(`✨ Animated stickers count: ${gifCount} (Expected: 95)`);
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
