import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ counts: new Map<string, unknown>(), writes: [] as string[], failure: false, initFailure: false }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({ blogDb: () => {
  if (state.initFailure) throw new Error("provider initialization failed");
  return ({
  collection: () => ({ doc: (id: string) => id }),
  runTransaction: async (callback: (tx: unknown) => Promise<void>) => {
    if (state.failure) throw new Error("provider unavailable");
    const pending = new Map<string, {count: number}>();
    await callback({ get: async (id: string) => ({ get: () => state.counts.get(id) }),
      set: (id: string, value: {count: number}) => { pending.set(id, value); } });
    for (const [id, value] of pending) { state.counts.set(id, value.count); state.writes.push(id); }
  },
}); } }));
import { requestLimits } from "@/lib/blog/rate-limit";
const request = (address = "one") => new Request("https://example.com", { headers: {"x-forwarded-for": address} });
describe("atomic CMS budgets", () => {
  beforeEach(() => {
    state.counts.clear(); state.writes = []; state.failure = false; state.initFailure = false;
    vi.stubEnv("BLOG_RATE_LIMIT_MODE", "identity-global");
    vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "a".repeat(32));
    vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-02T12:00:00Z"));
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
  it("keeps UID cap independent of spoofed headers and consumes neither budget on denial", async () => {
    for (let i=0; i<5; i++) await requestLimits(request(String(i)), "reader");
    expect(state.counts.size).toBe(2);
    const before = [...state.counts];
    await expect(requestLimits(request("different"), "reader")).rejects.toMatchObject({status:429});
    expect([...state.counts]).toEqual(before);
    expect(state.writes).toHaveLength(10);
  });
  it("enforces global cap across identities without partially consuming a new UID", async () => {
    for (let i=0; i<30; i++) await requestLimits(request(String(i)), `reader-${i}`);
    const before = [...state.counts];
    await expect(requestLimits(request(), "fresh-reader")).rejects.toMatchObject({status:429});
    expect([...state.counts]).toEqual(before);
  });
  it("preserves session and report UID limits", async () => {
    for (const action of ["session", "report"]) {
      for (let i=0; i<30; i++) await requestLimits(request(), "reader", action);
      await expect(requestLimits(request(), "reader", action)).rejects.toMatchObject({status:429});
    }
  });
  it("fails closed for missing mode, short secret, unknown action and provider failure", async () => {
    vi.stubEnv("BLOG_RATE_LIMIT_MODE", "");
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503});
    vi.stubEnv("BLOG_RATE_LIMIT_MODE", "identity-global"); vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "short");
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503});
    vi.stubEnv("BLOG_RATE_LIMIT_SECRET", "a".repeat(32));
    await expect(requestLimits(request(), "reader", "unknown")).rejects.toMatchObject({status:503});
    state.failure = true;
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503});
    expect(state.writes).toHaveLength(0);
  });
  it("fails closed during provider initialization and for an unconfigured trusted ingress", async () => {
    state.initFailure = true;
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503,code:"RATE_LIMIT_UNAVAILABLE"});
    state.initFailure = false;
    vi.stubEnv("BLOG_RATE_LIMIT_MODE", "trusted-ingress");
    vi.stubEnv("BLOG_TRUSTED_IP_HEADER", "");
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503});
    expect(state.writes).toHaveLength(0);
  });
  it("renews a UID window while preserving the hourly global count", async () => {
    for (let i=0; i<5; i++) await requestLimits(request(), "reader");
    vi.advanceTimersByTime(600000);
    await requestLimits(request(), "reader");
    expect([...state.counts.values()].sort()).toEqual([1,5,6]);
  });
  it("fails closed for corrupt stored counts", async () => {
    await requestLimits(request(), "reader");
    state.counts.set([...state.counts.keys()][0], "invalid");
    await expect(requestLimits(request(), "reader")).rejects.toMatchObject({status:503});
    expect(state.writes).toHaveLength(2);
  });
});
