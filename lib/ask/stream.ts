import { askEventSchema, type AskEvent } from "./contracts";

export async function readAskStream(body: ReadableStream<Uint8Array>, onEvent: (event: AskEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = "", bytes = 0, received = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 30_000) throw new Error("INVALID_RESPONSE");
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = askEventSchema.parse(JSON.parse(line));
        if (event.type === "error" || received) throw new Error("INVALID_RESPONSE");
        if (event.type === "answer") received = true;
        onEvent(event);
      }
    }
    buffer += decoder.decode();
    if (!received || buffer.trim()) throw new Error("INCOMPLETE_RESPONSE");
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
