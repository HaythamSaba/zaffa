import { describe, expect, test } from "vitest";
import { getRoutingConfig } from "./config";

describe("getRoutingConfig", () => {
  test("reads the root domain, marketing hosts and demo slug", () => {
    const config = getRoutingConfig({
      NODE_ENV: "production",
      ROOT_DOMAIN: "Zaffa.com",
      MARKETING_HOSTS: "zaffa.vercel.app, ZAFFA-STUDIO.vercel.app ,",
      DEMO_SLUG: "layla-and-adam",
    });

    expect(config.rootDomain).toBe("zaffa.com");
    expect([...config.marketingHosts].sort()).toEqual([
      "127.0.0.1",
      "localhost",
      "www.zaffa.com",
      "zaffa-studio.vercel.app",
      "zaffa.com",
      "zaffa.vercel.app",
    ]);
    expect(config.demoSlug).toBe("layla-and-adam");
    expect(config.allowSitesPath).toBe(false);
  });

  test("Vercel's own deployment hosts always serve the marketing site", () => {
    const config = getRoutingConfig({
      NODE_ENV: "production",
      VERCEL_URL: "zaffa-abc123-team.vercel.app",
      VERCEL_BRANCH_URL: "zaffa-git-feat-team.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "zaffa.vercel.app",
    });

    expect(config.marketingHosts.has("zaffa-abc123-team.vercel.app")).toBe(true);
    expect(config.marketingHosts.has("zaffa-git-feat-team.vercel.app")).toBe(true);
    expect(config.marketingHosts.has("zaffa.vercel.app")).toBe(true);
  });

  test("development always treats localhost as marketing and allows /sites/", () => {
    const config = getRoutingConfig({ NODE_ENV: "development", ROOT_DOMAIN: "localhost" });

    expect(config.marketingHosts.has("localhost")).toBe(true);
    expect(config.marketingHosts.has("127.0.0.1")).toBe(true);
    expect(config.allowSitesPath).toBe(true);
  });

  test("localhost serves marketing in production too (local `next start` and e2e), without /sites/", () => {
    const config = getRoutingConfig({ NODE_ENV: "production" });
    expect(config.marketingHosts.has("localhost")).toBe(true);
    expect(config.marketingHosts.has("127.0.0.1")).toBe(true);
    expect(config.allowSitesPath).toBe(false);
  });

  test("a missing or invalid root domain means no subdomain routing", () => {
    expect(getRoutingConfig({ NODE_ENV: "production" }).rootDomain).toBeNull();
    expect(getRoutingConfig({ NODE_ENV: "production", ROOT_DOMAIN: "not a domain" }).rootDomain).toBeNull();
  });

  test("ROOT_DOMAIN with a port (old .env files) still works", () => {
    expect(getRoutingConfig({ NODE_ENV: "development", ROOT_DOMAIN: "localhost:3000" }).rootDomain).toBe(
      "localhost",
    );
  });

  test("an invalid demo slug falls back to the default demo", () => {
    expect(getRoutingConfig({ NODE_ENV: "production", DEMO_SLUG: "../etc" }).demoSlug).toBe("layla-and-adam");
    expect(getRoutingConfig({ NODE_ENV: "production" }).demoSlug).toBe("layla-and-adam");
  });
});
