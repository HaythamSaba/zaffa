import { describe, expect, test } from "vitest";
import { GENERATED_PASSWORD_LENGTH, MIN_CUSTOM_PASSWORD_LENGTH, generatePassword, validateCustomPassword } from "./set-dashboard-password.mjs";

describe("generatePassword", () => {
  test("generates a password of the expected length", () => {
    expect(generatePassword()).toHaveLength(GENERATED_PASSWORD_LENGTH);
  });

  test("meets the >=16 character bar on its own", () => {
    expect(GENERATED_PASSWORD_LENGTH).toBeGreaterThanOrEqual(16);
  });

  test("uses only unambiguous characters (no 0/O or 1/l/I)", () => {
    const password = generatePassword();
    expect(password).not.toMatch(/[0OIl1]/);
  });

  test("generates a different password on every call", () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generatePassword()));
    expect(passwords.size).toBe(20);
  });
});

describe("validateCustomPassword", () => {
  test("accepts a password at exactly the minimum length", () => {
    expect(validateCustomPassword("a".repeat(MIN_CUSTOM_PASSWORD_LENGTH))).toEqual({ ok: true });
  });

  test("rejects a password shorter than the minimum", () => {
    const result = validateCustomPassword("a".repeat(MIN_CUSTOM_PASSWORD_LENGTH - 1));
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/at least 12/);
  });

  test("rejects a blank password", () => {
    expect(validateCustomPassword("").ok).toBe(false);
  });
});
