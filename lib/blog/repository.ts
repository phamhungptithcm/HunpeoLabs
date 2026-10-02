import "server-only";
import { categoryAliases, categoryLabel } from "./categories";
import { listAccess, changeAccess, assignableAccess } from "./access";
import { randomUUID } from "node:crypto";
import { FieldPath, Filter, type Query } from "firebase-admin/firestore";
import { blogDb, blogEnabled } from "@/lib/firebase-admin";
import {
  Actor,
  BlogError,
  Post,
  PublishedPost,
  canEdit,
  draftSchema,
  idSchema,
  mediaIds,
  requirePublisher,
  searchTokens,
  validatePublish,
  bodyText,
} from "./schema";

function posts() {
  return blogDb().collection("blogPosts");
}
export function publicPost(data: Record<string, unknown>): PublishedPost {
  return {
    ...draftSchema.parse(data),
    category: categoryLabel(String(data.category ?? "")),
    id: String(data.id),
    author: String(data.author),
    authorAvatarId:
      typeof data.authorAvatarId === "string" ? data.authorAvatarId : "",
    authorBio:
      typeof data.authorBio === "string" ? data.authorBio.slice(0, 500) : "",
    publishedAt: String(data.publishedAt),
    updatedAt: String(data.updatedAt),
    readingMinutes: Number(data.readingMinutes),
    revision: Number(data.revision),
  };
}
export async function listPublished(
  options: {
    cursor?: string;
    category?: string;
    tag?: string;
    q?: string;
    limit?: number;
  } = {},
) {
  if (!blogEnabled()) return { items: [] as PublishedPost[], next: null };
  let q: Query = blogDb().collection("blogPublished");
  if (options.category) {
    const aliases = categoryAliases(options.category.slice(0, 80));
    q = aliases.length === 1
      ? q.where("category", "==", aliases[0])
      : q.where("category", "in", aliases);
  }
  if (options.tag)
    q = q.where("tags", "array-contains", options.tag.slice(0, 40));
  const token = searchTokens(options.q ?? "")[0];
  if (token && !options.tag) q = q.where("tokens", "array-contains", token);
  q = q.orderBy("publishedAt", "desc").orderBy(FieldPath.documentId());
  if (options.cursor) {
    const [time, id] = Buffer.from(options.cursor, "base64url")
      .toString()
      .split("|");
    if (!time || !id || Number.isNaN(Date.parse(time)))
      throw new BlogError(400, "INVALID_CURSOR");
    idSchema.parse(id);
    q = q.startAfter(time, id);
  }
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  const result = await q.limit(limit + 1).get();
  const page = result.docs.slice(0, limit);
  return {
    items: page.map((d) => publicPost(d.data())),
    next:
      result.size > limit
        ? Buffer.from(
            `${page.at(-1)!.get("publishedAt")}|${page.at(-1)!.id}`,
          ).toString("base64url")
        : null,
  };
}
export async function getPublished(slug: string) {
  if (!blogEnabled()) return null;
  const result = await blogDb()
    .collection("blogPublished")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  return result.empty ? null : publicPost(result.docs[0].data());
}
export async function getDraft(id: string, actor: Actor) {
  const d = await posts().doc(idSchema.parse(id)).get();
  if (!d.exists) throw new BlogError(404, "NOT_FOUND");
  const p = d.data() as Post;
  if (!canEdit(actor, p)) throw new BlogError(403, "FORBIDDEN");
  return p;
}
export async function listDrafts(
  actor: Actor,
  options: {
    cursor?: string;
    q?: string;
    state?: string;
    category?: string;
  } = {},
) {
  let q: Query = posts();
  if (actor.role === "author")
    q = q.where(
      Filter.or(
        Filter.where("owner", "==", actor.uid),
        Filter.where("assignee", "==", actor.uid),
      ),
    );
  if (options.state) q = q.where("state", "==", options.state);
  if (options.category) q = q.where("category", "==", options.category);
  const token = searchTokens(options.q ?? "")[0];
  if (token) q = q.where("tokens", "array-contains", token);
  q = q.orderBy("updatedAt", "desc").orderBy(FieldPath.documentId());
  if (options.cursor) {
    const [time, id] = Buffer.from(options.cursor, "base64url")
      .toString()
      .split("|");
    idSchema.parse(id);
    if (Number.isNaN(Date.parse(time)))
      throw new BlogError(400, "INVALID_CURSOR");
    q = q.startAfter(time, id);
  }
  const snap = await q.limit(21).get();
  const page = snap.docs.slice(0, 20);
  return {
    items: page.map((d) => d.data() as Post),
    next:
      snap.size > 20
        ? Buffer.from(
            `${page.at(-1)!.get("updatedAt")}|${page.at(-1)!.id}`,
          ).toString("base64url")
        : null,
  };
}
export async function createDraft(actor: Actor) {
  if (!actor.role) throw new BlogError(403, "FORBIDDEN");
  const { emptyDraft } = await import("./schema");
  const ref = posts().doc();
  const now = new Date().toISOString();
  const post: Post = {
    ...emptyDraft,
    id: ref.id,
    owner: actor.uid,
    assignee: actor.uid,
    revision: 1,
    state: "draft",
    updatedAt: now,
  };
  await ref.create({ ...post, tokens: [] });
  return post;
}
export async function saveDraft(
  id: string,
  actor: Actor,
  input: unknown,
  revision: number,
  state?: "review" | "archived",
) {
  const draft = draftSchema.parse(input);
  const ref = posts().doc(idSchema.parse(id));
  return blogDb().runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new BlogError(404, "NOT_FOUND");
    const old = doc.data() as Post;
    if (!canEdit(actor, old)) throw new BlogError(403, "FORBIDDEN");
    if (old.revision !== revision)
      throw new BlogError(409, "REVISION_CONFLICT");
    if (old.publishedSlug && old.publishedSlug !== draft.slug)
      throw new BlogError(400, "PUBLISHED_SLUG_LOCKED");
    if (actor.role === "author" && draft.assignee !== old.assignee)
      throw new BlogError(403, "ASSIGNMENT_FORBIDDEN");
    if (
      state === "archived" &&
      (await tx.get(blogDb().collection("blogPublished").doc(id))).exists
    )
      throw new BlogError(400, "UNPUBLISH_FIRST");
    const post: Post = {
      ...old,
      ...draft,
      revision: old.revision + 1,
      updatedAt: new Date().toISOString(),
      state: state ?? "draft",
    };
    const lastSnapshot = Number(
      (old as Post & { lastSnapshotAt?: number }).lastSnapshotAt ?? 0,
    );
    if (state || Date.now() - lastSnapshot > 60000)
      tx.set(ref.collection("revisions").doc(String(old.revision)), old);
    tx.set(ref, {
      ...post,
      lastSnapshotAt:
        state || Date.now() - lastSnapshot > 60000 ? Date.now() : lastSnapshot,
      tokens: searchTokens(
        `${post.title} ${post.summary} ${post.tags.join(" ")}`,
      ),
    });
    return post;
  });
}
export async function publish(
  id: string,
  actor: Actor,
  revision: number,
  operationId: string,
) {
  requirePublisher(actor);
  idSchema.parse(operationId);
  const db = blogDb();
  const ref = posts().doc(idSchema.parse(id));
  const receipt = db.collection("blogAudit").doc(`${id}_${operationId}`);
  return db.runTransaction(async (tx) => {
    const [doc, done] = await Promise.all([tx.get(ref), tx.get(receipt)]);
    if (done.exists) return { ok: true };
    if (!doc.exists) throw new BlogError(404, "NOT_FOUND");
    const p = doc.data() as Post;
    if (p.revision !== revision) throw new BlogError(409, "REVISION_CONFLICT");
    const draft = draftSchema.parse(p);
    validatePublish(draft);
    const slugRef = db.collection("blogSlugs").doc(p.slug);
    const [slug, author, ...media] = await Promise.all([
      tx.get(slugRef),
      tx.get(db.collection("blogAuthors").doc(idSchema.parse(p.authorId))),
      ...[
        ...new Set([
          ...mediaIds(draft.body),
          ...(p.coverId ? [p.coverId] : []),
        ]),
      ].map((mid) => tx.get(db.collection("blogMedia").doc(mid))),
    ]);
    if (slug.exists && slug.get("postId") !== id)
      throw new BlogError(409, "SLUG_TAKEN");
    if (!author.exists || !author.get("name"))
      throw new BlogError(400, "AUTHOR_REQUIRED");
    if (media.some((m) => !m.exists || m.get("postId") !== id))
      throw new BlogError(400, "INVALID_MEDIA");
    const avatarId = String(author.get("avatarId") ?? "");
    if (avatarId) {
      const avatar = await tx.get(
        db.collection("blogMedia").doc(idSchema.parse(avatarId)),
      );
      if (!avatar.exists || avatar.get("authorId") !== p.authorId)
        throw new BlogError(400, "INVALID_MEDIA");
    }
    const now = new Date().toISOString();
    const published: PublishedPost = {
      ...draft,
      id,
      author: author.get("name"),
      authorAvatarId: avatarId,
      authorBio: String(author.get("bio") ?? "").slice(0, 500),
      publishedAt: p.publishedAt ?? now,
      updatedAt: now,
      revision: p.revision,
      readingMinutes: Math.max(
        1,
        Math.ceil(bodyText(p.body).split(/\s+/).length / 220),
      ),
    };
    // Never expose internal assignee/author identity in public projections.
    tx.set(db.collection("blogPublished").doc(id), {
      ...published,
      commentCount: Number(
        (p as Post & { commentCount?: number }).commentCount ?? 0,
      ),
      assignee: "",
      authorId: "",
      tokens: searchTokens(`${p.title} ${p.summary} ${p.tags.join(" ")}`),
    });
    tx.set(slugRef, { postId: id });
    tx.set(ref, {
      ...p,
      state: "published",
      publishedAt: published.publishedAt,
      publishedSlug: p.slug,
    });
    tx.set(ref.collection("revisions").doc(String(p.revision)), p);
    tx.create(receipt, {
      action: "publish",
      actor: actor.uid,
      postId: id,
      revision: p.revision,
      at: now,
    });
    return { ok: true };
  });
}
export async function unpublish(id: string, actor: Actor, revision: number) {
  requirePublisher(actor);
  const db = blogDb();
  const ref = posts().doc(idSchema.parse(id));
  await db.runTransaction(async (tx) => {
    const d = await tx.get(ref);
    if (!d.exists) throw new BlogError(404, "NOT_FOUND");
    const p = d.data() as Post;
    if (p.revision !== revision) throw new BlogError(409, "REVISION_CONFLICT");
    tx.delete(db.collection("blogPublished").doc(id));
    tx.update(ref, {
      state: "draft",
      revision: p.revision + 1,
      updatedAt: new Date().toISOString(),
    });
    tx.create(db.collection("blogAudit").doc(), {
      action: "unpublish",
      actor: actor.uid,
      postId: id,
      at: new Date().toISOString(),
    });
  });
  return { ok: true };
}
export async function revisions(id: string, actor: Actor) {
  await getDraft(id, actor);
  return (
    await posts()
      .doc(id)
      .collection("revisions")
      .orderBy("revision", "desc")
      .limit(30)
      .get()
  ).docs.map((d) => d.data());
}
export async function restoreRevision(
  id: string,
  actor: Actor,
  revision: number,
  target: number,
) {
  const snap = await posts()
    .doc(idSchema.parse(id))
    .collection("revisions")
    .doc(String(target))
    .get();
  if (!snap.exists) throw new BlogError(404, "NOT_FOUND");
  const current = await getDraft(id, actor);
  return saveDraft(
    id,
    actor,
    {
      ...snap.data(),
      slug: current.publishedSlug ?? snap.get("slug"),
      assignee: current.assignee,
    },
    revision,
  );
}
export async function catalog(
  kind: "authors" | "taxonomy" | "members",
  actor: Actor,
) {
  if (kind === "members") return listAccess(actor);
  if (!actor.role) throw new BlogError(403, "FORBIDDEN");
  const col = kind === "authors" ? "blogAuthors" : "blogCategories";
  return (await blogDb().collection(col).limit(100).get()).docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
export async function updateCatalog(
  kind: "authors" | "taxonomy" | "members",
  actor: Actor,
  input: {
    id?: string;
    name?: string;
    role?: string;
    bio?: string;
    email?: string;
  },
) {
  if (kind === "members") return changeAccess(actor, input);
  if (actor.role !== "admin") throw new BlogError(403, "FORBIDDEN");
  const col = kind === "authors" ? "blogAuthors" : "blogCategories";
  const memberId = input.id;
  const id = idSchema.parse(memberId || randomUUID());
  if (
    input.bio !== undefined &&
    (typeof input.bio !== "string" || input.bio.length > 500)
  )
    throw new BlogError(400, "INVALID_BIO");
  if (!input.name?.trim() || input.name.length > 80)
    throw new BlogError(400, "NAME_REQUIRED");
  await blogDb()
    .collection(col)
    .doc(id)
    .set(
      kind === "authors"
        ? { name: input.name!.trim(), bio: input.bio?.trim() ?? "" }
        : { name: input.name!.trim() },
      { merge: true },
    );
  return { ok: true };
}

/** Discovery walks bounded pages; unlike the recent RSS feed it must not silently drop older URLs. */
export async function listDiscoveryPosts() {
  const result: PublishedPost[] = [];
  let cursor: string | undefined;
  do {
    const page = await listPublished({ cursor, limit: 100 });
    result.push(...page.items);
    cursor = page.next ?? undefined;
    if (result.length > 49000)
      throw new BlogError(503, "SITEMAP_SPLIT_REQUIRED");
  } while (cursor);
  return result;
}

/** Count accessible documents without loading private manuscripts into the dashboard. */
export async function workspaceSummary(actor: Actor) {
  let q: Query = posts();
  if (actor.role === "author")
    q = q.where(
      Filter.or(
        Filter.where("owner", "==", actor.uid),
        Filter.where("assignee", "==", actor.uid),
      ),
    );
  const states = ["draft", "review", "published", "archived"];
  const counts = await Promise.all(
    states.map(
      async (state) =>
        [
          state,
          (await q.where("state", "==", state).count().get()).data().count,
        ] as const,
    ),
  );
  const pending =
    actor.role === "publisher" || actor.role === "admin"
      ? (
          await blogDb()
            .collection("blogComments")
            .where("status", "==", "pending")
            .count()
            .get()
        ).data().count
      : null;
  return { ...Object.fromEntries(counts), pending };
}

/** Assignment picker exposes only the identity needed by an authorized publisher. */
export async function assignableMembers(actor: Actor) {
  return assignableAccess(actor);
}
