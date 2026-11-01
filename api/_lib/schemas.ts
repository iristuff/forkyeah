import { z } from 'zod';

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
    skill: z.enum(['new', 'some', 'confident']).optional(),
  })
  .refine(r => r.messages.at(-1)?.role === 'user', { message: 'The last message must be from the user.' });

export type ChefRequest = z.infer<typeof ChefRequestSchema>;
