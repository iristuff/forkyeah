// POST /api/score-dish — scores a photo of a finished dish with Gemini vision.
//   request:  {dishId, imageBase64}  (JPEG, resized on the phone to ~1024px)
//   response: {plating, technique, colorBalance, portioning, overall, feedback}, scores 0-100
import { z } from 'zod';
import { geminiScoreModel, UpstreamError, withRetry, type ScoreModel } from './_lib/ai.js';
import { clientIp, isAllowedOrigin, jsonError, readJson } from './_lib/http.js';
import { buildScorePrompt, buildScoreSystemPrompt } from './_lib/prompts.js';
import { defaultRateLimiter, type RateLimiter } from './_lib/rateLimit.js';
import { base64Bytes, SCORE_LIMITS, ScoreRequestSchema, ScoreResultSchema } from './_lib/schemas.js';

const TIMEOUT_MS = 25_000;
const { $schema: _, ...RESULT_JSON_SCHEMA } = z.toJSONSchema(ScoreResultSchema) as Record<string, unknown>;

export interface ScoreDeps {
  model: () => ScoreModel | null;
  rateLimit: RateLimiter;
  env?: Record<string, string | undefined>;
}

export function createScoreHandler(deps: ScoreDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return jsonError(405, 'method_not_allowed', 'Use POST.', { Allow: 'POST' });
    if (!isAllowedOrigin(req, deps.env)) return jsonError(403, 'forbidden', 'Not allowed from this origin.');

    const limit = await deps.rateLimit(`score:${clientIp(req)}`, SCORE_LIMITS.requestsPerMinute, 60);
    if (!limit.ok) {
      return jsonError(429, 'rate_limited', 'The judge needs a breather. Try again in a moment.', {
        'Retry-After': String(limit.retryAfterSec),
      });
    }

    const body = await readJson(req, SCORE_LIMITS.maxBodyBytes);
    if (!body.ok) return body.response;
    const parsed = ScoreRequestSchema.safeParse(body.body);
    if (!parsed.success) return jsonError(400, 'bad_request', parsed.error.issues[0]?.message ?? 'Invalid request.');

    const { dishId, imageBase64 } = parsed.data;
    if (base64Bytes(imageBase64) > SCORE_LIMITS.maxImageBytes) {
      return jsonError(413, 'payload_too_large', 'That photo is too large. Please try a smaller one.');
    }

    const model = deps.model();
    if (!model) return jsonError(503, 'not_configured', 'Dish scoring is not set up yet.');

    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(TIMEOUT_MS)]);
    try {
      // A malformed answer counts as a transient failure, so it gets the one retry too
      const result = await withRetry(async () => {
        const raw = await model.scoreDish({
          system: buildScoreSystemPrompt(),
          prompt: buildScorePrompt(dishId),
          imageBase64,
          jsonSchema: RESULT_JSON_SCHEMA,
          signal,
        });
        const checked = ScoreResultSchema.safeParse(raw);
        if (!checked.success) throw new UpstreamError('Model output failed validation');
        return checked.data;
      });
      return Response.json(result, { headers: { 'X-RateLimit-Remaining': String(limit.remaining) } });
    } catch (err) {
      console.error('[score-dish] upstream_error', (err as Error).message);
      return jsonError(502, 'upstream_error', 'Couldn’t score your dish right now. Please try again.');
    }
  };
}

export const POST = createScoreHandler({
  model: () => {
    const key = process.env.GEMINI_API_KEY;
    return key ? geminiScoreModel(key, process.env.GEMINI_MODEL || undefined) : null;
  },
  rateLimit: defaultRateLimiter(),
});
