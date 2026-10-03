import "server-only";
import { OAuth2Client } from "google-auth-library";
import { timingSafeEqual } from "node:crypto";
import { BlogError } from "./schema";
const verifier = new OAuth2Client();
export function schedulerConfigured() {
  return Boolean(process.env.BLOG_SCHEDULER_SERVICE_ACCOUNT && process.env.BLOG_SCHEDULER_AUDIENCE) || (process.env.BLOG_SCHEDULER_SECRET?.length ?? 0) >= 32;
}
export async function authorizeScheduler(request: Request) {
  const account = process.env.BLOG_SCHEDULER_SERVICE_ACCOUNT;
  const audience = process.env.BLOG_SCHEDULER_AUDIENCE;
  const bearer = request.headers.get("authorization") ?? "";
  if (account && audience) {
    if (!bearer.startsWith("Bearer ") || bearer.length > 10000) throw new BlogError(401, "FORBIDDEN");
    try {
      const ticket = await verifier.verifyIdToken({ idToken: bearer.slice(7), audience });
      const claims = ticket.getPayload();
      if (!claims || claims.email !== account || claims.email_verified !== true) throw new Error("IDENTITY_MISMATCH");
      return;
    } catch { throw new BlogError(401, "FORBIDDEN"); }
  }
  // Retain explicit local/test secret setup, never fall back when OIDC is configured.
  const secret = process.env.BLOG_SCHEDULER_SECRET;
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  const supplied = Buffer.from(bearer);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new BlogError(401, "FORBIDDEN");
}
