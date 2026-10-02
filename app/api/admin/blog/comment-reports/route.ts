import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { blogDb } from "@/lib/firebase-admin";
import { requirePublisher, idSchema } from "@/lib/blog/schema";
export const GET = () =>
  api(async () => {
    const a = await requireStaff();
    requirePublisher(a);
    return (
      await blogDb()
        .collection("blogCommentReports")
        .where("state", "==", "open")
        .limit(100)
        .get()
    ).docs.map((d) => ({ id: d.id, ...d.data() }));
  });
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    const a = await requireStaff();
    requirePublisher(a);
    const b = z.object({ id: idSchema }).parse(await jsonBody(r, 1000));
    await blogDb()
      .collection("blogCommentReports")
      .doc(b.id)
      .update({ state: "resolved" });
    return { ok: true };
  });
