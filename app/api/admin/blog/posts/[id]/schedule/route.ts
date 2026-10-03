import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { blogDb } from "@/lib/firebase-admin";
import { getDraft } from "@/lib/blog/repository";
import { BlogError, draftSchema, requirePublisher, validatePublish } from "@/lib/blog/schema";
import { validScheduleTime } from "@/lib/blog/schedule-time";
import { randomUUID } from "node:crypto";
import { z } from "zod";
type Context = { params: Promise<{ id: string }> };
export const GET = (r: Request, c: Context) => api(async () => {
  const actor = await requireStaff(); requirePublisher(actor);
  const { id } = await c.params; await getDraft(id, actor);
  const d = await blogDb().collection("blogSchedules").doc(id).get();
  return d.exists ? { dueAt: d.get("dueAt") } : { dueAt: null };
});
export const POST = (r: Request, c: Context) => api(async () => {
  sameOrigin(r); const actor = await requireStaff(); requirePublisher(actor);
  const b = z.object({ dueAt: z.string().datetime(), revision: z.number().int().positive() }).parse(await jsonBody(r));
  if (!validScheduleTime(b.dueAt)) throw new BlogError(400, "INVALID_SCHEDULE");
  const { id } = await c.params;
  const draft = await getDraft(id, actor);
  if (draft.revision !== b.revision) throw new BlogError(409, "REVISION_CONFLICT");
  validatePublish(draftSchema.parse(draft));
  if (!process.env.BLOG_SCHEDULER_SECRET || process.env.BLOG_SCHEDULER_SECRET.length < 32) throw new BlogError(503, "SCHEDULER_NOT_CONFIGURED");
  await blogDb().collection("blogSchedules").doc(id).set({ dueAt: b.dueAt, revision: b.revision, uid: actor.uid, operationId: randomUUID(), createdAt: new Date().toISOString() });
  return { ok: true, dueAt: b.dueAt };
});
export const DELETE = (r: Request, c: Context) => api(async () => {
  sameOrigin(r); const actor = await requireStaff(); requirePublisher(actor);
  const { id } = await c.params; await getDraft(id, actor);
  await blogDb().collection("blogSchedules").doc(id).delete(); return { ok: true };
});
