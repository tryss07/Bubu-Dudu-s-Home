const assert = require('assert');
const path = require('path');
const http = require('http');

// Change working directory to server for proper relative paths
process.chdir(path.join(__dirname, '../server'));
process.env.PORT = '3555';
process.env.HOST = '127.0.0.1';

// Require server and db
const db = require('../server/db');
require('../server/server.js');
const WebSocket = require('../server/node_modules/ws');

async function runTests() {
  console.log('🧪 Starting Full Feature Synchronization Test Suite...');

  // Wait 600ms for server to start listening
  await new Promise(r => setTimeout(r, 600));

  const TOKEN = process.env.RELAY_AUTH_TOKEN || '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
  const BASE_URL = 'http://127.0.0.1:3555';
  const WS_URL = `ws://127.0.0.1:3555/chat-socket?token=${TOKEN}`;

  const authFetch = (url, options = {}) => fetch(url, {
    ...options,
    headers: { ...options.headers, 'x-relay-token': TOKEN }
  });

  // Verify Layer 1 Security: Unauthorized access without token is rejected
  const unauthRes = await fetch(`${BASE_URL}/api/calendar`);
  assert.strictEqual(unauthRes.status, 401, 'Unauthorized request should be 401');
  console.log('✓ Layer 1 Security verified: Unauthorized request returned 401');

  // =========================================================================
  // 1. HTTP REST ENDPOINTS VERIFICATION
  // =========================================================================
  console.log('\n--- 1. Testing REST Endpoints ---');

  // Calendar
  const calRes = await authFetch(`${BASE_URL}/api/calendar`);
  const calData = await calRes.json();
  assert.strictEqual(calData.status, 'ok');
  assert.ok(Array.isArray(calData.events) && calData.events.length >= 3);
  console.log(`✓ GET /api/calendar: ${calData.events.length} events returned`);

  // Planner
  const planRes = await authFetch(`${BASE_URL}/api/planner`);
  const planData = await planRes.json();
  assert.strictEqual(planData.status, 'ok');
  assert.ok(Array.isArray(planData.items) && planData.items.length >= 5);
  console.log(`✓ GET /api/planner: ${planData.items.length} items returned`);

  // Notes
  const notesRes = await authFetch(`${BASE_URL}/api/notes`);
  const notesData = await notesRes.json();
  assert.strictEqual(notesData.status, 'ok');
  assert.ok(Array.isArray(notesData.notes) && notesData.notes.length >= 3);
  console.log(`✓ GET /api/notes: ${notesData.notes.length} notes returned`);

  // Memories
  const memRes = await authFetch(`${BASE_URL}/api/memories`);
  const memData = await memRes.json();
  assert.strictEqual(memData.status, 'ok');
  assert.ok(Array.isArray(memData.polaroids) && memData.polaroids.length >= 4);
  assert.ok(Array.isArray(memData.milestones) && memData.milestones.length >= 3);
  console.log(`✓ GET /api/memories: ${memData.polaroids.length} polaroids, ${memData.milestones.length} milestones`);

  // Couple Space
  const csRes = await authFetch(`${BASE_URL}/api/couple-space`);
  const csData = await csRes.json();
  assert.strictEqual(csData.status, 'ok');
  assert.strictEqual(csData.data.anniversaryDate, '2025-11-04');
  console.log(`✓ GET /api/couple-space: anniversary=${csData.data.anniversaryDate}, loveBattery=${csData.data.loveBattery}`);

  // Wardrobe / Couple Closet
  const wardRes = await authFetch(`${BASE_URL}/api/wardrobe`);
  const wardData = await wardRes.json();
  assert.strictEqual(wardData.status, 'ok');
  assert.ok(wardData.data && wardData.data.wardrobe && wardData.data.wardrobe.dudu && wardData.data.wardrobe.bubu);
  console.log(`✓ GET /api/wardrobe: dudu.hat=${wardData.data.wardrobe.dudu.hat}, bubu.hat=${wardData.data.wardrobe.bubu.hat}, highScore=${wardData.data.miniGameHighScore}`);

  // Test POST & DELETE via REST for Calendar
  const postCal = await authFetch(`${BASE_URL}/api/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'rest_cal_1', date: 15, month: 10, year: 2026, title: 'REST Test Dinner' })
  });
  const postCalJson = await postCal.json();
  assert.strictEqual(postCalJson.status, 'ok');
  assert.strictEqual(postCalJson.event.title, 'REST Test Dinner');

  const delCal = await authFetch(`${BASE_URL}/api/calendar/rest_cal_1`, { method: 'DELETE' });
  const delCalJson = await delCal.json();
  assert.strictEqual(delCalJson.status, 'ok');
  console.log('✓ POST & DELETE /api/calendar verified');

  // =========================================================================
  // 2. WEBSOCKET REAL-TIME SYNC BETWEEN DUDU & BUBU
  // =========================================================================
  console.log('\n--- 2. Testing Real-Time WebSocket Sync Between 2 Clients ---');

  const clientDudu = new WebSocket(WS_URL);
  const clientBubu = new WebSocket(WS_URL);

  const duduReceived = [];
  const bubuReceived = [];

  clientDudu.on('message', data => {
    try { duduReceived.push(JSON.parse(data.toString())); } catch (e) {}
  });

  clientBubu.on('message', data => {
    try { bubuReceived.push(JSON.parse(data.toString())); } catch (e) {}
  });

  // Wait for connections and initial sync packets
  await new Promise(r => setTimeout(r, 600));

  // Verify initial sync packets received
  const duduCalSync = duduReceived.find(m => m.type === 'calendar_sync');
  const duduPlannerSync = duduReceived.find(m => m.type === 'planner_sync');
  const duduNotesSync = duduReceived.find(m => m.type === 'notes_sync');
  const duduMemoriesSync = duduReceived.find(m => m.type === 'memories_sync');
  const duduCoupleSync = duduReceived.find(m => m.type === 'couple_space_sync');
  const duduWardrobeSync = duduReceived.find(m => m.type === 'wardrobe_sync');

  assert.ok(duduCalSync, 'Dudu should receive calendar_sync on connect');
  assert.ok(duduPlannerSync, 'Dudu should receive planner_sync on connect');
  assert.ok(duduNotesSync, 'Dudu should receive notes_sync on connect');
  assert.ok(duduMemoriesSync, 'Dudu should receive memories_sync on connect');
  assert.ok(duduCoupleSync, 'Dudu should receive couple_space_sync on connect');
  assert.ok(duduWardrobeSync, 'Dudu should receive wardrobe_sync on connect');
  console.log('✓ Initial connection sync packets verified for all 6 domains (including Wardrobe)');

  // Test A: Dudu creates calendar event -> Bubu receives
  clientDudu.send(JSON.stringify({
    type: 'save_calendar_event',
    event: { id: 'ws_cal_1', date: 18, month: 10, year: 2026, title: 'Sunset Walk by the Lake 🌅' }
  }));
  await new Promise(r => setTimeout(r, 200));

  const bubuGotCal = bubuReceived.find(m => m.type === 'calendar_event_saved' && m.event.id === 'ws_cal_1');
  assert.ok(bubuGotCal, 'Bubu must receive calendar_event_saved');
  console.log(`✓ Calendar real-time sync verified: "${bubuGotCal.event.title}"`);

  // Test B: Bubu creates planner item -> Dudu receives
  clientBubu.send(JSON.stringify({
    type: 'save_planner_item',
    item: { id: 'ws_plan_1', title: 'Make Strawberry Parfait 🍓', completed: false, category: 'indoor' }
  }));
  await new Promise(r => setTimeout(r, 200));

  const duduGotPlan = duduReceived.find(m => m.type === 'planner_item_saved' && m.item.id === 'ws_plan_1');
  assert.ok(duduGotPlan, 'Dudu must receive planner_item_saved');
  console.log(`✓ Planner real-time sync verified: "${duduGotPlan.item.title}"`);

  // Test C: Dudu writes love note -> Bubu receives
  clientDudu.send(JSON.stringify({
    type: 'save_note',
    note: { id: 'ws_note_1', style: 'envelope', body: 'Missing you already, Bubu! 💌', sender: 'Dudu 🐻', senderRole: 'dudu' }
  }));
  await new Promise(r => setTimeout(r, 200));

  const bubuGotNote = bubuReceived.find(m => m.type === 'note_saved' && m.note.id === 'ws_note_1');
  assert.ok(bubuGotNote, 'Bubu must receive note_saved');
  console.log(`✓ Love note real-time sync verified: "${bubuGotNote.note.body}"`);

  // Test D: Bubu adds polaroid -> Dudu receives
  clientBubu.send(JSON.stringify({
    type: 'save_polaroid',
    polaroid: { id: 'ws_pol_1', title: 'Coffee Time', date: 'Today', image: 'assets/mockup_art/polaroid_cafe.png' }
  }));
  await new Promise(r => setTimeout(r, 200));

  const duduGotPol = duduReceived.find(m => m.type === 'polaroid_saved' && m.polaroid.id === 'ws_pol_1');
  assert.ok(duduGotPol, 'Dudu must receive polaroid_saved');
  console.log(`✓ Memory Polaroid real-time sync verified: "${duduGotPol.polaroid.title}"`);

  // Test E: Dudu updates couple status & love battery -> Bubu receives
  clientDudu.send(JSON.stringify({
    type: 'update_couple_space',
    data: { statuses: { dudu: 'Planning dinner 🍝' }, loveBattery: 95 }
  }));
  await new Promise(r => setTimeout(r, 200));

  const bubuGotCouple = bubuReceived.find(m => m.type === 'couple_space_updated');
  assert.ok(bubuGotCouple, 'Bubu must receive couple_space_updated');
  assert.strictEqual(bubuGotCouple.data.statuses.dudu, 'Planning dinner 🍝');
  console.log(`✓ Couple space real-time sync verified: status="${bubuGotCouple.data.statuses.dudu}"`);

  // Test F: Dudu updates Couple Closet outfit & Mini-Game High Score -> Bubu receives in real time
  clientDudu.send(JSON.stringify({
    type: 'update_wardrobe',
    data: {
      wardrobe: {
        dudu: { hat: 'beret', sweater: 'hoodie', coat: 'trench', accs: 'scarf' },
        bubu: { hat: 'beret', sweater: 'hoodie', coat: 'trench', accs: 'satchel' }
      },
      miniGameHighScore: 680,
      updatedBy: 'dudu'
    }
  }));
  await new Promise(r => setTimeout(r, 200));

  const bubuGotWardrobe = bubuReceived.find(m => m.type === 'wardrobe_updated');
  assert.ok(bubuGotWardrobe, 'Bubu must receive wardrobe_updated');
  assert.strictEqual(bubuGotWardrobe.data.wardrobe.dudu.hat, 'beret');
  assert.strictEqual(bubuGotWardrobe.data.wardrobe.bubu.accs, 'satchel');
  assert.strictEqual(bubuGotWardrobe.data.miniGameHighScore, 680);
  console.log(`✓ Wardrobe real-time sync verified: dudu.hat="${bubuGotWardrobe.data.wardrobe.dudu.hat}", highScore=${bubuGotWardrobe.data.miniGameHighScore}`);

  // Restore default wardrobe state after test
  db.saveWardrobe({
    wardrobe: {
      dudu: { hat: 'beanie', sweater: 'cable', coat: 'duffle', accs: 'scarf' },
      bubu: { hat: 'earflap', sweater: 'cream', coat: 'winter', accs: 'pompom' }
    },
    miniGameHighScore: 420
  });

  // Clean up test items
  db.deleteCalendarEvent('ws_cal_1');
  db.deletePlannerItem('ws_plan_1');
  db.deleteNote('ws_note_1');
  db.deletePolaroid('ws_pol_1');

  clientDudu.close();
  clientBubu.close();

  console.log('\n🎉 ALL SYNCHRONIZATION TEST SUITES PASSED FLAWLESSLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
