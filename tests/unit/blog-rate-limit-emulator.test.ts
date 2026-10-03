import { afterAll, describe, expect, it, vi } from "vitest";
import { createHmac, randomUUID } from "node:crypto";
vi.mock("server-only", () => ({}));
const enabled = process.env.BLOG_RATE_LIMIT_EMULATOR_TEST === "true";
if (enabled && (process.env.BLOG_FIREBASE_PROJECT_ID !== "demo-hunpeolabs-blog-001" ||
    process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:28080" ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:29099" ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST !== "127.0.0.1:29199"))
  throw new Error("Refuse non-isolated demo limiter test");
import { requestLimits } from "@/lib/blog/rate-limit";
import { blogDb } from "@/lib/firebase-admin";
const uid = `limiter-concurrency-${randomUUID()}`;
const ids: string[] = [];
describe.skipIf(!enabled)("Firestore emulator atomic limiter", () => {
  afterAll(async () => {
    vi.unstubAllEnvs();
    if (!enabled) return;
    const batch = blogDb().batch();
    for (const id of ids) batch.delete(blogDb().collection("blogRateLimits").doc(id));
    await batch.commit();
  });
  it("commits exactly five concurrent comments and preserves denied budgets", async () => {
    vi.stubEnv("BLOG_RATE_LIMIT_MODE", "identity-global");
    const secret = process.env.BLOG_RATE_LIMIT_SECRET ?? "emulator-only";
    const now = Date.now();
    for (const [key, window] of [[`comment:uid:${uid}`,600000],["comment:global",3600000]] as const)
      ids.push(createHmac("sha256",secret).update(`${key}:${Math.floor(now/window)}`).digest("hex"));
    const global = blogDb().collection("blogRateLimits").doc(ids[1]);
    // This test owns the isolated demo project and must run before browser fixtures.
    await global.delete();
    const results = await Promise.allSettled(Array.from({length:7},(_,i) =>
      requestLimits(new Request("https://example.com",{headers:{"x-forwarded-for":String(i)}}),uid)));
    expect(results.filter(r=>r.status === "fulfilled")).toHaveLength(5);
    for (const result of results) if (result.status === "rejected") expect(result.reason.status).toBe(429);
    const stored = await global.get();
    expect(stored.get("count")).toBe(5);
    expect(stored.get("expiresAt").toMillis() - now).toBeGreaterThanOrEqual(86400000);
    expect(stored.get("expiresAt").toMillis() - now).toBeLessThan(86410000);
    expect((await blogDb().collection("blogRateLimits").doc(ids[0]).get()).get("count")).toBe(5);
    vi.unstubAllEnvs();
  },30000);
});
