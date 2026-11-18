import { describe, expect, test } from "vitest";
import type { RoutingConfig } from "./config";
import { classifyHost, normalizeHost, routeRequest, type RouteLookups } from "./resolve-host";

const production: RoutingConfig = {
  rootDomain: "zaffa.com",
  marketingHosts: new Set(["zaffa.com", "www.zaffa.com", "zaffa.vercel.app"]),
  demoSlug: "layla-and-adam",
  allowSitesPath: false,
};

const development: RoutingConfig = {
  rootDomain: "localhost",
  marketingHosts: new Set(["localhost", "www.localhost", "127.0.0.1"]),
  demoSlug: "layla-and-adam",
  allowSitesPath: true,
};

const noLookup = async (): Promise<string | null> => {
  throw new Error("lookup should not be called");
};

/** Every slug is published unless a test says otherwise. */
const everySlugPublished = async (slug: string): Promise<string | null> => slug;

function lookups(overrides: Partial<RouteLookups> = {}): RouteLookups {
  return { host: noLookup, publishedSlug: everySlugPublished, ...overrides };
}

describe("normalizeHost", () => {
  test("lowercases and strips the port and a trailing dot", () => {
    expect(normalizeHost("Layla-And-Adam.Zaffa.com:443")).toBe("layla-and-adam.zaffa.com");
    expect(normalizeHost("localhost:3000")).toBe("localhost");
    expect(normalizeHost("zaffa.com.")).toBe("zaffa.com");
  });

  test.each([null, undefined, "", "  ", "[::1]:3000", "bad_host.com", "-start.com", "a..b.com", "x".repeat(254)])(
    "rejects %s",
    (raw) => {
      expect(normalizeHost(raw)).toBeNull();
    },
  );
});

describe("classifyHost", () => {
  test("the marketing hosts serve the marketing site", () => {
    expect(classifyHost("zaffa.com", production)).toEqual({ kind: "marketing" });
    expect(classifyHost("WWW.zaffa.com", production)).toEqual({ kind: "marketing" });
    expect(classifyHost("zaffa.vercel.app", production)).toEqual({ kind: "marketing" });
    expect(classifyHost("localhost:3000", development)).toEqual({ kind: "marketing" });
  });

  test("a subdomain of the root domain is the couple's slug, with no lookup", () => {
    expect(classifyHost("sara-and-omar.zaffa.com", production)).toEqual({
      kind: "slug",
      slug: "sara-and-omar",
    });
    expect(classifyHost("layla-and-adam.localhost:3000", development)).toEqual({
      kind: "slug",
      slug: "layla-and-adam",
    });
  });

  test("a nested or invalid subdomain of the root domain is unknown", () => {
    expect(classifyHost("a.b.zaffa.com", production)).toEqual({ kind: "unknown" });
    expect(classifyHost("x.zaffa.com", production)).toEqual({ kind: "unknown" });
  });

  test("any other host is looked up in event_hosts", () => {
    expect(classifyHost("saraandomar.com", production)).toEqual({
      kind: "lookup",
      host: "saraandomar.com",
    });
    expect(classifyHost("zaffa-layla-and-adam.vercel.app", production)).toEqual({
      kind: "lookup",
      host: "zaffa-layla-and-adam.vercel.app",
    });
  });

  test("a single-label or malformed host is unknown", () => {
    expect(classifyHost("intranet", production)).toEqual({ kind: "unknown" });
    expect(classifyHost(null, production)).toEqual({ kind: "unknown" });
  });

  test("without a root domain, subdomains are looked up like any other host", () => {
    const noRoot: RoutingConfig = { ...production, rootDomain: null };
    expect(classifyHost("sara-and-omar.zaffa.com", noRoot)).toEqual({
      kind: "lookup",
      host: "sara-and-omar.zaffa.com",
    });
  });
});

describe("routeRequest on a marketing host", () => {
  test("passes normal pages through", async () => {
    expect(await routeRequest({ host: "zaffa.com", pathname: "/" }, production, lookups())).toEqual({
      action: "next",
    });
    expect(
      await routeRequest({ host: "zaffa.com", pathname: "/privacy" }, production, lookups()),
    ).toEqual({ action: "next" });
  });

  test("/sample serves the demo couple without showing /sites/", async () => {
    expect(await routeRequest({ host: "zaffa.com", pathname: "/sample" }, production, lookups())).toEqual({
      action: "rewrite",
      pathname: "/sites/layla-and-adam",
    });
    expect(
      await routeRequest({ host: "zaffa.com", pathname: "/sample/opengraph-image" }, production, lookups()),
    ).toEqual({ action: "rewrite", pathname: "/sites/layla-and-adam/opengraph-image" });
  });

  test("/samples is an ordinary page, not the demo", async () => {
    expect(
      await routeRequest({ host: "zaffa.com", pathname: "/samples" }, production, lookups()),
    ).toEqual({ action: "next" });
  });

  test("/sites/* is a 404 in production and allowed in development", async () => {
    expect(
      await routeRequest({ host: "zaffa.com", pathname: "/sites/layla-and-adam" }, production, lookups()),
    ).toEqual({ action: "not-found" });
    expect(
      await routeRequest({ host: "localhost:3000", pathname: "/sites/layla-and-adam" }, development, lookups()),
    ).toEqual({ action: "next" });
  });
});

