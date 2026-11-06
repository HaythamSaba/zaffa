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

  test("header CTA links to the contact section", async ({ page }) => {
    const cta = page.locator("header").getByRole("link", { name: /request/i });
    await expect(cta).toHaveAttribute("href", "/#contact");
  });
});
