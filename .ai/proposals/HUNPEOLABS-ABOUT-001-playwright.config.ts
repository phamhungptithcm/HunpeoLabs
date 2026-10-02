import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";

export default defineConfig({
  ...base,
  testDir: "../../tests/e2e",
  outputDir: "../../test-results/about-001",
  use: { ...base.use, baseURL: "http://127.0.0.1:3122" },
  webServer: {
    command: "pnpm dev --port 3122",
    url: "http://127.0.0.1:3122",
    reuseExistingServer: true,
  },
});
