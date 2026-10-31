// Shared HTTP helpers for /api functions (Web-standard Request/Response)

export type ErrorCode =
  | 'bad_request'
  | 'forbidden'
  | 'payload_too_large'
  | 'rate_limited'
  | 'upstream_error'
  | 'not_configured'
  | 'method_not_allowed';

export function jsonError(status: number, code: ErrorCode, message: string, headers: HeadersInit = {}): Response {
  return Response.json({ error: { code, message } }, { status, headers });
}

// Only our own site may call the AI endpoints (stops other sites spending our quota).
// Allowed: same host as the request, anything in ALLOWED_ORIGINS, and localhost outside production.
export function isAllowedOrigin(req: Request, env: Record<string, string | undefined> = process.env): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  let originURL: URL;
  try {
    originURL = new URL(origin);
  } catch {
    return false;
  }
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
  if (originURL.host === host) return true;

  const allowList = (env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowList.includes(originURL.origin)) return true;

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(originURL.hostname);
  return isLocal && env.VERCEL_ENV !== 'production';
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

// Read a JSON body with a hard size cap (Content-Length can lie, so count bytes)
export async function readJson(req: Request, maxBytes: number): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > maxBytes) {
    return { ok: false, response: jsonError(413, 'payload_too_large', 'Request is too large.') };
  }
  const text = await req.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, response: jsonError(413, 'payload_too_large', 'Request is too large.') };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: jsonError(400, 'bad_request', 'Body must be JSON.') };
  }
}
