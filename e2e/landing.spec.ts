import { expect, test } from "@playwright/test";

const SECTION_IDS = [
  "top",
  "what",
  "how",
  "packages",
  "demo",
  "about",
  "faq",
  "contact",
] as const;

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has exactly one h1 with the hero headline", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("language your families speak");
  });

  test("renders every section in order", async ({ page }) => {
    for (const id of SECTION_IDS) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    await expect(page.getByRole("region", { name: "Who it's for" })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
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

    for (const el of await reveals.all()) {
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

  test("header CTA links to the contact section", async ({ page }) => {
    const cta = page.locator("header").getByRole("link", { name: /request/i });
    await expect(cta).toHaveAttribute("href", "/#contact");
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
