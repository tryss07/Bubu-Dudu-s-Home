/**
 * E2EE WebCrypto SubtleCrypto AES-GCM 256-bit implementation
 */

const PBKDF2_SALT = new TextEncoder().encode('DuduBubuSanctuarySalt_2026');
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedPacket {
  iv: string;
  ciphertext: string;
  timestamp?: number;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKey(passphrase: string): Promise<CryptoKey> {
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

export async function encryptPayload<T>(payload: T, cryptoKey: CryptoKey): Promise<EncryptedPacket> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(payload));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encodedData
  );

  return {
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(new Uint8Array(cipherBuffer)),
    timestamp: Date.now()
  };
}

export async function decryptPayload<T>(packet: EncryptedPacket, cryptoKey: CryptoKey): Promise<T> {
  const iv = base64ToUint8Array(packet.iv);
  const cipherData = base64ToUint8Array(packet.ciphertext);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    cryptoKey,
    cipherData as unknown as BufferSource
  );

  const jsonString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}
