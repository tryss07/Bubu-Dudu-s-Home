const { chromium } = require('playwright');

(async () => {
  console.log('[Playwright Audit] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[PAGEERROR] ${err.toString()}`);
  });

  console.log('[Playwright Audit] Navigating to http://localhost:3000/index.html...');
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const socketStatus = await page.evaluate(() => {
    return {
      hasSocket: !!window.DuduChatSocket,
      socketStatus: window.DuduChatSocket?.getStatus?.(),
      hasMockup: !!window.DuduMockup,
      appDataNotesCount: window.DuduMockup?.appData?.notes?.length,
      appDataCalendarCount: window.DuduMockup?.appData?.calendarEvents?.length,
      appDataBucketCount: window.DuduMockup?.appData?.bucketList?.length,
      appDataPolaroidCount: window.DuduMockup?.appData?.polaroids?.length,
      userRole: window.DuduMockup?.getUserRole?.()
    };
  });

  console.log('[Playwright Audit] Page Evaluated:', JSON.stringify(socketStatus, null, 2));

  console.log('\n--- Console Logs ---');
  consoleLogs.slice(-20).forEach(l => console.log(l));

  console.log('\n--- Console Errors ---');
  if (consoleErrors.length === 0) {
    console.log('Zero console errors!');
  } else {
    consoleErrors.forEach(e => console.error(e));
  }

  await browser.close();
})();
