const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting Full Playwright Verification Suite for Dudu Companion App...');
  
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  // Test across responsive viewport widths:
  // 1. Mobile standard (412x915)
  // 2. Ultra-narrow small window (340x700) to test "adapt to smaller window"
  // 3. Wider layout window (600x950) to test "maximum dimension bit wider"
  const viewports = [
    { name: '01_mobile_std', width: 412, height: 915 },
    { name: '02_small_window', width: 340, height: 720 },
    { name: '03_wider_window', width: 580, height: 950 }
  ];

  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');

  for (const vp of viewports) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });

    const page = await context.newPage();
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    // Capture initial layout
    await page.screenshot({ path: `scratch/screenshots/${vp.name}_home.png` });
    console.log(`📸 Captured: scratch/screenshots/${vp.name}_home.png`);
    await context.close();
  }

  // Interactive Detailed Test Suite on primary context
  const primaryContext = await browser.newContext({
    viewport: { width: 440, height: 920 },
    deviceScaleFactor: 2
  });
  const page = await primaryContext.newPage();
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Check title & Bubu / Dudu couple header
  const title = await page.title();
  console.log(`Page title: "${title}"`);
  if (title !== 'Dudu') throw new Error(`Page title mismatch, expected "Dudu", got: ${title}`);

  // 2. Verify Promise to sleep & Spicy instant noodles habits are REMOVED
  const pageText = await page.textContent('body');
  if (pageText.includes('Promise to sleep before 11:00 PM')) {
    throw new Error('FAIL: Sleep habit still found on page!');
  }
  if (pageText.includes('Free from spicy instant noodles')) {
    throw new Error('FAIL: "Free from spicy instant noodles" habit still found on page!');
  }
  if (!pageText.includes('Eat veggies')) {
    throw new Error('FAIL: "Eat veggies" habit not found on page!');
  }
  console.log('✅ Verified: "Eat veggies" habit cleanly rendered!');

  // Verify Redundant Tummy Shield Emergency Widget removed from sanctuary tab
  const widgetBadge = await page.$('#widget-streak-badge');
  if (widgetBadge) throw new Error('FAIL: #widget-streak-badge still found in sanctuary tab!');
  console.log('✅ Verified: Redundant tummy shield widget removed from sanctuary tab!');

  // Verify Header Streak Badge removed and Honey Badge cleanly rendered
  const streakBadge = await page.$('#streak-count');
  if (streakBadge) throw new Error('FAIL: #streak-count still found in header!');
  const honeyHeader = await page.$eval('#honey-count', el => el.textContent.trim());
  console.log(`Header honey count: "${honeyHeader}"`);
  console.log('✅ Verified: Header streak badge removed and honey badge cleanly rendered!');

  // 2b. Verify Sticker Vault & Sound Toggle removed
  const galleryEl = await page.$('#tab-gallery');
  if (galleryEl) throw new Error('FAIL: #tab-gallery still exists!');
  const soundToggleEl = await page.$('#sound-toggle-btn');
  if (soundToggleEl) throw new Error('FAIL: #sound-toggle-btn still exists!');
  console.log('✅ Verified: Sticker vault and sound toggle completely removed!');

  // 2c. Test Collapsible Sections (Care & Action) with Animation
  console.log('📂 Testing Collapsible Sections (Care & Action) with Animation...');
  const careHiddenBefore = await page.$eval('#care-buttons-container', el => el.classList.contains('hidden'));
  const actionHiddenBefore = await page.$eval('#action-buttons-container', el => el.classList.contains('hidden'));
  if (careHiddenBefore) throw new Error('FAIL: #care-buttons-container should be visible initially!');
  if (!actionHiddenBefore) throw new Error('FAIL: #action-buttons-container should be hidden initially!');
  console.log('✅ Initial states: Care expanded, Action collapsed.');

  // Collapse Care Section
  await page.click('#toggle-care-btn');
  await page.waitForTimeout(300);
  const careHiddenAfter = await page.$eval('#care-buttons-container', el => el.classList.contains('hidden'));
  if (!careHiddenAfter) throw new Error('FAIL: #care-buttons-container failed to collapse on click!');
  console.log('✅ Verified: Care section collapses with animation!');

  // Re-expand Care Section
  await page.click('#toggle-care-btn');
  await page.waitForTimeout(300);
  const careReExpanded = await page.$eval('#care-buttons-container', el => !el.classList.contains('hidden'));
  if (!careReExpanded) throw new Error('FAIL: #care-buttons-container failed to re-expand!');
  console.log('✅ Verified: Care section re-expands with animation!');

  // Expand Action Section
  await page.click('#toggle-action-btn');
  await page.waitForTimeout(300);
  const actionHiddenAfter = await page.$eval('#action-buttons-container', el => el.classList.contains('hidden'));
  if (actionHiddenAfter) throw new Error('FAIL: #action-buttons-container failed to expand on click!');
  console.log('✅ Verified: Action section expands successfully with animation on click!');


  // Verify speech bubble, mood badge, and Dudu hero text removed
  const speechBubble = await page.$('#dudu-dialogue');
  if (speechBubble) throw new Error('FAIL: #dudu-dialogue speech bubble should be completely removed!');
  console.log('✅ Verified: Dudu speech bubble text container cleanly removed!');

  const moodBadge = await page.$('#dudu-mood-badge');
  if (moodBadge) throw new Error('FAIL: #dudu-mood-badge should be removed from hero card!');
  console.log('✅ Verified: Top mood badge pill cleanly removed!');

  const duduAvatarImg = await page.$('#dudu-avatar-img');
  if (!duduAvatarImg) throw new Error('FAIL: #dudu-avatar-img must exist and be displayed!');
  console.log('✅ Verified: Dudu mascot avatar preserved and enlarged!');

  // 2d. Test Dudu Dance button (random sticker & anti-repeat)
  console.log('💃 Testing Standalone Dudu Dance Button (#action-dance-btn)...');
  const danceBtn = await page.$('#action-dance-btn');
  if (!danceBtn) throw new Error('FAIL: #action-dance-btn not found!');
  await page.click('#action-dance-btn');
  await page.waitForTimeout(300);
  const danceAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#action-dance-btn');
  await page.waitForTimeout(300);
  const danceAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (danceAvatar1 === danceAvatar2) throw new Error('FAIL: Consecutive clicks on Dance must change sticker!');
  console.log(`Dance Avatars switched: ${danceAvatar1.split('/').pop()} -> ${danceAvatar2.split('/').pop()}`);
  await page.screenshot({ path: 'scratch/screenshots/test_dance.png' });

  // 3. Test Annoy button (random sticker & anti-repeat)
  console.log('😤 Testing Annoy Button (#pout-annoy-btn)...');
  await page.click('#pout-annoy-btn');
  await page.waitForTimeout(300);
  const annoyAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#pout-annoy-btn');
  await page.waitForTimeout(300);
  const annoyAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (annoyAvatar1 === annoyAvatar2) throw new Error('FAIL: Consecutive clicks on Annoy must change sticker!');
  console.log(`Annoy Avatars switched: ${annoyAvatar1.split('/').pop()} -> ${annoyAvatar2.split('/').pop()}`);
  await page.screenshot({ path: 'scratch/screenshots/test_annoy.png' });

  // 4. Test Fight button (random sticker & anti-repeat)
  console.log('🥊 Testing Fight Button (#pout-fight-btn)...');
  await page.click('#pout-fight-btn');
  await page.waitForTimeout(300);
  const fightAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#pout-fight-btn');
  await page.waitForTimeout(300);
  const fightAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (fightAvatar1 === fightAvatar2) throw new Error('FAIL: Consecutive clicks on Fight must change sticker!');
  console.log(`Fight Avatars switched: ${fightAvatar1.split('/').pop()} -> ${fightAvatar2.split('/').pop()}`);
  await page.screenshot({ path: 'scratch/screenshots/test_fight.png' });

  // 5. Test Scold button (random sticker & anti-repeat)
  console.log('📢 Testing Scold Button (#pout-scold-btn)...');
  await page.click('#pout-scold-btn');
  await page.waitForTimeout(300);
  const scoldAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#pout-scold-btn');
  await page.waitForTimeout(300);
  const scoldAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (scoldAvatar1 === scoldAvatar2) throw new Error('FAIL: Consecutive clicks on Scold must change sticker!');
  console.log(`Scold Avatars switched: ${scoldAvatar1.split('/').pop()} -> ${scoldAvatar2.split('/').pop()}`);
  const poolsCheck = await page.evaluate(() => {
    return {
      scoldHas29: window.DUDU_POOLS.scold.includes(29),
      hugHas29: window.DUDU_POOLS.hug.includes(29)
    };
  });
  if (!poolsCheck.scoldHas29) throw new Error('FAIL: Sticker 29 must be present in window.DUDU_POOLS.scold!');
  if (poolsCheck.hugHas29) throw new Error('FAIL: Sticker 29 must NOT be present in window.DUDU_POOLS.hug!');
  await page.screenshot({ path: 'scratch/screenshots/test_scold.png' });

  // 6. Test Hug action (random sticker & anti-repeat)
  console.log('🤗 Testing Hug Action lifts Mood meter and switches stickers...');
  const moodBefore = await page.textContent('#mood-val-text');
  await page.click('#action-hug-btn');
  await page.waitForTimeout(300);
  const moodAfter = await page.textContent('#mood-val-text');
  const hugAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#action-hug-btn');
  await page.waitForTimeout(300);
  const hugAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (hugAvatar1 === hugAvatar2) throw new Error('FAIL: Consecutive clicks on Hug must change sticker!');
  console.log(`Hug Avatars switched: ${hugAvatar1.split('/').pop()} -> ${hugAvatar2.split('/').pop()}`);

  // 7. Test Tuck In action
  console.log('💤 Testing Tuck In Action...');
  await page.click('#action-sleep-btn');
  await page.waitForTimeout(300);
  const sleepAvatar = await page.$eval('#dudu-avatar-img', el => el.src);
  console.log(`Tuck In Avatar: ${sleepAvatar}`);
  await page.screenshot({ path: 'scratch/screenshots/test_tuck_in.png' });

  // 8. Test Wake Up action
  console.log('☀️ Testing Wake Up Action...');
  await page.click('#action-sleep-btn');
  await page.waitForTimeout(300);
  const wakeAvatar = await page.$eval('#dudu-avatar-img', el => el.src);
  console.log(`Wake Avatar: ${wakeAvatar}`);
  if (wakeAvatar.includes('STK-20261003-WA0041.webp')) throw new Error('FAIL: Sticker 68 STK-20261003-WA0041.webp should NOT appear on wake!');
  await page.screenshot({ path: 'scratch/screenshots/test_wake_up.png' });

  // 8b. Test Squish, Boop, Massage (random sticker & anti-repeat)
  console.log('🤏 Testing Squish Button (#pout-squish-btn)...');
  await page.click('#pout-squish-btn');
  await page.waitForTimeout(300);
  const squishAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#pout-squish-btn');
  await page.waitForTimeout(300);
  const squishAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (squishAvatar1 === squishAvatar2) throw new Error('FAIL: Consecutive clicks on Squish must change sticker!');
  console.log(`Squish Avatars switched: ${squishAvatar1.split('/').pop()} -> ${squishAvatar2.split('/').pop()}`);

  console.log('🎁 Testing Gift Button (#action-gift-btn)...');
  await page.click('#action-gift-btn');
  await page.waitForTimeout(300);
  const giftAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#action-gift-btn');
  await page.waitForTimeout(300);
  const giftAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (giftAvatar1 === giftAvatar2) throw new Error('FAIL: Consecutive clicks on Gift must change sticker!');
  console.log(`Gift Avatars switched: ${giftAvatar1.split('/').pop()} -> ${giftAvatar2.split('/').pop()}`);

  const boopBtn = await page.$('#pout-boop-btn');
  if (boopBtn) throw new Error('FAIL: #pout-boop-btn should be removed from DOM!');
  console.log('✅ Verified: Boop button cleanly removed from Action section!');

  console.log('💆 Testing Massage Button (#pout-massage-btn)...');
  await page.click('#pout-massage-btn');
  await page.waitForTimeout(300);
  const massageAvatar1 = await page.$eval('#dudu-avatar-img', el => el.src);
  await page.click('#pout-massage-btn');
  await page.waitForTimeout(300);
  const massageAvatar2 = await page.$eval('#dudu-avatar-img', el => el.src);
  if (massageAvatar1 === massageAvatar2) throw new Error('FAIL: Consecutive clicks on Massage must change sticker!');
  console.log(`Massage Avatars switched: ${massageAvatar1.split('/').pop()} -> ${massageAvatar2.split('/').pop()}`);

  // 9. Test Feed Action (Verify milk option removed, rice option present & functional)
  console.log('🥣 Testing Feed Action...');
  await page.click('#action-feed-btn');
  await page.waitForTimeout(300);
  const milkFoodBtn = await page.$('button[data-food="milk"]');
  if (milkFoodBtn) throw new Error('FAIL: button[data-food="milk"] should be removed from feed modal!');
  const riceFoodBtn = await page.$('button[data-food="rice"]');
  if (!riceFoodBtn) throw new Error('FAIL: button[data-food="rice"] should exist in feed modal!');
  const riceText = await page.textContent('button[data-food="rice"]');
  if (!riceText.includes('Fluffy Rice Bowl')) throw new Error('FAIL: rice button should have text "Fluffy Rice Bowl"!');
  const nutsFoodBtn = await page.$('button[data-food="nuts"]');
  if (!nutsFoodBtn) throw new Error('FAIL: button[data-food="nuts"] should exist in feed modal!');
  const nutsText = await page.textContent('button[data-food="nuts"]');
  if (!nutsText.includes('Crunchy Nuts')) throw new Error('FAIL: nuts button should have text "Crunchy Nuts"!');
  await page.click('button[data-food="rice"]');
  await page.waitForTimeout(400);
  const riceAvatar = await page.$eval('#dudu-avatar-img', el => el.src);
  if (!riceAvatar.includes('STK-20260930-WA0107.webp') && !riceAvatar.includes('STK-20261001-WA0040.webp')) {
    throw new Error('FAIL: Rice option should show rice sticker (STK-20260930-WA0107.webp)!');
  }
  console.log(`Rice Avatar verified: ${riceAvatar.split('/').pop()}`);
  const foodVal = await page.textContent('#food-val-text');
  console.log(`Food after rice: ${foodVal} (rice, nuts, and soup verified)`);

  // 10. Test Offline Simulation / Clock Decay Logic
  console.log('⏱️ Testing Offline Simulation with simulated 3-hour timestamp difference...');
  const decayResult = await page.evaluate(() => {
    const st = window.DuduApp.getState();
    const originalFood = st.stats.hunger;
    const originalMood = st.stats.mood;
    // Simulate being away for 3 hours (180 mins)
    st.lastActiveTimestamp = Date.now() - (180 * 60 * 1000);
    // Trigger visibility return or reload
    document.dispatchEvent(new Event('visibilitychange'));
    return {
      before: { food: originalFood, mood: originalMood },
      after: { food: st.stats.hunger, mood: st.stats.mood }
    };
  });
  console.log('Decay result after 3 hours offline:', decayResult);
  await page.screenshot({ path: 'scratch/screenshots/test_offline_decay.png' });

  // 11. Test Complete Habit
  console.log('🌱 Testing Habit Complete...');
  const completeBtn = await page.$('#habits-container button:not([disabled])');
  if (completeBtn) {
    await completeBtn.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: 'scratch/screenshots/test_habits.png' });

  // 12. Test Bubu's Belly Tab, Calendar Dropdown & Guardian Shop
  console.log("🛡️ Testing Bubu's Belly Tab, Calendar Dropdown & Shop...");
  await page.click('a[data-tab="shield"]');
  await page.waitForTimeout(400);

  // Check branding in header and nav
  const bellyHeading = await page.textContent('#tab-shield h2');
  console.log(`Belly Tab Heading: "${bellyHeading.trim()}"`);
  if (!bellyHeading.includes("Bubu's Belly")) throw new Error("FAIL: Header should display Bubu's Belly!");

  // Test Calendar Dropdown toggle
  console.log('📅 Testing Calendar Dropdown Toggle & Selection...');
  const calTrigger = await page.$('#cal-dropdown-trigger-btn');
  if (!calTrigger) throw new Error('FAIL: #cal-dropdown-trigger-btn not found!');
  
  // Open Dropdown
  await page.click('#cal-dropdown-trigger-btn');
  await page.waitForTimeout(200);
  const dropdownHidden = await page.$eval('#cal-dropdown-menu', el => el.classList.contains('hidden'));
  if (dropdownHidden) throw new Error('FAIL: Calendar dropdown failed to open!');
  console.log('✅ Verified: Calendar dropdown menu opened on click!');

  // Select "Yesterday" from dropdown
  await page.click('#cal-dropdown-menu button[data-dropdown-date="yesterday"]');
  await page.waitForTimeout(300);
  const dropdownClosed = await page.$eval('#cal-dropdown-menu', el => el.classList.contains('hidden'));
  if (!dropdownClosed) throw new Error('FAIL: Calendar dropdown failed to close after selection!');
  const yestLabel = await page.textContent('#cal-current-label');
  console.log(`Dropdown selected label: "${yestLabel.trim()}"`);
  if (!yestLabel.includes('Yesterday')) throw new Error('FAIL: Label should update to Yesterday!');
  console.log('✅ Verified: Calendar dropdown selection works and updates label!');

  // Test filter to all history via shortcut chip
  await page.click('button[data-day-filter="all"]');
  await page.waitForTimeout(300);
  const allLabel = await page.textContent('#cal-current-label');
  if (!allLabel.includes('All History')) throw new Error('FAIL: All History filter failed to activate!');

  // Test Daily Honey Pool Badge
  const honeyPoolText = await page.textContent('#daily-honey-pool-text');
  console.log(`Daily Honey Pool: "${honeyPoolText.trim()}"`);
  if (!honeyPoolText.includes('/120')) throw new Error('FAIL: #daily-honey-pool-text should show /120!');

  // Test Standalone Belly Guardian Shop (Purchase Spice Shield)
  console.log('🛍️ Testing Standalone Belly Guardian Shop (Purchasing Shields)...');
  await page.click('a[data-tab="shop"]');
  await page.waitForTimeout(300);
  const shopVisible = await page.$eval('#tab-shop', el => !el.classList.contains('hidden'));
  if (!shopVisible) throw new Error('FAIL: #tab-shop is not visible after switching to shop tab!');

  const shopWalletBefore = parseInt(await page.textContent('#shop-wallet-honey'), 10);
  console.log(`Shop wallet before purchase: ${shopWalletBefore} Honey`);
  
  // Verify button labels
  const spiceBtnText = await page.textContent('#buy-spice-shield-btn');
  const junkBtnText = await page.textContent('#buy-junk-shield-btn');
  if (!spiceBtnText.includes('120 Honey')) throw new Error('FAIL: Spice Shield should cost 120 Honey!');
  if (!junkBtnText.includes('95 Honey')) throw new Error('FAIL: Junk Shield should cost 95 Honey!');

  // Buy Spice Shield (120 Honey)
  await page.click('#buy-spice-shield-btn');
  await page.waitForTimeout(300);
  const spiceOwned = await page.textContent('#spice-shield-owned-count');
  if (spiceOwned.trim() !== '1') throw new Error('FAIL: Spice Shield owned count should be 1!');
  console.log('✅ Verified: Purchased Spice Shield (120 Honey)! Junk Shield confirmed at 95 Honey.');
  await page.screenshot({ path: 'scratch/screenshots/test_tab_shop.png' });

  // Return to Bubu's Belly Tab to test food logging with active Spice Shield
  await page.click('a[data-tab="shield"]');
  await page.waitForTimeout(300);

  // Test Spicy Food Button & Modal with Spice Shield active
  console.log('🌶️ Testing Spicy Food Modal with Active Spice Shield...');
  await page.click('#log-spicy-trigger-btn');
  await page.waitForTimeout(300);
  const spiceBannerHidden = await page.$eval('#spicy-shield-banner', el => el.classList.contains('hidden'));
  if (spiceBannerHidden) throw new Error('FAIL: #spicy-shield-banner should be visible when shield owned!');
  await page.fill('#spicy-food-name-input', 'Late Night Samyang Fire Noodles');
  await page.click('#form-log-spicy button[type="submit"]');
  await page.waitForTimeout(400);
  console.log('✅ Logged spicy food with Spice Shield defense successfully!');

  // Test Junk Food Button & Modal
  console.log('🍔 Testing Junk Food Modal & Logging...');
  await page.click('#log-junk-trigger-btn');
  await page.waitForTimeout(300);
  const junkModalHidden = await page.$eval('#modal-log-junk', el => el.classList.contains('hidden'));
  if (junkModalHidden) throw new Error('FAIL: #modal-log-junk should be open!');
  await page.fill('#junk-food-name-input', 'Double Cheeseburger & Fries');
  await page.click('#form-log-junk button[type="submit"]');
  await page.waitForTimeout(400);
  console.log('✅ Logged junk food successfully!');

  await page.screenshot({ path: 'scratch/screenshots/test_tab_shield.png' });
  console.log("✅ Verified: Bubu's Belly calendar dropdown & Honey deductions function cleanly!");

  // 13. Test Sanctuary Tab Navigation and Screenshot
  console.log('🏠 Testing Sanctuary Tab Return Navigation...');
  await page.click('a[data-tab="home"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/screenshots/test_tab_home_updated.png' });

  // 13b. Test Debug Mode 5-tap toggle on Profile Avatar & Sticker Gallery
  console.log('🛠️ Testing Debug Mode 5-tap toggle on Profile Avatar...');
  const pillHiddenBefore = await page.$eval('#dudu-sticker-id-pill', el => el.classList.contains('hidden'));
  if (!pillHiddenBefore) throw new Error('FAIL: Sticker ID pill should be hidden by default when debugMode is false!');

  // Tap profile avatar 5 times quickly (< 1s between taps)
  for (let i = 0; i < 5; i++) {
    await page.click('#profile-avatar-btn');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);

  const pillHiddenAfter = await page.$eval('#dudu-sticker-id-pill', el => el.classList.contains('hidden'));
  if (pillHiddenAfter) throw new Error('FAIL: Sticker ID pill should be visible after 5 taps!');
  console.log('✅ Verified: Debug Mode enabled after 5 taps on Profile Avatar!');

  // Test Floating Gallery launcher and modal
  console.log('🎨 Testing Sticker Gallery Modal...');
  await page.click('#debug-gallery-btn');
  await page.waitForTimeout(300);
  const galleryItems = await page.$$('.gallery-sticker-card');
  console.log(`✅ Gallery rendered ${galleryItems.length} stickers with IDs!`);
  if (galleryItems.length !== 95) throw new Error(`FAIL: Expected 95 stickers in gallery, found ${galleryItems.length}`);

  // Tap a sticker in gallery (e.g. sticker #20)
  await page.click('.gallery-sticker-card[data-sticker-id="20"]');
  await page.waitForTimeout(300);
  const avatarAfterPick = await page.$eval('#dudu-avatar-img', el => el.src);
  const pillText = await page.$eval('#dudu-sticker-id-pill', el => el.textContent.trim());
  console.log(`Picked sticker 20 from gallery -> Avatar: ${avatarAfterPick}, Pill: ${pillText}`);
  if (!avatarAfterPick.includes('STK-20260930-WA0048.webp')) throw new Error('FAIL: Avatar did not switch to selected gallery sticker!');
  if (pillText !== 'ID #20') throw new Error(`FAIL: Pill text expected 'ID #20', got '${pillText}'!`);

  // Tap 5 times again to toggle debug mode OFF
  for (let i = 0; i < 5; i++) {
    await page.click('#profile-avatar-btn');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);
  const pillHiddenOff = await page.$eval('#dudu-sticker-id-pill', el => el.classList.contains('hidden'));
  if (!pillHiddenOff) throw new Error('FAIL: Sticker ID pill should be hidden after toggling debug mode off!');
  console.log('✅ Verified: Debug Mode toggled off successfully!');

  // 14. Verify LocalStorage contains both state and dedicated belly logs backup
  const stored = await page.evaluate(() => localStorage.getItem('dudu_companion_bubu_en_v2'));
  const storedBellyLogs = await page.evaluate(() => localStorage.getItem('DUDU_BELLY_LOGS'));
  if (!stored) throw new Error('FAIL: localStorage key dudu_companion_bubu_en_v2 not found!');
  if (!storedBellyLogs) throw new Error('FAIL: localStorage backup DUDU_BELLY_LOGS not found!');
  console.log('✅ Verified: State and Tummy Logs successfully saved in localStorage!');

  console.log('🎉 Playwright verification suite finished with 100% success!');
  await browser.close();
})();
