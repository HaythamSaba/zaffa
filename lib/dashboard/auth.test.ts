import bcrypt from "bcryptjs";
import { describe, expect, test } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";
import { checkDashboardLogin } from "./auth";

const PASSWORD = "correct-horse-battery-staple";
const HASH = bcrypt.hashSync(PASSWORD, 4); // low cost: tests only

function deps(overrides: Partial<Parameters<typeof checkDashboardLogin>[2]> = {}) {
  return {
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    ip: "203.0.113.7",
    slug: "sara-and-omar",
    ...overrides,
  };
}

describe("checkDashboardLogin", () => {
  test("accepts the correct password", async () => {
    const result = await checkDashboardLogin(HASH, PASSWORD, deps());

    expect(result).toEqual({ ok: true });
  });

  test("rejects an incorrect password", async () => {
    const result = await checkDashboardLogin(HASH, "wrong-password", deps());

    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  test("blocks after the rate limit without checking the password", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await checkDashboardLogin(HASH, "wrong-password", d);

    const result = await checkDashboardLogin(HASH, PASSWORD, d);

    expect(result).toEqual({ ok: false, reason: "rateLimited" });
  });

  test("keeps separate rate-limit buckets per event", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    await checkDashboardLogin(HASH, "wrong-password", deps({ limiter, slug: "sara-and-omar" }));

    const result = await checkDashboardLogin(HASH, PASSWORD, deps({ limiter, slug: "layla-and-adam" }));

    expect(result).toEqual({ ok: true });
  });

  test("keeps separate rate-limit buckets per IP", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    await checkDashboardLogin(HASH, "wrong-password", deps({ limiter, ip: "203.0.113.7" }));

    const result = await checkDashboardLogin(HASH, PASSWORD, deps({ limiter, ip: "198.51.100.9" }));

    expect(result).toEqual({ ok: true });
  });

  test("shares one bucket when the IP is unknown", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    await checkDashboardLogin(HASH, "wrong-password", deps({ limiter, ip: null }));

    const result = await checkDashboardLogin(HASH, PASSWORD, deps({ limiter, ip: null }));

    expect(result).toEqual({ ok: false, reason: "rateLimited" });
  });
});
