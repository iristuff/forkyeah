import type { Streak } from '../types';
import { addDays, daysBetween, weekdayIndex } from './dates';

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

export interface WeekDay {
  day: string; // 'YYYY-MM-DD'
  cooked: boolean; // inside the active streak
  isToday: boolean;
  isFuture: boolean;
}

// Monday-to-Sunday of the current week, marking the days covered by the active streak
export function streakWeek(streak: Streak, today: string): WeekDay[] {
  const count = activeStreak(streak, today);
  const first = count > 0 && streak.lastDay ? addDays(streak.lastDay, -(count - 1)) : null;
  const monday = addDays(today, -weekdayIndex(today));
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i);
    const cooked = first !== null && streak.lastDay !== null && day >= first && day <= streak.lastDay;
    return { day, cooked, isToday: day === today, isFuture: day > today };
  });
}
