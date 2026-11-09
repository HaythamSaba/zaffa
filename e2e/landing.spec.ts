import { expect, test } from "@playwright/test";

// CLAUDE.md "Phase 1 > Sections, in order" (the closing band has no id; it is checked by heading).
const SECTION_IDS = [
  "top",
  "about",
  "features",
  "demo",
  "dashboard",
  "how",
  "packages",
  "faq",
  "contact",
] as const;

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has exactly one h1 with the hero headline", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(/every family/i);
  });

  test("renders every section in the v3 order, with the form after the closing call to action", async ({ page }) => {
    const order = await page.evaluate(() =>
      [...document.querySelectorAll("main > section")].map(
        (s) => s.id || s.getAttribute("aria-labelledby") || "",
      ),
    );

    expect(order).toEqual([
      "top",
      "about",
      "features",
      "demo",
      "dashboard",
      "how",
      "packages",
      "faq",
      "closing-title",
      "contact",
    ]);
    for (const id of SECTION_IDS) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    await expect(page.getByRole("heading", { name: /let.s invite everyone/i })).toBeVisible();
    await expect(page.locator("#contact form")).toHaveCount(1);
    await expect(page.locator("footer")).toBeVisible();
  });

  test("every photo slot renders an optimised, described image (no placeholders left)", async ({ page }) => {
    await expect(page.locator('[data-photo-placeholder="true"]')).toHaveCount(0);

    const photos = page.locator('img[srcset*="/_next/image?url=%2Fimages%2F"]');
    // hero, 5 arch cards, phone, FAQ (hidden on phones but in the DOM), closing band
    await expect(photos).toHaveCount(9);
    for (const alt of await photos.evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt") ?? ""))) {
      expect(alt.length).toBeGreaterThan(10);
    }
  });

  test("white text on photos always sits on the dark overlay", async ({ page }) => {
    // Hero, closing band and the five arch photo cards.
    await expect(page.locator("#top [data-photo-overlay]")).toHaveCount(1);
    await expect(page.locator("section[aria-labelledby='closing-title'] [data-photo-overlay]")).toHaveCount(1);
    await expect(page.locator("#features [data-photo-overlay]")).toHaveCount(5);
  });

  test("has no horizontal overflow", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("FAQ items open from the keyboard", async ({ page }) => {
    const first = page.locator("#faq summary").first();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#faq details").first()).toHaveAttribute("open", "");
  });

  test("marketing copy stays language-neutral", async ({ page }) => {
    const text = await page.locator("body").innerText();
    const placeholders = await page
      .locator("input[placeholder], textarea[placeholder]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("placeholder") ?? ""));
    const copy = [text, ...placeholders].join("\n");

    expect(copy).not.toMatch(
      /\b(bilingual|english|arabic|italian|german|french|spanish|turkish|persian|urdu|hebrew|hindi|greek|russian|polish|dutch|swedish|slovenian)\b/i,
    );
    expect(copy).not.toMatch(/[֐-ࣿ]/); // no Hebrew/Arabic script
  });

  test("hero headline and mockup are never animated (LCP)", async ({ page }) => {
    await expect(page.locator("#top [data-reveal]")).toHaveCount(0);
    const h1Style = await page.locator("h1").evaluate((el) => {
      const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: s.transform };
    });
    expect(h1Style).toEqual({ opacity: "1", transform: "none" });
  });

  test("revealed content ends fully visible and in place", async ({ page }) => {
    const reveals = page.locator("[data-reveal]");
    expect(await reveals.count()).toBeGreaterThan(10);

    // :visible skips reveals that are display:none at this width (e.g. the FAQ photo on phones).
    for (const el of await page.locator("[data-reveal]:visible").all()) {
      await el.scrollIntoViewIfNeeded();
      await expect(el).toHaveCSS("opacity", "1");
      await expect(el).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    }
  });

  test("scrolling the whole page causes no layout shift", async ({ page }) => {
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            })[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(cls).toBeLessThan(0.01);
  });

  test("the header Contact link and every 'Request your invitation' button lead to the form", async ({ page }) => {
    const headerContact = page.locator("header").getByRole("link", { name: "Contact", exact: true });
    await expect(headerContact.first()).toHaveAttribute("href", "/#contact");

    const requests = page.getByRole("link", { name: /request your invitation/i });
    expect(await requests.count()).toBeGreaterThanOrEqual(2);
    for (const href of await requests.evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
      expect(href).toBe("#contact");
    }
  });
});

test.describe("landing page with prefers-reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("revealed content becomes visible without movement", async ({ page }) => {
    await page.goto("/");
    const sample = page.locator("#packages [data-reveal]").first();
    await sample.scrollIntoViewIfNeeded();

    await expect(sample).toHaveCSS("opacity", "1");
    await expect(sample).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });
});

test.describe("SEO and legal pages", () => {
  for (const { path, title } of [
    { path: "/privacy", title: "Privacy notice" },
    { path: "/terms", title: "Terms" },
    { path: "/legal", title: "Legal notice" },
  ]) {
    test(`${path} is a noindex draft with one h1`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(title);
      await expect(page.getByRole("note")).toContainText("DRAFT");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    });
  }

  test("every footer link resolves", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator("footer nav a").evaluateAll((links) =>
      links.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
    );

    for (const href of hrefs) {
      const response = await request.get(href.split("#")[0] || "/");
      expect(response.status(), href).toBe(200);
    }
  });

  test("home page is indexable and has social preview metadata", async ({ page, request }) => {
    await page.goto("/");

    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toBeTruthy();
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

    const image = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
  });

  test("favicon and apple icon are served", async ({ page, request }) => {
    await page.goto("/");
    const icon = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
    const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");

    expect((await request.get(icon!)).headers()["content-type"]).toContain("image/svg+xml");
    expect((await request.get(apple!)).headers()["content-type"]).toContain("image/png");
  });

  test("sitemap lists the home page and robots.txt points to it", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const robots = await (await request.get("/robots.txt")).text();

    expect(sitemap).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
    expect(sitemap).not.toContain("/privacy");
    expect(robots).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });
});

test("responses carry the baseline security headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");
});
