import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const guards = vi.hoisted(() => ({ allow: vi.fn(() => true), authorize: vi.fn(async () => false), select: vi.fn(), config: vi.fn(() => null as unknown) }));
vi.mock("@/lib/ask/security", () => ({ allowPublishedRequest: guards.allow, authorizeAskAI: guards.authorize }));
vi.mock("@/lib/ask/config", () => ({ readAskAIConfig: guards.config }));
vi.mock("@/lib/ask/provider", () => ({ selectWithGemini: guards.select }));
import { POST } from "@/app/api/ask/route";

const payload = { question: "Who is the founder?", sessionId: "6a9dce34-ddc3-4e94-8e82-a41fe3826481", history: [], language: "en" };
function request(body: unknown = payload, extraHeaders = {}) { return new Request("http://localhost/api/ask", { method: "POST", headers: { "content-type": "application/json", ...extraHeaders }, body: JSON.stringify(body) }); }
beforeEach(() => { vi.clearAllMocks(); guards.allow.mockReturnValue(true); guards.config.mockReturnValue(null); guards.authorize.mockResolvedValue(false); vi.stubEnv("ASK_ENABLED", "true"); });
afterEach(() => vi.unstubAllEnvs());
describe("Ask API", () => {
  it("serves founder information with no model invocation", async () => {
    const response = await POST(request());
    const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(events[0]).toEqual({ type: "status", phase: "retrieving" });
    expect(events[1].answer.founder).toBe(true); expect(events[1].answer.mode).toBe("published");
    expect(guards.select).not.toHaveBeenCalled(); expect(guards.authorize).not.toHaveBeenCalled();
  });
  it("does not call Gemini for a known question even when configured", async () => {
    guards.config.mockReturnValue({}); await (await POST(request())).text(); expect(guards.select).not.toHaveBeenCalled();
  });
  it("refuses cross-origin, oversized and invalid payloads", async () => {
    expect((await POST(request(payload, { origin: "https://bad.example" }))).status).toBe(403);
    expect((await POST(request(payload, { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect((await POST(request({ ...payload, question: "x".repeat(13000) }))).status).toBe(413);
    expect((await POST(request({ ...payload, question: "" }))).status).toBe(400);
  });
  it("allows only the equivalent loopback dev origin and the configured production origin", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect((await POST(request(payload, { origin: "http://127.0.0.1" }))).status).toBe(200);
    expect((await POST(request(payload, { origin: "http://127.0.0.1:4321" }))).status).toBe(403);
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hunpeolabs.com");
    expect((await POST(request(payload, { origin: "http://127.0.0.1" }))).status).toBe(403);
    expect((await POST(request(payload, { origin: "https://hunpeolabs.com" }))).status).toBe(200);
  });
  it("respects the kill switch and local rate limit", async () => {
    guards.allow.mockReturnValue(false); expect((await POST(request())).status).toBe(429);
    vi.stubEnv("ASK_ENABLED", "false"); expect((await POST(request())).status).toBe(503);
  });
  it("never calls the provider when App Check/budgets are unavailable", async () => {
    guards.config.mockReturnValue({});
    const response = await POST(request({ ...payload, question: "An unusual request" }));
    expect(await response.text()).toContain('"mode":"published"'); expect(guards.select).not.toHaveBeenCalled();
  });
  it("selects approved content with the provider and falls back after provider failure", async () => {
    guards.config.mockReturnValue({}); guards.authorize.mockResolvedValue(true);
    guards.select.mockResolvedValue({ topic: "services", service: "ai-agent-development", detail: "overview" });
    expect(await (await POST(request({ ...payload, question: "Organize repeated paperwork" }))).text()).toContain('"mode":"gemini"');
    guards.select.mockRejectedValue(new Error("provider detail must not leak"));
    const fallback = await (await POST(request({ ...payload, question: "Organize repeated paperwork" }))).text();
    expect(fallback).toContain('"mode":"published"'); expect(fallback).not.toContain("provider detail");
  });
});
