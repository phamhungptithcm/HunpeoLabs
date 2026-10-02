import { api } from "@/lib/blog/http";
import { requireStaff, sameOrigin } from "@/lib/blog/auth";
import { uploadMedia } from "@/lib/blog/media";
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    return uploadMedia(r, await requireStaff());
  });
