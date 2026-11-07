import { describe, expect, test } from "vitest";
import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  test("uses NEXT_PUBLIC_SITE_URL when it is a valid http(s) URL", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://zaffa.com" }).href).toBe("https://zaffa.com/");
  });

  test("drops any path, query or trailing slash so it is a clean origin", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://zaffa.com/foo?x=1" }).href).toBe(
      "https://zaffa.com/",
    );
  });

  test("falls back to localhost when unset or blank", () => {
    expect(getSiteUrl({}).href).toBe("http://localhost:3000/");
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "  " }).href).toBe("http://localhost:3000/");
  });

  test("falls back to localhost for invalid or non-http values", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" }).href).toBe("http://localhost:3000/");
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }).href).toBe(
      "http://localhost:3000/",
    );
  });
});
