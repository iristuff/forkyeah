import { describe, expect, it } from 'vitest';
import { createGameStore, STORE_VERSION } from './gameStore';
import { memoryRepo, STORAGE_KEY } from './progressRepo';
import { emptyProgress } from '../lib/game';

const NOW = new Date(2026, 9, 1, 18, 0);

describe('game store', () => {
  it('persists progress (but not transient events) through the repo', async () => {
    const repo = memoryRepo();
    const store = createGameStore(repo);
    store.getState().completeStep('miso-soup', 0, NOW);

    expect(store.getState().lastEvents.length).toBeGreaterThan(0);
    const saved = JSON.parse(repo.dump()[STORAGE_KEY]);
    expect(saved.version).toBe(STORE_VERSION);
    expect(saved.state.progress.xp).toBe(10);
    expect(saved.state.lastEvents).toBeUndefined();
  });

  it('restores saved progress on startup', async () => {
    const repo = memoryRepo();
    createGameStore(repo).getState().completeStep('miso-soup', 0, NOW);
    const reopened = createGameStore(repo);
    await reopened.persist.rehydrate();
    expect(reopened.getState().progress.dishes['miso-soup'].stepsDone).toEqual([0]);
  });

  it('keeps corrupted storage aside and starts fresh instead of crashing', async () => {
    const corrupt = { state: { progress: { xp: 'NaN', dishes: 7 } }, version: STORE_VERSION };
    const repo = memoryRepo({ [STORAGE_KEY]: JSON.stringify(corrupt) });
    const store = createGameStore(repo);
    await store.persist.rehydrate();
    expect(store.getState().progress).toEqual(emptyProgress());
    expect(JSON.parse(repo.dump()[`${STORAGE_KEY}:corrupt`])).toEqual(corrupt.state.progress);
  });

  it('migrates v1 saves by dropping photo-scoring data', async () => {
    const at = NOW.toISOString();
    const v1 = {
      ...emptyProgress(),
      xp: 500,
      dishes: { oyakodon: { stepsDone: [0], bestScore: { plating: 80, technique: 80, colorBalance: 80, portioning: 80, overall: 80 } } },
      quests: { 'ai-critic': at },
    };
    const repo = memoryRepo({ [STORAGE_KEY]: JSON.stringify({ state: { progress: v1 }, version: 1 }) });
    const store = createGameStore(repo);
    await store.persist.rehydrate();
    const { progress } = store.getState();
    expect(progress.xp).toBe(500);
    expect(progress.dishes.oyakodon).toEqual({ stepsDone: [0] });
    expect(progress.quests).toEqual({});
  });

  it('exports and imports a backup', () => {
    const a = createGameStore(memoryRepo());
    a.getState().completeStep('esquites', 0, NOW);
    a.getState().updateProfile({ name: 'Miaa' });
    const backup = a.getState().exportBackup(NOW);

    const b = createGameStore(memoryRepo());
    expect(b.getState().importBackup(backup)).toEqual({ ok: true });
    expect(b.getState().progress).toEqual(a.getState().progress);
    expect(b.getState().importBackup('garbage')).toMatchObject({ ok: false });
  });

  it('adds chat messages with ids and timestamps', () => {
    const store = createGameStore(memoryRepo());
    store.getState().addChatMessage({ role: 'user', text: 'How do I crack coconut cream?', dishId: 'green-curry' });
    const [msg] = store.getState().progress.chat;
    expect(msg).toMatchObject({ role: 'user', dishId: 'green-curry' });
    expect(msg.id).toBeTruthy();
    expect(Date.parse(msg.at)).not.toBeNaN();
    store.getState().clearChat();
    expect(store.getState().progress.chat).toEqual([]);
  });

  it('resets progress', () => {
    const store = createGameStore(memoryRepo());
    store.getState().completeStep('miso-soup', 0, NOW);
    store.getState().resetProgress();
    expect(store.getState().progress).toEqual(emptyProgress());
  });
});
