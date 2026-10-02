import { api, jsonBody } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { z } from "zod";
import { catalog, updateCatalog } from "@/lib/blog/repository";
export const GET = () =>
  api(async () => catalog("taxonomy", await requireStaff()));
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    const a = await requireStaff();
    const b = z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
      })
      .parse(await jsonBody(r));
    return updateCatalog("taxonomy", a, b);
  });
