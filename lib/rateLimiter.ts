/**
 * Rate Limiter for fetch-triggering endpoints (docs/04-API-AND-SECURITY.md §3)
 * Enforces per-IP and per-resource limits to protect booking sources and worker capacity.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 5 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = store.get(key) ?? { timestamps: [] };

  // Filter timestamps within sliding window
  const windowStart = now - options.windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = oldest ? oldest + options.windowMs - now : options.windowMs;
    store.set(key, record);
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  record.timestamps.push(now);
  store.set(key, record);

  return {
    allowed: true,
    remaining: options.maxRequests - record.timestamps.length,
    resetMs: options.windowMs,
  };
}
