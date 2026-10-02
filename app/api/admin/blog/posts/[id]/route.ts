import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { getDraft, saveDraft } from "@/lib/blog/repository";
type Context = { params: Promise<{ id: string }> };
export const GET = (_r: Request, c: Context) =>
  api(async () => getDraft((await c.params).id, await requireStaff()));
export const PUT = (r: Request, c: Context) =>
  api(async () => {
    sameOrigin(r);
    const a = await requireStaff();
    const b = z
      .object({
        draft: z.unknown(),
        revision: z.number().int().positive(),
        state: z.enum(["review", "archived"]).optional(),
      })
      .parse(await jsonBody(r));
    return saveDraft((await c.params).id, a, b.draft, b.revision, b.state);
  });
