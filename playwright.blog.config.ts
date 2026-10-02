import { defineConfig, devices } from "@playwright/test";
const origin = process.env.BLOG_TEST_ORIGIN || "http://localhost:3107";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error(
    "Blog E2E may only target a local emulator-backed application",
  );
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /blog-(cms|google)\.spec\.ts/,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: origin, trace: "retain-on-failure", actionTimeout: 15000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
