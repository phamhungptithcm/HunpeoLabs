import { sameOrigin, requireStaff } from "@/lib/blog/auth";
import { api, jsonBody } from "@/lib/blog/http";
import { recordTraffic, trafficSummary } from "@/lib/traffic/repository";
export const POST = (request: Request) => api(async () => { sameOrigin(request); return recordTraffic(request, await jsonBody(request, 2048)); });
export const GET = (request: Request) => api(async () => trafficSummary(await requireStaff(), Number(new URL(request.url).searchParams.get("days") ?? 7)));
