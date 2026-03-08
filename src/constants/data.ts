// ─────────────────────────────────────────────────────────────
// data.ts  —  Saffron Mock Data
// All data other devs import so screens look populated instantly
// ─────────────────────────────────────────────────────────────
import type {
  User, Lesson, Quest, Post, LeaderboardEntry,
  Friend, DailyMission, Message, CVScore,
} from '../types';

// ── Current User ──────────────────────────────────────────────
export const CURRENT_USER: User = {
  id: 'user_erik',
  name: 'Erik',
  emoji: '🧑‍🍳',
  level: 14,
  xp: 4820,
  xpToNext: 6500,
  streak: 21,
  rank: 7,
  title: 'The Spice Sage',
  badges: ['🎌 Japan ✓', '🇲🇽 Mexico ✓', '🇮🇳 India — Active'],
  completedCuisines: ['Japan', 'Mexico'],
  activeCuisine: 'India',
  friends: ['user_maria', 'user_alex', 'user_priya'],
};

// ── Daily Mission ─────────────────────────────────────────────
export const DAILY_MISSION: DailyMission = {
  id: 'mission_biryani',
  title: 'Biryani from Scratch',
  xpReward: 350,
  cuisine: 'Indian',
  flagEmoji: '🇮🇳',
  durationMin: 8,
  buddyAvailable: true,
  buddyName: 'Maria',
};

// ── Lessons ───────────────────────────────────────────────────
export const LESSONS: Lesson[] = [
  {
    id: 'lesson_spice',
    name: 'Spice Blending',
    emoji: '🫕',
    flagEmoji: '🇮🇳',
    cuisine: 'Indian',
    totalSteps: 5,
    completedSteps: 3,
    gradientStart: '#1a0e06',
    gradientEnd: '#2a1208',
  },
  {
    id: 'lesson_thai',
    name: 'Thai Curries',
    emoji: '🍜',
    flagEmoji: '🇹🇭',
    cuisine: 'Thai',
    totalSteps: 6,
    completedSteps: 1,
    gradientStart: '#061a10',
    gradientEnd: '#0d2a18',
  },
  {
    id: 'lesson_tagine',
    name: 'Moroccan Tagine',
    emoji: '🥘',
    flagEmoji: '🇲🇦',
    cuisine: 'Moroccan',
    totalSteps: 4,
    completedSteps: 0,
    gradientStart: '#1a0606',
    gradientEnd: '#2a0808',
  },
  {
    id: 'lesson_bento',
    name: 'Bento Mastery',
    emoji: '🍱',
    flagEmoji: '🇯🇵',
    cuisine: 'Japanese',
    totalSteps: 5,
    completedSteps: 5,
    gradientStart: '#06121a',
    gradientEnd: '#0c1f2a',
  },
];

// ── Quests ────────────────────────────────────────────────────
export const QUESTS: Quest[] = [
  {
    id: 'quest_spice_road',
    name: 'Spice Road',
    description: 'Complete 3 South Asian recipes',
    emoji: '🌶️',
    progress: 2,
    total: 3,
    xpReward: 500,
    colorVariant: 'orange',
  },
  {
    id: 'quest_better_together',
    name: 'Better Together',
    description: 'Complete 1 buddy mode session',
    emoji: '🤝',
    progress: 0,
    total: 1,
    xpReward: 200,
    colorVariant: 'teal',
  },
  {
    id: 'quest_ai_critic',
    name: 'AI Chef Critic',
    description: 'Get a 90%+ CV plating score',
    emoji: '📸',
    progress: 4,
    total: 5,
    xpReward: 750,
    colorVariant: 'green',
  },
];

// ── Feed Posts ────────────────────────────────────────────────
export const POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_maria',
    userName: 'Maria K.',
    userEmoji: '👩‍🍳',
    userLevel: 19,
    cuisine: 'Mexican',
    flagEmoji: '🇲🇽',
    dishName: 'Mole Negro',
    dishEmoji: '🌮',
    caption: 'Finally nailed the perfect mole sauce! The CV feedback on my plating was so helpful 🔥',
    cvScore: { plating: 94, technique: 89, colorBalance: 91, portioning: 88, overall: 91 },
    likes: 47,
    comments: 12,
    liked: true,
    timeAgo: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749604f7ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'post_2',
    userId: 'user_alex',
    userName: 'Alex M.',
    userEmoji: '👨‍🍳',
    userLevel: 24,
    cuisine: 'Japanese',
    flagEmoji: '🇯🇵',
    dishName: 'Tonkotsu Ramen',
    dishEmoji: '🍜',
    caption: 'Spent 6 hours on this broth. Worth every second. Broth score 97% 🏆',
    cvScore: { plating: 97, technique: 95, colorBalance: 93, portioning: 96, overall: 95 },
    likes: 134,
    comments: 28,
    liked: false,
    timeAgo: '4h ago',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749604f7ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'post_3',
    userId: 'user_priya',
    userName: 'Priya S.',
    userEmoji: '🧑',
    userLevel: 22,
    cuisine: 'Indian',
    flagEmoji: '🇮🇳',
    dishName: 'Butter Chicken',
    dishEmoji: '🍛',
    caption: 'Unlocked the Spice Sage badge today. This butter chicken earned it! 🎉',
    cvScore: { plating: 88, technique: 92, colorBalance: 85, portioning: 90, overall: 89 },
    likes: 73,
    comments: 9,
    liked: false,
    timeAgo: '6h ago',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749604f7ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'post_4',
    userId: 'user_sam',
    userName: 'Sam T.',
    userEmoji: '🧑‍🍳',
    userLevel: 11,
    cuisine: 'French',
    flagEmoji: '🇫🇷',
    dishName: 'Crème Brûlée',
    dishEmoji: '🍮',
    caption: 'First attempt at French desserts. AI said my caramel layer is 2mm too thick 😂',
    cvScore: { plating: 76, technique: 70, colorBalance: 82, portioning: 68, overall: 74 },
    likes: 31,
    comments: 14,
    liked: false,
    timeAgo: '8h ago',
    imageUrl: 'https://images.unsplash.com/photo-1551024705-20e7788d8f3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  },
];

