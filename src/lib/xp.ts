// XP → level → title. Level is always derived from total XP, never stored.

// Total XP needed to reach each level (index = level; index 0 unused)
export const XP_TABLE = [
  0, 0, 500, 1200, 2000, 3000, 4000, 5200, 6500, 8000, 9800,
  11800, 14000, 16500, 19000, 22000, 25500, 29500, 34000, 39000, 45000,
] as const;

export const MAX_LEVEL = XP_TABLE.length - 1;

const TITLES = [
  '',
  'Kitchen Newcomer', 'Prep Cook', 'Line Cook', 'Sauce Apprentice', 'Spice Explorer',
  'Flavor Artisan', 'Culture Seeker', 'Cuisine Traveler', 'Taste Architect', 'World Chef',
  'Culinary Scholar', 'Spice Whisperer', 'Flavor Alchemist', 'Global Chef', 'Spice Sage',
  'Grand Cuisinier', 'Culinary Legend', 'Master of Flavors', 'World Gastronome', 'Fork Yeah Grand Master',
] as const;

export function levelForXP(xp: number): number {
  let level = 1;
  for (let l = 2; l <= MAX_LEVEL; l++) {
    if (xp >= XP_TABLE[l]) level = l;
    else break;
  }
  return level;
}

export function titleForLevel(level: number): string {
  return TITLES[Math.min(Math.max(level, 1), MAX_LEVEL)];
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  levelStartXP: number; // total XP where this level began
  nextLevelXP: number | null; // null at max level
  xpIntoLevel: number;
  xpToNext: number; // 0 at max level
  progress: number; // 0-1, for the XP bar
}

export function levelInfo(xp: number): LevelInfo {
  const safeXP = Math.max(0, Math.floor(xp));
  const level = levelForXP(safeXP);
  const levelStartXP = XP_TABLE[level];
  const nextLevelXP = level < MAX_LEVEL ? XP_TABLE[level + 1] : null;
  const xpIntoLevel = safeXP - levelStartXP;
  const span = nextLevelXP === null ? 0 : nextLevelXP - levelStartXP;
  return {
    level,
    title: titleForLevel(level),
    xp: safeXP,
    levelStartXP,
    nextLevelXP,
    xpIntoLevel,
    xpToNext: nextLevelXP === null ? 0 : nextLevelXP - safeXP,
    progress: span === 0 ? 1 : xpIntoLevel / span,
  };
}
