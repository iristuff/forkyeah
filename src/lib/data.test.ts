import { describe, expect, it } from 'vitest';
import { ALL_DISHES, CUISINES, getCuisine, getDish } from '../content/cuisines';
import { QUESTS } from '../content/quests';
import { SAMPLE_POSTS } from '../content/sample';
import { buildLeaderboard, ME_ID } from './leaderboard';
import { emptyProgress } from './game';
import { fromBackup, isProgress, toBackup } from './progressSchema';

describe('content', () => {
  it('has unique ids and consistent cuisine links', () => {
    const ids = ALL_DISHES.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(CUISINES.map(c => c.id)).size).toBe(CUISINES.length);
    for (const c of CUISINES) for (const d of c.dishes) expect(d.cuisineId).toBe(c.id);
    expect(new Set(QUESTS.map(q => q.id)).size).toBe(QUESTS.length);
  });

  it('gives every dish a story, ingredients and real steps', () => {
    for (const d of ALL_DISHES) {
      expect(d.story.length, d.id).toBeGreaterThan(80);
      expect(d.ingredients.length, d.id).toBeGreaterThanOrEqual(4);
      expect(d.steps.length, d.id).toBeGreaterThanOrEqual(4);
      expect(d.xp, d.id).toBeGreaterThan(0);
      for (const s of d.steps) {
        expect(s.text.trim().length, d.id).toBeGreaterThan(10);
        if (s.timerSec !== undefined) expect(s.timerSec, d.id).toBeGreaterThan(0);
      }
    }
  });

  it('every cuisine has at least 2 dishes and a stamp', () => {
    for (const c of CUISINES) {
      expect(c.dishes.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.stamp, c.id).toBeTruthy();
    }
  });

  it('sample posts reference real cuisines', () => {
    for (const p of SAMPLE_POSTS) expect(getCuisine(p.cuisineId), p.id).toBeDefined();
    expect(getDish('chicken-biryani')).toBeDefined();
  });
});

describe('leaderboard', () => {
  it('inserts you by XP with ranks 1..n', () => {
    const board = buildLeaderboard({ ...emptyProgress(), xp: 5000 }, '2026-10-01');
    expect(board.map(e => e.rank)).toEqual(board.map((_, i) => i + 1));
    const me = board.find(e => e.isMe)!;
    expect(me.id).toBe(ME_ID);
    expect(board[me.rank - 2].xp).toBeGreaterThan(5000);
    expect(board[me.rank].xp).toBeLessThan(5000);
  });

  it('puts you behind a sample player on a tie', () => {
    const board = buildLeaderboard({ ...emptyProgress(), xp: 4200 }, '2026-10-01');
    const me = board.findIndex(e => e.isMe);
    expect(board[me - 1].name).toBe('Maria K.');
  });
});

describe('backup import/export', () => {
  const now = new Date('2026-10-01T12:00:00Z');

  it('round-trips progress', () => {
    const p = { ...emptyProgress(), xp: 1234, stamps: { japan: now.toISOString() } };
    const result = fromBackup(toBackup(p, now));
    expect(result).toEqual({ ok: true, progress: p });
  });

  it('rejects junk, other files, newer versions and damaged data', () => {
    expect(fromBackup('not json')).toMatchObject({ ok: false });
    expect(fromBackup('{"hello":1}')).toMatchObject({ ok: false, error: expect.stringMatching(/isn’t a Fork Yeah backup/) });
    expect(fromBackup(JSON.stringify({ format: 'forkyeah-backup', version: 99, progress: {} }))).toMatchObject({ ok: false, error: expect.stringMatching(/newer version/) });
    const damaged = JSON.stringify({ format: 'forkyeah-backup', version: 1, progress: { xp: 'lots' } });
    expect(fromBackup(damaged)).toMatchObject({ ok: false, error: expect.stringMatching(/damaged/) });
  });

  it('fills fields missing from older backups', () => {
    const { chat: _chat, missionDays: _m, ...old } = emptyProgress();
    const result = fromBackup(JSON.stringify({ format: 'forkyeah-backup', version: 1, progress: old }));
    expect(result.ok && result.progress.chat).toEqual([]);
  });

  it('validates nested fields', () => {
    expect(isProgress(emptyProgress())).toBe(true);
    expect(isProgress({ ...emptyProgress(), streak: { count: 1, lastDay: 'yesterday' } })).toBe(false);
    expect(isProgress({ ...emptyProgress(), dishes: { x: { stepsDone: [-1] } } })).toBe(false);
    expect(isProgress({ ...emptyProgress(), chat: [{ id: '1', role: 'system', text: 'hi', at: now.toISOString() }] })).toBe(false);
  });
});
