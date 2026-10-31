import type { Streak } from '../types';
import { daysBetween } from './dates';

// Record activity on `today`. Same day: unchanged. Next day: +1. Any gap: restart at 1.
export function bumpStreak(streak: Streak, today: string): Streak {
  if (streak.lastDay === null) return { count: 1, lastDay: today };
  const gap = daysBetween(streak.lastDay, today);
  if (gap <= 0) return streak; // same day (or clock went backwards) — no change
  if (gap === 1) return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

// What to display. A streak is still alive until the end of the day after lastDay,
// so the user has all of "today" to keep yesterday's streak going.
export function activeStreak(streak: Streak, today: string): number {
  if (streak.lastDay === null) return 0;
  return daysBetween(streak.lastDay, today) <= 1 ? streak.count : 0;
}
