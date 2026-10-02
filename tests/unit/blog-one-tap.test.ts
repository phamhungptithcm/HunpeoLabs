import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: {},
  getAuth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  credential: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/lib/blog/firebase-client", () => ({
  getBlogClientAuth: mocks.getAuth,
}));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: { credential: mocks.credential },
  signInWithCredential: mocks.signIn,
  signOut: mocks.signOut,
}));
vi.mock("@/components/blog-admin/client", () => ({ request: mocks.request }));
import { createOneTapSession } from "@/lib/blog/google-one-tap";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getAuth.mockResolvedValue(mocks.auth);
  mocks.credential.mockReturnValue("google-credential");
  mocks.signIn.mockResolvedValue({
    user: { getIdToken: async () => "firebase-verified-token" },
  });
  mocks.signOut.mockResolvedValue(undefined);
});
describe("One Tap Firebase session exchange", () => {
  it("sends the Firebase token to the existing session endpoint, not the Google token", async () => {
    mocks.request.mockResolvedValue({ role: "admin" });
    await expect(createOneTapSession("google-id-token")).resolves.toEqual({
      role: "admin",
    });
    expect(mocks.request).toHaveBeenCalledWith("/api/blog/session", "POST", {
      idToken: "firebase-verified-token",
    });
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });
  it("never creates a server session when Firebase rejects the credential", async () => {
    mocks.signIn.mockRejectedValue(new Error("invalid credential"));
    await expect(createOneTapSession("bad-token")).rejects.toThrow();
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.signOut).toHaveBeenCalled();
  });
  it("clears SDK credentials even when the server rejects the session", async () => {
    mocks.request.mockRejectedValue(new Error("forbidden"));
    await expect(createOneTapSession("google-token")).rejects.toThrow(
      "forbidden",
    );
    expect(mocks.signOut).toHaveBeenCalled();
  });
  it("does not elevate a reader", async () => {
    mocks.request.mockResolvedValue({ role: null });
    await expect(createOneTapSession("google-token")).resolves.toEqual({
      role: null,
    });
  });
  it("rejects empty or oversized credential before loading auth", async () => {
    await expect(createOneTapSession("")).rejects.toThrow();
    await expect(createOneTapSession("x".repeat(10001))).rejects.toThrow();
    expect(mocks.getAuth).not.toHaveBeenCalled();
  });
});
