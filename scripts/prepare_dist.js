/**
 * Prepare lean distribution bundle for Capacitor Android APK
 * Bundles app code, UI assets, closet, and a curated core sticker set (~15MB).
 * All remaining 1,300+ stickers load on-demand from chat server / Cloudflare tunnel.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Setup global window to load sticker taxonomy
global.window = global;
require(path.join(ROOT, 'js/stickers_catalog.js'));

const catalog = global.DUDU_STICKERS_CATALOG;
const taxonomy = catalog.TAXONOMY;

// Curate core sticker bundle (top 4 per emotion cluster + signature fallbacks)
const coreStickers = new Set([
  'STK-20260307-WA0001.webp',
  'STK-20260307-WA0004.webp',
  'STK-20260308-WA0019.webp',
  'STK-20260308-WA0037.webp',
  'STK-20260308-WA0043.webp',
  'STK-20260308-WA0066.webp',
  'STK-20260317-WA0027.webp',
  'STK-20260317-WA0031.webp',
  'STK-20260322-WA0027.webp',
  'STK-20260204-WA0113.webp',
  'STK-20260925-WA0133.webp',
  'STK-20260926-WA0056.webp',
  'STK-20230324-WA0019.webp'
]);

for (const cat in taxonomy) {
  for (const cluster in taxonomy[cat]) {
    const list = taxonomy[cat][cluster] || [];
    list.slice(0, 4).forEach(f => {
      coreStickers.add(catalog.getCanonical(f));
    });
  }
}

console.log(`📦 Identified ${coreStickers.size} core stickers for APK bundle.`);

// 1. Wipe & recreate dist/
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 2. Copy root files and static web directories
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));
fs.cpSync(path.join(ROOT, 'css'), path.join(DIST, 'css'), { recursive: true });
fs.cpSync(path.join(ROOT, 'js'), path.join(DIST, 'js'), { recursive: true });
fs.cpSync(path.join(ROOT, 'closet'), path.join(DIST, 'closet'), { recursive: true });

// 3. Copy assets (excluding full stickers directories)
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
for (const entry of fs.readdirSync(path.join(ROOT, 'assets'))) {
  if (entry.startsWith('stickers_') || entry === 'closet') continue;
  fs.cpSync(path.join(ROOT, 'assets', entry), path.join(DIST, 'assets', entry), { recursive: true });
}

// 4. Create sticker subfolders in dist and copy only core bundle
fs.mkdirSync(path.join(DIST, 'assets', 'stickers_dudu'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets', 'stickers_bubu'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets', 'stickers_couple'), { recursive: true });

let copiedCount = 0;
let totalBytes = 0;

for (const f of coreStickers) {
  const canon = catalog.getCanonical(f);
  const rel = catalog.resolveStickerPath(canon);
  const src = path.join(ROOT, rel);
  const dest = path.join(DIST, rel);

  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copiedCount++;
    totalBytes += fs.statSync(src).size;
  }
}

console.log(`✅ Copied ${copiedCount} core stickers (${(totalBytes / (1024 * 1024)).toFixed(2)} MB).`);
console.log(`🚀 dist/ prepared cleanly! Ready for Capacitor sync.`);
