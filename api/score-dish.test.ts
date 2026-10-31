import { describe, expect, it, vi } from 'vitest';
import { createScoreHandler, type ScoreDeps } from './score-dish';
import { UpstreamError, type ScoreModel } from './_lib/ai';
import { memoryRateLimiter } from './_lib/rateLimit';
import { base64Bytes } from './_lib/schemas';
import { buildScorePrompt } from './_lib/prompts';
import { blobToBase64, fitWithin, scoreDish, ScoreError } from '../src/lib/scoreClient';
import { emptyProgress, recordScore } from '../src/lib/game';

const ORIGIN = 'https://forkyeah.vercel.app';
const JPEG = '/9j/' + 'A'.repeat(2000);
const photo = { dishId: 'miso-soup', imageBase64: JPEG };
const GOOD = { plating: 80, technique: 75, colorBalance: 70, portioning: 85, overall: 78, feedback: 'Lovely clear broth. Try slicing the scallions thinner.' };

function req(body: unknown, init: { origin?: string | null; ip?: string; method?: string; raw?: string } = {}) {
  const headers = new Headers({ 'content-type': 'application/json', host: 'forkyeah.vercel.app', 'x-forwarded-for': init.ip ?? '1.2.3.4' });
  if (init.origin !== null) headers.set('origin', init.origin ?? ORIGIN);
  return new Request('https://forkyeah.vercel.app/api/score-dish', {
    method: init.method ?? 'POST',
    headers,
    body: init.method === 'GET' ? undefined : init.raw ?? JSON.stringify(body),
  });
}

// Fake vision model: answers with `outputs` in order (last one repeats), or throws
function fakeModel(outputs: unknown[] = [GOOD], opts: { failTimes?: number; status?: number } = {}) {
  const calls: Parameters<ScoreModel['scoreDish']>[0][] = [];
  let failures = 0;
  const model: ScoreModel = {
    async scoreDish(args) {
      calls.push(args);
      if (failures < (opts.failTimes ?? 0)) {
        failures++;
        throw new UpstreamError('boom', opts.status ?? 503);
      }
      return outputs[Math.min(calls.length - 1, outputs.length - 1)];
    },
  };
  return { model, calls };
}

function handler(overrides: Partial<ScoreDeps> = {}) {
  const { model } = fakeModel();
  return createScoreHandler({ model: () => model, rateLimit: memoryRateLimiter(), env: {}, ...overrides });
}

describe('POST /api/score-dish', () => {
  it('returns validated scores', async () => {
    const res = await handler()(req(photo));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(GOOD);
  });

  it('sends the photo, the expected dish and a JSON schema to the model', async () => {
    const { model, calls } = fakeModel();
    await handler({ model: () => model })(req(photo));
    expect(calls[0].imageBase64).toBe(JPEG);
    expect(calls[0].prompt).toContain('Miso Soup');
    expect(calls[0].system).toContain('plating judge');
    expect(calls[0].jsonSchema).toMatchObject({ type: 'object', required: expect.arrayContaining(['overall', 'feedback']) });
    expect(calls[0].jsonSchema).not.toHaveProperty('$schema');
  });

  it('rejects other methods, foreign origins and missing origins', async () => {
    expect((await handler()(req(null, { method: 'GET' }))).status).toBe(405);
    expect((await handler()(req(photo, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await handler()(req(photo, { origin: null }))).status).toBe(403);
  });

  it('validates the request body', async () => {
    const h = handler();
    let ip = 0; // fresh IP per call so the 5/min limit doesn't kick in
    const status = async (body: unknown, raw?: string) => (await h(req(body, { raw, ip: `10.0.0.${ip++}` }))).status;
    expect(await status(null, '{not json')).toBe(400);
    expect(await status({ dishId: 'miso-soup' })).toBe(400);
    expect(await status({ ...photo, dishId: 'not-a-dish' })).toBe(400);
    expect(await status({ ...photo, imageBase64: 'iVBORw0KGgo=' })).toBe(400); // PNG, not JPEG
    expect(await status({ ...photo, imageBase64: '/9j/<script>' })).toBe(400);
    expect(await status({ ...photo, imageBase64: '' })).toBe(400);
  });

  it('rejects images over 1.5 MB with 413', async () => {
    const h = handler();
    // Under the body cap but over the image cap
    const big = '/9j/' + 'A'.repeat(2_066_000);
    expect(base64Bytes(big)).toBeGreaterThan(1_500_000);
    expect((await h(req({ ...photo, imageBase64: big }))).status).toBe(413);
    // Over the body cap entirely
    expect((await h(req({ ...photo, imageBase64: '/9j/' + 'A'.repeat(2_200_000) }))).status).toBe(413);
  });

  it('rate-limits to 5 per minute per IP, separately from chat', async () => {
    const limiter = memoryRateLimiter();
    const h = handler({ rateLimit: limiter });
    for (let i = 0; i < 5; i++) expect((await h(req(photo))).status).toBe(200);
    const blocked = await h(req(photo));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await h(req(photo, { ip: '9.9.9.9' }))).status).toBe(200);
    expect((await limiter('chef:1.2.3.4', 20, 60)).ok).toBe(true);
  });

  it('returns 503 when no API key is configured', async () => {
    const res = await handler({ model: () => null })(req(photo));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: 'not_configured', message: expect.any(String) } });
  });

  it('retries a transient provider failure once, then gives up with 502', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const once = fakeModel([GOOD], { failTimes: 1 });
    expect((await handler({ model: () => once.model })(req(photo))).status).toBe(200);
    expect(once.calls).toHaveLength(2);

    const always = fakeModel([GOOD], { failTimes: 5 });
    expect((await handler({ model: () => always.model })(req(photo))).status).toBe(502);
    expect(always.calls).toHaveLength(2);

    const bad = fakeModel([GOOD], { failTimes: 5, status: 400 });
    expect((await handler({ model: () => bad.model })(req(photo))).status).toBe(502);
    expect(bad.calls).toHaveLength(1);
    spy.mockRestore();
  });

  it('retries once when the model answers with the wrong shape', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixed = fakeModel([{ ...GOOD, overall: 140 }, GOOD]);
    const res = await handler({ model: () => fixed.model })(req(photo));
    expect(res.status).toBe(200);
    expect(fixed.calls).toHaveLength(2);

    for (const junk of [{ ...GOOD, overall: 77.5 }, { ...GOOD, feedback: '' }, { plating: 50 }, 'not an object']) {
      const r = await handler({ model: () => fakeModel([junk]).model })(req(photo));
      expect(r.status).toBe(502);
      expect(JSON.stringify(await r.json())).not.toContain('validation');
    }
    spy.mockRestore();
  });
});

