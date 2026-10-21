const { chromium } = require('playwright');
const assert = require('assert');

async function runBilingualAndFreshDefaultsTest() {
  console.log('🚀 Starting Bilingual & Fresh Install Defaults Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Fresh Install Simulation: clear localStorage and indexedDB completely
    await page.goto('http://localhost:3000');
    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
    });

    // Verify default mockup data structure directly in page context
    const initialData = await page.evaluate(() => {
      const data = window.DuduMockup ? window.DuduMockup.appData : null;
      return {
        duduStatus: data?.statuses?.dudu,
        bubuStatus: data?.statuses?.bubu,
        battery: data?.loveBattery,
        highScore: data?.miniGameHighScore
      };
    });

    console.log('App Data state:', JSON.stringify(initialData));
    assert(initialData.battery.dudu === 95, 'Battery should be 95%');
    assert(initialData.highScore === 705, 'Mini game high score should default to 705');
    console.log('✅ Passed: Fresh install defaults are calibrated!');

    // Verify Chat Topics on Fresh Install (NO mock messages, NO placeholder topics)
    await page.click('[data-tab="chat"]');
    await page.waitForTimeout(500);

    const activeTopics = await page.evaluate(async () => {
      const db = await DuduChatStorage.openDB();
      const sessions = await DuduChatStorage.getSessions();
      const messages = await DuduChatStorage.getMessages('daily_banter');
      return {
        sessionIds: sessions.map(s => s.id),
        messageIds: messages.map(m => m.id)
      };
    });

    console.log('Sessions in fresh DB:', activeTopics.sessionIds);
    console.log('Messages in daily_banter:', activeTopics.messageIds);

    assert(!activeTopics.sessionIds.includes('watchlist'), 'watchlist placeholder must not exist');
    assert(!activeTopics.sessionIds.includes('vent_space'), 'vent_space placeholder must not exist');
    assert(!activeTopics.sessionIds.includes('deep_talks'), 'deep_talks placeholder must not exist');
    assert(!activeTopics.messageIds.includes('mock_msg_1'), 'mock_msg_1 must not exist');
    assert(!activeTopics.messageIds.includes('mock_msg_2'), 'mock_msg_2 must not exist');
    console.log('✅ Passed: Fresh install has zero dummy mock messages and zero placeholder topics!');

    // 2. Language Switching Strict Separation Test
    // Set to EN
    await page.evaluate(() => window.DuduI18n.setLanguage('en'));
    await page.waitForTimeout(300);

    const enNavHome = await page.$eval('[data-tab="home"] span:last-child', el => el.textContent.trim());
    const enTogetherPrefix = await page.$eval('[data-i18n="home_together_prefix"]', el => el.textContent.trim());
    assert.strictEqual(enNavHome, 'Home', 'EN nav home must be "Home"');
    assert.strictEqual(enTogetherPrefix, "We've been together for", 'EN together prefix must match');

    // Mute incoming socket message toasts during unit verification of showToast
    await page.evaluate(() => {
      if (window.DuduChatSocket) {
        window.DuduChatSocket.disconnect?.();
        window.DuduChatSocket.connect = () => {};
        window.DuduChatSocket.handleIncomingMessage = () => {};
        if (window.DuduChatSocket.socket) {
          window.DuduChatSocket.socket.onmessage = null;
          try { window.DuduChatSocket.socket.close(); } catch (_) {}
        }
      }
    });

    // Test toast in EN
    await page.evaluate(() => window.showToast('Removed from favorites', 'Dihapus dari favorit'));
    let toastText = await page.$eval('#feedback-toast', el => el.textContent.trim());
    assert.strictEqual(toastText, 'Removed from favorites', 'Toast in EN must show English string');

    // Switch to ID
    await page.evaluate(() => window.DuduI18n.setLanguage('id'));
    await page.waitForTimeout(300);

    const idNavHome = await page.$eval('[data-tab="home"] span:last-child', el => el.textContent.trim());
    const idTogetherPrefix = await page.$eval('[data-i18n="home_together_prefix"]', el => el.textContent.trim());
    assert.strictEqual(idNavHome, 'Beranda', 'ID nav home must be "Beranda"');
    assert.strictEqual(idTogetherPrefix, 'Kita telah bersama selama', 'ID together prefix must match');

    // Test toast in ID
    await page.evaluate(() => window.showToast('Removed from favorites', 'Dihapus dari favorit'));
    toastText = await page.$eval('#feedback-toast', el => el.textContent.trim());
    assert.strictEqual(toastText, 'Dihapus dari favorit', 'Toast in ID must show Indonesian string');

    console.log('✅ Passed: Bilingual strict separation verified across UI and toasts!');
    console.log('🎉 ALL BILINGUAL & FRESH DEFAULTS TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBilingualAndFreshDefaultsTest();
