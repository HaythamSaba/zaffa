import { describe, expect, test } from "vitest";
import { ContactConfigError, getContactConfig } from "./env";

const sendVars = {
  RESEND_API_KEY: "re_test_key",
  CONTACT_TO_EMAIL: "studio@example.com",
  CONTACT_FROM_EMAIL: "onboarding@resend.dev",
};

describe("getContactConfig", () => {
  test("uses dry-run mode when CONTACT_DRY_RUN=1 outside production", () => {
    expect(getContactConfig({ NODE_ENV: "development", CONTACT_DRY_RUN: "1" })).toEqual({
      mode: "dry-run",
    });
    expect(getContactConfig({ NODE_ENV: "test", CONTACT_DRY_RUN: "1" })).toEqual({
      mode: "dry-run",
    });
  });

  test("ignores CONTACT_DRY_RUN in production and sends for real", () => {
    const config = getContactConfig({ NODE_ENV: "production", CONTACT_DRY_RUN: "1", ...sendVars });

    expect(config).toEqual({
      mode: "send",
      apiKey: "re_test_key",
      to: "studio@example.com",
      from: "onboarding@resend.dev",
    });
  });

  test("in production with CONTACT_DRY_RUN=1 but no Resend config, fails instead of silently skipping", () => {
    expect(() => getContactConfig({ NODE_ENV: "production", CONTACT_DRY_RUN: "1" })).toThrow(
      ContactConfigError,
    );
  });

  test("treats any value other than '1' as dry run off", () => {
    expect(getContactConfig({ NODE_ENV: "development", CONTACT_DRY_RUN: "true", ...sendVars }).mode).toBe(
      "send",
    );
  });

  test("names every missing variable in the error, without leaking values", () => {
    try {
      getContactConfig({ NODE_ENV: "production", RESEND_API_KEY: "re_secret" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContactConfigError);
      const message = (error as Error).message;
      expect(message).toContain("CONTACT_TO_EMAIL");
      expect(message).toContain("CONTACT_FROM_EMAIL");
      expect(message).not.toContain("re_secret");
    }
  });

  test("treats whitespace-only values as missing", () => {
    expect(() => getContactConfig({ NODE_ENV: "production", ...sendVars, RESEND_API_KEY: "  " })).toThrow(
      /RESEND_API_KEY/,
    );
  });
});
