// Browser client for POST /api/chef. Streams the reply chunk by chunk.
//
//   const reply = await askChef({ messages, dishId, stepIdx }, chunk => setDraft(d => d + chunk), abort.signal);

export interface ChefTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ChefRequest {
  messages: ChefTurn[];
  dishId?: string;
  stepIdx?: number;
}

export type ChefErrorCode = 'offline' | 'rate_limited' | 'bad_request' | 'unavailable' | 'interrupted' | 'aborted';

export class ChefError extends Error {
  constructor(readonly code: ChefErrorCode, message: string, readonly retryAfterSec?: number) {
    super(message);
    this.name = 'ChefError';
  }
}

// Same limits the server enforces — trim here so long chats still work
export const MAX_HISTORY = 20;
export const MAX_CHARS = 2000;

export function prepareHistory(messages: ChefTurn[]): ChefTurn[] {
  const trimmed = messages
    .map(m => ({ role: m.role, text: m.text.trim().slice(0, MAX_CHARS) }))
    .filter(m => m.text.length > 0)
    .slice(-MAX_HISTORY);
  // The server requires the history to start with a user turn
  while (trimmed.length && trimmed[0].role !== 'user') trimmed.shift();
  return trimmed;
}

export async function askChef(
  req: ChefRequest,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  fetchFn: typeof fetch = fetch,
): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ChefError('offline', 'You’re offline. The Sous Chef needs internet.');
  }

  let res: Response;
  try {
    res = await fetchFn('/api/chef', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req, messages: prepareHistory(req.messages) }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw new ChefError('aborted', 'Cancelled.');
    throw new ChefError('offline', 'Couldn’t reach the Sous Chef. Check your connection.', undefined);
  }

  if (!res.ok || !res.body) throw await toChefError(res);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let full = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      // SSE events are separated by a blank line
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const event = parseEvent(raw);
        if (event.data === '[DONE]') return full;
        if (event.name === 'error') {
          throw new ChefError('interrupted', safeMessage(event.data, 'The reply was cut off. Please try again.'));
        }
        const text = (JSON.parse(event.data) as { text?: string }).text ?? '';
        if (text) {
          full += text;
          onChunk(text);
        }
      }
    }
  } catch (err) {
    if (err instanceof ChefError) throw err;
    if (signal?.aborted) throw new ChefError('aborted', 'Cancelled.');
    throw new ChefError('interrupted', 'The reply was cut off. Please try again.');
  }
  // Stream ended without [DONE]
  throw new ChefError('interrupted', 'The reply was cut off. Please try again.');
}

function parseEvent(raw: string): { name: string; data: string } {
  let name = 'message';
  const data: string[] = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) name = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
  }
  return { name, data: data.join('\n') };
}

function safeMessage(json: string, fallback: string): string {
  try {
    return (JSON.parse(json) as { message?: string }).message ?? fallback;
  } catch {
    return fallback;
  }
}

async function toChefError(res: Response): Promise<ChefError> {
  let message = 'The Sous Chef is unavailable right now. Please try again.';
  try {
    message = ((await res.json()) as { error?: { message?: string } }).error?.message ?? message;
  } catch {
    // non-JSON error body
  }
  if (res.status === 429) {
    return new ChefError('rate_limited', message, Number(res.headers.get('retry-after')) || undefined);
  }
  if (res.status === 400 || res.status === 413) return new ChefError('bad_request', message);
  return new ChefError('unavailable', message);
}
