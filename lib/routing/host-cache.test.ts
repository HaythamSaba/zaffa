import { describe, expect, test, vi } from "vitest";
import { createCachedLookup } from "./host-cache";

describe("createCachedLookup", () => {
  test("caches a found slug for the TTL", async () => {
    let now = 0;
    const fetchSlug = vi.fn(async () => "sara-and-omar");
    const lookup = createCachedLookup(fetchSlug, { ttlMs: 60_000, now: () => now });

    expect(await lookup("saraandomar.com")).toBe("sara-and-omar");
    now = 59_999;
    expect(await lookup("saraandomar.com")).toBe("sara-and-omar");
    expect(fetchSlug).toHaveBeenCalledTimes(1);

    now = 60_000;
    await lookup("saraandomar.com");
    expect(fetchSlug).toHaveBeenCalledTimes(2);
  });

  test("caches misses too, so unknown hosts don't hit the database each time", async () => {
    const fetchSlug = vi.fn(async () => null);
    const lookup = createCachedLookup(fetchSlug, { ttlMs: 60_000, now: () => 0 });

    expect(await lookup("unknown.example")).toBeNull();
    expect(await lookup("unknown.example")).toBeNull();
    expect(fetchSlug).toHaveBeenCalledTimes(1);
  });

  test("never caches an error, so the next request retries", async () => {
    const fetchSlug = vi
      .fn<(host: string) => Promise<string | null>>()
      .mockRejectedValueOnce(new Error("unreachable"))
      .mockResolvedValueOnce("sara-and-omar");
    const lookup = createCachedLookup(fetchSlug, { ttlMs: 60_000, now: () => 0 });

    await expect(lookup("saraandomar.com")).rejects.toThrow("unreachable");
    expect(await lookup("saraandomar.com")).toBe("sara-and-omar");
  });

  test("bounds the cache size by evicting the oldest entry", async () => {
    const fetchSlug = vi.fn(async (host: string) => host);
    const lookup = createCachedLookup(fetchSlug, { ttlMs: 60_000, now: () => 0, maxEntries: 2 });

    await lookup("a.example");
    await lookup("b.example");
    await lookup("c.example"); // evicts a.example
    await lookup("a.example");
    expect(fetchSlug).toHaveBeenCalledTimes(4);
  });
});
