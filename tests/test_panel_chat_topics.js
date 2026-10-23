const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, '..', reqPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise(resolve => {
    server.listen(PORT, () => resolve(server));
  });
}

(async () => {
  const server = await startServer();
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 } // Mobile iPhone SE viewport
  });
  const page = await context.newPage();

  try {
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // 1. Verify Header Sync Indicator is HIDDEN
    console.log('Test 1: Header sync indicator hidden...');
    const syncStatusVisible = await page.$eval('#header-sync-status', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && !el.classList.contains('hidden');
    });
    if (syncStatusVisible) {
      throw new Error('FAIL: #header-sync-status must be hidden per user request!');
    }
    console.log('✅ Passed: Header sync indicator is hidden.');

    // 2. Verify Bottom Dock on Mobile & More Arrow Up Menu
    console.log('Test 2: Mobile bottom dock & More Arrow Up menu...');
    const isMoreBtnVisible = await page.$eval('#btn-bottom-nav-more', el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none';
    });
    if (!isMoreBtnVisible) {
      throw new Error('FAIL: #btn-bottom-nav-more should be visible on narrow mobile screen (375px)!');
    }

    const secondaryHidden = await page.$eval('.bottom-nav-secondary', el => {
      const style = window.getComputedStyle(el);
      return style.display === 'none';
    });
    if (!secondaryHidden) {
      throw new Error('FAIL: .bottom-nav-secondary should be hidden in bottom bar on narrow mobile screen!');
    }

    // Click More button
    await page.click('#btn-bottom-nav-more');
    await page.waitForTimeout(200);

    const isExpandedVisible = await page.$eval('#bottom-nav-expanded-panel', el => !el.classList.contains('hidden'));
    const isDockExpanded = await page.$eval('#bottom-nav-bar', el => el.classList.contains('dock-expanded'));
    if (!isExpandedVisible || !isDockExpanded) {
      throw new Error('FAIL: #bottom-nav-bar should expand and #bottom-nav-expanded-panel open when clicking #btn-bottom-nav-more!');
    }
    console.log('✅ Passed: #bottom-nav-bar expanded up with secondary tabs.');

    // Click Calendar in expanded panel
    await page.click('#bottom-nav-expanded-panel a[data-tab="calendar"]');
    await page.waitForTimeout(300);

    const isCalendarTabVisible = await page.$eval('#tab-calendar', el => !el.classList.contains('hidden'));
    if (!isCalendarTabVisible) {
      throw new Error('FAIL: Switching to Calendar tab from expanded dock failed!');
    }
    const isExpandedClosed = await page.$eval('#bottom-nav-expanded-panel', el => el.classList.contains('hidden'));
    if (!isExpandedClosed) {
      throw new Error('FAIL: #bottom-nav-expanded-panel should close after tab selection!');
    }
    console.log('✅ Passed: Switched to Calendar and expanded dock closed.');

    // 3. Switch to Chat Tab & Test Chat Screen Space Efficiency & Input Tap Collapse
    console.log('Test 3: Chat screen layout & space efficiency...');
    await page.click('a[data-tab="chat"]');
    await page.waitForTimeout(300);

    const isChatVisible = await page.$eval('#tab-chat', el => !el.classList.contains('hidden'));
    if (!isChatVisible) {
      throw new Error('FAIL: #tab-chat should be visible!');
    }

    // Test Desktop Browser Centering
    console.log('Testing desktop browser centering of bottom navigation bar...');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);

    const desktopCentering = await page.$eval('#bottom-nav-bar', el => {
      const rect = el.getBoundingClientRect();
      const expectedLeft = (window.innerWidth - rect.width) / 2;
      return Math.abs(rect.left - expectedLeft) <= 5;
    });
    console.log('Bottom nav perfectly centered on desktop (1200px):', desktopCentering);
    if (!desktopCentering) {
      throw new Error('FAIL: Bottom nav is not centered in desktop browser!');
    }
    console.log('✅ Passed: Bottom nav bar is centered in desktop browser mode.');

    // Reset viewport back to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Verify chat messages container occupies generous height and has NO scrollbar
    const chatFeedHeight = await page.$eval('#chat-messages-container', el => el.clientHeight);
    console.log(`Chat messages container clientHeight on mobile: ${chatFeedHeight}px`);
    if (chatFeedHeight < 300) {
      throw new Error(`FAIL: Chat feed is too cramped (${chatFeedHeight}px)! Expected full space utilization.`);
    }

    const hasNoScrollbar = await page.$eval('#chat-messages-container', el => {
      // scrollWidth <= clientWidth and offsetWidth - clientWidth <= 1
      return Math.abs(el.offsetWidth - el.clientWidth) <= 2;
    });
    console.log('Chat messages container has no visible scrollbar:', hasNoScrollbar);
    if (!hasNoScrollbar) {
      throw new Error('FAIL: Chat messages container still has visible vertical scrollbar!');
    }
    console.log('✅ Passed: Chat section scrollbar removed cleanly.');

    // Verify chat input bar does NOT overlap with bottom nav bar
    const chatInputBox = await page.locator('#chat-input-bar-container').boundingBox();
    const bottomNavBox = await page.locator('#bottom-nav-bar').boundingBox();
    console.log(`Chat input bottom: ${chatInputBox.y + chatInputBox.height}, Bottom nav top: ${bottomNavBox.y}`);
    if (chatInputBox.y + chatInputBox.height > bottomNavBox.y) {
      throw new Error(`FAIL: Bottom nav overlaps chat input box! Input bottom: ${chatInputBox.y + chatInputBox.height}, Nav top: ${bottomNavBox.y}`);
    }
    console.log('✅ Passed: Chat input box sits cleanly above bottom navigation panel (no overlap).');

    // Tap/Focus message input box
    console.log('Testing tap on message input box collapses bottom button panel...');
    await page.focus('#chat-text-input');
    await page.waitForTimeout(200);

    const isNavCollapsed = await page.$eval('#bottom-nav-bar', el => el.classList.contains('nav-collapsed'));
    if (!isNavCollapsed) {
      throw new Error('FAIL: #bottom-nav-bar must have .nav-collapsed when #chat-text-input is focused!');
    }
    console.log('✅ Passed: Bottom nav collapsed upon tapping message box.');

    // Click chat messages container to blur/dismiss
    await page.click('#chat-messages-container');
    await page.waitForTimeout(300);

    const isNavRestored = await page.$eval('#bottom-nav-bar', el => !el.classList.contains('nav-collapsed'));
    if (!isNavRestored) {
      throw new Error('FAIL: #bottom-nav-bar should restore when clicking messages feed!');
    }
    console.log('✅ Passed: Bottom nav restored upon blurring input.');

    // 4. Test Topic Bookmarks Limited to 3 & "All Topics" Button
    console.log('Test 4: Topic bookmarks limited to 3 & "All Topics" button...');

    // Setup test topics for testing bookmarks, search, rename and unread
    await page.evaluate(async () => {
      await window.DuduChatStorage.saveSession({
        id: 'topic_banter',
        title: 'Daily Banter',
        emoji: '💬',
        isPinned: true,
        isArchived: false,
        createdAt: Date.now(),
        lastActivity: Date.now()
      });
      await window.DuduChatStorage.saveSession({
        id: 'topic_date_ideas',
        title: 'Date Ideas',
        emoji: '🍱',
        isPinned: false,
        isArchived: false,
        createdAt: Date.now(),
        lastActivity: Date.now() - 3600000
      });
      await window.DuduChatUI?.loadSessions?.();
    });
    await page.waitForTimeout(300);

    const chipCount = await page.$$eval('#chat-sessions-list .chat-session-chip', chips => chips.length);
    console.log(`Rendered topic chips count: ${chipCount} (max 3 allowed)`);
    if (chipCount > 3) {
      throw new Error(`FAIL: Expected at most 3 topic bookmark chips, got ${chipCount}!`);
    }

    await page.click('#btn-open-all-topics');
    await page.waitForSelector('#modal-all-topics:not(.hidden)', { timeout: 3000 });
    console.log('✅ Passed: "All Topics" modal opened successfully.');

    // Search topics
    await page.fill('#input-search-topics', 'Date Ideas');
    await page.waitForTimeout(200);
    const searchMatch = await page.$eval('#all-topics-list-container', el => el.textContent.includes('Date Ideas'));
    if (!searchMatch) {
      throw new Error('FAIL: Search in All Topics modal failed to find Date Ideas!');
    }

    // Close All Topics modal
    await page.click('#btn-close-all-topics');
    await page.waitForSelector('#modal-all-topics', { state: 'hidden', timeout: 3000 });
    console.log('✅ Passed: "All Topics" modal closed cleanly.');

    // 5. Test Long Hold on Topic (Delete or Rename Menu)
    console.log('Test 5: Long hold on topic chip opens Topic Options menu...');
    const firstChip = await page.waitForSelector('.chat-session-chip');
    await firstChip.dispatchEvent('pointerdown', { button: 0, clientX: 150, clientY: 150 });
    await page.waitForTimeout(550);
    await firstChip.dispatchEvent('pointerup', { button: 0, clientX: 150, clientY: 150 });

    await page.waitForSelector('#modal-topic-actions:not(.hidden)', { timeout: 3000 });
    console.log('✅ Passed: #modal-topic-actions opened on long hold!');

    // Test Rename Button from Topic Options Modal
    console.log('Testing Rename topic workflow...');
    await page.click('#btn-topic-action-rename');
    await page.waitForSelector('#modal-rename-topic:not(.hidden)', { timeout: 3000 });

    await page.fill('#input-rename-topic-title', 'Banter & Giggles');
    await page.click('#form-rename-topic button[type="submit"]');
    await page.waitForSelector('#modal-rename-topic', { state: 'hidden', timeout: 3000 });
    await page.waitForTimeout(300);

    const renamedChipText = await page.$eval('#chat-sessions-list', el => el.textContent);
    if (!renamedChipText.includes('Banter & Giggles')) {
      throw new Error(`FAIL: Topic was not renamed to "Banter & Giggles"! Got: ${renamedChipText}`);
    }
    console.log('✅ Passed: Topic successfully renamed to "Banter & Giggles".');

    // 6. Test Topic-Specific New Chat Indicator
    console.log('Test 6: Topic-specific new chat indicator...');
    await page.evaluate(async () => {
      // Find a session that is NOT active and mark it unread
      const sessions = await window.DuduChatStorage.getSessions();
      const other = sessions.find(s => s.id !== 'daily_banter') || sessions[1];
      if (other) {
        // Trigger unread mark
        window.markSessionUnreadTest?.(other.id);
      }
    });

    // Alternatively, send synthetic message via storage/socket or call markSessionUnread
    const targetSessionId = await page.evaluate(async () => {
      const sessions = await window.DuduChatStorage.getSessions();
      const target = sessions.find(s => !s.title.includes('Banter & Giggles')) || sessions[0];
      // Simulate partner message in that topic
      const fakeMsg = {
        id: 'msg_unread_test_1',
        sessionId: target.id,
        sender: 'bubu',
        content: 'Hey sweet bear! Look at this ❤️',
        type: 'text',
        timestamp: Date.now(),
        status: 'received'
      };
      await window.DuduChatStorage.saveMessage(fakeMsg);
      // Directly dispatch message event through socket listeners
      window.dispatchEvent(new CustomEvent('dudu-test-unread', { detail: fakeMsg }));
      return target.id;
    });

    await page.evaluate((sid) => {
      // Mark session unread directly
      localStorage.setItem('dudu_unread_topics', JSON.stringify([sid]));
      location.hash = '#chat';
    }, targetSessionId);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.click('a[data-tab="chat"]');
    await page.waitForTimeout(300);

    // Verify chip has unread indicator
    const hasUnreadPill = await page.$eval('#chat-sessions-list', el => {
      return el.querySelector('.chat-session-chip .bg-rose-500') !== null || el.textContent.includes('new');
    });
    console.log('Topic specific new chat indicator visible:', hasUnreadPill);
    if (!hasUnreadPill) {
      throw new Error('FAIL: Topic-specific new chat indicator not displayed on unread session chip!');
    }
    console.log('✅ Passed: Topic-specific new chat indicator displayed prominently!');

    // Click on the unread chip to clear indicator
    const unreadChip = await page.waitForSelector('.chat-session-chip:has(.bg-rose-500)');
    await unreadChip.click();
    await page.waitForTimeout(300);

    // Verify unread indicator is cleared on that active chip
    const activeChipUnread = await page.$eval('.chat-session-chip.bg-secondary', el => {
      return el.querySelector('.bg-rose-500') !== null;
    });
    if (activeChipUnread) {
      throw new Error('FAIL: Active chip should clear its unread badge once opened!');
    }
    console.log('✅ Passed: Unread indicator cleared on active topic chip.');

    console.log('\n🎉 ALL 6 REQUIREMENTS VERIFIED 100% SUCCESSFULLY!\n');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error('❌ Playwright Test Failed:', err);
  process.exit(1);
});
