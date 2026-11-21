import bcrypt from "bcryptjs";
import type { RateLimiter } from "@/lib/rate-limit";

export interface LoginAttemptDeps {
  limiter: RateLimiter;
  ip: string | null;
  slug: string;
}

export type LoginResult = { ok: true } | { ok: false; reason: "rateLimited" | "invalid" };

const UNKNOWN_IP_KEY = "unknown";

/**
 * Checked against the rate limit first, so a flood of guesses costs nothing
 * in bcrypt CPU time once the limit is hit. One bucket per event+IP: a
 * stranger hammering one couple's dashboard never locks out another couple.
 */
export async function checkDashboardLogin(
  passwordHash: string,
  attempt: string,
  deps: LoginAttemptDeps,
): Promise<LoginResult> {
  const key = `${deps.slug}:${deps.ip ?? UNKNOWN_IP_KEY}`;
  if (!deps.limiter.check(key).allowed) {
    return { ok: false, reason: "rateLimited" };
  }

  const matches = await bcrypt.compare(attempt, passwordHash);
  return matches ? { ok: true } : { ok: false, reason: "invalid" };
}
