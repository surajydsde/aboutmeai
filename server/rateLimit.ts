// Simple fixed-window limiter. On serverless each warm instance keeps its own counts,
// so this is a speed bump against casual abuse, not a hard guarantee.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function clientIp(headers: Record<string, unknown>, fallback = 'unknown'): string {
  const forwarded = headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof value === 'string' && value.length > 0) return value.split(',')[0].trim();
  const real = headers['x-real-ip'];
  return typeof real === 'string' && real ? real : fallback;
}

export function __resetRateLimitsForTests() {
  buckets.clear();
}
