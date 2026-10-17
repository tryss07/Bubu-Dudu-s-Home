const { chromium } = require('playwright');

(async () => {
  console.log('--- Starting Playwright Full E2E & Autonomous Verification ---');
  const browser = await chromium.launch({ headless: true });

  // 1. Create two isolated browser contexts for Dudu (Kevin) and Bubu (Nana)
  const contextDudu = await browser.newContext();
  const contextBubu = await browser.newContext();

  const pageDudu = await contextDudu.newPage();
  const pageBubu = await contextBubu.newPage();

  const duduErrors = [];
  const bubuErrors = [];
  pageDudu.on('pageerror', err => duduErrors.push(`[Dudu Error] ${err.message}`));
  pageBubu.on('pageerror', err => bubuErrors.push(`[Bubu Error] ${err.message}`));

  console.log('[E2E] Navigating Dudu and Bubu to http://localhost:3000/index.html...');
  await Promise.all([
    pageDudu.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' }),
    pageBubu.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' })
  ]);

  // Give 1.5s for initial sync and WebSocket handshake
  await pageDudu.waitForTimeout(1500);

  // Set roles
  await pageDudu.evaluate(() => window.DuduMockup.setUserRole('dudu'));
  await pageBubu.evaluate(() => window.DuduMockup.setUserRole('bubu'));

  console.log('✓ Dudu & Bubu roles configured.');

  // ==========================================
  // TEST 1: CALENDAR MODAL, ADD & DELETE SYNC
  // ==========================================
  console.log('\n[TEST 1] Testing Calendar Modal & Add/Delete Sync...');
  await pageDudu.evaluate(() => window.DuduMockup.switchTab('calendar'));
  await pageBubu.evaluate(() => window.DuduMockup.switchTab('calendar'));
  await pageDudu.waitForTimeout(500);

  // Dudu clicks day 18 on calendar
  const day18Selector = '#calendar-days-grid div';
  const day18Cells = await pageDudu.$$(day18Selector);
  let clicked = false;
  for (const cell of day18Cells) {
    const text = await cell.innerText();
    if (text.includes('18')) {
      await cell.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) throw new Error('Day 18 cell not found on calendar grid!');

  // Verify modal-calendar-day is visible (no ugly prompt!)
  const isCalModalVisible = await pageDudu.isVisible('#modal-calendar-day');
  if (!isCalModalVisible) throw new Error('#modal-calendar-day should be visible after clicking day 18');
  console.log('✓ Calendar day modal sheet opened with plush design.');

  // Dudu inputs event
  const testEventTitle = 'Romantic Starlight Dinner ' + Date.now();
  await pageDudu.fill('#input-cal-event-title', testEventTitle);
  await pageDudu.click('#btn-submit-cal-event');
  await pageDudu.waitForTimeout(500);

  // Close calendar modal on Dudu
  await pageDudu.click('#btn-close-cal-modal');

  // Verify event is in Dudu's state
  const duduHasEvent = await pageDudu.evaluate((title) => {
    return window.DuduMockup.appData.calendarEvents.some(e => e.title === title);
  }, testEventTitle);
  if (!duduHasEvent) throw new Error('Dudu failed to save calendar event!');
  console.log('✓ Dudu created calendar event successfully.');

  // Wait for WebSocket sync to Bubu
  await pageBubu.waitForTimeout(1500);

  const bubuHasEvent = await pageBubu.evaluate((title) => {
    return window.DuduMockup.appData.calendarEvents.some(e => e.title === title);
  }, testEventTitle);
  if (!bubuHasEvent) throw new Error('Bubu did NOT receive the synchronized calendar event!');
  console.log('✓ Bubu received calendar event via real-time WebSocket sync!');

  // Bubu opens day 18 and deletes the event
  const bubuDay18Cells = await pageBubu.$$(day18Selector);
  for (const cell of bubuDay18Cells) {
    const text = await cell.innerText();
    if (text.includes('18')) {
      await cell.click();
      break;
    }
  }
  await pageBubu.waitForTimeout(500);

  // Find the delete button for testEventTitle in Bubu's modal
  const deleteBtn = await pageBubu.$('.btn-del-cal-event');
  if (!deleteBtn) throw new Error('Delete button not found in Bubu calendar modal!');
  await deleteBtn.click();
  await pageBubu.waitForTimeout(500);
  await pageBubu.click('#btn-close-cal-modal');

  // Verify event deleted on Bubu
  const bubuHasEventAfter = await pageBubu.evaluate((title) => {
    return window.DuduMockup.appData.calendarEvents.some(e => e.title === title);
  }, testEventTitle);
  if (bubuHasEventAfter) throw new Error('Calendar event was not deleted on Bubu!');
  console.log('✓ Bubu deleted calendar event via modal delete button.');

  // Wait for sync to Dudu
  await pageDudu.waitForTimeout(1500);
  const duduHasEventAfter = await pageDudu.evaluate((title) => {
    return window.DuduMockup.appData.calendarEvents.some(e => e.title === title);
  }, testEventTitle);
  if (duduHasEventAfter) throw new Error('Calendar deletion did not propagate to Dudu!');
  console.log('✓ Calendar deletion propagated to Dudu with zero refresh!');

  // ==========================================
  // TEST 2: PLANNER (BUCKET LIST) MODAL & DELETE
  // ==========================================
  console.log('\n[TEST 2] Testing Planner / Bucket List Modal & Delete Sync...');
  await pageDudu.evaluate(() => window.DuduMockup.switchTab('bucket'));
  await pageBubu.evaluate(() => window.DuduMockup.switchTab('bucket'));
  await pageDudu.waitForTimeout(500);

  // Click Add Date Idea button
  await pageDudu.click('#btn-add-date-idea');
  const isPlannerModalVisible = await pageDudu.isVisible('#modal-add-planner');
  if (!isPlannerModalVisible) throw new Error('#modal-add-planner should be visible!');
  console.log('✓ Planner modal opened with plush styling.');

  const testPlanTitle = 'Pottery Class Together ' + Date.now();
  await pageDudu.fill('#input-planner-title', testPlanTitle);
  await pageDudu.fill('#input-planner-desc', 'Spinning cozy clay cups together');
  await pageDudu.click('#btn-submit-planner-item');
  await pageDudu.waitForTimeout(500);

  // Verify Dudu has it
  const duduHasPlan = await pageDudu.evaluate((title) => {
    return window.DuduMockup.appData.bucketList.some(i => i.title === title);
  }, testPlanTitle);
  if (!duduHasPlan) throw new Error('Dudu failed to save planner item!');
  console.log('✓ Dudu saved planner item.');

  // Wait for Bubu to sync
  await pageBubu.waitForTimeout(1500);
  const bubuHasPlan = await pageBubu.evaluate((title) => {
    return window.DuduMockup.appData.bucketList.some(i => i.title === title);
  }, testPlanTitle);
  if (!bubuHasPlan) throw new Error('Bubu did NOT receive planner item!');
  console.log('✓ Bubu received planner item via live sync!');

  // Bubu deletes planner item using inline delete button
  const bubuDeletePlannerBtn = await pageBubu.$('.btn-delete-bucket');
  if (!bubuDeletePlannerBtn) throw new Error('Inline delete button not found on bucket cards!');
  await bubuDeletePlannerBtn.click();
  await pageBubu.waitForTimeout(1000);

  // Verify deleted on Dudu
  await pageDudu.waitForTimeout(1500);
  const duduHasPlanAfter = await pageDudu.evaluate((title) => {
    return window.DuduMockup.appData.bucketList.some(i => i.title === title);
  }, testPlanTitle);
  if (duduHasPlanAfter) throw new Error('Planner deletion did not sync to Dudu!');
  console.log('✓ Planner item deletion synchronized across both users!');

  // ==========================================
  // TEST 3: LOVE NOTES VIEW MODAL & DELETE
  // ==========================================
  console.log('\n[TEST 3] Testing Love Notes View Modal & Delete...');
  await pageDudu.evaluate(() => window.DuduMockup.switchTab('notes'));
  await pageBubu.evaluate(() => window.DuduMockup.switchTab('notes'));
  await pageDudu.waitForTimeout(500);

  // Dudu writes a note
  await pageDudu.click('#btn-write-love-note');
  const testNoteBody = 'Thinking of you constantly, my sweetest Nana! ' + Date.now();
  await pageDudu.fill('#input-love-note-body', testNoteBody);
  await pageDudu.click('#btn-submit-love-note');
  await pageDudu.waitForTimeout(500);

  // Verify Bubu received note
  await pageBubu.waitForTimeout(1500);
  const bubuHasNote = await pageBubu.evaluate((text) => {
    return window.DuduMockup.appData.notes.some(n => n.body === text);
  }, testNoteBody);
  if (!bubuHasNote) throw new Error('Bubu did NOT receive love note!');
  console.log('✓ Love note synchronized to Bubu!');

  // Bubu clicks the first note card to open view modal
  const bubuFirstNote = await pageBubu.$('#notes-cards-list > div:first-child');
  await bubuFirstNote.click();
  await pageBubu.waitForTimeout(500);

  const isViewNoteVisible = await pageBubu.isVisible('#modal-view-love-note');
  if (!isViewNoteVisible) throw new Error('#modal-view-love-note should be visible on note click!');
  console.log('✓ Love note viewing sheet displayed with wax seal and handwritten typography.');

  // Bubu deletes note inside the modal
  await pageBubu.click('#btn-delete-view-note');
  await pageBubu.waitForTimeout(1000);

  // Verify note deleted on Dudu
  await pageDudu.waitForTimeout(1500);
  const duduHasNoteAfter = await pageDudu.evaluate((text) => {
    return window.DuduMockup.appData.notes.some(n => n.body === text);
  }, testNoteBody);
  if (duduHasNoteAfter) throw new Error('Note deletion did not sync to Dudu!');
  console.log('✓ Love note deletion synchronized successfully!');

  // ==========================================
  // TEST 4: MEMORY JAR (POLAROID) MODAL & DELETE
  // ==========================================
  await pageDudu.evaluate(() => window.DuduMockup.switchTab('memories'));
  await pageBubu.evaluate(() => window.DuduMockup.switchTab('memories'));
  await pageDudu.waitForTimeout(500);

  // Dudu adds polaroid
  await pageDudu.click('#btn-add-polaroid');
  const testPolTitle = 'Cherry Blossom Stroll ' + Date.now();
  await pageDudu.fill('#input-polaroid-title', testPolTitle);
  await pageDudu.click('#btn-submit-polaroid');
  await pageDudu.waitForTimeout(500);

  // Bubu verifies polaroid
  await pageBubu.waitForTimeout(1500);
  const bubuHasPol = await pageBubu.evaluate((title) => {
    return window.DuduMockup.appData.polaroids.some(p => p.title === title);
  }, testPolTitle);
  if (!bubuHasPol) throw new Error('Bubu did NOT receive polaroid!');
  console.log('✓ Polaroid synced to Bubu!');

  // Bubu clicks the new polaroid to view large
  const bubuFirstPol = await pageBubu.$('#polaroids-grid > div:first-child');
  await bubuFirstPol.click();
  await pageBubu.waitForTimeout(500);

  const isViewPolVisible = await pageBubu.isVisible('#modal-view-polaroid');
  if (!isViewPolVisible) throw new Error('#modal-view-polaroid should be visible!');
  console.log('✓ Polaroid view modal opened with authentic frame styling.');

  // Bubu deletes polaroid inside the modal
  await pageBubu.click('#btn-delete-view-polaroid');
  await pageBubu.waitForTimeout(1000);

  // Verify deletion on Dudu
  await pageDudu.waitForTimeout(1500);
  const duduHasPolAfter = await pageDudu.evaluate((title) => {
    return window.DuduMockup.appData.polaroids.some(p => p.title === title);
  }, testPolTitle);
  if (duduHasPolAfter) throw new Error('Polaroid deletion did not sync to Dudu!');
  console.log('✓ Polaroid deletion synchronized across both users!');

  // ==========================================
  // TEST 5: COUPLE STATUS & ANNIVERSARY MODALS
  // ==========================================
  console.log('\n[TEST 5] Testing Couple Status & Anniversary Modals...');
  await pageDudu.evaluate(() => window.DuduMockup.switchTab('home'));
  await pageBubu.evaluate(() => window.DuduMockup.switchTab('home'));
  await pageDudu.waitForTimeout(500);

  // Click status card to open modal
  await pageDudu.click('#home-status-card');
  const isStatusModalVisible = await pageDudu.isVisible('#modal-edit-status');
  if (!isStatusModalVisible) throw new Error('#modal-edit-status should be visible!');
  console.log('✓ Status modal sheet opened.');

  // Click a quick preset
  const presetBtn = await pageDudu.$('.btn-preset-status');
  await presetBtn.click();
  await pageDudu.click('#btn-save-partner-status');
  await pageDudu.waitForTimeout(1000);

  // Click anniversary pill
  await pageDudu.click('#home-anniversary-pill');
  const isAnnivModalVisible = await pageDudu.isVisible('#modal-edit-anniversary');
  if (!isAnnivModalVisible) throw new Error('#modal-edit-anniversary should be visible!');
  console.log('✓ Anniversary modal sheet opened.');
  await pageDudu.click('#btn-close-anniversary-modal');

  // Verify zero page errors
  if (duduErrors.length > 0 || bubuErrors.length > 0) {
    console.error('Errors found:', duduErrors, bubuErrors);
    throw new Error('Errors occurred in browser sessions!');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL PLAYWRIGHT E2E SYNC & MODAL TESTS PASSED 100%! 🎉');
  console.log('======================================================');

  await browser.close();
})().catch(err => {
  console.error('\n❌ Playwright Test Failure:', err);
  process.exit(1);
});
