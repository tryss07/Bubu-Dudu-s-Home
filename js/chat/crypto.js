/**
 * Dudu Duo Chat - End-to-End Cryptographic Engine
 * Zero-Knowledge AES-GCM 256-bit Encryption via native WebCrypto SubtleCrypto API.
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

  /**
   * Derive a 256-bit AES-GCM CryptoKey from a human-readable passphrase using PBKDF2-SHA-256
   */
  async function deriveKey(passphrase) {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new Error('Passphrase must be a non-empty string');
    }
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

  /**
   * Encrypt a JSON payload object into { iv, ciphertext } in base64 format.
   * Generates a unique 12-byte random IV for every single message.
   */
  async function encrypt(payloadObj, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required for encryption');
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const jsonString = JSON.stringify(payloadObj);
    const encodedData = new TextEncoder().encode(jsonString);

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

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      cipherData
    );

    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString);
  }

  /**
   * Encrypt a raw ArrayBuffer chunk into a Uint8Array [12-byte IV][ciphertext + tag]
   */
  async function encryptChunk(arrayBuffer, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required');
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
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

  /**
   * Decrypt a raw Uint8Array/ArrayBuffer [12-byte IV][ciphertext + tag] back into ArrayBuffer
   */
  async function decryptChunk(encryptedData, cryptoKey) {
    if (!cryptoKey) throw new Error('CryptoKey is required');
    const bytes = encryptedData instanceof Uint8Array ? encryptedData : new Uint8Array(encryptedData);
    if (bytes.length < 13) throw new Error('Invalid encrypted chunk: too short');
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    return await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      ciphertext
    );
  }

  // Identity & Key Persistence
  function getStoredPassphrase() {
    return localStorage.getItem(STORAGE_KEY_PASSPHRASE) || localStorage.getItem('dudu_chat_passphrase') || 'dudu-and-bubu-forever';
  }

  function setStoredPassphrase(passphrase) {
    localStorage.setItem(STORAGE_KEY_PASSPHRASE, passphrase.trim());
  }

  function getStoredIdentity() {
    // 1. Check window.duduMockup state if available
    try {
      if (window.duduMockup && typeof window.duduMockup.getUserRole === 'function') {
        const role = window.duduMockup.getUserRole();
        if (role) return role;
      }
    } catch (_) {}

    // 2. Check tab session storage (isolated per tab)
    try {
      const sessionRole = sessionStorage.getItem('DUDU_ACTIVE_ROLE');
      if (sessionRole && (sessionRole === 'dudu' || sessionRole === 'bubu')) {
        return sessionRole;
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
    encrypt,
    decrypt,
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
