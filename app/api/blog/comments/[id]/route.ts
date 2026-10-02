import { api, jsonBody } from "@/lib/blog/http";
import { currentActor, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { changeComment } from "@/lib/blog/comments";
import { requestLimits } from "@/lib/blog/rate-limit";
type Context = { params: Promise<{ id: string }> };
export const PUT = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await currentActor();
    await requestLimits(r, a.uid);
    const b = z
      .object({ text: z.string(), revision: z.number().int().positive() })
      .parse(await jsonBody(r, 10000));
    return changeComment((await c.params).id, a, "edit", b.revision, b.text);
  });
export const DELETE = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await currentActor();
    const b = z
      .object({ revision: z.number().int().positive() })
      .parse(await jsonBody(r, 1000));
    return changeComment((await c.params).id, a, "delete", b.revision);
  });
