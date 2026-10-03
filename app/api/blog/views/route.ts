import { sameOrigin } from "@/lib/blog/auth";
import { api, jsonBody } from "@/lib/blog/http";
import { getViews, recordView } from "@/lib/blog/views";
export const GET = (request: Request) => api(() => getViews(new URL(request.url).searchParams.get("postId") ?? ""));
export const POST = (request: Request) => api(async () => {
  sameOrigin(request);
  return recordView(request, await jsonBody(request, 1024));
});
