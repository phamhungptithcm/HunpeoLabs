import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { blogBucket, blogDb } from "@/lib/firebase-admin";
import { Actor, BlogError, mediaIds, idSchema } from "./schema";
import { getDraft } from "./repository";
export async function uploadMedia(request: Request, actor: Actor) {
  const postId = new URL(request.url).searchParams.get("postId") ?? "";
  const authorId = new URL(request.url).searchParams.get("authorId");
  if (authorId) {
    if (actor.role !== "admin") throw new BlogError(403, "FORBIDDEN");
    if (
      !(
        await blogDb()
          .collection("blogAuthors")
          .doc(idSchema.parse(authorId))
          .get()
      ).exists
    )
      throw new BlogError(404, "NOT_FOUND");
  } else await getDraft(postId, actor);
  const reader = request.body?.getReader();
  if (!reader) throw new BlogError(400, "IMAGE_REQUIRED");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.length;
    if (size > 5 * 1024 * 1024) {
      await reader.cancel();
      throw new BlogError(413, "IMAGE_TOO_LARGE");
    }
    chunks.push(r.value);
  }
  let output: Buffer;
  let width: number | undefined, height: number | undefined;
  try {
    const bytes = Buffer.concat(chunks);
    const meta = await sharp(bytes, { limitInputPixels: 20000000 }).metadata();
    if (
      !["jpeg", "png", "webp", "gif"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 100 ||
      (meta.width ?? 0) * (meta.pageHeight ?? meta.height ?? 0) * (meta.pages ?? 1) > 20000000
    )
      throw new Error("format");
    const result = await sharp(bytes, { limitInputPixels: 20000000, animated: true })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    output = result.data;
    width = result.info.width;
    height = result.info.height;
  } catch {
    throw new BlogError(400, "INVALID_IMAGE");
  }
  const id = randomUUID();
  const key = authorId
    ? `blog/authors/${authorId}/${id}.webp`
    : `blog/${postId}/${id}.webp`;
  await blogBucket()
    .file(key)
    .save(output, {
      resumable: false,
      metadata: {
        contentType: "image/webp",
        cacheControl: "private, no-store",
      },
    });
  await blogDb()
    .collection("blogMedia")
    .doc(id)
    .create({
      id,
      postId,
      ...(authorId ? { authorId } : {}),
      owner: actor.uid,
      key,
      width,
      height,
      size: output.length,
      createdAt: new Date().toISOString(),
    });
  if (authorId)
    await blogDb()
      .collection("blogAuthors")
      .doc(authorId)
      .update({ avatarId: id });
  return { id, url: `/api/blog/media/${id}` };
}
export async function readMedia(id: string, actor: Actor | null) {
  const d = await blogDb().collection("blogMedia").doc(id).get();
  if (!d.exists) throw new BlogError(404, "NOT_FOUND");
  if (d.get("authorId")) {
    const publicReference = await blogDb()
      .collection("blogPublished")
      .where("authorAvatarId", "==", id)
      .limit(1)
      .get();
    if (
      publicReference.empty &&
      !["author", "publisher", "admin"].includes(actor?.role ?? "")
    )
      throw new BlogError(404, "NOT_FOUND");
  } else {
    const p = await blogDb()
      .collection("blogPublished")
      .doc(d.get("postId"))
      .get();
    const published =
      p.exists &&
      (p.get("coverId") === id || mediaIds(p.get("body")).includes(id));
    if (!published) {
      if (!actor) throw new BlogError(404, "NOT_FOUND");
      try {
        await getDraft(d.get("postId"), actor);
      } catch (error) {
        if (error instanceof BlogError && [403, 404].includes(error.status))
          throw new BlogError(404, "NOT_FOUND");
        throw error;
      }
    }
  }
  const [data] = await blogBucket().file(d.get("key")).download();
  return data;
}
