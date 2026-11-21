import { describe, expect, test } from "vitest";
import { DashboardConfigError, getDashboardSessionSecret } from "./env";

const LONG_ENOUGH = "a".repeat(32);

describe("getDashboardSessionSecret", () => {
  test("returns a long enough secret", () => {
    expect(getDashboardSessionSecret({ DASHBOARD_SESSION_SECRET: LONG_ENOUGH })).toBe(LONG_ENOUGH);
  });

  test("throws, naming the variable, when missing", () => {
    expect(() => getDashboardSessionSecret({})).toThrow(DashboardConfigError);
    expect(() => getDashboardSessionSecret({})).toThrow(/DASHBOARD_SESSION_SECRET/);
  });

  test("throws when the secret is too short to be a safe HMAC key", () => {
    expect(() => getDashboardSessionSecret({ DASHBOARD_SESSION_SECRET: "too-short" })).toThrow(
      DashboardConfigError,
    );
  });

  test("never echoes the actual secret in the error message", () => {
    try {
      getDashboardSessionSecret({ DASHBOARD_SESSION_SECRET: "too-short" });
      throw new Error("expected to throw");
    } catch (error) {
      expect(String(error)).not.toContain("too-short");
    }
  });
});
