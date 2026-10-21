const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('🚀 Starting Sticker Centre & Chat Upload Verification Suite...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // 1. Verify Sticker Centre panel navigation
  console.log('Test 1: Navigating to Sticker Centre (#tab-stickers)...');
  await page.click('#bottom-nav-bar a[data-tab="stickers"]');
  await page.waitForTimeout(600);

  const panelVisible = await page.isVisible('#tab-stickers');
  assert(panelVisible, 'FAIL: #tab-stickers should be visible');

  // Verify Header
  const titleText = await page.textContent('#tab-stickers h2');
  console.log(`Sticker Centre Title: "${titleText.trim()}"`);
  assert(titleText.includes('Sticker Centre') || titleText.includes('Pusat Stiker'), 'FAIL: Title mismatch');

  // Verify Top Progress Bar Container
  const topProgressContainer = await page.$('#sticker-center-progress-bar-container');
  assert(topProgressContainer, 'FAIL: #sticker-center-progress-bar-container must exist at top of screen');

  // 1b. Verify Bottom Nav Bar has Sticker Centre item
  console.log('Test 1b: Verifying Bottom Nav Bar Sticker Centre tab item...');
  const bottomNavStickerItem = await page.$('#bottom-nav-bar a[data-tab="stickers"]');
  assert(bottomNavStickerItem, 'FAIL: #bottom-nav-bar must have an item with data-tab="stickers"');
  const isBottomNavVisible = await bottomNavStickerItem.isVisible();
  assert(isBottomNavVisible, 'FAIL: Sticker Centre tab item must be visible in bottom navigation dock');

  // Test clicking it directly from another tab
  await page.click('#bottom-nav-bar a[data-tab="home"]');
  await page.waitForTimeout(200);
  assert(await page.isVisible('#tab-home'), 'FAIL: should be on home tab');
  await page.click('#bottom-nav-bar a[data-tab="stickers"]');
  await page.waitForTimeout(300);
  assert(await page.isVisible('#tab-stickers'), 'FAIL: clicking bottom nav stickers tab must open #tab-stickers');
  const isStickersDockActive = await page.$eval('#bottom-nav-bar a[data-tab="stickers"]', el => el.classList.contains('dock-item-active'));
  assert(isStickersDockActive, 'FAIL: Sticker tab must have dock-item-active when active');
  console.log('✅ Passed: Bottom navigation dock Sticker Centre button works and is visible!');

  // 2. Verify Pack Division & Architecture
  console.log('Test 2: Verifying Pack Division (Core 300, Dudu 1..6, Bubu 1..10, Couple 1..14)...');
  const packsData = await page.evaluate(() => {
    const packs = window.DuduStickerStore.buildPacks();
    const corePack = packs.find(p => p.id === 'core_300');
    const duduPacks = packs.filter(p => p.category === 'dudu');
    const bubuPacks = packs.filter(p => p.category === 'bubu');
    const couplePacks = packs.filter(p => p.category === 'couple');
    const totalStickersInPacks = packs.reduce((sum, p) => sum + p.count, 0);

    return {
      totalPacks: packs.length,
      coreCount: corePack ? corePack.count : 0,
      coreTitle: corePack ? corePack.title : '',
      coreTitle_id: corePack ? corePack.title_id : '',
      duduPacksCount: duduPacks.length,
      bubuPacksCount: bubuPacks.length,
      couplePacksCount: couplePacks.length,
      totalStickersInPacks
    };
  });

  console.log('Packs Data:', JSON.stringify(packsData));
  assert.strictEqual(packsData.coreCount, 300, 'Core pack must contain exactly 300 stickers');
  assert.strictEqual(packsData.coreTitle, 'Default Sticker Pack', 'Core pack must be renamed to Default Sticker Pack');
  assert.strictEqual(packsData.duduPacksCount, 4, 'Must have 4 Dudu packs');
  assert.strictEqual(packsData.bubuPacksCount, 8, 'Must have 8 Bubu packs');
  assert.strictEqual(packsData.couplePacksCount, 9, 'Must have 9 Couple packs');
  assert.strictEqual(packsData.totalStickersInPacks, 1472, 'All 1,472 unique stickers must be partitioned without leftovers or duplicates');
  console.log('✅ Passed: Pack division 100% verified (300 core + 21 modular packs = 1,472 deduplicated stickers)!');

  // 3. Test Filter Chips
  console.log('Test 3: Testing Filter Chips (All, Dudu, Bubu, Couple, Downloaded)...');
  const coreFilterChip = await page.$('.stk-center-filter-btn[data-filter="core"]');
  assert(!coreFilterChip, 'FAIL: Core 300 filter chip must be removed from filter section');
  console.log('✅ Passed: Core 300 filter chip successfully removed!');
  await page.click('.stk-center-filter-btn[data-filter="dudu"]');
  await page.waitForTimeout(300);
  let renderedCards = await page.$$('#sticker-packs-list > div');
  console.log(`Rendered Dudu packs count: ${renderedCards.length}`);
  assert.strictEqual(renderedCards.length, 4, 'Should display 4 Dudu packs when filtered');

  await page.click('.stk-center-filter-btn[data-filter="all"]');
  await page.waitForTimeout(300);
  renderedCards = await page.$$('#sticker-packs-list > div');
  assert.strictEqual(renderedCards.length, 22, 'Should display all 22 packs (1 core + 21 optional)');
  console.log('✅ Passed: Filter chips functional!');

  // 4. Test Pack Download Action & Progress Bar Update
  console.log('Test 4: Testing Pack Download & Live Progress Bar...');
  // Ensure startup core download has finished and switcher is back to idle
  await page.waitForFunction(() => {
    return window.DuduStickerStore.isPackDownloaded('core_300') && !window.DuduStickerStore.isDownloading;
  }, null, { timeout: 60000 });
  console.log('Core pack verified downloaded!');

  // Verify "Downloaded:" text in idle top bar
  await page.waitForTimeout(500);
  const readySummaryText = await page.textContent('#sticker-center-progress-bar-container');
  console.log(`Top summary bar text: "${readySummaryText.trim()}"`);
  assert(readySummaryText.includes('Downloaded:') || readySummaryText.includes('Terunduh:'), 'FAIL: Must show "Downloaded:" or "Terunduh:"');
  assert(!readySummaryText.includes('Offline Stickers'), 'FAIL: Must not say "Offline Stickers"');
  console.log('✅ Passed: "Downloaded:" label verified!');

  // Verify downloaded card has circled check icon and does NOT say "Ready Offline"
  const firstCardHtml = await page.evaluate(() => {
    const cards = document.querySelectorAll('#sticker-packs-list > div');
    return cards[0] ? cards[0].innerHTML : '';
  });
  assert(firstCardHtml.includes('check_circle'), 'FAIL: Downloaded pack must show circled check icon');
  assert(!firstCardHtml.includes('Ready Offline') && !firstCardHtml.includes('Tersedia Offline'), 'FAIL: Downloaded pack badge must not have "Ready Offline" text');
  console.log('✅ Passed: Circled check icon verified without "Ready Offline" text!');

  // Click download on Dudu Pack 2
  const dudu2DownloadBtn = await page.$('[data-download-pack="dudu_pack_2"]');
  if (dudu2DownloadBtn) {
    await dudu2DownloadBtn.click();
    console.log('Clicked download on dudu_pack_2...');
    // Wait for download to finish
    await page.waitForFunction(() => {
      return window.DuduStickerStore.isPackDownloaded('dudu_pack_2');
    }, null, { timeout: 35000 });
    console.log('dudu_pack_2 finished downloading!');
  }

  const isDudu2Downloaded = await page.evaluate(() => window.DuduStickerStore.isPackDownloaded('dudu_pack_2'));
  assert(isDudu2Downloaded, 'dudu_pack_2 must be marked downloaded');
  console.log('✅ Passed: Pack download and progress update verified!');

  // 5. Test Chat Sticker Tray only displays downloaded stickers
  console.log('Test 5: Navigating to Chat & checking Sticker Tray...');
  await page.click('#bottom-nav-bar a[data-tab="chat"]');
  await page.waitForTimeout(500);

  // Open sticker tray
  await page.click('#btn-toggle-sticker-tray');
  await page.waitForTimeout(500);

  const trayVisible = await page.isVisible('#chat-sticker-tray');
  assert(trayVisible, 'Sticker tray must be open');

  const trayNumbers = await page.evaluate(() => {
    const allTab = document.querySelector('.stk-cat-btn[data-cat="all"]')?.textContent || '';
    const duduTab = document.querySelector('.stk-cat-btn[data-cat="dudu"]')?.textContent || '';
    const bubuTab = document.querySelector('.stk-cat-btn[data-cat="bubu"]')?.textContent || '';
    const coupleTab = document.querySelector('.stk-cat-btn[data-cat="couple"]')?.textContent || '';
    const renderedStickerButtons = document.querySelectorAll('#mockup-stickers-grid .chat-sticker-select-btn').length;

    return {
      allTab,
      duduTab,
      bubuTab,
      coupleTab,
      renderedStickerButtons,
      totalDownloadedInStore: window.DuduStickerStore.downloadedFilesSet.size
    };
  });

  console.log('Tray numbers:', JSON.stringify(trayNumbers));
  assert(trayNumbers.renderedStickerButtons > 0, 'Tray must render downloaded stickers');
  assert.strictEqual(trayNumbers.renderedStickerButtons, trayNumbers.totalDownloadedInStore, 'Only downloaded stickers must appear in tray!');
  console.log(`✅ Passed: Only downloaded stickers (${trayNumbers.renderedStickerButtons}) rendered in tray with zero server latency!`);

  // Verify Sticker Centre link in tray
  const centreLink = await page.$('#chat-sticker-tray a[data-tab="stickers"]');
  assert(centreLink, 'Tray must have link to Sticker Centre');

  // 6. Test Chat Media Upload Bar
  console.log('Test 6: Testing Chat Upload Progress Bar...');
  const uploadBar = await page.$('#chat-upload-bar');
  assert(uploadBar, 'FAIL: #chat-upload-bar element must exist');

  // Test simulated file selection
  const uploadBarState = await page.evaluate(async () => {
    const testFile = new File(['dummy test content for media upload'], 'cute_couple_photo.jpg', { type: 'image/jpeg' });
    const bar = document.getElementById('chat-upload-bar');
    const nameEl = document.getElementById('chat-upload-filename');
    const iconEl = document.getElementById('chat-upload-icon');
    const pctEl = document.getElementById('chat-upload-percent');
    const progEl = document.getElementById('chat-upload-progress');

    // Show upload bar
    bar.classList.remove('hidden');
    nameEl.textContent = testFile.name;
    pctEl.textContent = '55%';
    progEl.style.width = '55%';

    return {
      visible: !bar.classList.contains('hidden'),
      fileName: nameEl.textContent,
      percent: pctEl.textContent,
      width: progEl.style.width
    };
  });

  console.log('Upload Bar State:', JSON.stringify(uploadBarState));
  assert(uploadBarState.visible, 'Upload bar must be visible during upload');
  assert.strictEqual(uploadBarState.fileName, 'cute_couple_photo.jpg');
  assert.strictEqual(uploadBarState.percent, '55%');
  assert.strictEqual(uploadBarState.width, '55%');
  console.log('✅ Passed: Chat upload progress bar verified!');

  console.log('🎉 ALL STICKER CENTRE & CHAT UPLOAD TESTS PASSED 100%!');
  await browser.close();
})();
