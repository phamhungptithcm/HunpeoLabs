import { api } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { createDraft, listDrafts } from "@/lib/blog/repository";
export const GET = (r: Request) =>
  api(async () =>
    listDrafts(
      await requireStaff(),
      Object.fromEntries(new URL(r.url).searchParams),
    ),
  );
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    return createDraft(await requireStaff());
  });
