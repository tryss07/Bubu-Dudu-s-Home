const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('🧪 Starting Dual Love Battery (Dudu & Bubu) Permissions & Meter Tap Verification...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Check adjust buttons are removed from UI
  console.log('1. Checking adjust buttons removed...');
  const adjustDuduBtn = await page.$('#btn-open-battery-adjust');
  const adjustBubuBtn = await page.$('#btn-open-battery-bubu-adjust');
  assert.strictEqual(adjustDuduBtn, null, 'Adjust button for Dudu should be removed');
  assert.strictEqual(adjustBubuBtn, null, 'Adjust button for Bubu should be removed');
  console.log('✓ Adjust buttons successfully removed from UI');

  // 2. Ensure initial role is Dudu
  await page.evaluate(() => {
    window.duduApp?.setUserRole?.('dudu');
  });
  await page.waitForTimeout(200);

  const duduTextEl = await page.$('#home-battery-text');
  const bubuTextEl = await page.$('#home-battery-bubu-text');
  console.log('✓ Initial Dudu battery:', (await duduTextEl.innerText()).trim());
  console.log('✓ Initial Bubu battery:', (await bubuTextEl.innerText()).trim());

  // 3. Tapping Dudu's meter directly opens Dudu's slider modal (no tap-to-increase)
  console.log('2. Tapping Dudu meter directly (as Dudu)...');
  await page.click('#btn-boost-battery');
  await page.waitForTimeout(300);

  const isModalOpen = await page.$eval('#modal-adjust-battery', el => !el.classList.contains('hidden'));
  assert.ok(isModalOpen, 'Modal must open on meter tap');

  const modalTitle = await page.$eval('#battery-modal-title', el => el.innerText);
  console.log('✓ Opened modal title:', modalTitle);
  assert.ok(modalTitle.includes("Dudu"), 'Modal must target Dudu');

  const isSliderDisabled = await page.$eval('#input-love-battery-slider', el => el.disabled);
  assert.strictEqual(isSliderDisabled, false, 'Dudu slider must be enabled for Dudu');

  const saveBtnText = await page.$eval('#btn-save-battery-slider', el => el.innerText);
  console.log('✓ Save button text for Dudu:', saveBtnText);
  assert.ok(saveBtnText.includes('Save'), 'Save button must be active for Dudu');

  // Select 50% preset
  await page.click('.btn-battery-preset[data-val="50"]');
  await page.waitForTimeout(200);
  await page.click('#btn-save-battery-slider');
  await page.waitForTimeout(400);

  const duduValAfterSave = (await duduTextEl.innerText()).trim();
  console.log(`✓ Dudu battery saved to: ${duduValAfterSave}`);
  assert.strictEqual(duduValAfterSave, '50%');

  // 4. As Dudu, tap Bubu's meter -> opens Bubu's slider in READ-ONLY mode
  console.log('3. Tapping Bubu meter (as Dudu) -> checking read-only permissions...');
  await page.click('#btn-boost-battery-bubu');
  await page.waitForTimeout(300);

  const bubuModalTitle = await page.$eval('#battery-modal-title', el => el.innerText);
  console.log('✓ Opened modal title:', bubuModalTitle);
  assert.ok(bubuModalTitle.includes("Bubu"), 'Modal must target Bubu');

  const isBubuSliderDisabled = await page.$eval('#input-love-battery-slider', el => el.disabled);
  assert.strictEqual(isBubuSliderDisabled, true, 'Bubu slider must be DISABLED when viewed by Dudu');

  const bubuSaveBtnDisabled = await page.$eval('#btn-save-battery-slider', el => el.disabled);
  const bubuSaveBtnText = await page.$eval('#btn-save-battery-slider', el => el.innerText);
  console.log('✓ Bubu modal button text when viewed by Dudu:', bubuSaveBtnText);
  assert.strictEqual(bubuSaveBtnDisabled, true, 'Save button must be disabled for partner');
  assert.ok(bubuSaveBtnText.includes('Only Bubu can adjust'), 'Must display restriction message');

  // Close modal
  await page.click('#btn-close-battery-modal');
  await page.waitForTimeout(300);

  // 5. Switch perspective to Bubu
  console.log('4. Switching perspective to Bubu...');
  await page.evaluate(() => {
    window.duduApp?.setUserRole?.('bubu');
  });
  await page.waitForTimeout(200);

  // Now as Bubu, tap Bubu's meter -> opens in EDITABLE mode
  console.log('5. Tapping Bubu meter (as Bubu)...');
  await page.click('#btn-boost-battery-bubu');
  await page.waitForTimeout(300);

  const bubuOwnSliderDisabled = await page.$eval('#input-love-battery-slider', el => el.disabled);
  assert.strictEqual(bubuOwnSliderDisabled, false, 'Bubu slider must be ENABLED for Bubu');

  // Select 75% preset
  await page.click('.btn-battery-preset[data-val="75"]');
  await page.waitForTimeout(200);
  await page.click('#btn-save-battery-slider');
  await page.waitForTimeout(400);

  const bubuValAfterSave = (await bubuTextEl.innerText()).trim();
  console.log(`✓ Bubu battery saved to: ${bubuValAfterSave}`);
  assert.strictEqual(bubuValAfterSave, '75%');

  // 6. As Bubu, tap Dudu's meter -> opens Dudu's slider in READ-ONLY mode
  console.log('6. Tapping Dudu meter (as Bubu) -> checking read-only permissions...');
  await page.click('#btn-boost-battery');
  await page.waitForTimeout(300);

  const duduModalForBubuDisabled = await page.$eval('#input-love-battery-slider', el => el.disabled);
  assert.strictEqual(duduModalForBubuDisabled, true, 'Dudu slider must be DISABLED when viewed by Bubu');

  const duduSaveForBubuText = await page.$eval('#btn-save-battery-slider', el => el.innerText);
  console.log('✓ Dudu modal button text when viewed by Bubu:', duduSaveForBubuText);
  assert.ok(duduSaveForBubuText.includes('Only Dudu can adjust'));

  await page.click('#btn-close-battery-modal');
  await page.waitForTimeout(300);

  console.log('\n🎉 ALL ROLE PERMISSIONS & METER TAP TESTS PASSED FLAWLESSLY!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
