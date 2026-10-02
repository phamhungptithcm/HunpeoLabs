import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { restoreRevision } from "@/lib/blog/repository";
type Context = { params: Promise<{ id: string }> };
export const POST = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await requireStaff();
    const b = z
      .object({
        revision: z.number().int().positive(),
        target: z.number().int().positive(),
      })
      .parse(await jsonBody(r));
    return restoreRevision((await c.params).id, a, b.revision, b.target);
  });
