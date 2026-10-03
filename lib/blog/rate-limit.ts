import "server-only";
import { createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { blogDb } from "@/lib/firebase-admin";
import { BlogError } from "./schema";

type Budget = { key: string; limit: number; windowMs: number };
function secret() {
  const value = process.env.BLOG_RATE_LIMIT_SECRET;
  if (value && value.length >= 32) return value;
  if (!value && process.env.FIRESTORE_EMULATOR_HOST &&
      process.env.BLOG_FIREBASE_PROJECT_ID?.startsWith("demo-")) return "emulator-only";
  throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
}
async function consume(budgets: Budget[]) {
  const key = secret();
  const now = Date.now();
  try {
    const db = blogDb();
    const refs = budgets.map((budget) => db.collection("blogRateLimits").doc(
      createHmac("sha256", key)
        .update(`${budget.key}:${Math.floor(now / budget.windowMs)}`).digest("hex"),
    ));
    await db.runTransaction(async (tx) => {
      // Firestore requires all reads before writes. A denied budget consumes none.
      const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
      const counts = snapshots.map((snapshot) => snapshot.get("count") ?? 0);
      if (counts.some((count) => !Number.isSafeInteger(count) || count < 0))
        throw new BlogError(503, "RATE_LIMIT_UNAVAILABLE");
      if (counts.some((count, index) => count >= budgets[index].limit))
        throw new BlogError(429, "RATE_LIMITED");
      refs.forEach((ref, index) => tx.set(ref, {
        count: counts[index] + 1,
        expiresAt: Timestamp.fromMillis(now + 86400000),
      }));
    });
  } catch (error) {
    if (error instanceof BlogError) throw error;
    throw new BlogError(503, "RATE_LIMIT_UNAVAILABLE");
  }
}
export async function rateLimit(key: string, limit: number, windowMs: number) {
  if (!key || !Number.isSafeInteger(limit) || limit < 1 ||
      !Number.isSafeInteger(windowMs) || windowMs < 1)
    throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  await consume([{ key, limit, windowMs }]);
}
export async function requestLimits(request: Request, uid: string, action = "comment") {
  if (typeof uid !== "string" || !uid || uid.length > 128 || !["comment", "session", "report"].includes(action))
    throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  const mode = process.env.BLOG_RATE_LIMIT_MODE ?? (
    process.env.FIRESTORE_EMULATOR_HOST && process.env.BLOG_FIREBASE_PROJECT_ID?.startsWith("demo-")
      ? "identity-global" : undefined
  );
  let shared = `${action}:global`;
  if (mode === "trusted-ingress") {
    const header = process.env.BLOG_TRUSTED_IP_HEADER;
    const address = header ? request.headers.get(header) : null;
    if (!address) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
    const hash = createHmac("sha256", secret())
      .update(`${new Date().toISOString().slice(0, 10)}:${address}`).digest("hex");
    shared = `${action}:network:${hash}`;
  } else if (mode !== "identity-global" && mode !== "global") {
    throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  }
  await consume([
    { key: `${action}:uid:${uid}`, limit: action === "comment" ? 5 : 30, windowMs: 600000 },
    { key: shared, limit: action === "comment" ? 30 : 100, windowMs: 3600000 },
  ]);
}
