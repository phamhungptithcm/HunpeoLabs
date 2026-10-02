import { api, jsonBody } from "@/lib/blog/http";
import { currentActor, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { reportComment } from "@/lib/blog/comments";
import { requestLimits } from "@/lib/blog/rate-limit";
type Context = { params: Promise<{ id: string }> };
export const POST = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await currentActor();
    await requestLimits(r, a.uid, "report");
    const b = z.object({ reason: z.string() }).parse(await jsonBody(r, 3000));
    return reportComment((await c.params).id, a, b.reason);
  });
