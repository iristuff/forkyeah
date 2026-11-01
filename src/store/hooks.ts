// Read-only hooks for screens. Everything here is derived from Progress,
// so the UI never stores or recomputes game state itself.
import { useMemo } from 'react';
import { useGame } from './gameStore';
import { CUISINES, getDish } from '../content/cuisines';
import { cuisineProgress, dailyMission, dishProgress, questStatus } from '../lib/game';
import { buildLeaderboard } from '../lib/leaderboard';
import { activeStreak, streakWeek } from '../lib/streak';
import { localDay } from '../lib/dates';
import { levelInfo } from '../lib/xp';

// Recomputed per render; cheap, and rolls over correctly at local midnight
const today = () => localDay(new Date());

export function useProgress() {
  return useGame(s => s.progress);
}

export function useLevel() {
  const xp = useGame(s => s.progress.xp);
  return useMemo(() => levelInfo(xp), [xp]);
}

export function useStreak() {
  const streak = useGame(s => s.progress.streak);
  return activeStreak(streak, today());
}

export function useStreakWeek() {
  const streak = useGame(s => s.progress.streak);
  const day = today();
  return useMemo(() => streakWeek(streak, day), [streak, day]);
}

export function useDailyMission() {
  const progress = useProgress();
  const day = today();
  return useMemo(() => {
    const dish = dailyMission(progress, day);
    return { dish, done: progress.missionDays.includes(day) };
  }, [progress, day]);
}

export function useDish(dishId: string) {
  const progress = useProgress();
  return useMemo(() => {
    const dish = getDish(dishId);
    if (!dish) return null;
    const state = progress.dishes[dishId];
    return {
      dish,
      ...dishProgress(progress, dish),
      stepsDone: state?.stepsDone ?? [],
      completed: Boolean(state?.completedAt),
    };
  }, [progress, dishId]);
}

// Passport: every cuisine with dish counts and stamp state
export function usePassport() {
  const progress = useProgress();
  return useMemo(
    () => CUISINES.map(cuisine => ({ cuisine, ...cuisineProgress(progress, cuisine.id), earnedAt: progress.stamps[cuisine.id] ?? null })),
    [progress],
  );
}

export function useQuests() {
  const progress = useProgress();
  const day = today();
  return useMemo(() => questStatus(progress, day), [progress, day]);
}

export function useLeaderboard() {
  const progress = useProgress();
  const day = today();
  return useMemo(() => buildLeaderboard(progress, day), [progress, day]);
}

// Accounts (sign-in + cloud sync): state and actions live in accountStore
export { useAccount } from './accountStore';
