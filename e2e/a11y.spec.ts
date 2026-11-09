import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/privacy", "/terms", "/legal"] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Scroll everything into view so reveal animations finish before axe checks contrast. */
async function revealAll(page: Page): Promise<void> {
  // :visible skips reveals that are display:none at this width (e.g. the FAQ photo on phones).
  for (const el of await page.locator("[data-reveal]:visible").all()) {
    await el.scrollIntoViewIfNeeded();
    await expect(el).toHaveCSS("opacity", "1");
  }
}

for (const path of PAGES) {
  test(`${path} has no WCAG 2.2 A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await revealAll(page);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );

    expect(summary).toEqual([]);
  });
}
