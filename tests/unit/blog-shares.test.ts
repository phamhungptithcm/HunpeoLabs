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
import { getShares, recordShare, shareInput } from "@/lib/blog/shares";
const session = "92fa37d5-174d-4f5a-8d56-e6198cb0ee11";
const request = new Request("http://localhost/api/blog/shares");
beforeEach(() => {
  fake.docs.clear(); fake.rate.mockReset(); fake.fail = false;
  vi.stubEnv("FIRESTORE_EMULATOR_HOST", "127.0.0.1:18080");
  vi.stubEnv("BLOG_TRUSTED_IP_HEADER", ""); vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "");
  fake.docs.set("blogPublished/post", { title: "Published" });
});
describe("article share statistics", () => {
  it("starts at zero and deduplicates retries in the same action", async () => {
    expect(await getShares("post")).toEqual({ shares: 0 });
    expect(await recordShare(request, { postId: "post", eventId: session, channel: "copy" })).toEqual({ shares: 1 });
    expect(await recordShare(request, { postId: "post", eventId: session, channel: "copy" })).toEqual({ shares: 1 });
    expect([...fake.docs.keys()].filter(k => k.startsWith("blogShareEvents/"))).toHaveLength(1);
    expect(JSON.stringify([...fake.docs])).not.toContain(session);
  });
  it("counts another action and preserves stats on republishing", async () => {
    await recordShare(request, { postId: "post", eventId: session, channel: "copy" });
    fake.docs.delete("blogPublished/post");
    await expect(getShares("post")).rejects.toMatchObject({ status: 404 });
    fake.docs.set("blogPublished/post", { title: "Updated" });
    expect(await recordShare(request, { postId: "post", eventId: "72fa37d5-174d-4f5a-8d56-e6198cb0ee11", channel: "linkedin" })).toEqual({ shares: 2 });
  });
  it("checks expiry even before TTL deletion", async () => {
    await recordShare(request, { postId: "post", eventId: session, channel: "copy" });
    for (const [key] of fake.docs) if (key.startsWith("blogShareEvents/")) fake.docs.set(key, { expiresAt: Timestamp.fromMillis(0) });
    expect(await recordShare(request, { postId: "post", eventId: session, channel: "copy" })).toEqual({ shares: 2 });
  });
  it("does not count drafts or unknown articles", async () => {
    await expect(recordShare(request, { postId: "draft", eventId: session, channel: "copy" })).rejects.toMatchObject({ status: 404 });
    expect(fake.docs.has("blogPostShares/draft")).toBe(false);
  });
  it("bounds input and rejects injected count or malformed session", () => {
    for (const input of [{ postId: "../x", eventId: session, channel: "copy" }, { postId: "post", eventId: "x", channel: "copy" }, { postId: "post", eventId: session, channel: "copy", shares: 99 }]) expect(shareInput.safeParse(input).success).toBe(false);
  });
  it("fails closed without production ingress and rate-limit secret", async () => {
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
    await expect(recordShare(request, { postId: "post", eventId: session, channel: "copy" })).rejects.toMatchObject({ code: "RATE_LIMIT_NOT_CONFIGURED" });
    vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "test-only-secret");
    await expect(recordShare(request, { postId: "post", eventId: session, channel: "copy" })).rejects.toMatchObject({ code: "INGRESS_NOT_CONFIGURED" });
  });
  it("does not write when throttled or when database fails", async () => {
    fake.rate.mockRejectedValueOnce(new Error("throttled"));
    await expect(recordShare(request, { postId: "post", eventId: session, channel: "copy" })).rejects.toThrow("throttled");
    fake.fail = true;
    await expect(recordShare(request, { postId: "post", eventId: session, channel: "copy" })).rejects.toThrow("unavailable");
    expect(fake.docs.has("blogPostShares/post")).toBe(false);
  });
});
it("rejects unknown channels and deduplicates an event even if the channel changes", async () => {
  expect(shareInput.safeParse({ postId: "post", eventId: session, channel: "unknown" }).success).toBe(false);
  await recordShare(request, { postId: "post", eventId: session, channel: "copy" });
  expect(await recordShare(request, { postId: "post", eventId: session, channel: "email" })).toEqual({ shares: 1 });
});
it("refuses corrupt counts and integer overflow without replacing statistics", async () => {
  for (const shares of [-1, "100", Number.MAX_SAFE_INTEGER]) {
    fake.docs.set("blogPostShares/post", { shares });
    await expect(recordShare(request, { postId: "post", eventId: session, channel: "copy" })).rejects.toMatchObject({ status: 503 });
    expect(fake.docs.get("blogPostShares/post")).toEqual({ shares });
  }
});
it("never alters the independent view statistics", async () => {
  fake.docs.set("blogPostStats/post", { views: 42 });
  await recordShare(request, { postId: "post", eventId: session, channel: "copy" });
  expect(fake.docs.get("blogPostStats/post")).toEqual({ views: 42 });
});
