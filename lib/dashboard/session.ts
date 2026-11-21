import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** 12 hours; the dashboard re-signs on activity rather than extending this. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** No Domain attribute is ever set on this cookie: the browser scopes it to the
 * exact host, so one couple's session can never be sent to another couple's. */
export const SESSION_COOKIE_NAME = "dashboard_session";

interface SessionClaims {
  readonly eventId: string;
  /** A fingerprint of dashboard_password_hash, never the hash itself. */
  readonly fp: string;
  /** Epoch milliseconds. */
  readonly exp: number;
}

/**
 * Changes whenever the password is reset: bcrypt salts every hash
 * differently, so a new hash() call always produces a different fingerprint,
 * which is exactly what makes a reset invalidate every existing session.
 */
export function hashFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash, "utf8").digest("hex").slice(0, 16);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function base64urlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function parseClaims(payload: string): SessionClaims | null {
  try {
    const json: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof json === "object" &&
      json !== null &&
      typeof (json as SessionClaims).eventId === "string" &&
      typeof (json as SessionClaims).fp === "string" &&
      typeof (json as SessionClaims).exp === "number"
    ) {
      return json as SessionClaims;
    }
  } catch {
    // Malformed payload: verifySession treats this the same as any other failure.
  }
  return null;
}

/** A signed, stateless session token: `base64url(claims).hmacHex`. */
export function signSession(
  eventId: string,
  passwordHash: string,
  now: Date,
  secret: string,
  ttlMs: number = SESSION_TTL_MS,
): string {
  const claims: SessionClaims = { eventId, fp: hashFingerprint(passwordHash), exp: now.getTime() + ttlMs };
  const payload = base64urlEncode(JSON.stringify(claims));
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Verifies a session token against the *current* event and password hash:
 * a wrong event (cookie reused across couples), an expired token, a reset
 * password (fingerprint no longer matches) or a tampered signature all fail.
 */
export function verifySession(
  token: string,
  eventId: string,
  passwordHash: string,
  now: Date,
  secret: string,
): boolean {
  const dotIndex = token.indexOf(".");
  if (dotIndex < 1) return false;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expected = Buffer.from(sign(payload, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  const claims = parseClaims(payload);
  if (!claims) return false;
  if (claims.exp <= now.getTime()) return false;
  if (claims.eventId !== eventId) return false;
  if (claims.fp !== hashFingerprint(passwordHash)) return false;
  return true;
}
