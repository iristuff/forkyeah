import { describe, expect, it } from 'vitest';
import { dayHash, daysBetween, localDay } from './dates';
import { activeStreak, bumpStreak } from './streak';
import { levelForXP, levelInfo, MAX_LEVEL, titleForLevel, XP_TABLE } from './xp';

describe('dates', () => {
  it('formats the local calendar day', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDay(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
  });

  it('counts whole days across month, year and DST boundaries', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2); // US DST starts Mar 8
    expect(daysBetween('2026-11-01', '2026-10-31')).toBe(-1);
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2); // leap year
  });

  it('hashes days deterministically', () => {
    expect(dayHash('2026-10-30')).toBe(dayHash('2026-10-30'));
    expect(dayHash('2026-10-30')).not.toBe(dayHash('2026-10-31'));
  });
});

describe('xp', () => {
  it('maps XP to levels at the exact boundaries', () => {
    expect(levelForXP(0)).toBe(1);
    expect(levelForXP(499)).toBe(1);
    expect(levelForXP(500)).toBe(2);
    expect(levelForXP(1199)).toBe(2);
    expect(levelForXP(1200)).toBe(3);
    expect(levelForXP(4820)).toBe(6); // the old app claimed "level 14" here
    expect(levelForXP(45000)).toBe(MAX_LEVEL);
    expect(levelForXP(1_000_000)).toBe(MAX_LEVEL);
  });

  it('reports progress within a level', () => {
    const info = levelInfo(850);
    expect(info).toMatchObject({ level: 2, levelStartXP: 500, nextLevelXP: 1200, xpIntoLevel: 350, xpToNext: 350 });
    expect(info.progress).toBeCloseTo(0.5);
  });

  it('handles max level and bad input', () => {
    expect(levelInfo(50000)).toMatchObject({ level: MAX_LEVEL, nextLevelXP: null, xpToNext: 0, progress: 1 });
    expect(levelInfo(-20)).toMatchObject({ level: 1, xp: 0, progress: 0 });
  });

  it('has a title for every level and never says Saffron', () => {
    for (let l = 1; l <= MAX_LEVEL; l++) {
      expect(titleForLevel(l)).toBeTruthy();
      expect(titleForLevel(l)).not.toMatch(/saffron/i);
    }
    expect(XP_TABLE).toEqual([...XP_TABLE].sort((a, b) => a - b));
  });
});

describe('streak', () => {
  it('starts, continues, holds and resets', () => {
    let s = bumpStreak({ count: 0, lastDay: null }, '2026-10-01');
    expect(s).toEqual({ count: 1, lastDay: '2026-10-01' });
    expect(bumpStreak(s, '2026-10-01')).toBe(s); // same day: unchanged object
    s = bumpStreak(s, '2026-10-02');
    expect(s.count).toBe(2);
    s = bumpStreak(s, '2026-10-05'); // missed two days
    expect(s).toEqual({ count: 1, lastDay: '2026-10-05' });
  });

  it('ignores the clock going backwards', () => {
    const s = { count: 4, lastDay: '2026-10-10' };
    expect(bumpStreak(s, '2026-10-09')).toBe(s);
  });

  it('stays alive through the next day, then shows 0', () => {
    const s = { count: 5, lastDay: '2026-10-10' };
    expect(activeStreak(s, '2026-10-10')).toBe(5);
    expect(activeStreak(s, '2026-10-11')).toBe(5);
    expect(activeStreak(s, '2026-10-12')).toBe(0);
    expect(activeStreak({ count: 0, lastDay: null }, '2026-10-12')).toBe(0);
  });
});
