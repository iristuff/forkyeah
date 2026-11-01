import { describe, expect, it } from 'vitest';
import type { GameEvent, Progress } from '../types';
import { CUISINES, getCuisine, getDish } from '../content/cuisines';
import {
  completeStep, cuisineProgress, dailyMission, emptyProgress, MISSION_XP, STAMP_XP, STEP_XP, questStatus,
  addChatMessage, CHAT_HISTORY_LIMIT,
} from './game';
import { localDay } from './dates';

const DAY1 = new Date(2026, 9, 1, 18, 0);
const DAY2 = new Date(2026, 9, 2, 18, 0);

// Cook every step of a dish in order, collecting all events
function cook(p: Progress, dishId: string, now = DAY1) {
  const events: GameEvent[] = [];
  for (let i = 0; i < getDish(dishId)!.steps.length; i++) {
    const r = completeStep(p, dishId, i, now);
    p = r.progress;
    events.push(...r.events);
  }
  return { progress: p, events };
}

const types = (events: GameEvent[]) => events.map(e => e.type);

describe('completeStep', () => {
  it('awards step XP, starts the streak and records the step', () => {
    const { progress, events } = completeStep(emptyProgress(), 'miso-soup', 2, DAY1);
    expect(progress.dishes['miso-soup'].stepsDone).toEqual([2]);
    expect(progress.xp).toBe(STEP_XP);
    expect(progress.streak).toEqual({ count: 1, lastDay: localDay(DAY1) });
    expect(types(events)).toEqual(['step-complete', 'streak', 'xp']);
  });

  it('is idempotent for a step already done', () => {
    const first = completeStep(emptyProgress(), 'miso-soup', 0, DAY1).progress;
    const again = completeStep(first, 'miso-soup', 0, DAY1);
    expect(again.progress).toBe(first);
    expect(again.events).toEqual([]);
  });

  it('ignores unknown dishes and out-of-range steps', () => {
    const p = emptyProgress();
    expect(completeStep(p, 'nope', 0, DAY1).progress).toBe(p);
    expect(completeStep(p, 'miso-soup', 99, DAY1).progress).toBe(p);
    expect(completeStep(p, 'miso-soup', -1, DAY1).progress).toBe(p);
    expect(completeStep(p, 'miso-soup', 1.5, DAY1).progress).toBe(p);
  });

  it('completes a dish when every step is done, in any order', () => {
    let p = emptyProgress();
    const dish = getDish('esquites')!;
    for (const i of [...dish.steps.keys()].reverse()) p = completeStep(p, dish.id, i, DAY1).progress;
    expect(p.dishes[dish.id].completedAt).toBe(DAY1.toISOString());
    expect(p.dishes[dish.id].stepsDone).toEqual([...dish.steps.keys()]);
  });

  it('pays the dish bonus exactly once', () => {
    const { progress, events } = cook(emptyProgress(), 'miso-soup');
    const dish = getDish('miso-soup')!;
    expect(events.filter(e => e.type === 'dish-complete')).toHaveLength(1);
    const missionBonus = progress.missionDays.length ? MISSION_XP : 0;
    expect(progress.xp).toBe(dish.steps.length * STEP_XP + dish.xp + missionBonus);
  });

  it('grants the passport stamp once every dish in the cuisine is done', () => {
    const japan = getCuisine('japan')!;
    let p = cook(emptyProgress(), japan.dishes[0].id).progress;
    expect(p.stamps.japan).toBeUndefined();
    const r = cook(p, japan.dishes[1].id, DAY2);
    p = r.progress;
    expect(p.stamps.japan).toBe(DAY2.toISOString());
    expect(types(r.events)).toContain('stamp');
    expect(r.events).toContainEqual({ type: 'xp', amount: STAMP_XP, reason: 'Japan stamp' });
    expect(cuisineProgress(p, 'japan')).toEqual({ done: 2, total: 2, stamped: true });
  });

  it('reports a level-up when XP crosses a boundary', () => {
    const start = { ...emptyProgress(), xp: 495 };
    const { events } = completeStep(start, 'miso-soup', 0, DAY1);
    expect(events).toContainEqual({ type: 'level-up', level: 2, title: 'Prep Cook' });
  });
});

describe('daily mission', () => {
  it('is stable for the whole day, even after finishing it', () => {
    const today = localDay(DAY1);
    const mission = dailyMission(emptyProgress(), today)!;
    const { progress, events } = cook(emptyProgress(), mission.id);
    expect(dailyMission(progress, today)!.id).toBe(mission.id);
    expect(types(events)).toContain('mission-complete');
    expect(progress.missionDays).toEqual([today]);
  });

  it('skips dishes finished on earlier days', () => {
    const today = localDay(DAY2);
    let p = emptyProgress();
    for (const c of CUISINES) for (const d of c.dishes) p = cook(p, d.id, DAY1).progress;
    expect(dailyMission(p, today)).toBeNull(); // everything mastered before today
  });

  it('pays the mission bonus only for the mission dish', () => {
    const today = localDay(DAY1);
    const mission = dailyMission(emptyProgress(), today)!;
    const other = CUISINES.flatMap(c => c.dishes).find(d => d.id !== mission.id)!;
    const { events } = cook(emptyProgress(), other.id);
    expect(types(events)).not.toContain('mission-complete');
  });
});

describe('quests', () => {
  it('derives progress and pays each quest once', () => {
    let p = emptyProgress();
    p = cook(p, 'miso-soup').progress;
    p = cook(p, 'esquites').progress;
    expect(questStatus(p, localDay(DAY1)).find(q => q.quest.id === 'world-tour')!.progress).toBe(2);

    const r = cook(p, 'zaalouk');
    expect(r.events).toContainEqual({ type: 'quest-complete', questId: 'world-tour' });
    const again = cook(r.progress, 'pad-kra-pao');
    expect(again.events).not.toContainEqual({ type: 'quest-complete', questId: 'world-tour' });
  });

  it('keeps a claimed quest complete even if its live value drops', () => {
    let p = emptyProgress();
    for (let d = 1; d <= 7; d++) p = completeStep(p, 'chicken-biryani', d - 1, new Date(2026, 9, d, 12)).progress;
    expect(p.quests['week-streak']).toBeDefined();
    const later = questStatus(p, '2026-10-20').find(q => q.quest.id === 'week-streak')!;
    expect(later).toMatchObject({ claimed: true, progress: 7 });
  });
});

describe('chat history', () => {
  it(`keeps only the last ${CHAT_HISTORY_LIMIT} messages`, () => {
    let p = emptyProgress();
    for (let i = 0; i < CHAT_HISTORY_LIMIT + 5; i++) {
      p = addChatMessage(p, { id: String(i), role: 'user', text: `m${i}`, at: DAY1.toISOString() });
    }
    expect(p.chat).toHaveLength(CHAT_HISTORY_LIMIT);
    expect(p.chat[0].id).toBe('5');
  });
});
