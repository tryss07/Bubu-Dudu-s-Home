/**
 * Multi-Session & Message Persistence via IndexedDB
 */

export interface ChatSession {
  id: string;
  title: string;
  emoji: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: number;
  lastActivity: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: string;
  type: 'text' | 'sticker';
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'pending';
}

const DB_NAME = 'DuduDuoChatDB';
const DB_VERSION = 1;

export async function openChatDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'id' });
        s.createIndex('lastActivity', 'lastActivity', { unique: false });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const m = db.createObjectStore('messages', { keyPath: 'id' });
        m.createIndex('sessionId', 'sessionId', { unique: false });
        m.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
