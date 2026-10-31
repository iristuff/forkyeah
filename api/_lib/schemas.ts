import { z } from 'zod';
import { getDish } from '../../src/content/cuisines.js';

export const CHEF_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 2000,
  maxBodyBytes: 64 * 1024,
  requestsPerMinute: 20,
} as const;

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().trim().min(1).max(CHEF_LIMITS.maxMessageChars),
});

export const ChefRequestSchema = z
  .object({
    messages: z.array(ChatMessageSchema).min(1).max(CHEF_LIMITS.maxMessages),
    dishId: z.string().max(64).optional(),
    stepIdx: z.number().int().min(0).max(50).optional(),
  })
  .refine(r => r.messages.at(-1)?.role === 'user', { message: 'The last message must be from the user.' });

export type ChefRequest = z.infer<typeof ChefRequestSchema>;

// ── /api/score-dish ───────────────────────────────────────────
export const SCORE_LIMITS = {
  maxImageBytes: 1_500_000,
  maxBodyBytes: 2_100_000, // 1.5 MB as base64 (~2 MB) plus the JSON around it
  requestsPerMinute: 5,
} as const;

// A JPEG always starts with FF D8 FF, which is "/9j/" in base64
const JPEG_BASE64 = /^\/9j\/[A-Za-z0-9+/]*={0,2}$/;

export const ScoreRequestSchema = z.object({
  dishId: z.string().max(64).refine(id => getDish(id) !== undefined, { message: 'Unknown dish.' }),
  imageBase64: z.string().regex(JPEG_BASE64, { message: 'Image must be a base64 JPEG.' }),
});

export type ScoreRequest = z.infer<typeof ScoreRequestSchema>;

const Score = z.number().int().min(0).max(100);

export const ScoreResultSchema = z.object({
  plating: Score,
  technique: Score,
  colorBalance: Score,
  portioning: Score,
  overall: Score,
  feedback: z.string().trim().min(1).max(600),
});

export type ScoreResult = z.infer<typeof ScoreResultSchema>;

export function base64Bytes(b64: string): number {
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}
