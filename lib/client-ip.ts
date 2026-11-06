import { isIP } from "node:net";

/**
 * Client IP as reported by Vercel's edge. Vercel overwrites `x-real-ip` and
 * `x-forwarded-for`, so these are trustworthy on Vercel only. Other
 * client-settable headers (x-client-ip, cf-connecting-ip, ...) are ignored.
 */
export function getClientIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip")?.trim();
  const firstForwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  for (const candidate of [realIp, firstForwarded]) {
    if (candidate && isIP(candidate) !== 0) return candidate;
  }
  return null;
}
