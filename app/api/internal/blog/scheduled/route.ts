import { timingSafeEqual } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { blogApp, blogDb } from "@/lib/firebase-admin";
import { accessId } from "@/lib/blog/access";
import { publish } from "@/lib/blog/repository";
import { api } from "@/lib/blog/http";
import { BlogError, type Actor } from "@/lib/blog/schema";
export const POST = (r: Request) => api(async () => {
  const secret = process.env.BLOG_SCHEDULER_SECRET;
  const supplied = r.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new BlogError(401, "FORBIDDEN");
  const db = blogDb();
  const jobs = await db.collection("blogSchedules").where("dueAt", "<=", new Date().toISOString()).limit(25).get();
  let published = 0;
  for (const job of jobs.docs) {
    const data = job.data();
    try {
      const user = await getAuth(blogApp()).getUser(data.uid);
      if (user.disabled || !user.emailVerified || !user.email || !user.providerData.some(p => p.providerId === "google.com")) throw new BlogError(403, "FORBIDDEN");
      const grant = await db.collection("blogAccess").doc(accessId(user.email)).get();
      if (!grant.get("active") || grant.get("uid") !== user.uid || !["admin", "publisher"].includes(grant.get("role"))) throw new BlogError(403, "FORBIDDEN");
      const actor: Actor = { uid: user.uid, email: user.email, verified: true, name: user.displayName ?? "", role: grant.get("role") };
      await publish(job.id, actor, data.revision, data.operationId, true);
      published++;
      await db.runTransaction(async tx => { const current = await tx.get(job.ref); if (current.get("operationId") === data.operationId) tx.delete(job.ref); });
    } catch (e) {
      if (e instanceof BlogError && e.status < 500) {
        await db.runTransaction(async tx => {
          const current = await tx.get(job.ref);
          if (current.get("operationId") !== data.operationId) return;
          tx.set(db.collection("blogScheduleResults").doc(data.operationId), { postId: job.id, error: e.code, at: new Date().toISOString() }); tx.delete(job.ref);
        });
      }
    }
  }
  return { examined: jobs.size, published };
});
