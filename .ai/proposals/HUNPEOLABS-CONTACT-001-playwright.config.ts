import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "../../tests/e2e",
  testMatch: "site.spec.ts",
  use: { baseURL: process.env.CONTACT_TEST_URL || "http://127.0.0.1:3122" },
  reporter: "list",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
