// The one app store. Holds Progress (persisted) + the last action's events (not
// persisted) so screens can animate XP gains, level-ups and stamps.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatMessage, GameEvent, Profile, Progress } from '../types';
import { addChatMessage, completeStep, emptyProgress, type Result } from '../lib/game';
import { dropRetiredFields, fromBackup, isProgress, toBackup } from '../lib/progressSchema';
import { localStorageRepo, STORAGE_KEY, type ProgressRepo } from './progressRepo';

// Bump when the Progress shape changes, and handle the old version in `migrate`
// v2: photo scoring removed (dishes[].bestScore, 'ai-critic' quest)
// v3: optional profile.skill (no data change needed)
export const STORE_VERSION = 3;

export interface GameState {
  progress: Progress;
  lastEvents: GameEvent[];
  completeStep: (dishId: string, stepIdx: number, now?: Date) => GameEvent[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'at'> & Partial<Pick<ChatMessage, 'id' | 'at'>>) => void;
  clearChat: () => void;
  updateProfile: (profile: Partial<Profile>) => void;
  clearEvents: () => void;
  exportBackup: (now?: Date) => string;
  importBackup: (text: string) => { ok: true } | { ok: false; error: string };
  resetProgress: () => void;
}

export function createGameStore(repo: ProgressRepo = localStorageRepo) {
  return create<GameState>()(
    persist(
      (set, get) => {
        const apply = (result: Result) => {
          set({ progress: result.progress, lastEvents: result.events });
          return result.events;
        };

        return {
          progress: emptyProgress(),
          lastEvents: [],

          completeStep: (dishId, stepIdx, now = new Date()) => apply(completeStep(get().progress, dishId, stepIdx, now)),

          addChatMessage: message =>
            set(s => ({
              progress: addChatMessage(s.progress, {
                id: message.id ?? crypto.randomUUID(),
                at: message.at ?? new Date().toISOString(),
                role: message.role,
                text: message.text,
                ...(message.dishId ? { dishId: message.dishId } : {}),
              }),
            })),

          clearChat: () => set(s => ({ progress: { ...s.progress, chat: [] } })),

          updateProfile: profile =>
            set(s => ({ progress: { ...s.progress, profile: { ...s.progress.profile, ...profile } } })),

          clearEvents: () => set({ lastEvents: [] }),

          exportBackup: (now = new Date()) => toBackup(get().progress, now),

          importBackup: text => {
            const result = fromBackup(text);
            if (!result.ok) return result;
            set({ progress: result.progress, lastEvents: [] });
            return { ok: true };
          },

          resetProgress: () => set({ progress: emptyProgress(), lastEvents: [] }),
        };
      },
      {
        name: STORAGE_KEY,
        version: STORE_VERSION,
        storage: createJSONStorage(() => repo),
        partialize: s => ({ progress: s.progress }),
        migrate: persisted => {
          const progress = (persisted as { progress?: unknown } | undefined)?.progress;
          return { progress: dropRetiredFields(progress) as Progress };
        },
        // Never trust stored data blindly: fill new fields, and if it's corrupted,
        // keep a copy for recovery and start fresh instead of crashing the app.
        merge: (persisted, current) => {
          const stored = (persisted as { progress?: unknown } | undefined)?.progress;
          if (stored === undefined) return current;
          const candidate = { ...emptyProgress(), ...(stored as object) };
          if (isProgress(candidate)) return { ...current, progress: candidate };
          repo.setItem(`${STORAGE_KEY}:corrupt`, JSON.stringify(stored));
          return current;
        },
      },
    ),
  );
}

export const useGame = createGameStore();
