const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Testing Sticker Click Action Modal...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(800);

  // 1. Navigate to chat tab
  console.log('Navigating to chat tab...');
  const chatTab = page.locator('a[data-tab="chat"]').first();
  await chatTab.click();
  await page.waitForTimeout(500);

  // 2. Open sticker tray drawer using #btn-toggle-sticker-tray
  console.log('Opening sticker tray...');
  const btnStickerToggle = page.locator('#btn-toggle-sticker-tray');
  await btnStickerToggle.click();
  await page.waitForTimeout(600);

  // 3. Click first sticker in tray
  console.log('Clicking sticker to send...');
  const firstSticker = page.locator('.chat-sticker-select-btn, .chat-gif-stk-btn').first();
  await firstSticker.waitFor({ state: 'visible', timeout: 5000 });
  await firstSticker.click();
  await page.waitForTimeout(800);

  // 4. Locate sent sticker message in chat
  console.log('Finding sent sticker in chat feed...');
  const stickerImg = page.locator('#chat-messages-container img[alt="Sticker"], #chat-messages-container img[alt="Sticker Animasi"]').last();
  await stickerImg.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Sticker rendered in bubble.');

  // 5. Click on the sticker bubble
  console.log('Clicking sticker bubble...');
  await stickerImg.click({ force: true });
  await page.waitForTimeout(500);

  // 6. Verify modal is visible
  const modal = page.locator('#modal-message-actions');
  const isModalVisible = await modal.isVisible();
  console.log('Modal visible:', isModalVisible);
  if (!isModalVisible) throw new Error('Action modal not visible after clicking sticker!');

  // 7. Verify sticker preview is visible and has src
  const previewDiv = page.locator('#msg-action-sticker-preview');
  const isPreviewVisible = await previewDiv.isVisible();
  console.log('Sticker preview visible:', isPreviewVisible);
  if (!isPreviewVisible) throw new Error('Sticker preview container not visible!');

  const previewImg = page.locator('#msg-action-sticker-img');
  const imgSrc = await previewImg.getAttribute('src');
  console.log('Sticker preview img src:', imgSrc);
  if (!imgSrc || !imgSrc.includes('.webp')) {
    throw new Error(`Sticker preview image has invalid src: ${imgSrc}`);
  }

  // 8. Verify compact buttons (Reply, Forward, Delete)
  const stkActions = page.locator('#msg-actions-sticker');
  const isStkActionsVisible = await stkActions.isVisible();
  console.log('Sticker compact actions visible:', isStkActionsVisible);
  if (!isStkActionsVisible) throw new Error('Sticker compact actions bar not visible!');

  const btnReply = page.locator('#btn-stk-action-reply');
  const btnForward = page.locator('#btn-stk-action-forward');
  const btnDelete = page.locator('#btn-stk-action-delete');

  if (!(await btnReply.isVisible())) throw new Error('btn-stk-action-reply not visible!');
  if (!(await btnForward.isVisible())) throw new Error('btn-stk-action-forward not visible!');
  if (!(await btnDelete.isVisible())) throw new Error('btn-stk-action-delete not visible!');

  // 9. Verify normal actions and copy button are hidden
  const normalActions = page.locator('#msg-actions-normal');
  const isNormalActionsVisible = await normalActions.isVisible();
  console.log('Normal actions bar hidden:', !isNormalActionsVisible);
  if (isNormalActionsVisible) throw new Error('Normal actions bar should be hidden for stickers!');

  const normalCopyBtn = page.locator('#btn-action-copy');
  const isCopyVisible = await normalCopyBtn.isVisible();
  console.log('Copy button visible:', isCopyVisible);
  if (isCopyVisible) throw new Error('Copy button should NOT be visible for stickers!');

  // Save screenshot of sticker action modal
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const shotPath = path.join(screenshotDir, 'sticker_actions_modal.png');
  await page.screenshot({ path: shotPath });
  console.log('Screenshot saved to:', shotPath);

  // 10. Test clicking reply on sticker
  console.log('Testing compact Reply button...');
  await btnReply.click();
  await page.waitForTimeout(400);

  const isModalStillVisible = await modal.isVisible();
  console.log('Modal closed after reply:', !isModalStillVisible);
  if (isModalStillVisible) throw new Error('Modal should be closed after clicking reply!');

  const replyBar = page.locator('#chat-reply-bar');
  const isReplyBarVisible = await replyBar.isVisible();
  console.log('Reply bar visible:', isReplyBarVisible);
  if (!isReplyBarVisible) throw new Error('Reply bar should be visible after clicking reply!');

  const replyThumb = page.locator('#chat-reply-thumb');
  const isReplyThumbVisible = await replyThumb.isVisible();
  const replyThumbSrc = await replyThumb.getAttribute('src');
  console.log('Reply sticker thumb visible:', isReplyThumbVisible, 'src:', replyThumbSrc);
  if (!isReplyThumbVisible || !replyThumbSrc) throw new Error('Reply bar must show sticker thumbnail!');

  // Send reply to sticker
  const input = page.locator('#chat-text-input');
  await input.fill('Replying with love to your cute sticker!');
  await page.locator('#btn-send-message').click();
  await page.waitForTimeout(600);
  const quoteStickerImg = page.locator('.reply-quote-jump img').last();
  const hasQuoteImg = await quoteStickerImg.isVisible();
  console.log('Quote sticker image rendered in message bubble:', hasQuoteImg);
  if (!hasQuoteImg) throw new Error('Message quote must display sticker thumbnail!');

  // 11. Send a regular text message and verify normal actions (including Copy) are displayed
  console.log('Sending text message to test normal actions modal...');
  await input.fill('Hello text message test');
  await page.locator('#btn-send-message').click();
  await page.waitForTimeout(600);

  const textBubble = page.locator('.chat-bubble-body:has-text("Hello text message test")').last();
  await textBubble.click();
  await page.waitForTimeout(400);

  const isModalTextVisible = await modal.isVisible();
  console.log('Modal visible for text:', isModalTextVisible);
  const isNormalActionsVisibleForText = await normalActions.isVisible();
  console.log('Normal actions visible for text:', isNormalActionsVisibleForText);
  const isStkActionsVisibleForText = await stkActions.isVisible();
  console.log('Sticker actions hidden for text:', !isStkActionsVisibleForText);
  const isCopyVisibleForText = await normalCopyBtn.isVisible();
  console.log('Copy button visible for text:', isCopyVisibleForText);

  if (!isNormalActionsVisibleForText || !isCopyVisibleForText || isStkActionsVisibleForText) {
    throw new Error('Text message action modal state mismatch!');
  }

  // Close modal
  await page.locator('#btn-close-msg-actions').click();

  console.log('✅ ALL STICKER MODAL TESTS PASSED!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
