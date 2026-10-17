/**
 * Key Storage helper utilizing Capacitor Preferences or LocalStorage fallback
 */

const STORAGE_KEY_PASSPHRASE = 'DUDU_CHAT_PASSPHRASE';
const STORAGE_KEY_IDENTITY = 'DUDU_CHAT_IDENTITY';

export async function getPassphrase(): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Preferences) {
    try {
      const { value } = await (window as any).Capacitor.Plugins.Preferences.get({ key: STORAGE_KEY_PASSPHRASE });
      if (value) return value;
    } catch (e) {}
  }
  return localStorage.getItem(STORAGE_KEY_PASSPHRASE) || 'dudu-and-bubu-forever';
}

export async function setPassphrase(passphrase: string): Promise<void> {
  const clean = passphrase.trim();
  if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Preferences) {
    try {
      await (window as any).Capacitor.Plugins.Preferences.set({ key: STORAGE_KEY_PASSPHRASE, value: clean });
    } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY_PASSPHRASE, clean);
}

export function getIdentity(): string {
  return localStorage.getItem(STORAGE_KEY_IDENTITY) || 'Kevin';
}

export function setIdentity(name: string): void {
  localStorage.setItem(STORAGE_KEY_IDENTITY, name);
}
