// Fixed-window rate limiter.
// Uses Upstash Redis (REST) when its URL/token env vars are set, so limits hold
// across serverless instances. Otherwise falls back to per-instance memory (fine for dev).

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export type RateLimiter = (key: string, limit: number, windowSec: number) => Promise<RateLimitResult>;

export function memoryRateLimiter(now: () => number = Date.now): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return async (key, limit, windowSec) => {
    const t = now();
    let w = windows.get(key);
    if (!w || t >= w.resetAt) {
      w = { count: 0, resetAt: t + windowSec * 1000 };
      windows.set(key, w);
    }
    w.count++;
    // Opportunistic cleanup so the map can't grow forever
    if (windows.size > 5000) for (const [k, v] of windows) if (t >= v.resetAt) windows.delete(k);
    return {
      ok: w.count <= limit,
      remaining: Math.max(0, limit - w.count),
      retryAfterSec: Math.ceil((w.resetAt - t) / 1000),
    };
  };
}

export function upstashRateLimiter(url: string, token: string, fetchFn: typeof fetch = fetch): RateLimiter {
  return async (key, limit, windowSec) => {
    const bucket = Math.floor(Date.now() / (windowSec * 1000));
    const redisKey = `rl:${key}:${bucket}`;
    const res = await fetchFn(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, String(windowSec), 'NX'],
      ]),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const [{ result: count }] = (await res.json()) as [{ result: number }, unknown];
    const resetAt = (bucket + 1) * windowSec * 1000;
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSec: Math.ceil((resetAt - Date.now()) / 1000),
    };
  };
}

// Upstash's own names, or the KV_* names the Vercel Marketplace integration creates
export function redisConfig(env: Record<string, string | undefined>): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let shared: RateLimiter | undefined;

export function defaultRateLimiter(env: Record<string, string | undefined> = process.env): RateLimiter {
  if (shared) return shared;
  const redis = redisConfig(env);
  const limiter = redis ? upstashRateLimiter(redis.url, redis.token) : memoryRateLimiter();
  const fallback = memoryRateLimiter();
  // If Redis is down, degrade to memory limits rather than failing every request
  shared = async (key, limit, windowSec) => {
    try {
      return await limiter(key, limit, windowSec);
    } catch (err) {
      console.error('[rate-limit] falling back to memory:', (err as Error).message);
      return fallback(key, limit, windowSec);
    }
  };
  return shared;
}
