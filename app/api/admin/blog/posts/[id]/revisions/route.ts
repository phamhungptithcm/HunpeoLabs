import { api } from "@/lib/blog/http";
import { requireStaff } from "@/lib/blog/auth";
import { revisions } from "@/lib/blog/repository";
type Context = { params: Promise<{ id: string }> };
export const GET = (_r: Request, c: Context) =>
  api(async () => revisions((await c.params).id, await requireStaff()));
