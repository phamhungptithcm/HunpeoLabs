import { readMedia } from "@/lib/blog/media";
import { currentActor } from "@/lib/blog/auth";
import { BlogError, idSchema } from "@/lib/blog/schema";
type Context = { params: Promise<{ id: string }> };
export async function GET(_r: Request, c: Context) {
  try {
    const id = idSchema.parse((await c.params).id);
    const actor = await currentActor().catch((e) => {
      if (e instanceof BlogError && e.status === 401) return null;
      throw e;
    });
    const data = await readMedia(id, actor);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return new Response("Media unavailable", {
      status: e instanceof BlogError ? e.status : 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
