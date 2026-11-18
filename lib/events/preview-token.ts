import { createHash, timingSafeEqual } from "node:crypto";

/** URL-safe random tokens (base64url of 32 bytes is 43 chars). */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,200}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

/** Cheap shape check (no database): proxy.ts only skips the published check for these. */
export function isPlausiblePreviewToken(token: string | null | undefined): token is string {
  return typeof token === "string" && TOKEN_SHAPE.test(token);
}

/** What events.preview_token_hash stores: SHA-256 of the random token, hex. */
export function hashPreviewToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time check of a ?preview= token against the stored hash. */
export function verifyPreviewToken(
  token: string | undefined,
  storedHash: string | null | undefined,
): boolean {
  if (!isPlausiblePreviewToken(token)) return false;
  if (!storedHash || !SHA256_HEX.test(storedHash)) return false;
  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(hashPreviewToken(token), "hex");
  return timingSafeEqual(expected, actual);
}
