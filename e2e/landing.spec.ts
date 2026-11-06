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

  test("header CTA links to the contact section", async ({ page }) => {
    const cta = page.locator("header").getByRole("link", { name: /request/i });
    await expect(cta).toHaveAttribute("href", "/#contact");
  });
});
