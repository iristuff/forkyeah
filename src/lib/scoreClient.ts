// Browser client for POST /api/score-dish.
//
//   const imageBase64 = await resizeImage(file);            // from <input type="file" accept="image/*">
//   const result = await scoreDish({ dishId, imageBase64 }); // throws ScoreError
//   const events = recordScore(dishId, result);              // store action: bonus XP etc.
import type { CVScore } from '../types';

export interface ScoreResult extends CVScore {
  feedback: string;
}

export type ScoreErrorCode = 'offline' | 'rate_limited' | 'bad_image' | 'too_large' | 'unavailable' | 'aborted';

export class ScoreError extends Error {
  constructor(readonly code: ScoreErrorCode, message: string, readonly retryAfterSec?: number) {
    super(message);
    this.name = 'ScoreError';
  }
}

// Same limits the server enforces
export const MAX_SIDE = 1024;
export const MAX_IMAGE_BYTES = 1_500_000;

// Largest size that fits inside max×max, keeping the aspect ratio and never upscaling
export function fitWithin(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

// Phone photos are 3-8 MB; shrink to a ~200 KB JPEG before upload. Browser only.
export async function resizeImage(file: Blob): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ScoreError('bad_image', 'Couldn’t read that photo. Try another one.');
  }
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ScoreError('bad_image', 'Couldn’t read that photo. Try another one.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of [0.8, 0.6]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= MAX_IMAGE_BYTES) return blobToBase64(blob);
  }
  throw new ScoreError('too_large', 'That photo is too large. Please try a smaller one.');
}

export async function scoreDish(
  req: { dishId: string; imageBase64: string },
  signal?: AbortSignal,
  fetchFn: typeof fetch = fetch,
): Promise<ScoreResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ScoreError('offline', 'You’re offline. Dish scoring needs internet.');
  }

  let res: Response;
  try {
    res = await fetchFn('/api/score-dish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
  } catch {
    if (signal?.aborted) throw new ScoreError('aborted', 'Cancelled.');
    throw new ScoreError('offline', 'Couldn’t reach the judge. Check your connection.');
  }

  if (!res.ok) throw await toScoreError(res);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ScoreError('unavailable', UNAVAILABLE);
  }
  if (!isScoreResult(data)) throw new ScoreError('unavailable', UNAVAILABLE);
  return data;
}

const UNAVAILABLE = 'Couldn’t score your dish right now. Please try again.';

function isScoreResult(v: unknown): v is ScoreResult {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  const keys = ['plating', 'technique', 'colorBalance', 'portioning', 'overall'] as const;
  return keys.every(k => typeof r[k] === 'number' && Number.isFinite(r[k])) && typeof r.feedback === 'string';
}

async function toScoreError(res: Response): Promise<ScoreError> {
  let message = UNAVAILABLE;
  try {
    message = ((await res.json()) as { error?: { message?: string } }).error?.message ?? message;
  } catch {
    // non-JSON error body
  }
  if (res.status === 429) {
    return new ScoreError('rate_limited', message, Number(res.headers.get('retry-after')) || undefined);
  }
  if (res.status === 413) return new ScoreError('too_large', message);
  if (res.status === 400) return new ScoreError('bad_image', message);
  return new ScoreError('unavailable', message);
}
