// Quests: progress is DERIVED from Progress each time (never stored);
// only the claim timestamp is stored so the reward is paid once.
import type { Progress } from '../types';
import { getDish } from './cuisines';
import { activeStreak } from '../lib/streak';

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  total: number;
  xpReward: number;
  colorVariant: 'orange' | 'gold' | 'green' | 'teal';
  progress: (p: Progress, today: string) => number;
}

const completedDishIds = (p: Progress) =>
  Object.entries(p.dishes).filter(([, d]) => d.completedAt).map(([id]) => id);

export const QUESTS: QuestDef[] = [
  {
    id: 'spice-road',
    name: 'Spice Road',
    description: 'Cook 3 dishes from India or Thailand',
    emoji: '🌶️',
    total: 3,
    xpReward: 500,
    colorVariant: 'orange',
    progress: p =>
      completedDishIds(p).filter(id => ['india', 'thailand'].includes(getDish(id)?.cuisineId ?? '')).length,
  },
  {
    id: 'world-tour',
    name: 'World Tour',
    description: 'Cook a dish from 3 different cuisines',
    emoji: '🌍',
    total: 3,
    xpReward: 400,
    colorVariant: 'teal',
    progress: p => new Set(completedDishIds(p).map(id => getDish(id)?.cuisineId).filter(Boolean)).size,
  },
  {
    id: 'first-stamp',
    name: 'Passport Ready',
    description: 'Earn your first passport stamp',
    emoji: '🛂',
    total: 1,
    xpReward: 250,
    colorVariant: 'gold',
    progress: p => Object.keys(p.stamps).length,
  },
  {
    id: 'ai-critic',
    name: 'AI Chef Critic',
    description: 'Score 90+ on a dish photo',
    emoji: '📸',
    total: 1,
    xpReward: 750,
    colorVariant: 'green',
    progress: p => (Object.values(p.dishes).some(d => (d.bestScore?.overall ?? 0) >= 90) ? 1 : 0),
  },
  {
    id: 'week-streak',
    name: 'On Fire',
    description: 'Cook 7 days in a row',
    emoji: '🔥',
    total: 7,
    xpReward: 300,
    colorVariant: 'orange',
    progress: (p, today) => activeStreak(p.streak, today),
  },
];

export function getQuest(id: string): QuestDef | undefined {
  return QUESTS.find(q => q.id === id);
}
