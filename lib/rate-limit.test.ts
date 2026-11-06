import { describe, expect, test } from "vitest";
import { createRateLimiter } from "./rate-limit";

function clock(start = 0) {
  let now = start;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe("createRateLimiter", () => {
  test("allows up to the limit within the window", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: time.now });

    const results = [limiter.check("a"), limiter.check("a"), limiter.check("a")];

    expect(results.every((r) => r.allowed)).toBe(true);
  });

  test("blocks the request after the limit and reports when to retry", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: time.now });
    limiter.check("a");
    time.advance(300);
    limiter.check("a");

    const blocked = limiter.check("a");

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(700);
  });

  test("allows again once the oldest hit leaves the window", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: time.now });
    limiter.check("a");
    time.advance(1000);

    expect(limiter.check("a").allowed).toBe(true);
  });

  test("does not count blocked attempts against the window", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: time.now });
    limiter.check("a");
    time.advance(500);
    limiter.check("a"); // blocked
    time.advance(500);

    expect(limiter.check("a").allowed).toBe(true);
  });

  test("tracks keys independently", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: time.now });
    limiter.check("a");

    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  test("evicts expired keys so memory stays bounded", () => {
    const time = clock();
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: time.now,
      maxKeys: 2,
    });
    limiter.check("a");
    limiter.check("b");
    time.advance(1000);
    limiter.check("c");

    expect(limiter.size()).toBeLessThanOrEqual(2);
  });

  test("rejects invalid configuration", () => {
    expect(() => createRateLimiter({ limit: 0, windowMs: 1000 })).toThrow();
    expect(() => createRateLimiter({ limit: 1, windowMs: 0 })).toThrow();
  });
});
