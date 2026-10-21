/**
 * tests/test_music_panel.js
 * Verification of Music Panel enhancements:
 * 1. Scrollable, vertically constrained songs list box.
 * 2. Direct song selection by clicking in list.
 * 3. 3-State Loop Toggle (all -> one -> off -> all).
 * 4. Shuffle Toggle (on/off).
 * 5. Auto-advance on track end (keeps playing next song automatically).
 */

const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('🚀 Starting Music Panel Verification Suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser Error:', msg.text());
  });

  await page.goto('http://localhost:3000/index.html');
  await page.waitForLoadState('networkidle');

  // Switch to Music Tab
  await page.evaluate(() => window.DuduMockup.switchTab('music'));
  await page.waitForTimeout(300);

  // 1. Verify Playlist Box & Song Count
  console.log('Test 1: Verifying Playlist Box & items count...');
  const countBadge = await page.textContent('#lofi-track-count-badge');
  console.log(`Track count badge: "${countBadge}"`);
  assert(countBadge.includes('Songs') || countBadge.includes('156'), 'Badge should show song count');

  const songRowsCount = await page.locator('.lofi-track-row').count();
  console.log(`Song rows rendered: ${songRowsCount}`);
  assert(songRowsCount > 100, `Expected > 100 song rows, got ${songRowsCount}`);

  // Check vertical constraint on playlist box
  const boxClasses = await page.getAttribute('#lofi-playlist-box', 'class');
  assert(boxClasses.includes('max-h-52') && boxClasses.includes('overflow-y-auto'), 'Playlist box must be vertically constrained and scrollable');
  console.log('✅ Passed: Playlist box is scrollable and vertically constrained!');

  // 2. Direct Song Selection
  console.log('\nTest 2: Direct song selection from list...');
  const fifthSongTitle = await page.locator('.lofi-track-row').nth(4).locator('.truncate.font-medium, .truncate.font-bold').first().textContent();
  console.log(`Clicking 5th track: "${fifthSongTitle}"`);
  await page.locator('.lofi-track-row').nth(4).click();
  await page.waitForTimeout(200);

  const activeTrackTitle = await page.textContent('#lofi-track-title');
  console.log(`Now playing: "${activeTrackTitle}"`);
  assert.strictEqual(fifthSongTitle.trim(), activeTrackTitle.trim(), 'Current track must match clicked track');
  console.log('✅ Passed: Direct song selection works!');

  // 3. Search Filter in Playlist
  console.log('\nTest 3: Testing search filter in playlist...');
  await page.fill('#lofi-playlist-search', 'radio');
  await page.waitForTimeout(200);
  const filteredCount = await page.locator('.lofi-track-row').count();
  console.log(`Filtered songs matching "radio": ${filteredCount}`);
  assert(filteredCount >= 1 && filteredCount < songRowsCount, 'Filtered count should be smaller than total songs');
  await page.fill('#lofi-playlist-search', ''); // clear
  await page.waitForTimeout(200);
  console.log('✅ Passed: Playlist search filter functional!');

  // 4. Shuffle Toggle
  console.log('\nTest 4: Testing Shuffle toggle...');
  const initialShuffle = await page.evaluate(() => window.DuduMockup.lofiEngine.isShuffle);
  assert.strictEqual(initialShuffle, false, 'Default shuffle must be false');

  await page.click('#btn-lofi-shuffle');
  await page.waitForTimeout(100);
  const shuffleOn = await page.evaluate(() => window.DuduMockup.lofiEngine.isShuffle);
  assert.strictEqual(shuffleOn, true, 'Shuffle must be toggled to true');

  await page.click('#btn-lofi-shuffle');
  await page.waitForTimeout(100);
  const shuffleOff = await page.evaluate(() => window.DuduMockup.lofiEngine.isShuffle);
  assert.strictEqual(shuffleOff, false, 'Shuffle must be toggled back to false');
  console.log('✅ Passed: Shuffle toggle works perfectly!');

  // 5. 3-Function Loop Toggle ('all' -> 'one' -> 'off' -> 'all')
  console.log('\nTest 5: Testing 3-State Loop toggle...');
  const initialLoop = await page.evaluate(() => window.DuduMockup.lofiEngine.loopMode);
  assert.strictEqual(initialLoop, 'all', 'Default loop mode must be "all"');

  // Click 1: all -> one
  await page.click('#btn-lofi-loop');
  await page.waitForTimeout(100);
  const loopOne = await page.evaluate(() => window.DuduMockup.lofiEngine.loopMode);
  const loopOneIcon = await page.textContent('#lofi-loop-icon');
  console.log(`State 2: loopMode="${loopOne}", icon="${loopOneIcon}"`);
  assert.strictEqual(loopOne, 'one', 'Loop mode must advance to "one"');
  assert.strictEqual(loopOneIcon.trim(), 'repeat_one', 'Icon must be repeat_one');

  // Click 2: one -> off
  await page.click('#btn-lofi-loop');
  await page.waitForTimeout(100);
  const loopOff = await page.evaluate(() => window.DuduMockup.lofiEngine.loopMode);
  console.log(`State 3: loopMode="${loopOff}"`);
  assert.strictEqual(loopOff, 'off', 'Loop mode must advance to "off"');

  // Click 3: off -> all
  await page.click('#btn-lofi-loop');
  await page.waitForTimeout(100);
  const loopAll = await page.evaluate(() => window.DuduMockup.lofiEngine.loopMode);
  console.log(`State 1 (cycled): loopMode="${loopAll}"`);
  assert.strictEqual(loopAll, 'all', 'Loop mode must cycle back to "all"');
  console.log('✅ Passed: 3-State Loop toggle works (all -> one -> off -> all)!');

  // 6. Auto-Advance on Track Finish
  console.log('\nTest 6: Testing Auto-advance when song finishes...');
  // Case A: Loop Mode 'one' -> Repeats same song
  await page.evaluate(() => {
    window.DuduMockup.lofiEngine.loopMode = 'one';
    window.DuduMockup.lofiEngine.currentTrackIndex = 2;
    window.DuduMockup.lofiEngine.isPlaying = true;
    window.DuduMockup.lofiEngine.handleTrackEnded();
  });
  await page.waitForTimeout(100);
  const trackIdxAfterRepeat = await page.evaluate(() => window.DuduMockup.lofiEngine.currentTrackIndex);
  assert.strictEqual(trackIdxAfterRepeat, 2, 'In loopMode "one", track must repeat same index');
  console.log('✓ Loop Mode "one" repeated current song successfully');

  // Case B: Loop Mode 'all' -> Advances to next song automatically
  await page.evaluate(() => {
    window.DuduMockup.lofiEngine.loopMode = 'all';
    window.DuduMockup.lofiEngine.currentTrackIndex = 2;
    window.DuduMockup.lofiEngine.isPlaying = true;
    window.DuduMockup.lofiEngine.handleTrackEnded();
  });
  await page.waitForTimeout(100);
  const trackIdxAfterNext = await page.evaluate(() => window.DuduMockup.lofiEngine.currentTrackIndex);
  assert.strictEqual(trackIdxAfterNext, 3, 'In loopMode "all", track must advance to next index (2 -> 3)');
  console.log('✓ Loop Mode "all" auto-played next song successfully');

  // Case C: Loop Mode 'off' at end of playlist -> Stops playback
  await page.evaluate(() => {
    const total = window.DuduMockup.lofiEngine.tracks.length;
    window.DuduMockup.lofiEngine.loopMode = 'off';
    window.DuduMockup.lofiEngine.currentTrackIndex = total - 1;
    window.DuduMockup.lofiEngine.isPlaying = true;
    window.DuduMockup.lofiEngine.handleTrackEnded();
  });
  await page.waitForTimeout(100);
  const isPlayingAfterEnd = await page.evaluate(() => window.DuduMockup.lofiEngine.isPlaying);
  assert.strictEqual(isPlayingAfterEnd, false, 'In loopMode "off" at end of playlist, playback must stop');
  console.log('✓ Loop Mode "off" stopped playback at end of playlist');

  await browser.close();
  console.log('\n🎉 ALL MUSIC PANEL TESTS PASSED 100%!\n');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
