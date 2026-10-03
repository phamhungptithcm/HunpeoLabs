import "server-only";
import { createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { blogDb } from "@/lib/firebase-admin";
import { BlogError, idSchema } from "./schema";
import { rateLimit } from "./rate-limit";

export const shareInput = z.object({
  postId: idSchema,
  eventId: z.string().uuid(),
  channel: z.enum(["facebook", "linkedin", "x", "email", "copy", "device"]),
}).strict();
const retentionMs = 86400000;
function count(value: unknown): number {
  if (value === undefined) return 0;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw new BlogError(503, "INVALID_SHARE_COUNT");
  return value;
}

export async function getShares(postId: string) {
  const db = blogDb();
  const id = idSchema.parse(postId);
  const post = await db.collection("blogPublished").doc(id).get();
  if (!post.exists) throw new BlogError(404, "NOT_FOUND");
  const stats = await db.collection("blogPostShares").doc(id).get();
  return { shares: count(stats.get("shares")) };
}

export async function recordShare(request: Request, input: unknown) {
  const { postId, eventId } = shareInput.parse(input);
  const secret = process.env.BLOG_RATE_LIMIT_SECRET;
  const emulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (!secret && !emulated)
    throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  const header = process.env.BLOG_TRUSTED_IP_HEADER;
  if (!header && !emulated) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const address = header ? request.headers.get(header) : "local-emulator";
  if (!address) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const hash = (value: string) => createHmac("sha256", secret ?? "emulator-only")
    .update(value).digest("hex");
  await rateLimit(
    `share:network:${hash(`${Math.floor(Date.now() / retentionMs)}:${address}`)}`,
    60,
    600000,
  );
  const db = blogDb();
  const post = db.collection("blogPublished").doc(postId);
  // Separate collection preserves existing view-counter writes and publication snapshots.
  const stats = db.collection("blogPostShares").doc(postId);
  const receipt = db.collection("blogShareEvents").doc(hash(`${postId}:${eventId}`));
  return db.runTransaction(async (tx) => {
    const published = await tx.get(post);
    if (!published.exists) throw new BlogError(404, "NOT_FOUND");
    const previous = await tx.get(receipt);
    const current = await tx.get(stats);
    const shares = count(current.get("shares"));
    const expiry = previous.get("expiresAt");
    if (previous.exists && expiry instanceof Timestamp && expiry.toMillis() > Date.now())
      return { shares };
    if (shares === Number.MAX_SAFE_INTEGER) throw new BlogError(503, "COUNTER_LIMIT");
    tx.set(stats, { shares: shares + 1 });
    tx.set(receipt, { expiresAt: Timestamp.fromMillis(Date.now() + retentionMs) });
    return { shares: shares + 1 };
  });
}
