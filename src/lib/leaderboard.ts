import type { LeaderboardEntry, Progress } from '../types';
import { SAMPLE_LEADERBOARD } from '../content/sample';
import { getCuisine } from '../content/cuisines';
import { activeStreak } from './streak';
import { levelInfo } from './xp';

export const ME_ID = 'me';

// Sample players + you, ranked by XP. Ties go to the sample player
// (they "got there first"), so you have to pass them, not match them.
export function buildLeaderboard(p: Progress, today: string): LeaderboardEntry[] {
  const latestStamp = Object.entries(p.stamps).sort(([, a], [, b]) => b.localeCompare(a))[0]?.[0];
  const cuisine = latestStamp ? getCuisine(latestStamp) : undefined;
  const me = {
    id: ME_ID,
    name: `${p.profile.name} (You)`,
    emoji: p.profile.emoji,
    xp: p.xp,
    streak: activeStreak(p.streak, today),
    subtitle: cuisine ? `${cuisine.flag} ${levelInfo(p.xp).title}` : levelInfo(p.xp).title,
  };
  return [...SAMPLE_LEADERBOARD, me]
    .sort((a, b) => b.xp - a.xp || (a.id === ME_ID ? 1 : b.id === ME_ID ? -1 : 0))
    .map((e, i) => ({ ...e, rank: i + 1, isMe: e.id === ME_ID }));
}
