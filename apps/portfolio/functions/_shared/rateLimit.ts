type RateBucket = {
  count: number;
  windowStart: number;
};

const rateBuckets = new Map<string, RateBucket>();

export function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { key, limit, windowMs } = input;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (current.count >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - current.windowStart)) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  current.count += 1;
  rateBuckets.set(key, current);
  return { allowed: true };
}
