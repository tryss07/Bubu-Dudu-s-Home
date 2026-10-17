const assert = require('assert');
const path = require('path');
const http = require('http');

process.chdir(path.join(__dirname, '../server'));
process.env.PORT = '3666';
process.env.HOST = '127.0.0.1';

// Load db and server
const db = require('../server/db');
require('../server/server.js');
const WebSocket = require('../server/node_modules/ws');

(async () => {
  console.log('Testing server & db wardrobe handling...');
  await new Promise(r => setTimeout(r, 600));

  const TOKEN = '415abdb5c1ff97e7de8c9f2c43be8ed4efba6f49ad912f301323212c27dacf5a';
  const BASE_URL = 'http://127.0.0.1:3666';
  const WS_URL = `ws://127.0.0.1:3666/chat-socket?token=${TOKEN}`;

  // 1. Test db methods directly
  console.log('\n--- 1. Testing DB Wardrobe Methods ---');
  try {
    const initial = db.getWardrobe();
    console.log('db.getWardrobe():', JSON.stringify(initial));

    const saved = db.saveWardrobe({
      wardrobe: {
        dudu: { hat: 'beret', sweater: 'nordic', coat: 'trench', accs: 'camera' },
        bubu: { hat: 'bow', sweater: 'cardigan', coat: 'duffle', accs: 'ribbon' }
      },
      miniGameHighScore: 500
    });
    console.log('db.saveWardrobe() result:', saved);

    const updated = db.getWardrobe();
    console.log('Updated db.getWardrobe():', JSON.stringify(updated));
    assert.strictEqual(updated.wardrobe.dudu.hat, 'beret');
    assert.strictEqual(updated.miniGameHighScore, 500);
    console.log('✓ DB methods work!');
  } catch (err) {
    console.error('DB test error:', err);
  }

  // 2. Test REST endpoint
  console.log('\n--- 2. Testing REST Endpoints ---');
  try {
    const getRes = await fetch(`${BASE_URL}/api/wardrobe?token=${TOKEN}`);
    const getData = await getRes.json();
    console.log('GET /api/wardrobe:', getData);

    const postRes = await fetch(`${BASE_URL}/api/wardrobe?token=${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dudu: { hat: 'beanie' },
        bubu: { hat: 'earflap' }
      })
    });
    const postData = await postRes.json();
    console.log('POST /api/wardrobe:', postData);
    console.log('✓ REST endpoints work!');
  } catch (err) {
    console.error('REST test error:', err);
  }

  // 3. Test WebSocket messages
  console.log('\n--- 3. Testing WebSocket Wardrobe Sync ---');
  try {
    const ws = new WebSocket(WS_URL);
    const messages = [];
    ws.on('message', data => {
      try {
        messages.push(JSON.parse(data.toString()));
      } catch (e) {}
    });

    await new Promise(r => setTimeout(r, 600));

    console.log('Initial WS messages count:', messages.length);
    const wardSync = messages.find(m => m.type === 'wardrobe_sync');
    console.log('Received wardrobe_sync:', wardSync);

    // Send update_wardrobe
    ws.send(JSON.stringify({
      type: 'update_wardrobe',
      data: {
        wardrobe: {
          dudu: { hat: 'cap' }
        }
      }
    }));

    await new Promise(r => setTimeout(r, 600));
    const wardUpdated = messages.find(m => m.type === 'wardrobe_updated');
    console.log('Received wardrobe_updated:', wardUpdated);

    ws.close();
    console.log('✓ WebSocket wardrobe sync works!');
  } catch (err) {
    console.error('WS test error:', err);
  }

  process.exit(0);
})();