describe('score helpers', () => {
  it('computes decoded base64 size', () => {
    expect(base64Bytes(btoa('abc'))).toBe(3);
    expect(base64Bytes(btoa('abcd'))).toBe(4);
    expect(base64Bytes(btoa('abcde'))).toBe(5);
  });

  it('prompt falls back for unknown dishes', () => {
    expect(buildScorePrompt('nope')).toBe('Score this home-cooked dish.');
  });

  it('fits photos inside 1024px without upscaling', () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(3024, 4032)).toEqual({ width: 768, height: 1024 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('encodes a blob as plain base64', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
    const b64 = await blobToBase64(new Blob([bytes]));
    expect(b64.startsWith('/9j/')).toBe(true);
    expect(Uint8Array.from(atob(b64), c => c.charCodeAt(0))).toEqual(bytes);
  });
});

describe('scoreDish client', () => {
  const viaHandler = (h: (r: Request) => Promise<Response>) =>
    (async (_url: string, init: RequestInit) => {
      const headers = new Headers(init.headers);
      headers.set('origin', ORIGIN);
      headers.set('host', 'forkyeah.vercel.app');
      return h(new Request('https://forkyeah.vercel.app/api/score-dish', { ...init, headers }));
    }) as unknown as typeof fetch;

  it('scores end-to-end through the real handler and pays bonus XP in the store logic', async () => {
    const result = await scoreDish(photo, undefined, viaHandler(handler()));
    expect(result).toEqual(GOOD);

    const { progress, events } = recordScore(emptyProgress(), 'miso-soup', result, new Date('2026-10-31T12:00:00'));
    expect(progress.xp).toBe(78);
    expect(progress.dishes['miso-soup'].bestScore).toEqual({ plating: 80, technique: 75, colorBalance: 70, portioning: 85, overall: 78 });
    expect(events).toContainEqual({ type: 'xp', amount: 78, reason: 'Plating score' });
  });

  it('maps errors to friendly codes', async () => {
    const respond = (res: Response) => (async () => res) as unknown as typeof fetch;
    await expect(scoreDish(photo, undefined, respond(Response.json({ error: { message: 'slow down' } }, { status: 429, headers: { 'retry-after': '40' } }))))
      .rejects.toMatchObject({ code: 'rate_limited', retryAfterSec: 40, message: 'slow down' });
    await expect(scoreDish(photo, undefined, respond(Response.json({ error: { message: 'big' } }, { status: 413 })))).rejects.toMatchObject({ code: 'too_large' });
    await expect(scoreDish(photo, undefined, respond(Response.json({ error: { message: 'bad' } }, { status: 400 })))).rejects.toMatchObject({ code: 'bad_image' });
    await expect(scoreDish(photo, undefined, respond(new Response('oops', { status: 502 })))).rejects.toMatchObject({ code: 'unavailable' });
    await expect(scoreDish(photo, undefined, respond(Response.json({ plating: 1 })))).rejects.toMatchObject({ code: 'unavailable' });
    await expect(scoreDish(photo, undefined, (async () => { throw new TypeError('network'); }) as unknown as typeof fetch)).rejects.toBeInstanceOf(ScoreError);
  });

  it('reports a cancelled request as aborted', async () => {
    const abort = new AbortController();
    abort.abort();
    const fetchFn = (async () => { throw new DOMException('aborted', 'AbortError'); }) as unknown as typeof fetch;
    await expect(scoreDish(photo, abort.signal, fetchFn)).rejects.toMatchObject({ code: 'aborted' });
  });
});
