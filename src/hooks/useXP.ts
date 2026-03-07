// ─────────────────────────────────────────────────────────────
// hooks/useXP.ts  —  XP calculation, level-up logic, streak tracking
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';

interface XPState {
  xp: number;
  level: number;
  streak: number;
  justLeveledUp: boolean;
}

// XP required to reach each level
// Level N needs XP_TABLE[N] total XP
const XP_TABLE: number[] = [
  0,     // level 0 (unused)
  0,     // level 1
  500,   // level 2
  1200,  // level 3
  2000,  // level 4
  3000,  // level 5
  4000,  // level 6
  5200,  // level 7
  6500,  // level 8
  8000,  // level 9
  9800,  // level 10
  11800, // level 11
  14000, // level 12
  16500, // level 13
  19000, // level 14  ← Erik is here (4820 XP in level 14 range → next 6500)
  22000, // level 15
  25500, // level 16
  29500, // level 17
  34000, // level 18
  39000, // level 19
  45000, // level 20
];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i;
    else break;
  }
  return level;
}

export function getXPToNext(xp: number): number {
  const level = getLevel(xp);
  const nextLevel = Math.min(level + 1, XP_TABLE.length - 1);
  return XP_TABLE[nextLevel];
}

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1:  'Kitchen Newcomer',
    2:  'Prep Cook',
    3:  'Line Cook',
    4:  'Sauce Apprentice',
    5:  'Spice Explorer',
    6:  'Flavor Artisan',
    7:  'Culture Seeker',
    8:  'Cuisine Traveler',
    9:  'Taste Architect',
    10: 'World Chef',
    11: 'Culinary Scholar',
    12: 'Spice Whisperer',
    13: 'Flavor Alchemist',
    14: 'Global Chef',
    15: 'Spice Sage',
    16: 'Grand Cuisinier',
    17: 'Culinary Legend',
    18: 'Master of Flavors',
    19: 'World Gastronome',
    20: 'Saffron Grand Master',
  };
  return titles[level] ?? 'Legendary Chef';
}

interface UseXPReturn {
  xp: number;
  level: number;
  streak: number;
  xpToNext: number;
  xpProgress: number;      // 0-1 decimal for the XP bar
  levelTitle: string;
  justLeveledUp: boolean;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  clearLevelUp: () => void;
}

export function useXP(initialXP: number, initialStreak: number): UseXPReturn {
  const [state, setState] = useState<XPState>({
    xp: initialXP,
    level: getLevel(initialXP),
    streak: initialStreak,
    justLeveledUp: false,
  });

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = getLevel(newXP);
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        justLeveledUp: newLevel > prev.level,
      };
    });
  }, []);

  const incrementStreak = useCallback(() => {
    setState(prev => ({ ...prev, streak: prev.streak + 1 }));
  }, []);

  const resetStreak = useCallback(() => {
    setState(prev => ({ ...prev, streak: 0 }));
  }, []);

  const clearLevelUp = useCallback(() => {
    setState(prev => ({ ...prev, justLeveledUp: false }));
  }, []);

  const xpToNext = getXPToNext(state.xp);
  const currentLevelXP = XP_TABLE[state.level] ?? 0;
  const xpProgress = xpToNext > currentLevelXP
    ? (state.xp - currentLevelXP) / (xpToNext - currentLevelXP)
    : 0;

  return {
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    xpToNext,
    xpProgress: Math.min(Math.max(xpProgress, 0), 1),
    levelTitle: getLevelTitle(state.level),
    justLeveledUp: state.justLeveledUp,
    addXP,
    incrementStreak,
    resetStreak,
    clearLevelUp,
  };
}
