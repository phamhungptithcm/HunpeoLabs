import "server-only";
import { cookies } from "next/headers";
import { blogAuth } from "@/lib/firebase-admin";
import { Actor, BlogError } from "./schema";
import { accessFor, googleIdentity } from "./access";
import { googleAvatar } from "./profile";
export const SESSION = "hl_blog_session";
export async function currentActor(): Promise<Actor> {
  const value = (await cookies()).get(SESSION)?.value;
  if (!value) throw new BlogError(401, "SIGN_IN_REQUIRED");
  let decoded;
  try {
    decoded = await blogAuth().verifySessionCookie(value, true);
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (
      [
        "auth/session-cookie-expired",
        "auth/session-cookie-revoked",
        "auth/invalid-session-cookie",
        "auth/user-disabled",
        "auth/user-not-found",
        "auth/argument-error",
      ].includes(code)
    )
      throw new BlogError(401, "SESSION_EXPIRED");
    throw new BlogError(503, "AUTH_UNAVAILABLE");
  }
  let email: string;
  try {
    email = googleIdentity(decoded);
  } catch {
    throw new BlogError(401, "SESSION_EXPIRED");
  }
  const role = await accessFor(decoded);
  return {
    uid: decoded.uid,
    email,
    verified: decoded.email_verified === true,
    avatar: googleAvatar(decoded.picture),
    name:
      typeof decoded.name === "string" ? decoded.name.slice(0, 80) : "Reader",
    ...(role ? { role } : {}),
  };
}
export async function requireStaff() {
  const a = await currentActor();
  if (!a.role || !a.verified) throw new BlogError(403, "FORBIDDEN");
  return a;
}
export function sameOrigin(request: Request) {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = expected
    ? new URL(expected).origin
    : new URL(request.url).origin;
  if (
    request.headers.get("origin") !== origin ||
    request.headers.get("x-blog-request") !== "1"
  )
    throw new BlogError(403, "ORIGIN_REJECTED");
}

/** Page navigation uses a login redirect; API handlers retain explicit 401/403 errors. */
export async function requireStaffPage() {
  const { redirect, notFound } = await import("next/navigation");
  try {
    return await requireStaff();
  } catch (e) {
    if (e instanceof BlogError && e.status === 401)
      redirect("/admin/blog/login");
    if (e instanceof BlogError && e.status === 403) notFound();
    throw e;
  }
}
