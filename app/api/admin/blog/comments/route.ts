import { api } from "@/lib/blog/http";
import { requireStaff } from "@/lib/blog/auth";
import { moderationQueue } from "@/lib/blog/comments";
export const GET = () => api(async () => moderationQueue(await requireStaff()));
