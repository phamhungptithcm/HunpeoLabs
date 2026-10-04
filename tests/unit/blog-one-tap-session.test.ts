import { beforeEach, expect, it, vi } from "vitest";
const f = vi.hoisted(() => ({ auth: {}, signIn: vi.fn(), signOut: vi.fn(), request: vi.fn() }));
vi.mock("@/lib/blog/firebase-client", () => ({ getBlogClientAuth: async () => f.auth }));
vi.mock("firebase/auth", () => ({ GoogleAuthProvider: { credential: (token: string) => token }, signInWithCredential: f.signIn, signOut: f.signOut }));
vi.mock("@/components/blog-admin/client", () => ({ request: f.request }));
import { createOneTapSession } from "@/lib/blog/google-one-tap";
beforeEach(() => {
  vi.resetAllMocks();
  f.signOut.mockResolvedValue(undefined);
  f.signIn.mockResolvedValue({ user: { uid: "fixture-reader", getIdToken: async () => "fixture-firebase-token" } });
  f.request.mockResolvedValueOnce({ role: null }).mockResolvedValueOnce({ uid: "fixture-reader", verified: true });
});
it("confirms cookie identity before completing Google sign-in and clears SDK auth", async () => {
  await expect(createOneTapSession("fixture-google-token")).resolves.toEqual({ role: null });
  expect(f.request).toHaveBeenNthCalledWith(1, "/api/blog/session", "POST", { idToken: "fixture-firebase-token" });
  expect(f.request).toHaveBeenNthCalledWith(2, "/api/blog/session");
  expect(f.signOut).toHaveBeenCalledWith(f.auth);
});
it("does not report success when cookie readback fails", async () => {
  f.request.mockReset().mockResolvedValueOnce({ role: null }).mockRejectedValueOnce(new Error("SESSION_EXPIRED"));
  await expect(createOneTapSession("fixture-google-token")).rejects.toThrow("SESSION_EXPIRED");
  expect(f.signOut).toHaveBeenCalledOnce();
});
it("rejects mismatched or unverified cookie identity", async () => {
  f.request.mockReset().mockResolvedValueOnce({ role: null }).mockResolvedValueOnce({ uid: "different-reader", verified: true });
  await expect(createOneTapSession("fixture-google-token")).rejects.toThrow("SESSION_EXPIRED");
  expect(f.signOut).toHaveBeenCalledOnce();
});
it("rejects missing credentials before calling Firebase", async () => {
  await expect(createOneTapSession("")).rejects.toThrow("INVALID_LOGIN");
  expect(f.signIn).not.toHaveBeenCalled();
});
it("cleans up Firebase auth when credential exchange fails", async () => {
  f.signIn.mockRejectedValueOnce(new Error("auth/invalid-credential"));
  await expect(createOneTapSession("fixture-google-token")).rejects.toThrow("auth/invalid-credential");
  expect(f.request).not.toHaveBeenCalled();
  expect(f.signOut).toHaveBeenCalledOnce();
});
