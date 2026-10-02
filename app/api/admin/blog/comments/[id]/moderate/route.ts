import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { changeComment } from "@/lib/blog/comments";
type Context = { params: Promise<{ id: string }> };
export const POST = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await requireStaff();
    const b = z
      .object({
        action: z.enum(["approved", "hidden", "rejected"]),
        revision: z.number().int().positive(),
      })
      .parse(await jsonBody(r, 1000));
    return changeComment((await c.params).id, a, b.action, b.revision);
  });
