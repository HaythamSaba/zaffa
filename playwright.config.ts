import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

// Contact form success can only be tested with CONTACT_DRY_RUN=1, which is
// ignored in production. So those tests run against `next dev` (NODE_ENV=development),
// which builds into .next/dev and can run alongside the production server.
const DEV_PORT = 3200;
const DEV_URL = `http://localhost:${DEV_PORT}`;
const DRY_RUN_SPEC = /contact-dry-run\.spec\.ts/;

function envWith(extra: Record<string, string>): Record<string, string> {
  const base = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  return { ...base, ...extra };
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: [
    {
      name: "mobile-375",
      testIgnore: DRY_RUN_SPEC,
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
    {
      name: "desktop-1280",
      testIgnore: DRY_RUN_SPEC,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "contact-dry-run",
      testMatch: DRY_RUN_SPEC,
      timeout: 90_000,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        baseURL: DEV_URL,
      },
    },
  ],
  webServer: [
    {
      command: `npm run start -- --port ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npx next dev --port ${DEV_PORT}`,
      url: DEV_URL,
      // Own build folder, so it doesn't clash with a developer's running `next dev`.
      env: envWith({ CONTACT_DRY_RUN: "1", NEXT_DIST_DIR: ".next/e2e" }),
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
