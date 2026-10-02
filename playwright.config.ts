import { defineConfig, devices } from "@playwright/test";

const useProductionServer = process.env.PLAYWRIGHT_USE_PRODUCTION_SERVER === "true";
const analyticsTestsEnabled = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true";
const coreTestIgnore = analyticsTestsEnabled ? /smoke\.spec\.ts/ : /(smoke|analytics)\.spec\.ts/;
const testPort = Number(process.env.PLAYWRIGHT_PORT || 3000);
if (!Number.isInteger(testPort) || testPort < 1024 || testPort > 65535) {
  throw new Error("Playwright requires a valid local test port");
}
const localOrigin = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  outputDir: ".ai/local/release-evidence/website",
  use: {
    baseURL: localOrigin,
    trace: "on-first-retry",
    // General navigation exercises an explicit declined preference. The
    // dedicated Analytics spec resets storage and tests first-visit consent.
    storageState: {
      cookies: [],
      origins: [{
        origin: localOrigin,
        localStorage: [{ name: "hunpeolabs:analytics-consent:v1", value: "denied" }],
      }],
    },
  },
  webServer: {
    command: useProductionServer
      ? `pnpm exec next start --hostname 127.0.0.1 --port ${testPort}`
      : `pnpm exec next dev --hostname 127.0.0.1 --port ${testPort}`,
    url: localOrigin,
    reuseExistingServer: !process.env.CI && !useProductionServer,
  },
  projects: [
    {
      name: "chromium",
      testIgnore: coreTestIgnore,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      testIgnore: coreTestIgnore,
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "firefox",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
