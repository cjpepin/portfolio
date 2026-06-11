type RateBucket = {
  timestamps: number[];
};

const CLIENT_RATE_LIMIT = 20;
const CLIENT_WINDOW_MS = 60_000;

export function checkClientRateLimit(bucket: RateBucket): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < CLIENT_WINDOW_MS);

  if (bucket.timestamps.length >= CLIENT_RATE_LIMIT) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.ceil((CLIENT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  bucket.timestamps.push(now);
  return { allowed: true };
}

export function createClientRateBucket(): RateBucket {
  return { timestamps: [] };
}
