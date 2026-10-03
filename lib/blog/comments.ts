import "server-only";
import { googleAvatar } from "./profile";
import { legacyGooglePhotos } from "./google-profile";
import { createHash } from "node:crypto";
import { z } from "zod";
import { FieldPath } from "firebase-admin/firestore";
import { blogDb } from "@/lib/firebase-admin";
import { Actor, BlogError, idSchema, requirePublisher } from "./schema";
import {
  classifyComment,
  moderationReasons,
  moderationVersion,
  normalizedComment,
  readReputation,
  type ModerationReason,
} from "./comment-moderation";
const commentText = z.string().trim().min(1).max(2000)
  .refine((text) => normalizedComment(text).length > 0);
export const commentInput = z.object({
  postId: idSchema,
  parentId: z.union([idSchema, z.literal("")]).default(""),
  text: commentText,
  operationId: z.string().uuid(),
  website: z.literal("").default(""),
});
type Comment = {
  id: string;
  postId: string;
  parentId: string;
  uid: string;
  name: string;
  avatar?: string;
  text: string;
  status: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  badge: string;
  approvedReplyCount?: number;
  moderationReasons?: ModerationReason[];
  reputationCredit?: boolean;
  reputationRestriction?: boolean;
};
export function publicComment(c: Comment) {
  return {
    id: c.id,
    postId: c.postId,
    parentId: c.parentId,
    name: c.status === "deleted" ? "" : c.name,
    avatar: c.status === "deleted" ? "" : googleAvatar(c.avatar) ?? "",
    text: c.status === "deleted" ? "" : c.text,
    status: c.status,
    revision: c.revision,
    createdAt: c.createdAt,
    badge: c.status === "deleted" ? "" : c.badge,
  };
}
export async function listComments(postId: string, parentId = "", cursor = "") {
  const db = blogDb();
  const p = await db
    .collection("blogPublished")
    .doc(idSchema.parse(postId))
    .get();
  if (!p.exists) throw new BlogError(404, "NOT_FOUND");
  if (parentId) {
    const parent = await db
      .collection("blogComments")
      .doc(idSchema.parse(parentId))
      .get();
    if (
      !parent.exists ||
      parent.get("postId") !== postId ||
      !["approved", "deleted"].includes(parent.get("status"))
    )
      throw new BlogError(404, "NOT_FOUND");
  }
  let q = db
    .collection("blogComments")
    .where("postId", "==", postId)
    .where("parentId", "==", parentId)
    .where("status", "in", ["approved", "deleted"])
    .orderBy("createdAt")
    .orderBy(FieldPath.documentId());
  if (cursor) {
    const [time, id] = Buffer.from(cursor, "base64url").toString().split("|");
    idSchema.parse(id);
    if (Number.isNaN(Date.parse(time)))
      throw new BlogError(400, "INVALID_CURSOR");
    q = q.startAfter(time, id);
  }
  const result = await q.limit(21).get();
  const page = result.docs.slice(0, 20);
  const comments = page.map(d => d.data() as Comment);
  const photos = await legacyGooglePhotos(comments.filter(c => c.status !== "deleted" && !googleAvatar(c.avatar)).map(c => c.uid));
  return {
    items: comments.map(c => publicComment({ ...c, avatar: googleAvatar(c.avatar) ?? photos.get(c.uid) })),
    commentsEnabled: p.get("commentsEnabled") === true,
    count: Number(p.get("commentCount") ?? 0),
    next:
      result.size > 20
        ? Buffer.from(
            `${page.at(-1)!.get("createdAt")}|${page.at(-1)!.id}`,
          ).toString("base64url")
        : null,
  };
}
export async function ownComments(postId: string, actor: Actor) {
  const db = blogDb();
  if (
    !(await db.collection("blogPublished").doc(idSchema.parse(postId)).get())
      .exists
  )
    throw new BlogError(404, "NOT_FOUND");
  return (
    await db
      .collection("blogComments")
      .where("postId", "==", postId)
      .where("uid", "==", actor.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()
  ).docs.map((d) => publicComment({ ...(d.data() as Comment), avatar: googleAvatar(actor.avatar) ?? (d.data() as Comment).avatar }));
}
export async function createComment(actor: Actor, input: unknown) {
  if (!actor.verified) throw new BlogError(403, "VERIFY_EMAIL");
  const c = commentInput.parse(input);
  const db = blogDb();
  const id = createHash("sha256")
    .update(`${actor.uid}:${c.operationId}`)
    .digest("hex");
  const ref = db.collection("blogComments").doc(id);
  const stateRef = db.collection("blogPosts").doc(c.postId);
  const reputationRef = db.collection("blogCommentReputation").doc(createHash("sha256").update(actor.uid).digest("hex"));
  return db.runTransaction(async (tx) => {
    const [post, existing, parent, state, reputationSnap] = await Promise.all([
      tx.get(db.collection("blogPublished").doc(c.postId)),
      tx.get(ref),
      c.parentId ? tx.get(db.collection("blogComments").doc(c.parentId)) : null,
      tx.get(stateRef),
      tx.get(reputationRef),
    ]);
    if (!post.exists) throw new BlogError(404, "NOT_FOUND");
    if (!post.get("commentsEnabled"))
      throw new BlogError(403, "COMMENTS_CLOSED");
    if (existing.exists) return { ok: true, status: existing.get("status") as string };
    if (
      parent &&
      (!parent.exists ||
        parent.get("postId") !== c.postId ||
        parent.get("parentId") !== "" ||
        parent.get("status") !== "approved")
    )
      throw new BlogError(400, "INVALID_PARENT");
    const now = new Date().toISOString();
    const reputation = readReputation(reputationSnap.data());
    const decision = classifyComment(c.text, id, reputation, now);
    tx.set(reputationRef, { ...reputation, recent: decision.recent });
    if (decision.status === "approved") {
      const count = Number(post.get("commentCount") ?? 0) + 1;
      tx.update(post.ref, { commentCount: count });
      if (state.exists) tx.update(stateRef, { commentCount: count });
      if (parent) tx.update(parent.ref, { approvedReplyCount: Number(parent.get("approvedReplyCount") ?? 0) + 1 });
    }
    tx.create(ref, {
      id,
      postId: c.postId,
      parentId: c.parentId,
      uid: actor.uid,
      name: actor.name,
      avatar: googleAvatar(actor.avatar) ?? "",
      text: c.text,
      status: decision.status,
      moderationReasons: decision.reasons,
      moderationVersion,
      revision: 1,
      createdAt: now,
      updatedAt: now,
      badge:
        actor.role === "admin" || actor.role === "publisher" ? "Moderator" : "",
    });
    return { ok: true, status: decision.status };
  });
}
export async function changeComment(
  id: string,
  actor: Actor,
  action: "edit" | "delete" | "approved" | "hidden" | "rejected",
  revision: number,
  text = "",
) {
  const db = blogDb();
  const ref = db.collection("blogComments").doc(idSchema.parse(id));
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new BlogError(404, "NOT_FOUND");
    const c = snap.data() as Comment;
    const postRef = db.collection("blogPublished").doc(c.postId);
    const postStateRef = db.collection("blogPosts").doc(c.postId);
    const reputationRef = db.collection("blogCommentReputation").doc(createHash("sha256").update(c.uid).digest("hex"));
    const [p, postState, parent, reputationSnap] = await Promise.all([
      tx.get(postRef),
      tx.get(postStateRef),
      c.parentId ? tx.get(db.collection("blogComments").doc(c.parentId)) : null,
      tx.get(reputationRef),
    ]);
    if (action === "edit" || action === "delete") {
      if (c.uid !== actor.uid) throw new BlogError(403, "FORBIDDEN");
    } else requirePublisher(actor);
    if (c.revision !== revision) throw new BlogError(409, "REVISION_CONFLICT");
    if (
      action === "edit" &&
      (!actor.verified ||
        !p.exists ||
        !p.get("commentsEnabled") ||
        ["hidden", "rejected", "deleted"].includes(c.status))
    )
      throw new BlogError(403, "EDIT_FORBIDDEN");
    if (
      action === "approved" &&
      (!p.exists ||
        c.status === "deleted" ||
        (parent && !["approved", "deleted"].includes(parent.get("status"))))
    )
      throw new BlogError(400, "APPROVAL_FORBIDDEN");
    const now = new Date().toISOString();
    const reputation = readReputation(reputationSnap.data());
    const nextText = action === "edit" ? commentText.parse(text) : c.text;
    // Credits belong to the reviewed content, so editing cannot reuse its trust credit.
    const baseReputation = { ...reputation, approvedCount: Math.max(0, reputation.approvedCount - Number(c.reputationCredit === true)) };
    const decision = action === "edit" ? classifyComment(nextText, id, baseReputation, now) : null;
    if (decision && parent && !["approved", "deleted"].includes(parent.get("status"))) {
      decision.status = "pending";
      decision.reasons.push("thread");
    }
    const status = decision?.status ?? (action === "delete" ? "deleted" : action);
    const credit = action === "approved";
    // Deleting an already hidden/rejected comment must not erase its moderation history.
    const restriction = ["hidden", "rejected"].includes(action) || (action === "delete" && c.reputationRestriction === true);
    tx.set(reputationRef, {
      ...reputation,
      approvedCount: Math.max(0, reputation.approvedCount + Number(credit) - Number(c.reputationCredit === true)),
      restrictedCount: Math.max(0, reputation.restrictedCount + Number(restriction) - Number(c.reputationRestriction === true)),
      recent: decision?.recent ?? reputation.recent,
    });
    const replies = Number(c.approvedReplyCount ?? 0);
    const oldVisible = c.status === "approved" ? 1 : 0;
    const newVisible = status === "approved" ? 1 : 0;
    const threadVisible = (value: string) =>
      value === "approved" || value === "deleted";
    let delta = newVisible - oldVisible;
    if (!c.parentId)
      delta +=
        (Number(threadVisible(status)) - Number(threadVisible(c.status))) *
        replies;
    else if (parent) {
      tx.update(parent.ref, {
        approvedReplyCount: Math.max(
          0,
          Number(parent.get("approvedReplyCount") ?? 0) + delta,
        ),
      });
      if (!threadVisible(parent.get("status"))) delta = 0;
    }
    const count = Math.max(
      0,
      Number(p.get("commentCount") ?? postState.get("commentCount") ?? 0) + delta,
    );
    if (postState.exists) tx.update(postStateRef, { commentCount: count });
    if (p.exists) tx.update(postRef, { commentCount: count });
    tx.update(ref, {
      status,
      revision: c.revision + 1,
      updatedAt: now,
      reputationCredit: credit,
      reputationRestriction: restriction,
      ...(decision ? { moderationReasons: decision.reasons, moderationVersion } : {}),
      ...(action === "edit"
        ? { text: nextText, avatar: googleAvatar(actor.avatar) ?? "" }
        : {}),
      ...(action === "delete" ? { text: "", name: "", badge: "", avatar: "" } : {}),
    });
    tx.create(db.collection("blogAudit").doc(), {
      action: `comment_${action}`,
      actor: actor.uid,
      commentId: id,
      at: now,
      ...(decision ? { moderationReasons: decision.reasons, moderationVersion } : {}),
    });
    return { ok: true, status };
  });
}
export async function reportComment(id: string, actor: Actor, reason: string) {
  const db = blogDb();
  const ref = db.collection("blogComments").doc(idSchema.parse(id));
  const report = db.collection("blogCommentReports").doc(`${id}_${actor.uid}`);
  return db.runTransaction(async (tx) => {
    const c = await tx.get(ref);
    if (!c.exists || c.get("status") !== "approved")
      throw new BlogError(404, "NOT_FOUND");
    const post = await tx.get(
      db.collection("blogPublished").doc(c.get("postId")),
    );
    if (!post.exists) throw new BlogError(404, "NOT_FOUND");
    if (c.get("parentId")) {
      const parent = await tx.get(
        db.collection("blogComments").doc(c.get("parentId")),
      );
      if (
        !parent.exists ||
        !["approved", "deleted"].includes(parent.get("status"))
      )
        throw new BlogError(404, "NOT_FOUND");
    }
    tx.set(report, {
      commentId: id,
      reporter: actor.uid,
      reason: z.string().trim().min(1).max(500).parse(reason),
      state: "open",
      at: new Date().toISOString(),
    });
    return { ok: true };
  });
}
export async function moderationQueue(actor: Actor, status = "pending") {
  if (!["pending", "approved", "hidden", "rejected"].includes(status))
    throw new BlogError(400, "INVALID_STATUS");
  requirePublisher(actor);
  return (
    await blogDb()
      .collection("blogComments")
      .where("status", "==", status)
      .orderBy("createdAt")
      .limit(100)
      .get()
  ).docs.map((d) => {
    const c = d.data() as Comment;
    return { ...publicComment(c), moderationReasons: (c.moderationReasons ?? []).filter((r) => Object.hasOwn(moderationReasons, r)).map((r) => moderationReasons[r]) };
  });
}

export async function publicThread(postId: string, commentId: string) {
  const db = blogDb();
  const post = await db
    .collection("blogPublished")
    .doc(idSchema.parse(postId))
    .get();
  if (!post.exists) throw new BlogError(404, "NOT_FOUND");
  const snap = await db
    .collection("blogComments")
    .doc(idSchema.parse(commentId))
    .get();
  if (
    !snap.exists ||
    snap.get("postId") !== postId ||
    !["approved", "deleted"].includes(snap.get("status"))
  )
    throw new BlogError(404, "NOT_FOUND");
  const c = snap.data() as Comment;
  if (c.parentId) {
    const parent = await db.collection("blogComments").doc(c.parentId).get();
    if (
      !parent.exists ||
      !["approved", "deleted"].includes(parent.get("status"))
    )
      throw new BlogError(404, "NOT_FOUND");
    return { parent: publicComment(parent.data() as Comment), reply: publicComment(c) };
  }
  return { parent: publicComment(c), reply: null };
}
