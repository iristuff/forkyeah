// Shared domain types for Fork Yeah

// ── Content (static, bundled) ─────────────────────────────────
export interface Step {
  text: string;
  tip?: string;
  timerSec?: number; // UI can offer a timer for this step
}

export interface Dish {
  id: string;
  cuisineId: string;
  name: string;
  emoji: string;
  story: string; // the cultural background shown before cooking
  timeMin: number; // total hands-on + cooking time
  difficulty: 1 | 2 | 3;
  serves: number;
  xp: number; // bonus for finishing the dish
  ingredients: string[];
  steps: Step[];
}

export interface Cuisine {
  id: string;
  name: string; // "Japan"
  adjective: string; // "Japanese"
  flag: string;
  stamp: string; // passport stamp emoji
  story: string;
  dishes: Dish[];
}

// ── Progress (persisted on device) ────────────────────────────
export interface CVScore {
  plating: number; // 0-100
  technique: number;
  colorBalance: number;
  portioning: number;
  overall: number;
}

export interface DishProgress {
  stepsDone: number[]; // step indexes, sorted, unique
  completedAt?: string; // ISO timestamp
  bestScore?: CVScore;
}

export interface Streak {
  count: number;
  lastDay: string | null; // local 'YYYY-MM-DD'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  at: string; // ISO timestamp
  dishId?: string;
}

export interface Profile {
  name: string;
  emoji: string;
}

export interface Progress {
  profile: Profile;
  xp: number; // level/title are derived from xp, never stored
  streak: Streak;
  dishes: Record<string, DishProgress>;
  stamps: Record<string, string>; // cuisineId -> earnedAt ISO
  quests: Record<string, string>; // questId -> claimedAt ISO
  missionDays: string[]; // local days the daily mission was completed
  chat: ChatMessage[];
}

// ── Game events (returned by reducers so the UI can celebrate) ─
export type GameEvent =
  | { type: 'xp'; amount: number; reason: string }
  | { type: 'step-complete'; dishId: string; stepIdx: number }
  | { type: 'dish-complete'; dishId: string }
  | { type: 'stamp'; cuisineId: string }
  | { type: 'quest-complete'; questId: string }
  | { type: 'mission-complete'; dishId: string }
  | { type: 'streak'; count: number }
  | { type: 'level-up'; level: number; title: string };

// ── Sample social data (until Phase 5) ────────────────────────
export interface LeaderboardEntry {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  streak: number;
  subtitle: string;
  isMe: boolean;
  rank: number;
}

export interface Post {
  id: string;
  userName: string;
  userEmoji: string;
  userLevel: number;
  cuisineId: string;
  dishName: string;
  dishEmoji: string;
  caption: string;
  score: CVScore;
  likes: number;
  comments: number;
  timeAgo: string;
}
