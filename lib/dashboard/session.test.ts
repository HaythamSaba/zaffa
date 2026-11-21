import { describe, expect, test } from "vitest";
import { hashFingerprint, signSession, verifySession } from "./session";

const NOW = new Date("2027-04-01T10:00:00Z");
const SECRET = "test-secret-at-least-32-bytes-long-ok";
const EVENT_ID = "10000000-0000-0000-0000-000000000001";
const HASH = "$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ";
const OTHER_HASH = "$2b$12$zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

function laterBy(ms: number): Date {
  return new Date(NOW.getTime() + ms);
}

describe("hashFingerprint", () => {
  test("is deterministic for the same hash", () => {
    expect(hashFingerprint(HASH)).toBe(hashFingerprint(HASH));
  });

  test("differs for different hashes", () => {
    expect(hashFingerprint(HASH)).not.toBe(hashFingerprint(OTHER_HASH));
  });

  test("never contains the original hash", () => {
    expect(hashFingerprint(HASH)).not.toContain(HASH);
  });
});

describe("signSession / verifySession", () => {
  test("verifies a freshly signed session", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET);

    expect(verifySession(token, EVENT_ID, HASH, NOW, SECRET)).toBe(true);
  });

  test("still verifies just before expiry", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET, 1000);

    expect(verifySession(token, EVENT_ID, HASH, laterBy(999), SECRET)).toBe(true);
  });

  test("rejects a session after it expires", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET, 1000);

    expect(verifySession(token, EVENT_ID, HASH, laterBy(1001), SECRET)).toBe(false);
  });

  test("rejects a session for a different event (no cross-event reuse)", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET);

    expect(verifySession(token, "20000000-0000-0000-0000-000000000002", HASH, NOW, SECRET)).toBe(false);
  });

  test("rejects a session once the password has been reset", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET);

    expect(verifySession(token, EVENT_ID, OTHER_HASH, NOW, SECRET)).toBe(false);
  });

  test("rejects a session signed with a different secret", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET);

    expect(verifySession(token, EVENT_ID, HASH, NOW, "a-completely-different-secret")).toBe(false);
  });

  test("rejects a tampered payload", () => {
    const token = signSession(EVENT_ID, HASH, NOW, SECRET);
    const [payload, signature] = token.split(".");
    const tampered = `${Buffer.from("junk").toString("base64url")}.${signature}`;

    expect(tampered).not.toBe(`${payload}.${signature}`);
    expect(verifySession(tampered, EVENT_ID, HASH, NOW, SECRET)).toBe(false);
  });

  test("rejects malformed tokens instead of throwing", () => {
    expect(verifySession("", EVENT_ID, HASH, NOW, SECRET)).toBe(false);
    expect(verifySession("not-a-real-token", EVENT_ID, HASH, NOW, SECRET)).toBe(false);
    expect(verifySession("a.b.c", EVENT_ID, HASH, NOW, SECRET)).toBe(false);
  });
});
