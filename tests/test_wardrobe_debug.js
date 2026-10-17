const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  
  const consoleMsgs = [];
  page.on('console', msg => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });
  page.on('pageerror', err => console.error('[PAGEERROR]', err.stack || err.toString()));

  await page.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Navigating to wardrobe tab...');
  await page.evaluate(() => window.switchTab('wardrobe'));
  await page.waitForTimeout(500);

  if (!fs.existsSync('scratch')) fs.mkdirSync('scratch', { recursive: true });
  await page.screenshot({ path: 'scratch/wardrobe_tab.png' });
  console.log('Saved scratch/wardrobe_tab.png');

  // Test wardrobe card click
  const hatCard = await page.$('.wardrobe-item-card[data-type="hat"]');
  if (hatCard) {
    console.log('Clicking hat card...');
    await hatCard.click();
    await page.waitForTimeout(400);
  }

  // Test slot picker
  const pickerBtn = await page.$('#wardrobe-slot-picker button');
  if (pickerBtn) {
    console.log('Clicking slot picker button...');
    await pickerBtn.click();
    await page.waitForTimeout(400);
  }

  // Test mini game
  const playBtn = await page.$('#btn-play-minigame');
  if (playBtn) {
    console.log('Clicking Play Minigame...');
    await playBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scratch/minigame_modal.png' });
    console.log('Saved scratch/minigame_modal.png');

    // Test flipping cards in minigame
    const cards = await page.$$('.flip-card');
    console.log(`Found ${cards.length} minigame cards. Flipping first 2...`);
    if (cards.length >= 2) {
      await cards[0].click();
      await page.waitForTimeout(300);
      await cards[1].click();
      await page.waitForTimeout(500);
    }
  }

  // Check toast or feedbacks
  const toast = await page.$('#feedback-toast');
  if (toast) {
    const text = await toast.textContent();
    console.log('Toast text:', text.trim());
  }

  await browser.close();
  console.log('Test completed successfully!');
})();
