import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }) : null;
const limiters = new Map<string, Ratelimit>();
const local = new Map<string, { count: number; reset: number }>();
export async function checkRateLimit(scope: string, identifier: string, requests = 60) {
  const key = createHash('sha256').update(identifier).digest('hex');
  if (!redis) {
    if (process.env.NODE_ENV === 'production') return { status: 503, retryAfter: 60 };
    const now = Date.now();
    for (const [k, v] of local) if (v.reset <= now) local.delete(k);
    const entryKey = `${scope}:${key}`;
    const entry = local.get(entryKey) || { count: 0, reset: now + 60000 };
    entry.count++;
    local.set(entryKey, entry);
    return { status: entry.count > requests ? 429 : 200, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  try {
    const limiterKey = `${scope}:${requests}`;
    if (!limiters.has(limiterKey)) limiters.set(limiterKey, new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, '1 m'), prefix: `spectr:${scope}` }));
    const result = await limiters.get(limiterKey)!.limit(key);
    return { status: result.success ? 200 : 429, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
  } catch { return { status: 503, retryAfter: 60 }; }
}
export async function readJsonBody(request: Request, maxBytes = 16384): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Invalid request body');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error('Request body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body');
  return body;
}
