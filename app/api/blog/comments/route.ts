import { api, jsonBody } from "@/lib/blog/http";
import { currentActor, sameOrigin } from "@/lib/blog/auth";
import {
  createComment,
  listComments,
  ownComments,
  publicThread,
} from "@/lib/blog/comments";
import { requestLimits } from "@/lib/blog/rate-limit";
export const GET = (r: Request) =>
  api(async () => {
    const p = new URL(r.url).searchParams;
    if (p.get("commentId"))
      return publicThread(p.get("postId") ?? "", p.get("commentId")!);
    return p.get("mine") === "1"
      ? ownComments(p.get("postId") ?? "", await currentActor())
      : listComments(
          p.get("postId") ?? "",
          p.get("parentId") ?? "",
          p.get("cursor") ?? "",
        );
  });
export const POST = (r: Request) =>
  api(async () => {
    sameOrigin(r);
    const a = await currentActor();
    await requestLimits(r, a.uid);
    return createComment(a, await jsonBody(r, 10000));
  });
