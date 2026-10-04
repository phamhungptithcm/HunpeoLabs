import { describe, expect, it } from "vitest";
import { readAskStream } from "@/lib/ask/stream";
import { buildAnswer } from "@/lib/ask/retrieval";
import { withinSignal } from "@/lib/ask/deadline";
const encoder = new TextEncoder();
function stream(chunks: Uint8Array[]) { return new ReadableStream<Uint8Array>({ start(controller) { chunks.forEach(chunk => controller.enqueue(chunk)); controller.close(); } }); }
describe("Ask streaming responses", () => {
  it("handles a Vietnamese multibyte character split between network chunks", async () => {
    const data = encoder.encode(JSON.stringify({ type: "answer", answer: buildAnswer({ topic: "company", service: null, detail: "overview" }, "vi") }) + "\n");
    const events: unknown[] = [];
    await readAskStream(stream(Array.from(data, byte => new Uint8Array([byte]))), event => events.push(event));
    expect(events).toHaveLength(1);
  });
  it("rejects a truncated response and unapproved sources", async () => {
    await expect(readAskStream(stream([encoder.encode('{"type":"status","phase":"retrieving"}\n')]), () => {})).rejects.toThrow("INCOMPLETE_RESPONSE");
    const answer = { ...buildAnswer({ topic: "company", service: null, detail: "overview" }, "en"), sourceIds: ["https://evil.example"] };
    await expect(readAskStream(stream([encoder.encode(JSON.stringify({ type: "answer", answer }) + "\n")]), () => {})).rejects.toThrow();
  });
  it("stops waiting for an uncancellable SDK operation when aborted", async () => {
    const controller = new AbortController();
    const pending = withinSignal(new Promise(() => {}), controller.signal);
    controller.abort();
    await expect(pending).rejects.toThrow("INTERRUPTED");
  });
});
