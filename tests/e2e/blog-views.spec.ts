import { test, expect } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import { emptyDraft } from "../../lib/blog/schema";
const enabled = process.env.BLOG_VIEWS_E2E === "true";
test.skip(!enabled, "Requires isolated local demo Firestore fixture");
const project = "demo-hunpeolabs-blog-views-030";
const origin = "http://127.0.0.1:3142";
const id = `views-${randomUUID()}`;
const headers = { origin, "x-blog-request": "1" };
let db: ReturnType<typeof getFirestore>;
test.beforeAll(async () => {
  if (!enabled) return;
  if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:18080") throw new Error("Demo emulator required");
  db = getFirestore(initializeApp({ projectId: project }, `views-${id}`));
  const now = "2026-10-02T00:00:00.000Z";
  await db.collection("blogPublished").doc(id).set({ ...emptyDraft, id, slug: id, title: "Synthetic view counter fixture", summary: "Local validation only", author: "Demo Author", publishedAt: now, updatedAt: now, readingMinutes: 19, revision: 1, body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Local synthetic article." }] }] } });
});
test.afterAll(async () => {
  if (!enabled || !db) return;
  await db.collection("blogPublished").doc(id).delete();
  await db.collection("blogPostStats").doc(id).delete();
});
test("visible count, refresh deduplication, mobile layout and fail-safe rendering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/resources/blog/${id}`);
  await expect(page.locator(".blog-views")).toContainText("1 view");
  await page.reload();
  await expect(page.locator(".blog-views")).toContainText("1 view");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `/tmp/blog-views-${id}.png`, fullPage: true });
  await page.route("**/api/blog/views?*", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"SERVICE_UNAVAILABLE"}' }));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Synthetic view counter fixture", exact: true })).toBeVisible();
  await expect(page.locator(".blog-views")).toHaveCount(0);
});
test("concurrent duplicate requests count once, new sessions count separately and origin is enforced", async ({ request }) => {
  const session = randomUUID();
  const before = await (await request.get(`${origin}/api/blog/views?postId=${id}`)).json();
  const responses = await Promise.all(Array.from({ length: 6 }, () => request.post(`${origin}/api/blog/views`, { headers, data: { postId: id, session } })));
  for (const response of responses) expect(response.ok()).toBe(true);
  expect(await (await request.get(`${origin}/api/blog/views?postId=${id}`)).json()).toEqual({ views: before.views + 1 });
  const next = await request.post(`${origin}/api/blog/views`, { headers, data: { postId: id, session: randomUUID() } });
  expect(await next.json()).toEqual({ views: before.views + 2 });
  expect((await request.post(`${origin}/api/blog/views`, { headers: { ...headers, origin: "https://other.invalid" }, data: { postId: id, session } })).status()).toBe(403);
  expect((await request.post(`${origin}/api/blog/views`, { headers, data: { postId: "missing-fixture", session } })).status()).toBe(404);
});
