import { describe, expect, it } from 'vitest';
import type { Progress } from '../types';
import { authErrorMessage, fromCloudProgress, sameProgress, toCloudProgress } from './cloudDoc';
import { CHAT_HISTORY_LIMIT, emptyProgress } from './game';
import { mergeProgress, nameForAccount, withAccountName } from './mergeProgress';

const T1 = '2026-10-01T10:00:00.000Z';
const T2 = '2026-10-02T10:00:00.000Z';
const p = (over: Partial<Progress>): Progress => ({ ...emptyProgress(), ...over });

describe('mergeProgress', () => {
  it('keeps everything earned on either device', () => {
    const phone = p({
      xp: 300,
      dishes: { 'miso-soup': { stepsDone: [0, 1] }, oyakodon: { stepsDone: [0, 1, 2], completedAt: T2 } },
      stamps: { japan: T2 },
      quests: { 'first-dish': T2 },
      missionDays: ['2026-10-02'],
    });
    const cloud = p({
      xp: 250,
      dishes: { 'miso-soup': { stepsDone: [2, 3], completedAt: T1 }, 'green-curry': { stepsDone: [0] } },
      stamps: { japan: T1, india: T1 },
      quests: { 'first-dish': T1 },
      missionDays: ['2026-10-01', '2026-10-02'],
    });
    const m = mergeProgress(phone, cloud);
    expect(m.xp).toBe(300);
    expect(m.dishes['miso-soup']).toEqual({ stepsDone: [0, 1, 2, 3], completedAt: T1 });
    expect(m.dishes.oyakodon.completedAt).toBe(T2);
    expect(m.dishes['green-curry']).toEqual({ stepsDone: [0] });
    expect(m.stamps).toEqual({ japan: T1, india: T1 });
    expect(m.quests['first-dish']).toBe(T1);
    expect(m.missionDays).toEqual(['2026-10-01', '2026-10-02']);
  });

  it('is idempotent, so syncing again changes nothing', () => {
    const a = p({ xp: 120, dishes: { 'miso-soup': { stepsDone: [0] } }, stamps: { japan: T1 } });
    expect(mergeProgress(a, a)).toEqual(a);
    const once = mergeProgress(a, p({ xp: 50 }));
    expect(mergeProgress(once, once)).toEqual(once);
  });

  it('keeps the more recent streak', () => {
    const older = p({ streak: { count: 9, lastDay: '2026-10-01' } });
    const newer = p({ streak: { count: 2, lastDay: '2026-10-03' } });
    expect(mergeProgress(older, newer).streak).toEqual({ count: 2, lastDay: '2026-10-03' });
    expect(mergeProgress(newer, older).streak).toEqual({ count: 2, lastDay: '2026-10-03' });
    expect(mergeProgress(p({}), older).streak.count).toBe(9);
  });

  it('prefers the account profile unless it was never customised', () => {
    const guest = p({ profile: { name: 'Iris', emoji: '🍜', skill: 'some' } });
    expect(mergeProgress(guest, p({})).profile).toEqual(guest.profile);
    const saved = p({ profile: { name: 'Chef Iris', emoji: '🔥' } });
    expect(mergeProgress(guest, saved).profile).toEqual({ name: 'Chef Iris', emoji: '🔥', skill: 'some' });
  });

  it('merges chat by id in time order, capped', () => {
    const msg = (id: string, at: string) => ({ id, role: 'user' as const, text: id, at });
    const m = mergeProgress(p({ chat: [msg('b', T2), msg('a', T1)] }), p({ chat: [msg('a', T1), msg('c', T1)] }));
    expect(m.chat.map(c => c.id).sort()).toEqual(['a', 'b', 'c']);
    expect(m.chat.at(-1)!.id).toBe('b');
    const many = Array.from({ length: CHAT_HISTORY_LIMIT }, (_, i) => msg(`m${i}`, new Date(Date.parse(T1) + i * 1000).toISOString()));
    expect(mergeProgress(p({ chat: many }), p({ chat: [msg('new', T2)] })).chat).toHaveLength(CHAT_HISTORY_LIMIT);
  });
});

describe('account name', () => {
  it('uses the first name, or a cleaned-up email', () => {
    expect(nameForAccount({ displayName: 'Iris Le', email: 'iris@example.com' })).toBe('Iris');
    expect(nameForAccount({ displayName: null, email: 'iris.le42@example.com' })).toBe('Iris');
    expect(nameForAccount({ displayName: null, email: 'MARIA@example.com' })).toBe('Maria');
    expect(nameForAccount({ displayName: '  ', email: '1234@example.com' })).toBeNull();
    expect(nameForAccount({ displayName: null, email: null })).toBeNull();
  });

  it('only replaces the default name', () => {
    const user = { displayName: 'Iris Le', email: null };
    expect(withAccountName(emptyProgress(), user).profile.name).toBe('Iris');
    const named = p({ profile: { name: 'Chef Bao', emoji: '🍜' } });
    expect(withAccountName(named, user)).toBe(named);
  });
});

describe('cloud document', () => {
  it('drops undefined values, which Firestore rejects', () => {
    const withUndefined = p({ profile: { name: 'A', emoji: 'B', skill: undefined }, dishes: { x: { stepsDone: [0], completedAt: undefined } } });
    const cloud = toCloudProgress(withUndefined);
    expect('skill' in cloud.profile).toBe(false);
    expect('completedAt' in cloud.dishes.x).toBe(false);
    expect(sameProgress(withUndefined, cloud)).toBe(true);
  });

  it('validates cloud data and strips retired fields', () => {
    expect(fromCloudProgress(null)).toBeNull();
    expect(fromCloudProgress({ xp: 'lots' })).toBeNull();
    const old = { ...emptyProgress(), xp: 40, quests: { 'ai-critic': T1 }, missionDays: undefined };
    expect(fromCloudProgress(JSON.parse(JSON.stringify(old)))).toEqual({ ...emptyProgress(), xp: 40 });
  });

  it('turns Firebase error codes into friendly messages', () => {
    expect(authErrorMessage({ code: 'auth/invalid-credential' })).toBe('Wrong email or password.');
    expect(authErrorMessage({ code: 'auth/email-already-in-use' })).toMatch(/already an account/);
    expect(authErrorMessage(new Error('boom'))).toMatch(/Something went wrong/);
  });
});
