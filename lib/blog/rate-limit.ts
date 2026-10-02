import "server-only";
import { createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { blogDb } from "@/lib/firebase-admin";
import { BlogError } from "./schema";
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const bucket = Math.floor(Date.now() / windowMs);
  const ref = blogDb()
    .collection("blogRateLimits")
    .doc(
      createHmac(
        "sha256",
        process.env.BLOG_RATE_LIMIT_SECRET ?? "emulator-only",
      )
        .update(`${key}:${bucket}`)
        .digest("hex"),
    );
  if (
    !process.env.FIRESTORE_EMULATOR_HOST &&
    !process.env.BLOG_RATE_LIMIT_SECRET
  )
    throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  await blogDb().runTransaction(async (tx) => {
    const d = await tx.get(ref);
    const count = Number(d.get("count") ?? 0);
    if (count >= limit) throw new BlogError(429, "RATE_LIMITED");
    tx.set(ref, {
      count: count + 1,
      expiresAt: Timestamp.fromMillis(Date.now() + 86400000),
    });
  });
}
export async function requestLimits(
  request: Request,
  uid: string,
  action = "comment",
) {
  await rateLimit(
    `${action}:uid:${uid}`,
    action === "comment" ? 5 : 30,
    600000,
  );
  // Only explicitly configured trusted ingress headers are used; never guess trust from X-Forwarded-For.
  const header = process.env.BLOG_TRUSTED_IP_HEADER;
  if (!header && !process.env.FIRESTORE_EMULATOR_HOST)
    throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const address = header ? request.headers.get(header) : "local-emulator";
  if (!address) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const hash = createHmac(
    "sha256",
    process.env.BLOG_RATE_LIMIT_SECRET ?? "emulator-only",
  )
    .update(`${new Date().toISOString().slice(0, 10)}:${address}`)
    .digest("hex");
  await rateLimit(
    `${action}:network:${hash}`,
    action === "comment" ? 30 : 100,
    3600000,
  );
}
