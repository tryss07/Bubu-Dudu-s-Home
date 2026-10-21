/**
 * Comprehensive Test Runner for Dudu Companion & Sticker Centre
 */
const { spawnSync } = require('child_process');
const path = require('path');

const testSuites = [
  'tests/test_music_panel.js',
  'tests/test_sticker_centre_and_upload.js',
  'tests/test_sticker_suggestions_and_favs.js',
  'tests/test_bilingual_and_fresh_defaults.js',
  'tests/test_sticker_click_modal.js'
];

console.log('🧪 Running Complete Dudu Companion & Sticker Centre Test Suite...\n');

let allPassed = true;

for (const testFile of testSuites) {
  console.log(`====================================================`);
  console.log(`▶ Executing: ${testFile}`);
  console.log(`====================================================`);

  const res = spawnSync('node', [testFile], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  if (res.status !== 0) {
    console.error(`❌ Suite failed: ${testFile} (Exit code: ${res.status})`);
    allPassed = false;
    process.exit(res.status || 1);
  }
}

if (allPassed) {
  console.log('\n✨ ALL TEST SUITES PASSED WITH 100% SUCCESS! ✨\n');
  process.exit(0);
}
