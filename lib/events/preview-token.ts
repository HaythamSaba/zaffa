import { createHash, timingSafeEqual } from "node:crypto";

const MIN_TOKEN_LENGTH = 16;
const MAX_TOKEN_LENGTH = 200;
const SHA256_HEX = /^[0-9a-f]{64}$/;

/** What events.preview_token_hash stores: SHA-256 of the random token, hex. */
export function hashPreviewToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time check of a ?preview= token against the stored hash. */
export function verifyPreviewToken(
  token: string | undefined,
  storedHash: string | null | undefined,
): boolean {
  if (!token || token.length < MIN_TOKEN_LENGTH || token.length > MAX_TOKEN_LENGTH) return false;
  if (!storedHash || !SHA256_HEX.test(storedHash)) return false;
  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(hashPreviewToken(token), "hex");
  return timingSafeEqual(expected, actual);
}
