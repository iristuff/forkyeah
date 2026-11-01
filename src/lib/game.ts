// Core game rules as pure functions: (progress, input, now) -> { progress, events }.
// The store calls these; the UI reads `events` to animate XP, level-ups, stamps.
import type { Dish, GameEvent, Progress } from '../types';
import { ALL_DISHES, getCuisine, getDish } from '../content/cuisines';
import { QUESTS } from '../content/quests';
import { dayHash, localDay } from './dates';
import { bumpStreak } from './streak';
import { levelForXP, titleForLevel } from './xp';

export const STEP_XP = 10;
export const MISSION_XP = 100;
export const STAMP_XP = 250;
export const CHAT_HISTORY_LIMIT = 100;

export interface Result {
  progress: Progress;
  events: GameEvent[];
}

export function emptyProgress(): Progress {
  return {
    profile: { name: 'Chef', emoji: '🧑‍🍳' },
    xp: 0,
    streak: { count: 0, lastDay: null },
    dishes: {},
    stamps: {},
    quests: {},
    missionDays: [],
    chat: [],
  };
}

// ── Queries ───────────────────────────────────────────────────
export function isDishComplete(p: Progress, dishId: string): boolean {
  return Boolean(p.dishes[dishId]?.completedAt);
}

export function dishProgress(p: Progress, dish: Dish): { done: number; total: number; ratio: number } {
  const done = p.dishes[dish.id]?.stepsDone.length ?? 0;
  const total = dish.steps.length;
  return { done, total, ratio: total ? done / total : 0 };
}

export function cuisineProgress(p: Progress, cuisineId: string): { done: number; total: number; stamped: boolean } {
  const dishes = getCuisine(cuisineId)?.dishes ?? [];
  return {
    done: dishes.filter(d => isDishComplete(p, d.id)).length,
    total: dishes.length,
    stamped: Boolean(p.stamps[cuisineId]),
  };
}

// Today's mission is stable all day: it's chosen from dishes that were not yet
// finished before today, so finishing it doesn't make the mission jump.
// Returns null once every dish was mastered on an earlier day.
export function dailyMission(p: Progress, today: string): Dish | null {
  const candidates = ALL_DISHES.filter(d => {
    const at = p.dishes[d.id]?.completedAt;
    return !at || localDay(new Date(at)) === today;
  });
  if (candidates.length === 0) return null;
  return candidates[dayHash(today) % candidates.length];
}

export function questStatus(p: Progress, today: string) {
  return QUESTS.map(q => {
    const raw = q.progress(p, today);
    const claimed = Boolean(p.quests[q.id]);
    return { quest: q, progress: claimed ? q.total : Math.min(raw, q.total), claimed };
  });
}

// ── Actions ───────────────────────────────────────────────────
export function completeStep(p: Progress, dishId: string, stepIdx: number, now: Date): Result {
  const dish = getDish(dishId);
  if (!dish || !Number.isInteger(stepIdx) || stepIdx < 0 || stepIdx >= dish.steps.length) {
    return { progress: p, events: [] };
  }
  const current = p.dishes[dishId] ?? { stepsDone: [] };
  if (current.stepsDone.includes(stepIdx)) return { progress: p, events: [] };

  const today = localDay(now);
  // Mission is decided from the state *before* this action
  const mission = dailyMission(p, today);
  const events: GameEvent[] = [{ type: 'step-complete', dishId, stepIdx }];
  let next = withActivity(p, today, events);

  const stepsDone = [...current.stepsDone, stepIdx].sort((a, b) => a - b);
  next = { ...next, dishes: { ...next.dishes, [dishId]: { ...current, stepsDone } } };
  next = addXP(next, STEP_XP, 'Step complete', events);

  if (stepsDone.length === dish.steps.length && !current.completedAt) {
    next = { ...next, dishes: { ...next.dishes, [dishId]: { ...next.dishes[dishId], completedAt: now.toISOString() } } };
    events.push({ type: 'dish-complete', dishId });
    next = addXP(next, dish.xp, `${dish.name} complete`, events);

    if (mission?.id === dishId && !next.missionDays.includes(today)) {
      next = { ...next, missionDays: [...next.missionDays, today] };
      events.push({ type: 'mission-complete', dishId });
      next = addXP(next, MISSION_XP, 'Daily mission', events);
    }

    const cuisine = getCuisine(dish.cuisineId);
    if (cuisine && !next.stamps[cuisine.id] && cuisine.dishes.every(d => isDishComplete(next, d.id))) {
      next = { ...next, stamps: { ...next.stamps, [cuisine.id]: now.toISOString() } };
      events.push({ type: 'stamp', cuisineId: cuisine.id });
      next = addXP(next, STAMP_XP, `${cuisine.name} stamp`, events);
    }
  }

  return finish(p, next, today, now, events);
}

export function addChatMessage(p: Progress, message: Progress['chat'][number]): Progress {
  return { ...p, chat: [...p.chat, message].slice(-CHAT_HISTORY_LIMIT) };
}

// ── Internals ─────────────────────────────────────────────────
function withActivity(p: Progress, today: string, events: GameEvent[]): Progress {
  const streak = bumpStreak(p.streak, today);
  if (streak !== p.streak && streak.count !== p.streak.count) {
    events.push({ type: 'streak', count: streak.count });
  }
  return { ...p, streak };
}

function addXP(p: Progress, amount: number, reason: string, events: GameEvent[]): Progress {
  if (amount <= 0) return p;
  events.push({ type: 'xp', amount, reason });
  return { ...p, xp: p.xp + amount };
}

// Pay out newly finished quests, then report a level-up if one happened.
function finish(before: Progress, next: Progress, today: string, now: Date, events: GameEvent[]): Result {
  for (const { quest, progress, claimed } of questStatus(next, today)) {
    if (!claimed && progress >= quest.total) {
      next = { ...next, quests: { ...next.quests, [quest.id]: now.toISOString() } };
      events.push({ type: 'quest-complete', questId: quest.id });
      next = addXP(next, quest.xpReward, quest.name, events);
    }
  }
  const oldLevel = levelForXP(before.xp);
  const newLevel = levelForXP(next.xp);
  if (newLevel > oldLevel) events.push({ type: 'level-up', level: newLevel, title: titleForLevel(newLevel) });
  return { progress: next, events };
}
