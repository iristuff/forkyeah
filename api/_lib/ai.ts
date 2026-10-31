// The only file that knows which AI provider we use. Swap providers here.
import { GoogleGenAI } from '@google/genai';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ChefModel {
  // Yields text chunks. Rejects before the first chunk if the provider call fails.
  streamChat(opts: { system: string; history: ChatTurn[]; signal: AbortSignal }): Promise<AsyncIterable<string>>;
}

export interface ScoreModel {
  // Returns the model's parsed JSON answer (unvalidated). Rejects on provider failure or non-JSON output.
  scoreDish(opts: { system: string; prompt: string; imageBase64: string; jsonSchema: unknown; signal: AbortSignal }): Promise<unknown>;
}

export const DEFAULT_MODEL = 'gemini-flash-latest';

export class UpstreamError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export function geminiChefModel(apiKey: string, model = DEFAULT_MODEL): ChefModel {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async streamChat({ system, history, signal }) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: history.map(t => ({ role: t.role, parts: [{ text: t.text }] })),
          config: { systemInstruction: system, maxOutputTokens: 800, temperature: 0.7, abortSignal: signal },
        });
        return (async function* () {
          for await (const chunk of stream) {
            if (chunk.text) yield chunk.text;
          }
        })();
      } catch (err) {
        const status = (err as { status?: number }).status;
        throw new UpstreamError((err as Error).message, status);
      }
    },
  };
}

export function geminiScoreModel(apiKey: string, model = DEFAULT_MODEL): ScoreModel {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async scoreDish({ system, prompt, imageBase64, jsonSchema, signal }) {
      let text: string | undefined;
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }, { text: prompt }] }],
          config: {
            systemInstruction: system,
            responseMimeType: 'application/json',
            responseJsonSchema: jsonSchema,
            temperature: 0.4,
            abortSignal: signal,
          },
        });
        text = res.text;
      } catch (err) {
        const status = (err as { status?: number }).status;
        throw new UpstreamError((err as Error).message, status);
      }
      try {
        return JSON.parse(text ?? '');
      } catch {
        throw new UpstreamError('Model returned non-JSON output');
      }
    },
  };
}

// Retry once on a transient (5xx / network) failure, never on 4xx
export async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const status = err instanceof UpstreamError ? err.status : undefined;
    const transient = status === undefined || status >= 500;
    if (retries > 0 && transient && !(err instanceof DOMException && err.name === 'AbortError')) {
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}
