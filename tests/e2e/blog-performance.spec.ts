import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Opt-in: a local production build and isolated demo fixtures, never a live host.
const enabled = process.env.BLOG_PERFORMANCE_E2E === "true";
const origin = process.env.BLOG_TEST_ORIGIN ?? "http://127.0.0.1:3142";
const control = process.env.BLOG_PERFORMANCE_DELAY_CONTROL;
if (enabled && (!control || !["localhost", "127.0.0.1"].includes(new URL(origin).hostname)))
  throw new Error("Local performance server and delay proxy required");
test.skip(!enabled, "Requires opt-in isolated local performance fixtures and query delay proxy.");
test.use({ baseURL: origin });
test.beforeEach(async () => { if (enabled) await writeFile(control!, "{}"); });
test.afterEach(async () => { if (enabled) await writeFile(control!, "{}"); });

test("three account consumers share one slow anonymous-session check", async ({ page }) => {
  let count = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/blog/session", async (route) => {
    count++;
    await pending;
    await route.fulfill({ status: 401, contentType: "application/json", body: '{"error":"UNAUTHENTICATED"}' });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/resources/blog", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Ideas into practice." })).toBeVisible();
  await expect.poll(() => count).toBe(1);
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  release();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  expect(count).toBe(1);
  expect(errors).toEqual([]);
});

test("session outage and network failure keep reading usable without showing anonymous login", async ({ page }) => {
  let offline = false;
  let count = 0;
  await page.route("**/api/blog/session", (route) => {
    count++;
    return offline ? route.abort("internetdisconnected")
      : route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"AUTH_UNAVAILABLE"}' });
  });
  const unavailable = page.waitForResponse((response) => response.url().endsWith("/api/blog/session") && response.status() === 503);
  await page.goto("/resources/blog");
  await unavailable;
  await expect(page.getByRole("heading", { name: "Ideas into practice." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  offline = true;
  await page.evaluate(() => window.dispatchEvent(new Event("hl:session-changed")));
  await expect.poll(() => count).toBe(2);
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Ideas into practice." })).toBeVisible();
});

test("logout clears every account control and rejects a stale authenticated response", async ({ page }) => {
  let calls = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/blog/session", async (route) => {
    const request = ++calls;
    if (request === 2) await pending;
    await route.fulfill({ status: request >= 3 ? 401 : 200, contentType: "application/json", body: request >= 3
      ? '{"error":"UNAUTHENTICATED"}'
      : JSON.stringify({ uid: "fixture-reader", name: "Fixture Reader", verified: true, role: "author" }) }).catch(() => {});
  });
  await page.goto("/resources/blog");
  await expect(page.getByRole("link", { name: "Account for Fixture Reader" })).toHaveCount(1);
  // Mobile navigation is collapsed; verify that its conditional link exists.
  await expect(page.locator('a[href="/admin/blog"]')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => calls).toBe(2);
  await page.evaluate(() => window.dispatchEvent(new Event("hl:session-changed")));
  await expect(page.getByRole("link", { name: "Account for Fixture Reader" })).toHaveCount(0);
  await expect(page.locator('a[href="/admin/blog"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  release();
  await expect(page.getByRole("link", { name: "Account for Fixture Reader" })).toHaveCount(0);
});

test("article is readable while related queries remain stalled", async ({ page }) => {
  await writeFile(control!, JSON.stringify({ mode: "related", delayMs: 4000 }));
  await page.goto("/resources/blog/performance-fixture-0", { waitUntil: "commit" });
  await expect(page.getByRole("heading", { name: "Performance fixture 0", exact: true })).toBeVisible({ timeout: 2500 });
  await expect(page.getByText("Loading related posts…", { exact: true })).toHaveCount(1);
  await expect(page.locator('.related-stories a[href="/resources/blog/performance-fixture-1"]')).toHaveCount(0);
  await expect(page.locator('.related-stories a[href="/resources/blog/performance-fixture-1"]')).toBeVisible({ timeout: 8000 });
});

test("server loading shell precedes slow data and still permits reading with JavaScript disabled", async ({ browser }) => {
  await writeFile(control!, JSON.stringify({ mode: "all", delayMs: 2500 }));
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: origin, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/resources/blog/performance-fixture-0", { waitUntil: "commit" });
    await expect(page.getByText("Loading article…", { exact: true })).toBeVisible({ timeout: 1500 });
    await expect(page.getByRole("heading", { name: "Performance fixture 0", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Performance fixture 0", exact: true })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Loading article…", { exact: true })).toBeHidden();
    await expect(page.getByRole("link", { name: "Journal", exact: true })).toBeVisible();
    await expect(page.locator(".article-prose p").first()).toBeVisible();
    await page.waitForLoadState("load");
  } finally { await context.close(); }
});

test("category navigation preserves the feature, then shows the selected results", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/resources/blog");
  await expect(page.locator('.feature h2')).toHaveText("Performance fixture 0");
  await page.getByRole("link", { name: "Design", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/category=Design/);
  await expect(page.locator('.feature h2')).toHaveText("Performance fixture 0");
  await expect(page.locator('.story h3').first()).toHaveText("Performance fixture 5");
  await expect(page.locator('a[data-blog-category][aria-current="page"]')).toHaveText("Design");
});

test("ineligible One Tap does not add public session checks to the admin login page", async ({ page }) => {
  let count = 0;
  await page.route("**/api/blog/session", (route) => {
    count++;
    return route.fulfill({ status: 401, body: "{}" });
  });
  await page.goto("/admin/blog/login");
  await expect(page.getByRole("heading", { name: "Đăng nhập Studio", exact: true })).toBeVisible();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(count).toBe(0);
});

test("blog listing also remains usable with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: origin });
  try {
    const page = await context.newPage();
    await page.goto("/resources/blog");
    await expect(page.getByRole("heading", { name: "Ideas into practice." })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Design", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Design", exact: true }).click();
    await expect(page).toHaveURL(/category=Design/);
    await expect(page.locator('.story h3').first()).toBeVisible();
  } finally { await context.close(); }
});
