/**
 * In-memory sliding-window rate limiter.
 *
 * State lives in the server instance's memory, so on serverless hosting each
 * instance counts separately. Good enough as a first line of defence for the
 * contact form; swap for a shared store (e.g. Upstash) behind the same
 * interface if abuse appears.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Milliseconds until the next request would be allowed (0 when allowed). */
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  /** Number of tracked keys (exposed for tests and monitoring). */
  size(): number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  /** Upper bound on tracked keys before expired ones are evicted. */
  maxKeys?: number;
}

const DEFAULT_MAX_KEYS = 10_000;

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer, got ${value}`);
  }
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = DEFAULT_MAX_KEYS,
}: RateLimiterOptions): RateLimiter {
  assertPositiveInteger("limit", limit);
  assertPositiveInteger("windowMs", windowMs);
  assertPositiveInteger("maxKeys", maxKeys);

  const hits = new Map<string, readonly number[]>();

  const inWindow = (timestamps: readonly number[], at: number) =>
    timestamps.filter((t) => at - t < windowMs);

  function makeRoom(at: number): void {
    for (const [key, timestamps] of hits) {
      if (inWindow(timestamps, at).length === 0) hits.delete(key);
    }
    // Still full: drop the oldest-inserted key rather than grow without bound.
    if (hits.size >= maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest !== undefined) hits.delete(oldest);
    }
  }

  return {
    check(key) {
      const at = now();
      const recent = inWindow(hits.get(key) ?? [], at);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterMs: windowMs - (at - recent[0]) };
      }

      if (!hits.has(key) && hits.size >= maxKeys) makeRoom(at);
      hits.set(key, [...recent, at]);
      return { allowed: true, retryAfterMs: 0 };
    },
    size: () => hits.size,
  };
}
