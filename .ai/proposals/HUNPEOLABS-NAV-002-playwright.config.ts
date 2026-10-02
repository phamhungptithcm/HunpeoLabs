import config from "../../playwright.config";

// Task evidence harness: reuse the existing preview without interrupting it.
export default {
  ...config,
  testDir: "../../tests/e2e",
  webServer: undefined,
  use: { ...config.use, baseURL: "http://127.0.0.1:3120" },
};