describe("routeRequest on a couple's host", () => {
  test("rewrites a root-domain subdomain to the couple's site", async () => {
    expect(
      await routeRequest({ host: "sara-and-omar.zaffa.com", pathname: "/" }, production, lookups()),
    ).toEqual({ action: "rewrite", pathname: "/sites/sara-and-omar" });
    expect(
      await routeRequest(
        { host: "sara-and-omar.zaffa.com", pathname: "/opengraph-image" },
        production,
        lookups(),
      ),
    ).toEqual({ action: "rewrite", pathname: "/sites/sara-and-omar/opengraph-image" });
  });

  test("never lets a couple's host reach another couple via /sites/", async () => {
    expect(
      await routeRequest(
        { host: "sara-and-omar.zaffa.com", pathname: "/sites/layla-and-adam" },
        production,
        lookups(),
      ),
    ).toEqual({ action: "not-found" });
  });

  test("an unknown or unpublished couple subdomain is a real 404", async () => {
    const publishedSlug = async (slug: string) => (slug === "layla-and-adam" ? slug : null);
    expect(
      await routeRequest({ host: "nobody-and-noone.zaffa.com", pathname: "/" }, production, lookups({ publishedSlug })),
    ).toEqual({ action: "not-found" });
    expect(
      await routeRequest({ host: "layla-and-adam.zaffa.com", pathname: "/" }, production, lookups({ publishedSlug })),
    ).toEqual({ action: "rewrite", pathname: "/sites/layla-and-adam" });
  });

  test("a draft preview link skips the published check; the page validates the token", async () => {
    const publishedSlug = async () => null;
    expect(
      await routeRequest(
        { host: "sara-and-omar.zaffa.com", pathname: "/", hasPreviewToken: true },
        production,
        lookups({ publishedSlug }),
      ),
    ).toEqual({ action: "rewrite", pathname: "/sites/sara-and-omar" });
  });

  test("a failed published check still rewrites, so the page shows 'temporarily unavailable'", async () => {
    const publishedSlug = async (): Promise<string | null> => {
      throw new Error("Supabase unreachable");
    };
    expect(
      await routeRequest({ host: "sara-and-omar.zaffa.com", pathname: "/" }, production, lookups({ publishedSlug })),
    ).toEqual({ action: "rewrite", pathname: "/sites/sara-and-omar" });
  });

  test("/sample doesn't hit the database", async () => {
    expect(
      await routeRequest(
        { host: "zaffa.com", pathname: "/sample" },
        production,
        lookups({ publishedSlug: noLookup }),
      ),
    ).toEqual({ action: "rewrite", pathname: "/sites/layla-and-adam" });
  });

  test("looks up a custom domain and rewrites to its slug", async () => {
    const lookup = async (host: string) => (host === "saraandomar.com" ? "sara-and-omar" : null);
    expect(await routeRequest({ host: "SaraAndOmar.com", pathname: "/" }, production, lookups({ host: lookup }))).toEqual({
      action: "rewrite",
      pathname: "/sites/sara-and-omar",
    });
  });

  test("an unknown custom domain is a 404", async () => {
    const lookup = async () => null;
    expect(await routeRequest({ host: "unknown.example", pathname: "/" }, production, lookups({ host: lookup }))).toEqual({
      action: "not-found",
    });
  });

  test("a lookup that fails shows the unavailable page instead of crashing", async () => {
    const lookup = async (): Promise<string | null> => {
      throw new Error("Supabase unreachable");
    };
    expect(await routeRequest({ host: "saraandomar.com", pathname: "/" }, production, lookups({ host: lookup }))).toEqual({
      action: "unavailable",
    });
  });

  test("an unknown host shape is a 404", async () => {
    expect(await routeRequest({ host: "intranet", pathname: "/" }, production, lookups())).toEqual({
      action: "not-found",
    });
  });
});
