import { accessFor, googleIdentity } from "@/lib/blog/access";
import { cookies } from "next/headers";
import { z } from "zod";
import { api, jsonBody } from "@/lib/blog/http";
import { currentActor, sameOrigin, SESSION } from "@/lib/blog/auth";
import { blogAuth } from "@/lib/firebase-admin";
import { BlogError } from "@/lib/blog/schema";
import { requestLimits } from "@/lib/blog/rate-limit";
export const GET = () => api(async () => currentActor());
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    const b = z
      .object({ idToken: z.string().min(10).max(10000) })
      .parse(await jsonBody(r, 12000));
    let token;
    try {
      token = await blogAuth().verifyIdToken(b.idToken, true);
    } catch (error) {
      if (error instanceof BlogError) throw error;
      const code = (error as { code?: string }).code;
      if (
        [
          "auth/argument-error",
          "auth/invalid-id-token",
          "auth/id-token-expired",
          "auth/id-token-revoked",
          "auth/user-disabled",
          "auth/user-not-found",
        ].includes(code ?? "")
      )
        throw new BlogError(401, "INVALID_LOGIN");
      throw new BlogError(503, "AUTH_UNAVAILABLE");
    }
    googleIdentity(token);
    if (Date.now() / 1000 - token.auth_time > 300)
      throw new BlogError(401, "RECENT_LOGIN_REQUIRED");
    await requestLimits(r, token.uid, "session");
    const role = await accessFor(token, true);
    const session = await blogAuth().createSessionCookie(b.idToken, {
      expiresIn: 86400000,
    });
    (await cookies()).set(SESSION, session, {
      httpOnly: true,
      secure: !process.env.FIREBASE_AUTH_EMULATOR_HOST,
      sameSite: "strict",
      path: "/",
      maxAge: 86400,
    });
    return { ok: true, role: role ?? null };
  });
export const DELETE = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    const actor = await currentActor().catch(() => null);
    if (actor) await blogAuth().revokeRefreshTokens(actor.uid);
    (await cookies()).delete(SESSION);
    return { ok: true };
  });
