// ─────────────────────────────────────────────────────────────
// types/index.ts  —  Saffron TypeScript Interfaces
// ─────────────────────────────────────────────────────────────

// ── User ──────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  emoji: string;              // e.g. '🧑‍🍳'
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;             // days in a row
  rank: number;               // leaderboard position
  title: string;              // e.g. 'The Spice Sage'
  badges: string[];           // pill badge labels
  completedCuisines: string[];// e.g. ['🎌 Japan', '🇲🇽 Mexico']
  activeCuisine: string;      // e.g. '🇮🇳 India'
  friends: string[];          // friend user IDs
}

// ── Lesson ────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  name: string;
  emoji: string;              // dish emoji e.g. '🫕'
  flagEmoji: string;          // country flag e.g. '🇮🇳'
  cuisine: string;
  totalSteps: number;
  completedSteps: number;     // 0 = not started, totalSteps = complete
  gradientStart: string;      // hex color for card background gradient
  gradientEnd: string;
}

// ── Quest ─────────────────────────────────────────────────────
export interface Quest {
  id: string;
  name: string;
  description: string;
  emoji: string;
  progress: number;           // e.g. 2
  total: number;              // e.g. 3
  xpReward: number;
  colorVariant: 'orange' | 'gold' | 'green' | 'teal';
}

// ── CV Score (Computer Vision dish analysis) ──────────────────
export interface CVScore {
  plating: number;            // 0-100
  technique: number;
  colorBalance: number;
  portioning: number;
  overall: number;
}

// ── Social Post ───────────────────────────────────────────────
export interface Post {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userLevel: number;
  cuisine: string;
  flagEmoji: string;
  dishName: string;
  dishEmoji: string;
  caption: string;
  cvScore: CVScore;
  likes: number;
  comments: number;
  liked: boolean;
  timeAgo: string;
}

// ── Leaderboard ───────────────────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  streak: number;
  rank: number;
  isMe: boolean;
  subtitle: string;           // e.g. '🇯🇵 Japanese Master'
}

// ── Friend ────────────────────────────────────────────────────
export interface Friend {
  id: string;
  name: string;
  emoji: string;
  level: number;
  flagEmoji: string;
  isOnline: boolean;
  activity?: string;          // e.g. 'Cooking Biryani now 🍛'
  isBuddy?: boolean;          // current buddy partner
}

// ── Chat Message ──────────────────────────────────────────────
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;          // e.g. '2:34 PM'
  cvScore?: CVScore;          // only for AI dish-analysis replies
}

// ── Daily Mission ─────────────────────────────────────────────
export interface DailyMission {
  id: string;
  title: string;
  xpReward: number;
  cuisine: string;
  flagEmoji: string;
  durationMin: number;        // minutes
  buddyAvailable: boolean;
  buddyName?: string;
}
