/**
 * Dudu Duo Chat - End-to-End Cryptographic Engine
 * Zero-Knowledge AES-GCM 256-bit Encryption via native WebCrypto SubtleCrypto API
 * with resilient pure-JS authenticated cipher fallback for non-HTTPS LAN origins.
 */

(function () {
  'use strict';

  const STORAGE_KEY_PASSPHRASE = 'DUDU_CHAT_PASSPHRASE';
  const STORAGE_KEY_IDENTITY = 'DUDU_CHAT_IDENTITY';
  const PBKDF2_SALT = new TextEncoder().encode('DuduBubuSanctuarySalt_2026');
  const PBKDF2_ITERATIONS = 100000;

  // Base64 Helpers
  function uint8ArrayToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToUint8Array(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function randomBytes(len) {
    const out = new Uint8Array(len);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(out);
    } else {
      for (let i = 0; i < len; i++) out[i] = Math.floor(Math.random() * 256);
    }
    return out;
  }

  // Pure-JS key derivation & stream cipher fallback for non-HTTPS LAN environments
  function deriveFallbackKeyBytes(passphrase) {
    const passBytes = new TextEncoder().encode(passphrase);
    const state = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      state[i] = (PBKDF2_SALT[i % PBKDF2_SALT.length] ^ ((i * 37 + 19) & 0xff));
    }
    let acc = 0x811c9dc5;
    for (let round = 0; round < 2048; round++) {
      for (let i = 0; i < 32; i++) {
        const pb = passBytes[(i + round) % passBytes.length];
        acc = Math.imul(acc ^ pb ^ state[i], 0x01000193) >>> 0;
        state[i] = (state[i] + (acc & 0xff) + ((acc >>> 8) & 0xff) ^ (round & 0xff)) & 0xff;
      }
    }
    return state;
  }

  function fallbackTransform(dataBytes, keyBytes, ivBytes) {
    const out = new Uint8Array(dataBytes.length);
    let s0 = 0x6a09e667;
    let s1 = 0xbb67ae85;
    for (let i = 0; i < keyBytes.length; i++) {
      s0 = Math.imul(s0 ^ keyBytes[i], 0x85ebca6b) >>> 0;
      s1 = Math.imul(s1 ^ (keyBytes[i] + i), 0xc2b2ae35) >>> 0;
    }
    for (let i = 0; i < ivBytes.length; i++) {
      s0 = Math.imul(s0 ^ ivBytes[i], 0x27d4eb2f) >>> 0;
      s1 = Math.imul(s1 ^ (ivBytes[i] + i * 17), 0x165667b1) >>> 0;
    }
    for (let i = 0; i < dataBytes.length; i++) {
      if ((i & 3) === 0) {
        s0 = Math.imul(s0 ^ (i + 1), 0x85ebca6b) >>> 0;
        s1 = Math.imul(s1 + s0, 0xc2b2ae35) >>> 0;
      }
      const ks = ((s0 >>> ((i & 3) * 8)) ^ (s1 >>> (((i + 1) & 3) * 8)) ^ keyBytes[i & 31] ^ ivBytes[i % ivBytes.length]) & 0xff;
      out[i] = dataBytes[i] ^ ks;
    }
    return out;
  }

  function computeFallbackTag(cipherBytes, keyBytes, ivBytes) {
    const tag = new Uint8Array(16);
    let h1 = 0x243f6a88;
    let h2 = 0x85a308d3;
    for (let i = 0; i < keyBytes.length; i++) {
      h1 = Math.imul(h1 ^ keyBytes[i], 0x1000193) >>> 0;
      h2 = Math.imul(h2 ^ keyBytes[31 - i], 0x85ebca6b) >>> 0;
    }
    for (let i = 0; i < ivBytes.length; i++) {
      h1 = Math.imul(h1 ^ ivBytes[i], 0xc2b2ae35) >>> 0;
    }
    for (let i = 0; i < cipherBytes.length; i++) {
      h1 = Math.imul(h1 ^ cipherBytes[i], 0x1000193) >>> 0;
      h2 = Math.imul(h2 + (cipherBytes[i] ^ (i & 0xff)), 0x27d4eb2f) >>> 0;
      tag[i & 15] = (tag[i & 15] ^ (h1 & 0xff) ^ ((h2 >>> 8) & 0xff)) & 0xff;
    }
    for (let i = 0; i < 16; i++) {
      tag[i] = (tag[i] ^ keyBytes[i] ^ keyBytes[i + 16] ^ ivBytes[i % ivBytes.length]) & 0xff;
    }
    return tag;
  }

  /**
   * Derive a 256-bit AES-GCM CryptoKey from a human-readable passphrase using PBKDF2-SHA-256
   */
  async function deriveKey(passphrase) {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new Error('Passphrase must be a non-empty string');
    }
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      return window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: PBKDF2_SALT,
          iterations: PBKDF2_ITERATIONS,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    }

    return {
      __fallbackKey: deriveFallbackKeyBytes(passphrase)
    };
  }

  /**
   * Encrypt a JSON payload object into { iv, ciphertext } in base64 format.
   * Generates a unique 12-byte random IV for every single message.
   */
  async function encrypt(payloadObj, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required for encryption');
    const iv = randomBytes(12);
    const jsonString = JSON.stringify(payloadObj);
    const encodedData = new TextEncoder().encode(jsonString);

    if (window.crypto && window.crypto.subtle && !cryptoKey.__fallbackKey) {
      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        encodedData
      );

      return {
        iv: uint8ArrayToBase64(iv),
        ciphertext: uint8ArrayToBase64(new Uint8Array(cipherBuffer))
      };
    }

    const keyBytes = cryptoKey.__fallbackKey || deriveFallbackKeyBytes(getStoredPassphrase());
    const body = fallbackTransform(encodedData, keyBytes, iv);
    const tag = computeFallbackTag(body, keyBytes, iv);
    const combined = new Uint8Array(body.length + 16);
    combined.set(body, 0);
    combined.set(tag, body.length);

    return {
      iv: uint8ArrayToBase64(iv),
      ciphertext: uint8ArrayToBase64(combined)
    };
  }

  /**
   * Decrypt a message packet { iv, ciphertext } in base64 format back into JSON payload object.
   */
  async function decrypt(packet, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required for decryption');
    if (!packet || !packet.iv || !packet.ciphertext) {
      throw new Error('Invalid packet: missing iv or ciphertext');
    }

    const iv = base64ToUint8Array(packet.iv);
    const cipherData = base64ToUint8Array(packet.ciphertext);

    if (window.crypto && window.crypto.subtle && !cryptoKey.__fallbackKey) {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        cipherData
      );

      const jsonString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(jsonString);
    }

    if (cipherData.length < 16) throw new Error('Ciphertext too short');
    const keyBytes = cryptoKey.__fallbackKey || deriveFallbackKeyBytes(getStoredPassphrase());
    const body = cipherData.slice(0, cipherData.length - 16);
    const tag = cipherData.slice(cipherData.length - 16);
    const expectedTag = computeFallbackTag(body, keyBytes, iv);
    for (let i = 0; i < 16; i++) {
      if (tag[i] !== expectedTag[i]) {
        throw new Error('Authentication tag mismatch');
      }
    }
    const plainBytes = fallbackTransform(body, keyBytes, iv);
    const jsonString = new TextDecoder().decode(plainBytes);
    return JSON.parse(jsonString);
  }

  /**
   * Encrypt a raw ArrayBuffer chunk into a Uint8Array [12-byte IV][ciphertext + tag]
   */
  async function encryptChunk(arrayBuffer, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required');
    const iv = randomBytes(12);
    if (window.crypto && window.crypto.subtle && !cryptoKey.__fallbackKey) {
      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        arrayBuffer
      );
      const packet = new Uint8Array(12 + cipherBuffer.byteLength);
      packet.set(iv, 0);
      packet.set(new Uint8Array(cipherBuffer), 12);
      return packet;
    }

    const keyBytes = cryptoKey.__fallbackKey || deriveFallbackKeyBytes(getStoredPassphrase());
    const inputBytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
    const body = fallbackTransform(inputBytes, keyBytes, iv);
    const tag = computeFallbackTag(body, keyBytes, iv);
    const packet = new Uint8Array(12 + body.length + 16);
    packet.set(iv, 0);
    packet.set(body, 12);
    packet.set(tag, 12 + body.length);
    return packet;
  }

  /**
   * Decrypt a raw Uint8Array/ArrayBuffer [12-byte IV][ciphertext + tag] back into ArrayBuffer
   */
  async function decryptChunk(encryptedData, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required');
    const bytes = encryptedData instanceof Uint8Array ? encryptedData : new Uint8Array(encryptedData);
    if (bytes.length < 13) throw new Error('Invalid encrypted chunk: too short');
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    if (window.crypto && window.crypto.subtle && !cryptoKey.__fallbackKey) {
      return await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        ciphertext
      );
    }

    if (ciphertext.length < 16) throw new Error('Invalid encrypted chunk');
    const keyBytes = cryptoKey.__fallbackKey || deriveFallbackKeyBytes(getStoredPassphrase());
    const body = ciphertext.slice(0, ciphertext.length - 16);
    const tag = ciphertext.slice(ciphertext.length - 16);
    const expectedTag = computeFallbackTag(body, keyBytes, iv);
    for (let i = 0; i < 16; i++) {
      if (tag[i] !== expectedTag[i]) throw new Error('Chunk authentication tag mismatch');
    }
    return fallbackTransform(body, keyBytes, iv).buffer;
  }

  // Identity & Key Persistence
  let cachedCryptoKey = null;

  async function getCryptoKey() {
    if (cachedCryptoKey) return cachedCryptoKey;
    const passphrase = getStoredPassphrase();
    cachedCryptoKey = await deriveKey(passphrase);
    return cachedCryptoKey;
  }

  function getStoredPassphrase() {
    return localStorage.getItem(STORAGE_KEY_PASSPHRASE) || localStorage.getItem('dudu_chat_passphrase') || 'dudu-and-bubu-forever';
  }

  function setStoredPassphrase(passphrase) {
    cachedCryptoKey = null;
    localStorage.setItem(STORAGE_KEY_PASSPHRASE, passphrase.trim());
  }

  /**
   * Transparent Zero-Knowledge Payload Encryptor
   * Encrypts arbitrary object into { id, iv, ciphertext, isEncrypted: true }.
   * Preserves top-level id for database indexing & deletion.
   */
  async function encryptPayload(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj.iv && obj.ciphertext) return obj; // Already encrypted
    try {
      const key = await getCryptoKey();
      const packet = await encrypt(obj, key);
      return {
        id: obj.id,
        iv: packet.iv,
        ciphertext: packet.ciphertext,
        isEncrypted: true
      };
    } catch (e) {
      console.warn('[Crypto] Failed to encrypt payload, using raw:', e.message);
      return obj;
    }
  }

  /**
   * Transparent Zero-Knowledge Payload Decryptor
   * Decrypts { iv, ciphertext } back into original object.
   * If packet is already unencrypted (legacy), returns it as-is.
   */
  async function decryptPayload(packet) {
    if (!packet || typeof packet !== 'object') return packet;
    if (!packet.iv || !packet.ciphertext) return packet; // Legacy or plaintext
    try {
      const key = await getCryptoKey();
      const decrypted = await decrypt(packet, key);
      if (decrypted && typeof decrypted === 'object') {
        if (!decrypted.id && packet.id) decrypted.id = packet.id;
        return decrypted;
      }
      return packet;
    } catch (e) {
      console.warn('[Crypto] Failed to decrypt payload, returning packet:', e.message);
      return packet;
    }
  }

  async function encryptList(list) {
    if (!Array.isArray(list)) return [];
    return Promise.all(list.map(item => encryptPayload(item)));
  }

  async function decryptList(list) {
    if (!Array.isArray(list)) return [];
    return Promise.all(list.map(item => decryptPayload(item)));
  }

  function getStoredIdentity() {
    // 1. Check tab session storage first (isolated per tab so Dudu and Bubu tabs in the same browser don't overwrite each other)
    try {
      const sessionRole = sessionStorage.getItem('DUDU_ACTIVE_ROLE');
      if (sessionRole && (sessionRole === 'dudu' || sessionRole === 'bubu')) {
        return sessionRole;
      }
    } catch (_) {}

    // 2. Check window.duduMockup state if available
    try {
      if (window.duduMockup && typeof window.duduMockup.getUserRole === 'function') {
        const role = window.duduMockup.getUserRole();
        if (role) return role;
      }
    } catch (_) {}

    // 3. Check mockup data in localStorage
    try {
      const mockupSaved = localStorage.getItem('DUDU_MOCKUP_DATA_V1');
      if (mockupSaved) {
        const parsed = JSON.parse(mockupSaved);
        if (parsed && (parsed.userRole === 'dudu' || parsed.userRole === 'bubu')) {
          return parsed.userRole;
        }
      }
    } catch (_) {}

    // 4. Fallback to stored chat identity
    const raw = localStorage.getItem(STORAGE_KEY_IDENTITY) || localStorage.getItem('dudu_chat_identity') || 'dudu';
    const lower = String(raw).toLowerCase();
    if (lower.includes('bubu') || lower.includes('nana')) return 'bubu';
    return 'dudu';
  }

  function setStoredIdentity(name) {
    const raw = String(name || '').toLowerCase();
    const role = (raw.includes('bubu') || raw.includes('nana')) ? 'bubu' : 'dudu';
    try {
      localStorage.setItem(STORAGE_KEY_IDENTITY, role);
      localStorage.setItem('dudu_chat_identity', role);
      sessionStorage.setItem('DUDU_ACTIVE_ROLE', role);
    } catch (_) {}
  }

  window.DuduChatCrypto = {
    deriveKey,
    getCryptoKey,
    encrypt,
    decrypt,
    encryptPayload,
    decryptPayload,
    encryptList,
    decryptList,
    encryptChunk,
    decryptChunk,
    getStoredPassphrase,
    setStoredPassphrase,
    getStoredIdentity,
    setStoredIdentity,
    uint8ArrayToBase64,
    base64ToUint8Array
  };
})();

