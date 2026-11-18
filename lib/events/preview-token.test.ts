import { describe, expect, test } from "vitest";
import { hashPreviewToken, isPlausiblePreviewToken, verifyPreviewToken } from "./preview-token";

describe("preview tokens", () => {
  test("hashes a token to lowercase SHA-256 hex", () => {
    expect(hashPreviewToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  test("accepts the token whose hash is stored", () => {
    const token = "k3J9-preview-token-for-sara-and-omar";
    expect(verifyPreviewToken(token, hashPreviewToken(token))).toBe(true);
  });

  test("rejects a wrong token, a missing token or a missing hash", () => {
    const stored = hashPreviewToken("right-token-right-token");
    expect(verifyPreviewToken("wrong-token-wrong-token", stored)).toBe(false);
    expect(verifyPreviewToken("", stored)).toBe(false);
    expect(verifyPreviewToken(undefined, stored)).toBe(false);
    expect(verifyPreviewToken("right-token-right-token", null)).toBe(false);
  });

  test("rejects a malformed stored hash instead of throwing", () => {
    expect(verifyPreviewToken("right-token-right-token", "not-hex")).toBe(false);
  });

  test("rejects tokens that are too short or too long to be real", () => {
    expect(verifyPreviewToken("short", hashPreviewToken("short"))).toBe(false);
    const huge = "x".repeat(300);
    expect(verifyPreviewToken(huge, hashPreviewToken(huge))).toBe(false);
  });
});

describe("isPlausiblePreviewToken", () => {
  test("accepts URL-safe tokens of 16-200 characters", () => {
    expect(isPlausiblePreviewToken("k3J9_preview-token-ABC")).toBe(true);
  });

  test.each([undefined, "", "short", "has spaces in it here", "x".repeat(201), "<script>alert(1)</script>"])(
    "rejects %j",
    (token) => {
      expect(isPlausiblePreviewToken(token)).toBe(false);
    },
  );
});
