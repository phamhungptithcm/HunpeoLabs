import { z } from "zod";
import { BlogError, idSchema } from "@/lib/blog/schema";
export const trafficInput = z.object({
  kind: z.enum(["page", "read"]), path: z.string().max(180).regex(/^\/[a-z0-9/-]*$/),
  session: z.string().uuid(), nonce: z.string().uuid(), consent: z.literal("granted"),
  postId: idSchema.optional(), activeMs: z.number().int().min(10000).max(86400000).optional(),
  progress: z.number().min(0.25).max(1).optional(),
}).strict().superRefine((v, ctx) => {
  if (v.kind === "read" && (!v.postId || v.activeMs === undefined || v.progress === undefined))
    ctx.addIssue({ code: "custom", message: "Reading evidence required" });
});
export const metrics = ["visits", "pageViews", "blogOpens", "reads"] as const;
export type Counts = Record<typeof metrics[number], number>;
export const emptyCounts = (): Counts => ({ visits: 0, pageViews: 0, blogOpens: 0, reads: 0 });
export function validCount(v: unknown) {
  if (v === undefined) return 0;
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 0) throw new BlogError(503, "COUNTER_INVALID");
  return v;
}
export function isPublicPath(path: string) {
  return ["/", "/about", "/contact", "/careers", "/privacy", "/products", "/services", "/company/principles", "/resources/blog"].includes(path) ||
    /^\/(products|services)\/[a-z0-9-]+$/.test(path) || /^\/resources\/blog\/(?:authors\/)?[a-z0-9-]+$/.test(path);
}
