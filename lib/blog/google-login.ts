import { request } from "@/components/blog-admin/client";

export async function createVerifiedGoogleSession(user: { uid: string; getIdToken(): Promise<string> }) {
  const session = await request<{ role: string | null }>("/api/blog/session", "POST", {
    idToken: await user.getIdToken(),
  });
  const actor = await request<{ uid: string; verified: boolean }>("/api/blog/session");
  if (actor.verified !== true || actor.uid !== user.uid) throw new Error("SESSION_EXPIRED");
  return session;
}

/** Both Google entry points share one Firebase auth instance. Never exchange concurrently. */
export function createGoogleLoginLock(onChange: (busy: boolean) => void = () => {}) {
  let busy = false;
  return () => {
    if (busy) return null;
    busy = true;
    onChange(true);
    let released = false;
    return () => { if (!released) { released = true; busy = false; onChange(false); } };
  };
}
export const beginGoogleLogin = createGoogleLoginLock(busy => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("hl:google-login-busy", { detail: busy }));
});
