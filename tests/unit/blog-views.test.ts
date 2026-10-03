import { beforeEach, describe, expect, it, vi } from "vitest";
const fake = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), rate: vi.fn(), fail: false }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/blog/rate-limit", () => ({ rateLimit: fake.rate }));
vi.mock("@/lib/firebase-admin", () => {
  const snapshot = (path: string) => ({ exists: fake.docs.has(path), get: (key: string) => fake.docs.get(path)?.[key] });
  return { blogDb: () => ({
    collection: (name: string) => ({ doc: (id: string) => ({ path: `${name}/${id}`, get: async () => snapshot(`${name}/${id}`) }) }),
    runTransaction: async (action: (tx: unknown) => unknown) => {
      if (fake.fail) throw new Error("unavailable");
      const writes = new Map<string, Record<string, unknown>>();
      const result = await action({ get: async (ref: { path: string }) => snapshot(ref.path), set: (ref: { path: string }, data: Record<string, unknown>) => writes.set(ref.path, data) });
      for (const [path, data] of writes) fake.docs.set(path, data);
      return result;
    },
  }) };
});
import { Timestamp } from "firebase-admin/firestore";
import { getViews, recordView, viewInput } from "@/lib/blog/views";
const session = "92fa37d5-174d-4f5a-8d56-e6198cb0ee11";
const request = new Request("http://localhost/api/blog/views");
beforeEach(() => {
  fake.docs.clear(); fake.rate.mockReset(); fake.fail = false;
  vi.stubEnv("FIRESTORE_EMULATOR_HOST", "127.0.0.1:18080");
  vi.stubEnv("BLOG_TRUSTED_IP_HEADER", ""); vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "");
  fake.docs.set("blogPublished/post", { title: "Published" });
});
describe("article view statistics", () => {
  it("starts at zero and deduplicates retries in the same session", async () => {
    expect(await getViews("post")).toEqual({ views: 0 });
    expect(await recordView(request, { postId: "post", session })).toEqual({ views: 1 });
    expect(await recordView(request, { postId: "post", session })).toEqual({ views: 1 });
    expect([...fake.docs.keys()].filter(k => k.startsWith("blogViewSessions/"))).toHaveLength(1);
    expect(JSON.stringify([...fake.docs])).not.toContain(session);
  });
  it("counts another session and preserves stats on republishing", async () => {
    await recordView(request, { postId: "post", session });
    fake.docs.delete("blogPublished/post");
    await expect(getViews("post")).rejects.toMatchObject({ status: 404 });
    fake.docs.set("blogPublished/post", { title: "Updated" });
    expect(await recordView(request, { postId: "post", session: "72fa37d5-174d-4f5a-8d56-e6198cb0ee11" })).toEqual({ views: 2 });
  });
  it("checks expiry even before TTL deletion", async () => {
    await recordView(request, { postId: "post", session });
    for (const [key] of fake.docs) if (key.startsWith("blogViewSessions/")) fake.docs.set(key, { expiresAt: Timestamp.fromMillis(0) });
    expect(await recordView(request, { postId: "post", session })).toEqual({ views: 2 });
  });
  it("does not count drafts or unknown articles", async () => {
    await expect(recordView(request, { postId: "draft", session })).rejects.toMatchObject({ status: 404 });
    expect(fake.docs.has("blogPostStats/draft")).toBe(false);
  });
  it("bounds input and rejects injected count or malformed session", () => {
    for (const input of [{ postId: "../x", session }, { postId: "post", session: "x" }, { postId: "post", session, views: 99 }]) expect(viewInput.safeParse(input).success).toBe(false);
  });
  it("fails closed without production ingress and rate-limit secret", async () => {
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
    await expect(recordView(request, { postId: "post", session })).rejects.toMatchObject({ code: "RATE_LIMIT_NOT_CONFIGURED" });
    vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "test-only-secret");
    await expect(recordView(request, { postId: "post", session })).rejects.toMatchObject({ code: "INGRESS_NOT_CONFIGURED" });
  });
  it("does not write when throttled or when database fails", async () => {
    fake.rate.mockRejectedValueOnce(new Error("throttled"));
    await expect(recordView(request, { postId: "post", session })).rejects.toThrow("throttled");
    fake.fail = true;
    await expect(recordView(request, { postId: "post", session })).rejects.toThrow("unavailable");
    expect(fake.docs.has("blogPostStats/post")).toBe(false);
  });
});
