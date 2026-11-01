// Combines two copies of Progress (this device and the cloud) when an account
// syncs. Nothing a player earned on either side is lost: steps, stamps, quests
// and mission days are unioned (earliest timestamp wins), the newer streak is
// kept, and XP takes the higher total. XP can't be summed: both copies usually
// share most of their history, so adding would double-count it.
import type { ChatMessage, DishProgress, Progress, Streak } from '../types';
import { CHAT_HISTORY_LIMIT, emptyProgress } from './game';

export function mergeProgress(local: Progress, cloud: Progress): Progress {
  return {
    profile: mergeProfile(local, cloud),
    xp: Math.max(local.xp, cloud.xp),
    streak: newerStreak(local.streak, cloud.streak),
    dishes: mergeRecords(local.dishes, cloud.dishes, mergeDish),
    stamps: mergeRecords(local.stamps, cloud.stamps, earliest),
    quests: mergeRecords(local.quests, cloud.quests, earliest),
    missionDays: [...new Set([...local.missionDays, ...cloud.missionDays])].sort(),
    chat: mergeChat(local.chat, cloud.chat),
  };
}

// The account's saved profile wins, unless it was never customised
function mergeProfile(local: Progress, cloud: Progress): Progress['profile'] {
  const fresh = emptyProgress().profile;
  const cloudIsDefault = cloud.profile.name === fresh.name && cloud.profile.emoji === fresh.emoji && !cloud.profile.skill;
  if (cloudIsDefault) return local.profile;
  return { ...cloud.profile, skill: cloud.profile.skill ?? local.profile.skill };
}

function newerStreak(a: Streak, b: Streak): Streak {
  if (a.lastDay === b.lastDay) return a.count >= b.count ? a : b;
  if (a.lastDay === null) return b;
  if (b.lastDay === null) return a;
  return a.lastDay > b.lastDay ? a : b; // 'YYYY-MM-DD' sorts as text
}

function mergeDish(a: DishProgress, b: DishProgress): DishProgress {
  const stepsDone = [...new Set([...a.stepsDone, ...b.stepsDone])].sort((x, y) => x - y);
  const completedAt = a.completedAt && b.completedAt ? earliest(a.completedAt, b.completedAt) : (a.completedAt ?? b.completedAt);
  return completedAt ? { stepsDone, completedAt } : { stepsDone };
}

function mergeChat(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
  const byId = new Map([...b, ...a].map(m => [m.id, m]));
  return [...byId.values()].sort((x, y) => x.at.localeCompare(y.at)).slice(-CHAT_HISTORY_LIMIT);
}

function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, both: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...b, ...a };
  for (const key of Object.keys(a)) if (key in b) out[key] = both(a[key], b[key]);
  return out;
}

function earliest(a: string, b: string): string {
  return Date.parse(a) <= Date.parse(b) ? a : b;
}
