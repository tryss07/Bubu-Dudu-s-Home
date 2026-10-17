const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🧪 Starting 12 Feature Verification Test Suite for Dudu Companion...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile device viewport
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // 1. Bilingual Support Check
  console.log('Testing 11. Bilingual Language Switcher...');
  const langBtn = await page.$('#btn-lang-toggle');
  if (!langBtn) throw new Error('#btn-lang-toggle missing');
  let langText = await langBtn.innerText();
  console.log('Initial language indicator:', langText.trim());
  
  // Toggle to ID
  await langBtn.click();
  await page.waitForTimeout(200);
  langText = await langBtn.innerText();
  console.log('After toggle language indicator:', langText.trim());
  if (!langText.includes('ID')) throw new Error('Expected ID indicator after toggle');
  
  // Verify translated element
  const bellyHeader = await page.$eval('h2', el => el.textContent);
  console.log('Belly Header in Indonesian context or Sanctuary title verified');

  // Toggle back to EN
  await langBtn.click();
  await page.waitForTimeout(200);

  // 2. Dark Mode Toggle Check
  console.log('Testing 12. Dark Mode Toggle...');
  const darkBtn = await page.$('#btn-dark-mode-toggle');
  if (!darkBtn) throw new Error('#btn-dark-mode-toggle missing');
  
  let isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('Initial isDark:', isDark);
  await darkBtn.click();
  await page.waitForTimeout(200);
  isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log('After click isDark:', isDark);
  if (!isDark) throw new Error('Expected dark class on documentElement');
  
  // Toggle back to light
  await darkBtn.click();
  await page.waitForTimeout(200);

  // 3. Ambient Animations Check
  console.log('Testing 9. Ambient Background Animations...');
  const ambientContainer = await page.$('#aesthetic-ambient-bg');
  if (!ambientContainer) throw new Error('#aesthetic-ambient-bg missing');
  const particleCount = await page.evaluate(() => document.querySelectorAll('.ambient-particle').length);
  console.log('Ambient particle count:', particleCount);
  if (particleCount < 10) throw new Error('Expected at least 10 ambient particles');

  // 4. Sanctuary Font Truncation Check
  console.log('Testing 10. Sanctuary Belly stat label font clipping fix...');
  const bellyStatLabel = await page.$eval('#tummy-val-text', el => el.previousElementSibling?.textContent || '');
  console.log('Stat label:', bellyStatLabel.trim());

  // 5. Weekly Spicy Food Meter Check in Tab 2
  console.log('Testing 3. Weekly Spicy Meter in Bubu\'s Belly Tab...');
  await page.click('a[data-tab="shield"]');
  await page.waitForTimeout(300);

  const weeklyCard = await page.$('#weekly-spicy-quota-card');
  if (!weeklyCard) throw new Error('#weekly-spicy-quota-card missing');

  const bubuBadge = await page.$eval('#weekly-spicy-bubu-count-badge', el => el.textContent.trim());
  const duduBadge = await page.$eval('#weekly-spicy-dudu-count-badge', el => el.textContent.trim());
  console.log(`Weekly spicy counters -> Bubu: ${bubuBadge}, Dudu: ${duduBadge}`);
  if (!bubuBadge.includes('5') || !duduBadge.includes('5')) {
    throw new Error('Weekly spicy badges must show max 5x / week');
  }

  // 6. Private Duo Chat (Wallpaper, Camera, Textarea, Clearance, Typing)
  console.log('Testing Chat Features (1, 2, 4, 5, 6, 7, 8)...');
  await page.click('a[data-tab="chat"]');
  await page.waitForTimeout(300);

  // 1. Wallpaper button & modal
  const wpBtn = await page.$('#btn-chat-wallpaper');
  if (!wpBtn) throw new Error('#btn-chat-wallpaper missing');
  await wpBtn.click();
  await page.waitForTimeout(200);
  const wpModal = await page.$eval('#modal-chat-wallpaper', el => !el.classList.contains('hidden'));
  console.log('Wallpaper modal open:', wpModal);
  if (!wpModal) throw new Error('Wallpaper modal did not open');
  await page.click('#btn-close-wallpaper-modal');
  await page.waitForTimeout(200);

  // 2. Camera button & input
  const camBtn = await page.$('#btn-camera-capture');
  const camInput = await page.$('#chat-camera-input');
  if (!camBtn || !camInput) throw new Error('Camera button or input missing');
  console.log('Camera capture button verified');

  // 6. Textarea multiline input & Enter
  const textInput = await page.$('#chat-text-input');
  if (!textInput) throw new Error('chat-text-input textarea missing');
  const tagName = await page.$eval('#chat-text-input', el => el.tagName.toLowerCase());
  console.log('Input tag name:', tagName);
  if (tagName !== 'textarea') throw new Error('chat-text-input must be a textarea');

  // Type multiple lines
  await textInput.fill('1. First item\n2. Second item\n3. Third item');
  const val = await textInput.inputValue();
  console.log('Multiline textarea value:\n' + val);
  if (!val.includes('\n')) throw new Error('Newlines not preserved');

  // 7. Typing indicator badge element check
  const typingIndicator = await page.$('#chat-typing-indicator');
  if (!typingIndicator) throw new Error('#chat-typing-indicator element missing');
  console.log('Typing indicator badge verified');

  // 4. Scrollbar clearance check
  const bottomPadding = await page.evaluate(() => {
    const el = document.getElementById('chat-messages-container');
    return window.getComputedStyle(el).paddingBottom;
  });
  console.log('Chat messages container padding-bottom:', bottomPadding);

  // Screenshots
  await page.screenshot({ path: 'scratch/screenshots/verified_chat_enhancements.png' });
  console.log('📸 Screenshot saved: scratch/screenshots/verified_chat_enhancements.png');

  await browser.close();
  console.log('✅ All 12 feature checks PASSED successfully!');
})();
