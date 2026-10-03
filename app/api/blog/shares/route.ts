import { sameOrigin } from "@/lib/blog/auth";
import { api, jsonBody } from "@/lib/blog/http";
import { getShares, recordShare } from "@/lib/blog/shares";

export const GET = (request: Request) =>
  api(() => getShares(new URL(request.url).searchParams.get("postId") ?? ""));

export const POST = (request: Request) => api(async () => {
  sameOrigin(request);
  return recordShare(request, await jsonBody(request, 1024));
});
