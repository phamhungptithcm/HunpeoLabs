import "server-only";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { BlogError } from "./schema";
export async function jsonBody(
  request: Request,
  limit = 240000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new BlogError(415, "JSON_REQUIRED");
  const reader = request.body?.getReader();
  if (!reader) throw new BlogError(400, "INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > limit) {
        await reader.cancel();
        throw new BlogError(413, "BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (e) {
    if (e instanceof BlogError) throw e;
    throw new BlogError(400, "INVALID_JSON");
  }
}
export async function api(action: () => Promise<unknown>) {
  try {
    return Response.json(await action(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status =
      error instanceof BlogError
        ? error.status
        : error instanceof ZodError
          ? 400
          : 503;
    const code =
      error instanceof BlogError
        ? error.code
        : error instanceof ZodError
          ? "INVALID_INPUT"
          : "SERVICE_UNAVAILABLE";
    const requestId = randomUUID();
    if (status >= 500)
      console.error(
        JSON.stringify({ event: "blog_request_failed", code, requestId }),
      );
    return Response.json(
      { error: code, requestId },
      {
        status,
        headers: {
          "Cache-Control": "private, no-store",
          ...(status === 429 ? { "Retry-After": "600" } : {}),
        },
      },
    );
  }
}
