import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { verify } = vi.hoisted(() => ({ verify: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({
  blogAuth: () => ({ verifyIdToken: verify }),
}));
vi.mock("@/lib/blog/auth", () => ({
  currentActor: vi.fn(),
  sameOrigin: vi.fn(),
  SESSION: "test-session",
}));
vi.mock("@/lib/blog/access", () => ({
  accessFor: vi.fn(),
  googleIdentity: vi.fn(),
}));
vi.mock("@/lib/blog/rate-limit", () => ({ requestLimits: vi.fn() }));
import { POST } from "@/app/api/blog/session/route";
import { BlogError } from "@/lib/blog/schema";
afterEach(() => vi.restoreAllMocks());
it.each([
  [
    Object.assign(new Error("private-provider-detail"), {
      code: "auth/id-token-expired",
    }),
    401,
    "INVALID_LOGIN",
  ],
  [
    Object.assign(new Error("private-provider-detail"), {
      code: "auth/user-disabled",
    }),
    401,
    "INVALID_LOGIN",
  ],
  [
    Object.assign(new Error("private-provider-detail"), {
      code: "app/network-error",
    }),
    503,
    "AUTH_UNAVAILABLE",
  ],
  [new BlogError(503, "BLOG_NOT_CONFIGURED"), 503, "BLOG_NOT_CONFIGURED"],
])(
  "preserves safe authentication failure semantics (%#)",
  async (error, status, code) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    verify.mockRejectedValueOnce(error);
    const response = await POST(
      new Request("http://localhost/api/blog/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: "synthetic-invalid-token" }),
      }),
    );
    expect(response.status).toBe(status);
    expect(response.headers.get("set-cookie")).toBeNull();
    const body = await response.json();
    expect(body.error).toBe(code);
    expect(JSON.stringify(body)).not.toContain("private-provider-detail");
  },
);
