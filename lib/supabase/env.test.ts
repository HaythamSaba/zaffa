import { describe, expect, test } from "vitest";
import { SupabaseConfigError, getServiceRoleKey, getSupabasePublicConfig } from "./env";

describe("getSupabasePublicConfig", () => {
  test("reads and trims the URL and publishable key", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: " https://abc.supabase.co ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " sb_publishable_test ",
      }),
    ).toEqual({ url: "https://abc.supabase.co", anonKey: "sb_publishable_test" });
  });

  test("names the missing variables without echoing values", () => {
    expect(() => getSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
    expect(() => getSupabasePublicConfig({})).toThrow(SupabaseConfigError);
  });

  test("rejects a URL that isn't https (except localhost)", () => {
    expect(() =>
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://abc.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
      }),
    ).toThrow(SupabaseConfigError);
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
      }).url,
    ).toBe("http://127.0.0.1:54321");
  });
});

describe("getServiceRoleKey", () => {
  test("reads the server-only secret key", () => {
    expect(getServiceRoleKey({ SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test" })).toBe("sb_secret_test");
  });

  test("throws without echoing anything when missing", () => {
    expect(() => getServiceRoleKey({})).toThrow("Missing Supabase configuration: SUPABASE_SERVICE_ROLE_KEY");
  });
});
