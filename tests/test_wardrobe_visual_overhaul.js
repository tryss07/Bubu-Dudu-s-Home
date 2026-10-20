const { chromium } = require('playwright');
const fs = require('fs');

async function runWardrobeVisualTest() {
  console.log('🚀 Starting Wardrobe Visual Overhaul Playwright Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 mobile viewport
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  await page.goto('http://localhost:3000');
  await page.click('[data-tab="wardrobe"]');
  await page.waitForTimeout(1000);

  fs.mkdirSync('/tmp/wardrobe_test', { recursive: true });

  // 1. Ensure tab-wardrobe is visible
  const tabWardrobe = await page.locator('#tab-wardrobe');
  await tabWardrobe.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ #tab-wardrobe is visible');

  // Take screenshot of initial wardrobe state
  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_dudu_dressed.png' });
  console.log('📸 Captured initial Dudu dressed screenshot');

  // 2. Verify stage art and view switcher
  const stageArt = page.locator('#wardrobe-stage-art');
  const stageArtSrc = await stageArt.getAttribute('src');
  console.log('Stage art src:', stageArtSrc);

  // 3. Switch to Bubu's wardrobe
  const bubuBadge = page.locator('#wardrobe-badge-bubu');
  await bubuBadge.click();
  await page.waitForTimeout(400);

  // View Bubu's room
  const btnViewBubu = page.locator('#btn-stage-view-bubu');
  await btnViewBubu.click();
  await page.waitForTimeout(400);

  const bubuStageSrc = await stageArt.getAttribute('src');
  console.log('Bubu Stage art src:', bubuStageSrc);
  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_bubu_dressed.png' });
  console.log('📸 Captured Bubu dressed screenshot');

  // 4. Test "Lepas Semua" (Undress to raw mentahan)
  const undressBtn = page.locator('#btn-wardrobe-undress-all');
  await undressBtn.click();
  await page.waitForTimeout(400);

  const bubuHatLayer = page.locator('#layer-bubu-hat');
  const bubuOutfitLayer = page.locator('#layer-bubu-outfit');
  const hatDisp = await bubuHatLayer.evaluate(el => el.style.display);
  const outfitDisp = await bubuOutfitLayer.evaluate(el => el.style.display);
  console.log('Bubu layers after undress: hat =', hatDisp, ', outfit =', outfitDisp);
  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_bubu_raw.png' });
  console.log('📸 Captured Bubu raw naked screenshot');

  // 5. Test outfit set picker: equip sleep pajamas
  const pajamaSetBtn = page.locator('#wardrobe-sets-grid button[data-set-id="bubu_05_sleep_pajamas"]');
  await pajamaSetBtn.waitFor({ state: 'visible', timeout: 5000 });
  await pajamaSetBtn.click();
  await page.waitForTimeout(400);

  const bubuPjSrc = await stageArt.getAttribute('src');
  console.log('Bubu Pajamas src:', bubuPjSrc);
  if (!bubuPjSrc.includes('bubu_05_sleep_pajamas')) {
    throw new Error('FAIL: Expected bubu_05_sleep_pajamas on stage!');
  }
  console.log('✅ Picked and equipped sleep pajamas set');

  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_bubu_pajamas.png' });
  console.log('📸 Captured Bubu in sleep pajamas screenshot');

  // 6. Test Couple View
  const btnViewCouple = page.locator('#btn-stage-view-couple');
  await btnViewCouple.click();
  await page.waitForTimeout(400);

  const coupleStageSrc = await stageArt.getAttribute('src');
  console.log('Couple Stage art src:', coupleStageSrc);

  // Equip couple preset "Piyama Malam Manis"
  const nextPresetBtn = page.locator('#btn-wardrobe-next-preset');
  await nextPresetBtn.click();
  await page.waitForTimeout(400);

  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_couple_room.png' });
  console.log('📸 Captured Couple room preset screenshot');

  // 7. Equip couple preset "Bears Asli Mentahan" (Raw bears preset)
  const prevPresetBtn = page.locator('#btn-wardrobe-prev-preset');
  await prevPresetBtn.click(); // Back to Bears Asli Mentahan
  await page.waitForTimeout(400);

  await page.screenshot({ path: '/tmp/wardrobe_test/test_closet_couple_raw.png' });
  console.log('📸 Captured Couple raw mentahan screenshot');

  await browser.close();
  console.log('🎉 All tests completed successfully!');
}

runWardrobeVisualTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
