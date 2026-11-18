import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Runs against the production server with ROOT_DOMAIN=localhost (playwright.config.ts)
// and the linked DEVELOPMENT Supabase project, which holds the demo couple.
const PORT = 3100;
const COUPLE_URL = `http://layla-and-adam.localhost:${PORT}/`;
const UNKNOWN_COUPLE_URL = `http://nobody-and-noone.localhost:${PORT}/`;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function openInvitation(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Open invitation/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test.describe("demo invitation at /sample", () => {
  test("the landing page's Open the sample button leads to it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Open the sample" }).click();
    await expect(page).toHaveURL(/\/sample$/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("opens from the opening screen to the names, without /sites/ in the URL", async ({ page }) => {
    await page.goto("/sample");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await openInvitation(page);

    const names = page.getByRole("heading", { level: 1 });
    await expect(names).toHaveText("Layla & Adam");
    await expect(page.locator("#invitation-names")).toBeFocused();
    expect(page.url()).not.toContain("/sites/");
  });

  test("stacks English and Arabic, with every Arabic block marked rtl", async ({ page }) => {
    await page.goto("/sample");
    await openInvitation(page);

    const arabic = page.locator('[lang="ar"]');
    expect(await arabic.count()).toBeGreaterThan(20);
    await expect(page.locator('[lang="ar"]:not([dir="rtl"])')).toHaveCount(0);
    await expect(page.getByText("ليلى وآدم").first()).toBeVisible();
    await expect(page.getByText("السبت، ١٢ يونيو ٢٠٢٧").first()).toBeVisible();
  });

  test("shows every Premium section and a ticking countdown", async ({ page }) => {
    await page.goto("/sample");
    await openInvitation(page);

    for (const name of ["Our story", "The celebration", "The day", "Dress code", "Moments"]) {
      await expect(page.getByRole("region", { name })).toBeVisible();
    }
    const seconds = page.getByRole("timer").locator(":scope > div").nth(3).locator("span").first();
    const before = await seconds.textContent();
    await expect(seconds).not.toHaveText(before ?? "", { timeout: 3000 });
  });

  test("Send reply shows the received screen without saving anything", async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET") writes.push(request.url());
    });
    await page.goto("/sample");
    await openInvitation(page);

    await page.getByRole("textbox", { name: /Full name/ }).fill("The Haddad family");
    await page.getByRole("button", { name: /Send reply/ }).click();

    await expect(page.getByRole("status")).toContainText("Thank you");
    await expect(page.getByText("The Haddad family")).toBeVisible();
    await expect(page.getByRole("link", { name: /Add to calendar/ })).toHaveAttribute("download", "layla-and-adam.ics");
    expect(writes).toEqual([]);

    await page.getByRole("button", { name: /Back to the invitation/ }).click();
    await expect(page.getByRole("button", { name: /Send reply/ })).toBeVisible();
  });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto("/sample");
    await openInvitation(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("has no WCAG 2.2 A/AA violations, closed and open", async ({ page }) => {
    await page.goto("/sample");
    const analyze = async () =>
      (await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations.map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );

    expect(await analyze()).toEqual([]);
    await openInvitation(page);
    expect(await analyze()).toEqual([]);
  });

  test("is never indexed and has a WhatsApp preview image under 300 KB", async ({ page, request }) => {
    await page.goto("/sample");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(image).toBe(`http://localhost:${PORT}/sample/share-image`);

    const response = await request.get(image!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/jpeg");
    expect((await response.body()).byteLength).toBeLessThan(300 * 1024);
  });
});

test.describe("couple subdomains", () => {
  test("a couple's subdomain serves their invitation", async ({ page }) => {
    const response = await page.goto(COUPLE_URL);
    expect(response?.status()).toBe(200);
    await openInvitation(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Layla & Adam");
    await expect(page).toHaveURL(COUPLE_URL);
  });

  test("its preview image is on the couple's own host", async ({ page }) => {
    await page.goto(COUPLE_URL);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(image).toBe(`${COUPLE_URL}share-image`);
  });

  test("an unknown couple's subdomain is a real 404", async ({ page }) => {
    const response = await page.goto(UNKNOWN_COUPLE_URL);
    expect(response?.status()).toBe(404);
  });

  test("a couple's host can't reach /sites/ paths", async ({ page }) => {
    const response = await page.goto(`${COUPLE_URL}sites/layla-and-adam`);
    expect(response?.status()).toBe(404);
  });
});

test("production never serves /sites/ directly on the marketing site", async ({ request }) => {
  const response = await request.get("/sites/layla-and-adam");
  expect(response.status()).toBe(404);
});
