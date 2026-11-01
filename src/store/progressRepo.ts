// Where Progress is persisted. Zustand's persist middleware talks to this
// StateStorage interface, so Phase 5 can swap in a Supabase-backed repo
// without touching the store or the UI.
import type { StateStorage } from 'zustand/middleware';

export type ProgressRepo = StateStorage;

// Device storage is synchronous; the account store relies on that
export interface SyncStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export const STORAGE_KEY = 'forkyeah:progress';

// localStorage, but never throws (private mode, quota, blocked storage)
export const localStorageRepo: SyncStorage = {
  getItem: name => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // quota exceeded / storage blocked: keep running in memory
    }
  },
  removeItem: name => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

// For tests and previews
export function memoryRepo(initial: Record<string, string> = {}): SyncStorage & { dump(): Record<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    getItem: name => data.get(name) ?? null,
    setItem: (name, value) => void data.set(name, value),
    removeItem: name => void data.delete(name),
    dump: () => Object.fromEntries(data),
  };
}
