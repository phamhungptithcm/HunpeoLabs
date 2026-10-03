import { test, expect } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { emptyDraft } from "../../lib/blog/schema";
const enabled = process.env.BLOG_SHARES_E2E === "true";
test.skip(!enabled, "Requires isolated local demo Firestore fixture");
const project = "demo-hunpeolabs-blog-shares-031";
const origin = "http://127.0.0.1:3143";
const id = `shares-${randomUUID()}`;
const headers = { origin, "x-blog-request": "1" };
let db: ReturnType<typeof getFirestore>;
test.beforeAll(async () => {
  if (!enabled) return;
  if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:18081") throw new Error("Isolated demo emulator required");
  db = getFirestore(initializeApp({ projectId: project }, id));
  const now = "2026-10-02T12:00:00.000Z";
  await db.collection("blogPublished").doc(id).set({ ...emptyDraft, id, slug: id, title: "Synthetic sharing fixture", summary: "Local validation only", author: "Demo Author", publishedAt: now, updatedAt: now, readingMinutes: 19, revision: 1, body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Synthetic article for local sharing checks." }] }] } });
});
test.afterAll(async () => {
  if (!enabled || !db) return;
  await db.collection("blogPublished").doc(id).delete();
  await db.collection("blogPostShares").doc(id).delete();
  await db.collection("blogPostStats").doc(id).delete();
});

test("counts explicit share actions; dialog opens, cancelled device and failed copies do not count", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("test clipboard denied"); } } });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("test cancelled", "AbortError"); } });
  });
  await page.goto(`${origin}/resources/blog/${id}`);
  await expect(page.locator(".blog-shares")).toHaveText(" · 0 shares");
  await expect(page.locator(".blog-views")).toContainText("view");
  await page.getByRole("button", { name: "Share", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator(".blog-shares")).toHaveText(" · 0 shares");
  await dialog.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Select and copy");
  await dialog.getByRole("button", { name: "Share with your device", exact: true }).click();
  await expect(page.locator(".blog-shares")).toHaveText(" · 0 shares");
  for (const name of ["Facebook", "LinkedIn", "X", "Email"]) {
    const link = dialog.getByRole("link", { name: `Share via ${name}`, exact: true });
    // Trigger real UI handlers without navigating to external social services.
    await link.evaluate(el => el.addEventListener("click", e => e.preventDefault()));
    await link.click();
  }
  await expect(page.locator(".blog-shares")).toHaveText(" · 4 shares");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
  });
  await dialog.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Link copied.");
  await expect(page.locator(".blog-shares")).toHaveText(" · 5 shares");
  await dialog.getByRole("button", { name: "Share with your device", exact: true }).click();
  await expect(page.locator(".blog-shares")).toHaveText(" · 6 shares");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.screenshot({ path: "/tmp/hunpeolabs-blog-shares-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator(".blog-shares")).toHaveText(" · 6 shares");

  await page.route("**/api/blog/shares", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"SERVICE_UNAVAILABLE"}' }));
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } }));
  await page.getByRole("button", { name: "Share", exact: true }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("Link copied.");
  await expect(page.locator(".blog-shares")).toHaveText(" · 6 shares");
});

test("all desktop share controls update the same total", async ({ page, request }) => {
  const before = await (await request.get(`${origin}/api/blog/shares?postId=${id}`)).json();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } }));
  await page.goto(`${origin}/resources/blog/${id}`);
  const side = page.locator("aside.side-share");
  const linkedin = side.getByRole("link", { name: "Share on LinkedIn", exact: true });
  await linkedin.evaluate(el => el.addEventListener("click", e => e.preventDefault()));
  await linkedin.click();
  await expect(page.locator(".blog-shares")).toContainText(`${before.shares + 1} shares`);
  await side.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator(".blog-shares")).toContainText(`${before.shares + 2} shares`);
  await page.getByRole("button", { name: "Share", exact: true }).last().click();
  await page.getByRole("dialog").getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator(".blog-shares")).toContainText(`${before.shares + 3} shares`);
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator(".blog-views")).toContainText("view");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/tmp/hunpeolabs-blog-shares-desktop.png", fullPage: true });
});

test("concurrent duplicate events count once; API bounds input and enforces origin", async ({ request }) => {
  const eventId = randomUUID();
  const before = await (await request.get(`${origin}/api/blog/shares?postId=${id}`)).json();
  const responses = await Promise.all(Array.from({ length: 6 }, () => request.post(`${origin}/api/blog/shares`, { headers, data: { postId: id, eventId, channel: "copy" } })));
  for (const response of responses) expect(response.ok()).toBe(true);
  expect(await (await request.get(`${origin}/api/blog/shares?postId=${id}`)).json()).toEqual({ shares: before.shares + 1 });
  expect((await request.post(`${origin}/api/blog/shares`, { headers: { ...headers, origin: "https://other.invalid" }, data: { postId: id, eventId, channel: "email" } })).status()).toBe(403);
  expect((await request.post(`${origin}/api/blog/shares`, { headers, data: { postId: "missing", eventId, channel: "email" } })).status()).toBe(404);
  expect((await request.post(`${origin}/api/blog/shares`, { headers, data: { postId: id, eventId, channel: "unknown" } })).status()).toBe(400);
  expect((await request.post(`${origin}/api/blog/shares`, { headers, data: { postId: id, eventId, channel: "copy", padding: "x".repeat(1100) } })).status()).toBe(413);
});


test("slow initial counts cannot overwrite newer actions; failed reads hide statistics", async ({ page, request }) => {
  const before = await (await request.get(`${origin}/api/blog/shares?postId=${id}`)).json();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } }));
  await page.route("**/api/blog/shares?*", async route => {
    await gate;
    await route.fulfill({ contentType: "application/json", body: '{"shares":0}' });
  });
  await page.goto(`${origin}/resources/blog/${id}`);
  await page.getByRole("button", { name: "Share", exact: true }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator(".blog-shares")).toContainText(`${before.shares + 1} shares`);
  const received = page.waitForResponse(response => response.url().includes("/api/blog/shares?") && response.request().method() === "GET");
  release();
  await received;
  await expect(page.locator(".blog-shares")).toContainText(`${before.shares + 1} shares`);
  await page.unroute("**/api/blog/shares?*");
  await page.route("**/api/blog/shares?*", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"SERVICE_UNAVAILABLE"}' }));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Synthetic sharing fixture", exact: true })).toBeVisible();
  await expect(page.locator(".blog-shares")).toHaveCount(0);
});
