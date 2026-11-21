import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Runs against the production server (playwright.config.ts) and the linked
// DEVELOPMENT Supabase project, which holds the demo couple and its seeded,
// documented demo dashboard password (README.md). The demo dashboard is
// read-only (addition #5): mutation success/failure is unit-tested in
// app/sites/[slug]/dashboard/actions.test.ts instead, since there is no real
// (non-demo) seeded event safe to mutate from an e2e run.
//
// Login is rate-limited to 10 attempts per 10 minutes per event+IP (by
// design: CLAUDE.md's security rules). Every test here that needs a live
// session is folded into ONE test, so a full run (both viewport projects)
// costs 4 real login attempts total, not one per assertion.
const PORT = 3100;
const DASHBOARD_URL = `http://localhost:${PORT}/sample/dashboard`;
const DEMO_PASSWORD = "zaffa-demo-2027";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function login(page: Page, password: string): Promise<void> {
  await page.goto(DASHBOARD_URL);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test("rejects an incorrect password", async ({ page }) => {
  await login(page, "not-the-right-password");
  // Next's own route announcer (#__next-route-announcer__) also has role="alert".
  await expect(page.getByText("Incorrect password.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guests" })).toHaveCount(0);
});

test("the login page is never indexed (no session needed to check this)", async ({ page }) => {
  await page.goto(DASHBOARD_URL);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("demo dashboard: login, header, stats, badges, search, filters, read-only, export, logout", async ({
  page,
}) => {
  await login(page, DEMO_PASSWORD);
  await expect(page.getByRole("heading", { name: "Guests" })).toBeVisible();

  // Header: couple's names, wedding date, RSVP status.
  await expect(page.getByText("Layla & Adam · 12 June 2027")).toBeVisible();
  await expect(page.getByText(/Replies close 1 May 2027|Replies closed/)).toBeVisible();

  // Seeded stats.
  await expect(page.getByText("Households replied")).toBeVisible();
  const stats = page.locator("dl");
  await expect(stats.getByText("8", { exact: true })).toBeVisible();
  await expect(stats.getByText("17", { exact: true })).toBeVisible();

  // Attending/declined told apart by text and shape, guest count hidden when declined.
  const haddad = page.getByText("The Haddad family").locator("..");
  await expect(haddad.getByText("Attending")).toBeVisible();
  await expect(haddad.getByText("4 guests")).toBeVisible();
  const omar = page.getByText("Omar Khalil").locator("..");
  await expect(omar.getByText("Declined")).toBeVisible();
  await expect(omar.getByText(/guest/)).toHaveCount(0);

  // Search.
  await page.getByPlaceholder("Search by name").fill("haddad");
  await expect(page.getByText("The Haddad family")).toBeVisible();
  await expect(page.getByText("The Haddad cousins")).toBeVisible();
  await expect(page.getByText("Lena Novak")).toHaveCount(0);
  await page.getByPlaceholder("Search by name").fill("");

  // Filter.
  await page.getByRole("button", { name: "Not attending" }).click();
  await expect(page.getByText("Omar Khalil")).toBeVisible();
  await expect(page.getByText("Jonas & Mira")).toBeVisible();
  await expect(page.getByText("The Haddad family")).toHaveCount(0);
  await page.getByRole("button", { name: "All" }).click();

  // Read-only: no edit or delete controls anywhere.
  await expect(page.getByRole("button", { name: "Edit" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  // CSV export, sharing this page's session cookie.
  const response = await page.request.get(`${DASHBOARD_URL}/export`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");
  expect(response.headers()["content-disposition"]).toContain("attachment");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  const body = await response.text();
  expect(body.split("\r\n")[0]).toBe("Name,Guests,Attending,Notes,Replied at");
  expect(body).toContain("The Haddad family,4,Yes");

  // No horizontal overflow and no WCAG violations while authenticated.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const violations = (await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(violations).toEqual([]);

  // Logout returns to the login form.
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByLabel("Password")).toBeVisible();
});
