import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const fake = vi.hoisted(() => ({ counts: new Map<string, number>(), verify: vi.fn(), writes: vi.fn(), tail: Promise.resolve() }));
vi.mock("firebase-admin/app", () => ({ applicationDefault: () => ({}), getApps: () => [{ name: "hunpeolabs-ask" }], initializeApp: vi.fn() }));
vi.mock("firebase-admin/app-check", () => ({ getAppCheck: () => ({ verifyToken: fake.verify }) }));
vi.mock("firebase-admin/firestore", () => ({
  Timestamp: { fromDate: (date: Date) => date },
  getFirestore: () => ({ collection: () => ({ doc: (key: string) => key }), runTransaction: (callback: (tx: unknown) => Promise<boolean>) => {
    const run = fake.tail.then(() => callback({
      getAll: async (...refs: string[]) => refs.map(ref => ({ get: () => fake.counts.get(ref) })),
      set: (ref: string, value: { count: number }) => { fake.counts.set(ref, value.count); fake.writes(ref, value); },
    }));
    fake.tail = run.then(() => {}); return run;
  } }),
}));
import { allowPublishedRequest, authorizeAskAI } from "@/lib/ask/security";
const config = { projectId: "demo-project", location: "us-central1", appId: "expected-app", secret: "s".repeat(32), monthlyLimit: 1 };
const request = () => new Request("http://localhost/api/ask", { headers: { "x-firebase-appcheck": "fixture-token" } });
beforeEach(() => { fake.counts.clear(); fake.writes.mockClear(); fake.verify.mockReset(); fake.verify.mockResolvedValue({ appId: config.appId }); fake.tail = Promise.resolve(); });
describe("Ask paid request budget", () => {
  it("reserves before generation and prevents concurrent sessions exceeding the monthly cap", async () => {
    const results = await Promise.all([authorizeAskAI(request(), "session-one", config), authorizeAskAI(request(), "session-two", config)]);
    expect(results.filter(Boolean)).toHaveLength(1); expect(fake.writes).toHaveBeenCalledTimes(4);
    expect(fake.writes.mock.calls.every(([, record]) => Object.keys(record).sort().join() === "count,expiresAt")).toBe(true);
  });
  it("rejects missing, invalid and wrong-app attestations before storing counters", async () => {
    expect(await authorizeAskAI(new Request("http://localhost/api/ask"), "s", config)).toBe(false);
    fake.verify.mockResolvedValue({ appId: "wrong-app" }); expect(await authorizeAskAI(request(), "s", config)).toBe(false);
    fake.verify.mockRejectedValue(new Error("invalid")); expect(await authorizeAskAI(request(), "s", config)).toBe(false);
    expect(fake.writes).not.toHaveBeenCalled();
  });
  it("retains failed reservations and refuses corrupt counters", async () => {
    expect(await authorizeAskAI(request(), "s", config)).toBe(true);
    expect(await authorizeAskAI(request(), "s", config)).toBe(false);
    for (const key of fake.counts.keys()) fake.counts.set(key, NaN);
    expect(await authorizeAskAI(request(), "s", { ...config, monthlyLimit: 1000 })).toBe(false);
  });
  it("does not reset the shared monthly cap when the session hashing secret rotates", async () => {
    expect(await authorizeAskAI(request(), "s", config)).toBe(true);
    expect(await authorizeAskAI(request(), "other", { ...config, secret: "t".repeat(32) })).toBe(false);
  });
  it("bounds free request bursts and expires local counters", () => {
    const now = Date.now(); const key = "public-fixture";
    for (let index = 0; index < 12; index++) expect(allowPublishedRequest(key, now)).toBe(true);
    expect(allowPublishedRequest(key, now)).toBe(false); expect(allowPublishedRequest(key, now + 60_001)).toBe(true);
  });
});
