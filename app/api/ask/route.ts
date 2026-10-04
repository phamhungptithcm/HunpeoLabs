import { askRequestSchema, MAX_ASK_BYTES, type AskEvent } from "@/lib/ask/contracts";
import { buildAnswer, detectLanguage, retrieveSelection } from "@/lib/ask/retrieval";
import { readAskAIConfig } from "@/lib/ask/config";
import { allowPublishedRequest, authorizeAskAI } from "@/lib/ask/security";
import { withinSignal } from "@/lib/ask/deadline";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function allowedOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestURL = new URL(request.url);
  try {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    const expected = configured && process.env.NODE_ENV === "production" ? new URL(configured).origin : requestURL.origin;
    if (origin === expected) return true;
    const visitor = new URL(origin);
    const loopback = (host: string) => host === "localhost" || host === "127.0.0.1";
    return process.env.NODE_ENV !== "production" && origin === visitor.origin && visitor.protocol === "http:" && requestURL.protocol === "http:" && visitor.port === requestURL.port && loopback(visitor.hostname) && loopback(requestURL.hostname);
  } catch { return false; }
}

async function readBoundedJSON(request: Request) {
  if (!request.body) throw new Error("INVALID_JSON");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0, text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_ASK_BYTES) throw new Error("TOO_LARGE");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text) as unknown;
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export async function POST(request: Request) {
  if (process.env.ASK_ENABLED === "false") return Response.json({ code: "UNAVAILABLE" }, { status: 503, headers });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ code: "UNSUPPORTED_MEDIA_TYPE" }, { status: 415, headers });
  if (!allowedOrigin(request)) return Response.json({ code: "ORIGIN_NOT_ALLOWED" }, { status: 403, headers });
  let body: unknown;
  try { body = await readBoundedJSON(request); } catch (error) {
    return Response.json({ code: "INVALID_REQUEST" }, { status: error instanceof Error && error.message === "TOO_LARGE" ? 413 : 400, headers });
  }
  const parsed = askRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ code: "INVALID_REQUEST" }, { status: 400, headers });
  if (!allowPublishedRequest(parsed.data.sessionId)) return Response.json({ code: "RATE_LIMITED" }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  const input = parsed.data;
  const language = detectLanguage(input.question, input.language);
  const local = retrieveSelection(input);
  const cancellation = new AbortController();
  const signal = AbortSignal.any([request.signal, cancellation.signal, AbortSignal.timeout(12_000)]);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: AskEvent) => { if (!signal.aborted) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); };
      try {
        emit({ type: "status", phase: "retrieving" });
        let selected = local;
        let mode: "published" | "gemini" = "published";
        // Common questions are answered directly: no Gemini cost or extra latency.
        const config = readAskAIConfig();
        const authorized = local.topic === "outside" && config ? await withinSignal(authorizeAskAI(request, input.sessionId, config), signal) : false;
        if (config && authorized && !signal.aborted) {
          emit({ type: "status", phase: "selecting" });
          try {
            const { selectWithGemini } = await withinSignal(import("@/lib/ask/provider"), signal);
            const result = await withinSignal(selectWithGemini(input, config, signal), signal);
            if (result) { selected = result; mode = "gemini"; }
          } catch { /* Fall back to the published source path. */ }
        }
        if (!signal.aborted) emit({ type: "answer", answer: buildAnswer(selected, language, mode) });
      } catch {
        emit({ type: "error", code: "UNAVAILABLE" });
      } finally {
        if (!cancellation.signal.aborted) controller.close();
      }
    },
    cancel() { cancellation.abort(); },
  });
  return new Response(stream, { headers: { ...headers, "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
