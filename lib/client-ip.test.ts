import { describe, expect, test } from "vitest";
import { getClientIp } from "./client-ip";

describe("getClientIp", () => {
  test("prefers x-real-ip set by Vercel", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.7",
      "x-forwarded-for": "198.51.100.1, 10.0.0.1",
    });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  test("falls back to the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" });

    expect(getClientIp(headers)).toBe("198.51.100.1");
  });

  test("ignores client-controlled headers such as x-client-ip", () => {
    const headers = new Headers({ "x-client-ip": "1.2.3.4", "cf-connecting-ip": "5.6.7.8" });

    expect(getClientIp(headers)).toBeNull();
  });

  test("returns null when the headers are empty or blank", () => {
    expect(getClientIp(new Headers())).toBeNull();
    expect(getClientIp(new Headers({ "x-real-ip": "  ", "x-forwarded-for": " , " }))).toBeNull();
  });

  test("rejects values that are not plausible IP addresses", () => {
    const headers = new Headers({ "x-real-ip": "<script>alert(1)</script>" });

    expect(getClientIp(headers)).toBeNull();
  });

  test("accepts IPv6 addresses", () => {
    const headers = new Headers({ "x-real-ip": "2001:db8::1" });

    expect(getClientIp(headers)).toBe("2001:db8::1");
  });
});
