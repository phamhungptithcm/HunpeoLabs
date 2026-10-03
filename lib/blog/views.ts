import "server-only";
import { createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { blogDb } from "@/lib/firebase-admin";
import { BlogError, idSchema } from "./schema";
import { rateLimit } from "./rate-limit";

export const viewInput = z.object({ postId: idSchema, session: z.string().uuid() }).strict();
const retentionMs = 86400000;
function count(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export async function getViews(postId: string) {
  const db = blogDb();
  const id = idSchema.parse(postId);
  const post = await db.collection("blogPublished").doc(id).get();
  if (!post.exists) throw new BlogError(404, "NOT_FOUND");
  const stats = await db.collection("blogPostStats").doc(id).get();
  return { views: count(stats.get("views")) };
}
export async function recordView(request: Request, input: unknown) {
  const { postId, session } = viewInput.parse(input);
  const secret = process.env.BLOG_RATE_LIMIT_SECRET;
  const emulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (!secret && !emulated) throw new BlogError(503, "RATE_LIMIT_NOT_CONFIGURED");
  const header = process.env.BLOG_TRUSTED_IP_HEADER;
  if (!header && !emulated) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const address = header ? request.headers.get(header) : "local-emulator";
  if (!address) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const hash = (value: string) => createHmac("sha256", secret ?? "emulator-only").update(value).digest("hex");
  await rateLimit(`view:network:${hash(`${Math.floor(Date.now() / retentionMs)}:${address}`)}`, 120, 600000);
  const db = blogDb();
  const post = db.collection("blogPublished").doc(postId);
  const stats = db.collection("blogPostStats").doc(postId);
  const receipt = db.collection("blogViewSessions").doc(hash(`${postId}:${session}`));
  return db.runTransaction(async (tx) => {
    const published = await tx.get(post);
    if (!published.exists) throw new BlogError(404, "NOT_FOUND");
    const previous = await tx.get(receipt);
    const current = await tx.get(stats);
    const views = count(current.get("views"));
    const expiry = previous.get("expiresAt");
    if (previous.exists && expiry instanceof Timestamp && expiry.toMillis() > Date.now()) return { views };
    if (views === Number.MAX_SAFE_INTEGER) throw new BlogError(503, "COUNTER_LIMIT");
    tx.set(stats, { views: views + 1 });
    tx.set(receipt, { expiresAt: Timestamp.fromMillis(Date.now() + retentionMs) });
    return { views: views + 1 };
  });
}
