import { expect, test, type Page } from "@playwright/test";

// Runs against `next dev` with CONTACT_DRY_RUN=1 (see playwright.config.ts):
// inquiries go through the real server action, but no email is sent.

let ipCounter = 0;

/** Gives each test its own client IP so rate-limit buckets don't collide. */
async function useFreshIp(page: Page, workerIndex: number): Promise<void> {
  ipCounter += 1;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `10.${workerIndex % 250}.0.${ipCounter}` });
}

function contact(page: Page) {
  const section = page.locator("#contact");
  return {
    names: section.getByLabel("Your names"),
    email: section.getByLabel("Email"),
    weddingDate: section.getByLabel("Wedding date"),
    submit: section.getByRole("button", { name: /send inquiry|sending/i }),
    // Scoped to #contact: Next's route announcer is also role="alert".
    alert: section.getByRole("alert"),
    status: section.getByRole("status"),
  };
}

async function submitAndWait(page: Page): Promise<void> {
  await Promise.all([
    page.waitForResponse((r) => r.request().method() === "POST" && r.request().headers()["next-action"] !== undefined),
    contact(page).submit.click(),
  ]);
}

test.describe("contact form (dry run)", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await useFreshIp(page, testInfo.workerIndex);
    await page.goto("/#contact");
  });

  test("a valid inquiry shows the success message and clears the form", async ({ page }) => {
    const form = contact(page);
    await form.names.fill("Sara & Omar");
    await form.email.fill("sara@example.com");

    await submitAndWait(page);

    await expect(form.status).toContainText("Thank you");
    await expect(form.names).toHaveValue("");
    await expect(form.alert).toHaveCount(0);
  });

  test("server-side errors are shown next to the field and typed values are kept", async ({ page }) => {
    const form = contact(page);
    await form.names.fill("Sara & Omar");
    await form.email.fill("sara@example.com");
    await form.weddingDate.fill("2020-01-01");

    await submitAndWait(page);

    await expect(form.alert).toContainText("check the highlighted fields");
    await expect(form.weddingDate).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contact-weddingDate-error")).toContainText("can't be in the past");
    await expect(form.names).toHaveValue("Sara & Omar");
  });

  test("the browser blocks an empty submission before it reaches the server", async ({ page }) => {
    const form = contact(page);

    await form.submit.click();

    const isMissing = await form.names.evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
    expect(isMissing).toBe(true);
    await expect(form.status).toHaveText("");
  });

  test("a filled honeypot gets a quiet fake success", async ({ page }) => {
    const form = contact(page);
    await form.names.fill("Spam Bot");
    await form.email.fill("bot@example.com");
    await page.locator('#contact input[name="website"]').evaluate((el) => {
      (el as HTMLInputElement).value = "http://spam.example";
    });

    await submitAndWait(page);

    await expect(form.status).toContainText("Thank you");
  });

  test("the sixth inquiry from one IP within 10 minutes is rate-limited", async ({ page }) => {
    const form = contact(page);

    for (let i = 0; i < 5; i += 1) {
      await form.names.fill(`Couple ${i}`);
      await form.email.fill(`couple${i}@example.com`);
      await submitAndWait(page);
      await expect(form.status).toContainText("Thank you");
    }

    await form.names.fill("Couple 6");
    await form.email.fill("couple6@example.com");
    await submitAndWait(page);

    await expect(form.alert).toContainText("Too many messages");
    await expect(form.names).toHaveValue("Couple 6");
  });
});