// ── Leaderboard ───────────────────────────────────────────────
export const LEADERBOARD: LeaderboardEntry[] = [
  { id: 'user_alex',  name: 'Alex M.',   emoji: '👨‍🍳', xp: 12400, streak: 45, rank: 1, isMe: false, subtitle: '🇯🇵 Japanese Master' },
  { id: 'user_jin',   name: 'Jin L.',    emoji: '🧑‍🍳', xp: 11800, streak: 38, rank: 2, isMe: false, subtitle: '🇰🇷 Korean Specialist' },
  { id: 'user_amara', name: 'Amara D.',  emoji: '👩‍🍳', xp: 10950, streak: 29, rank: 3, isMe: false, subtitle: '🇳🇬 Global Chef' },
  { id: 'user_luca',  name: 'Luca B.',   emoji: '👨‍🍳', xp: 9200,  streak: 17, rank: 4, isMe: false, subtitle: '🇮🇹 Italian Artisan' },
  { id: 'user_sofia', name: 'Sofia R.',  emoji: '👩‍🍳', xp: 7600,  streak: 22, rank: 5, isMe: false, subtitle: '🇪🇸 Spice Explorer' },
  { id: 'user_taro',  name: 'Taro K.',   emoji: '🧑',   xp: 6900,  streak: 14, rank: 6, isMe: false, subtitle: '🇯🇵 Ramen Wizard' },
  { id: 'user_erik',  name: 'Erik (You)',emoji: '🧑‍🍳', xp: 4820,  streak: 21, rank: 7, isMe: true,  subtitle: '🇮🇳 Spice Sage' },
  { id: 'user_maria', name: 'Maria K.',  emoji: '👩‍🍳', xp: 4200,  streak: 16, rank: 8, isMe: false, subtitle: '🇲🇽 Mole Master' },
];

// ── Friends ───────────────────────────────────────────────────
export const FRIENDS: Friend[] = [
  {
    id: 'user_maria',
    name: 'Maria K.',
    emoji: '👩‍🍳',
    level: 19,
    flagEmoji: '🇲🇽',
    isOnline: true,
    activity: 'Cooking Biryani now 🍛',
    isBuddy: true,
  },
  {
    id: 'user_alex',
    name: 'Alex M.',
    emoji: '👨‍🍳',
    level: 24,
    flagEmoji: '🇯🇵',
    isOnline: true,
    activity: 'Leaderboard #2 🏆',
  },
  {
    id: 'user_priya',
    name: 'Priya S.',
    emoji: '🧑',
    level: 22,
    flagEmoji: '🇮🇳',
    isOnline: false,
    activity: 'Last seen 4h ago',
  },
];

// ── Initial Chat Messages ─────────────────────────────────────
export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    role: 'ai',
    content: "Hey Chef Erik! 👋 I'm Saffron, your AI sous chef. I can analyze your dishes, suggest substitutions, and explain the cultural story behind every recipe. What are we cooking today? 🍳",
    timestamp: '9:00 AM',
  },
  {
    id: 'msg_2',
    role: 'user',
    content: 'Can you analyze my biryani? I just finished plating it.',
    timestamp: '9:01 AM',
  },
  {
    id: 'msg_3',
    role: 'ai',
    content: "Absolutely! Upload a photo and I'll run a full CV analysis on your plating, portion balance, and color distribution. 📸",
    timestamp: '9:01 AM',
    cvScore: {
      plating: 87,
      technique: 91,
      colorBalance: 83,
      portioning: 89,
      overall: 88,
    },
  },
];

// ── AI Quick Prompts ──────────────────────────────────────────
export const QUICK_PROMPTS = [
  '📸 Analyze my dish',
  '🌍 Cultural history',
  '🔄 Substitutions',
  '🔪 Technique tips',
  '🏆 My progress',
];
