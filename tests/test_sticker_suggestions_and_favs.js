const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Sticker Suggestions & Favorites Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(1000);

  // 1. Navigate to chat tab
  console.log('Navigating to chat tab...');
  const chatTab = page.locator('a[data-tab="chat"]').first();
  await chatTab.click();
  await page.waitForTimeout(500);

  const textInput = page.locator('#chat-text-input');
  const suggestionsBox = page.locator('#chat-sticker-suggestions');
  const suggestionsTrack = page.locator('#chat-suggestions-track');

  // 2. Test typing "dudu sad"
  console.log('Test 1: Typing "dudu sad"...');
  await textInput.fill('dudu sad');
  await page.waitForTimeout(400);

  if (!(await suggestionsBox.isVisible())) {
    throw new Error('FAIL: #chat-sticker-suggestions not visible after typing "dudu sad"');
  }
  const duduSadChips = suggestionsTrack.locator('.btn-suggestion-chip');
  const duduSadCount = await duduSadChips.count();
  console.log(`Suggested chips count for "dudu sad": ${duduSadCount}`);
  if (duduSadCount === 0) throw new Error('FAIL: No suggestion chips rendered for "dudu sad"');

  const firstDuduSadSrc = await duduSadChips.first().getAttribute('data-sticker-file');
  console.log(`First chip file: ${firstDuduSadSrc}`);
  if (!firstDuduSadSrc.includes('assets/stickers_dudu')) {
    throw new Error(`FAIL: Expected assets/stickers_dudu but got ${firstDuduSadSrc}`);
  }
  console.log('✅ Passed: "dudu sad" displays Dudu stickers.');

  // Test 1b: Verify Zero Visual Duplicates on angry, love, happy, sad
  console.log('Test 1b: Verifying 0 visual duplicates on "dudu angry", "dudu love", "dudu happy"...');
  const testEmotions = ['angry', 'love', 'happy', 'sad'];
  for (const emo of testEmotions) {
    await textInput.fill('');
    await page.waitForTimeout(100);
    await textInput.fill('dudu ' + emo);
    await page.waitForTimeout(300);

    const files = await suggestionsTrack.locator('.btn-suggestion-chip').evaluateAll(els =>
      els.map(e => e.getAttribute('data-sticker-file').split('/').pop())
    );
    console.log(`"dudu ${emo}" chips count: ${files.length}`);
    if (files.length !== 14) {
      throw new Error(`FAIL: Expected 14 chips for "dudu ${emo}", got ${files.length}`);
    }

    // Evaluate canonical uniqueness via window.DUDU_STICKERS_CATALOG.CANONICAL_MAP
    const canonList = await page.evaluate(fileNames => {
      const cmap = window.DUDU_STICKERS_CATALOG.CANONICAL_MAP || {};
      return fileNames.map(f => cmap[f] || f);
    }, files);

    const uniqueCanons = new Set(canonList);
    console.log(`"dudu ${emo}" unique visual count: ${uniqueCanons.size} / ${files.length}`);
    if (uniqueCanons.size !== files.length) {
      throw new Error(`FAIL: Visual duplicates detected in "dudu ${emo}"! (${uniqueCanons.size} unique vs ${files.length} total)`);
    }
  }
  console.log('✅ Passed: Zero visual duplicates across all emotion suggestions!');

  // 3. Test typing "dudu hug" (couple verb routing)
  console.log('Test 2: Typing "dudu hug" (verifying couple routing)...');
  await textInput.fill('dudu hug');
  await page.waitForTimeout(400);

  const duduHugFirstSrc = await duduSadChips.first().getAttribute('data-sticker-file');
  console.log(`"dudu hug" first chip file: ${duduHugFirstSrc}`);
  if (!duduHugFirstSrc.includes('assets/stickers_couple')) {
    throw new Error(`FAIL: Expected couple sticker for "dudu hug" but got ${duduHugFirstSrc}`);
  }
  console.log('✅ Passed: "dudu hug" correctly routed to couple stickers.');

  // 4. Test typing "bubu hug" (couple verb routing)
  console.log('Test 3: Typing "bubu hug" (verifying couple routing)...');
  await textInput.fill('bubu hug');
  await page.waitForTimeout(400);

  const bubuHugFirstSrc = await duduSadChips.first().getAttribute('data-sticker-file');
  console.log(`"bubu hug" first chip file: ${bubuHugFirstSrc}`);
  if (!bubuHugFirstSrc.includes('assets/stickers_couple')) {
    throw new Error(`FAIL: Expected couple sticker for "bubu hug" but got ${bubuHugFirstSrc}`);
  }
  console.log('✅ Passed: "bubu hug" correctly routed to couple stickers.');

  // 5. Test typing "bubu dance" (Bubu solo verb)
  console.log('Test 4: Typing "bubu dance"...');
  await textInput.fill('bubu dance');
  await page.waitForTimeout(400);

  const bubuDanceFirstSrc = await duduSadChips.first().getAttribute('data-sticker-file');
  console.log(`"bubu dance" first chip file: ${bubuDanceFirstSrc}`);
  if (!bubuDanceFirstSrc.includes('assets/stickers_bubu')) {
    throw new Error(`FAIL: Expected bubu sticker for "bubu dance" but got ${bubuDanceFirstSrc}`);
  }
  console.log('✅ Passed: "bubu dance" displays Bubu stickers.');

  // 6. Test static consistency: clear and type "dudu sad" multiple times
  console.log('Test 5: Static & consistent suggestion results with top relevance...');
  await textInput.fill('');
  await page.waitForTimeout(200);
  await textInput.fill('dudu sad');
  await page.waitForTimeout(300);
  const run1Files = await suggestionsTrack.locator('.btn-suggestion-chip').evaluateAll(els => els.map(e => e.getAttribute('data-sticker-file')));

  await textInput.fill('');
  await page.waitForTimeout(200);
  await textInput.fill('dudu sad');
  await page.waitForTimeout(300);
  const run2Files = await suggestionsTrack.locator('.btn-suggestion-chip').evaluateAll(els => els.map(e => e.getAttribute('data-sticker-file')));

  console.log('Run 1 first 2:', run1Files.slice(0, 2));
  console.log('Run 2 first 2:', run2Files.slice(0, 2));
  if (JSON.stringify(run1Files) !== JSON.stringify(run2Files)) {
    throw new Error('FAIL: Suggestions should be static and consistent!');
  }
  if (!run1Files[0].includes('STK-20260307-WA0001.webp')) {
    throw new Error(`FAIL: Expected top relevant sad sticker first, got ${run1Files[0]}`);
  }
  console.log('✅ Passed: Static & consistent top-relevance suggestions verified.');

  // 7. Click a suggestion chip to send to chat
  console.log('Test 6: Tap suggestion chip to send directly to chat...');
  const chipToSend = suggestionsTrack.locator('.btn-suggestion-chip').first();
  const sentChipFile = await chipToSend.getAttribute('data-sticker-file');
  await chipToSend.click();
  await page.waitForTimeout(600);

  // Verify input is cleared and suggestion box is hidden
  const inputValue = await textInput.inputValue();
  if (inputValue !== '') throw new Error('FAIL: Text input was not cleared after tapping suggestion chip!');
  if (await suggestionsBox.isVisible()) throw new Error('FAIL: Suggestion box was not hidden after tapping chip!');

  // Verify message in chat
  const lastBubble = page.locator('#chat-messages-container .chat-bubble-row').last();
  const lastImg = lastBubble.locator('img');
  await lastImg.waitFor({ state: 'visible', timeout: 3000 });
  const bubbleImgSrc = await lastImg.getAttribute('src');
  console.log('Sent sticker bubble img src:', bubbleImgSrc);
  if (!bubbleImgSrc || !bubbleImgSrc.includes(sentChipFile.split('/').pop())) {
    throw new Error('FAIL: Sent sticker bubble does not match clicked suggestion chip!');
  }
  console.log('✅ Passed: Suggestion chip sent to chat smoothly.');

  // 8. Test Favorite button in Sticker View Modal
  console.log('Test 7: Favorite button in sticker actions modal...');
  await lastBubble.locator('.chat-bubble-body').click({ force: true });
  await page.waitForTimeout(500);

  const modal = page.locator('#modal-message-actions');
  if (!(await modal.isVisible())) throw new Error('FAIL: Action modal not visible after clicking sent sticker!');

  const btnFav = page.locator('#btn-stk-action-fav');
  if (!(await btnFav.isVisible())) throw new Error('FAIL: #btn-stk-action-fav not visible in sticker actions modal!');

  const favIcon = page.locator('#icon-stk-action-fav');
  console.log('Fav icon before click:', await favIcon.textContent());

  // Click Favorite
  await btnFav.click();
  await page.waitForTimeout(300);

  const favIconAfter = await favIcon.textContent();
  console.log('Fav icon after click:', favIconAfter);
  if (favIconAfter.trim() !== 'star') {
    throw new Error('FAIL: Expected filled "star" icon after favoriting!');
  }

  // Close modal
  await page.locator('#btn-close-msg-actions').click();
  await page.waitForTimeout(300);
  console.log('✅ Passed: Favorite toggled from sticker modal.');

  // 9. Open sticker tray and check ⭐ Fav tab
  console.log('Test 8: Check ⭐ Fav category in sticker drawer...');
  const btnStickerToggle = page.locator('#btn-toggle-sticker-tray');
  await btnStickerToggle.click();
  await page.waitForTimeout(500);

  const favTab = page.locator('.stk-cat-btn[data-cat="fav"]');
  if (!(await favTab.isVisible())) throw new Error('FAIL: .stk-cat-btn[data-cat="fav"] not visible in drawer!');

  const favTabText = await favTab.textContent();
  console.log('Fav tab button text:', favTabText);
  if (!favTabText.includes('Fav (1)')) {
    throw new Error(`FAIL: Expected Fav (1) but got ${favTabText}`);
  }

  await favTab.click();
  await page.waitForTimeout(400);

  const favStickersInGrid = page.locator('#mockup-stickers-grid .chat-sticker-select-btn');
  const favGridCount = await favStickersInGrid.count();
  console.log(`Rendered stickers in ⭐ Fav tab: ${favGridCount}`);
  if (favGridCount !== 1) {
    throw new Error(`FAIL: Expected 1 sticker in ⭐ Fav tab, got ${favGridCount}`);
  }
  console.log('✅ Passed: Favorited sticker rendered in ⭐ Fav tab.');

  // 10. Test Long-Press (Hold Down) to Favorite in Drawer WITHOUT SENDING
  console.log('Test 9: Test long-press on sticker in drawer to favorite WITHOUT sending...');
  const duduTab = page.locator('.stk-cat-btn[data-cat="dudu"]');
  await duduTab.click();
  await page.waitForTimeout(400);

  const bubbleCountBefore = await page.locator('#chat-messages-container .chat-bubble-row').count();
  console.log(`Bubble count before long-press: ${bubbleCountBefore}`);

  const secondSticker = page.locator('#mockup-stickers-grid .chat-sticker-select-btn').nth(1);
  const secondBox = await secondSticker.boundingBox();

  // Simulate pointer down and hold for 600ms
  await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(400);

  // CRITICAL CHECK: Long-press MUST NOT send message or close drawer!
  const bubbleCountAfter = await page.locator('#chat-messages-container .chat-bubble-row').count();
  console.log(`Bubble count after long-press: ${bubbleCountAfter}`);
  if (bubbleCountAfter !== bubbleCountBefore) {
    throw new Error(`FAIL: Long-pressing to favorite sent a new message! Before: ${bubbleCountBefore}, After: ${bubbleCountAfter}`);
  }

  const tray = page.locator('#chat-sticker-tray');
  if (!(await tray.isVisible())) {
    throw new Error('FAIL: Sticker tray was closed after long-press to favorite!');
  }

  // Check updated fav tab count
  const updatedFavTabText = await favTab.textContent();
  console.log('Fav tab button text after long-press:', updatedFavTabText);
  if (!updatedFavTabText.includes('Fav (2)')) {
    throw new Error(`FAIL: Expected Fav (2) after long-press favorite, got ${updatedFavTabText}`);
  }

  await favTab.click();
  await page.waitForTimeout(400);
  const favGridCount2 = await page.locator('#mockup-stickers-grid .chat-sticker-select-btn').count();
  console.log(`Rendered stickers in ⭐ Fav tab after 2nd favorite: ${favGridCount2}`);
  if (favGridCount2 !== 2) {
    throw new Error(`FAIL: Expected 2 stickers in ⭐ Fav tab, got ${favGridCount2}`);
  }
  console.log('✅ Passed: Long-press in tray successfully favorited sticker WITHOUT sending.');

  // 11. Test Presence Indicator is Non-Toggleable Live Presence
  console.log('Test 10: Presence indicator non-toggleable live presence verification...');
  const presenceContainer = page.locator('#chat-partner-presence-container');
  const tagName = await presenceContainer.evaluate(el => el.tagName.toLowerCase());
  if (tagName !== 'div') {
    throw new Error(`FAIL: Expected #chat-partner-presence-container to be <div>, but got <${tagName}>`);
  }

  const textBeforeClick = await page.locator('#chat-partner-presence-text').textContent();
  // Click on presence container - must NOT change or toggle anything
  await presenceContainer.click();
  await page.waitForTimeout(300);
  const textAfterClick = await page.locator('#chat-partner-presence-text').textContent();
  if (textBeforeClick !== textAfterClick) {
    throw new Error(`FAIL: Presence container changed text on click! Was: "${textBeforeClick}", Now: "${textAfterClick}"`);
  }
  console.log('✅ Passed: Presence container is non-toggleable live indicator.');

  // Take screenshot of suggestions and favorites
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, 'sticker_suggestions_and_favs.png') });

  await browser.close();
  console.log('🎉 ALL STICKER SUGGESTIONS & FAVORITES TESTS PASSED 100%!');
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
