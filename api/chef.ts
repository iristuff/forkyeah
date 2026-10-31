// POST /api/chef — streams Sous Chef replies as Server-Sent Events.
//   data: {"text":"..."}            one per chunk
//   event: error / data: {...}      if the model fails mid-stream
//   data: [DONE]                    end of reply
import { geminiChefModel, withRetry, type ChefModel } from './_lib/ai';
import { clientIp, isAllowedOrigin, jsonError, readJson } from './_lib/http';
import { buildChefSystemPrompt } from './_lib/prompts';
import { defaultRateLimiter, type RateLimiter } from './_lib/rateLimit';
import { CHEF_LIMITS, ChefRequestSchema } from './_lib/schemas';

const TIMEOUT_MS = 25_000;

export interface ChefDeps {
  model: () => ChefModel | null;
  rateLimit: RateLimiter;
  env?: Record<string, string | undefined>;
}

export function createChefHandler(deps: ChefDeps) {
  return async function handle(req: Request): Promise<Response> {
    if (req.method !== 'POST') return jsonError(405, 'method_not_allowed', 'Use POST.', { Allow: 'POST' });
    if (!isAllowedOrigin(req, deps.env)) return jsonError(403, 'forbidden', 'Not allowed from this origin.');

    const limit = await deps.rateLimit(`chef:${clientIp(req)}`, CHEF_LIMITS.requestsPerMinute, 60);
    if (!limit.ok) {
      return jsonError(429, 'rate_limited', 'The Sous Chef needs a breather. Try again in a moment.', {
        'Retry-After': String(limit.retryAfterSec),
      });
    }

    const body = await readJson(req, CHEF_LIMITS.maxBodyBytes);
    if (!body.ok) return body.response;
    const parsed = ChefRequestSchema.safeParse(body.body);
    if (!parsed.success) return jsonError(400, 'bad_request', parsed.error.issues[0]?.message ?? 'Invalid request.');

    const model = deps.model();
    if (!model) return jsonError(503, 'not_configured', 'The Sous Chef is not set up yet.');

    const { messages, dishId, stepIdx } = parsed.data;
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(TIMEOUT_MS)]);

    let chunks: AsyncIterable<string>;
    try {
      chunks = await withRetry(() =>
        model.streamChat({ system: buildChefSystemPrompt(dishId, stepIdx), history: messages, signal }),
      );
    } catch (err) {
      console.error('[chef] upstream_error', (err as Error).message);
      return jsonError(502, 'upstream_error', 'The Sous Chef is unavailable right now. Please try again.');
    }

    const encoder = new TextEncoder();
    const sse = (data: string, event?: string) => encoder.encode(`${event ? `event: ${event}\n` : ''}data: ${data}\n\n`);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const text of chunks) controller.enqueue(sse(JSON.stringify({ text })));
          controller.enqueue(sse('[DONE]'));
        } catch (err) {
          console.error('[chef] stream_error', (err as Error).message);
          controller.enqueue(sse(JSON.stringify({ code: 'upstream_error', message: 'The reply was cut off. Please try again.' }), 'error'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  };
}

export const POST = createChefHandler({
  model: () => {
    const key = process.env.GEMINI_API_KEY;
    return key ? geminiChefModel(key, process.env.GEMINI_MODEL || undefined) : null;
  },
  rateLimit: defaultRateLimiter(),
});
