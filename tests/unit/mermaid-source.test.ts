import { expect, it } from "vitest";
import { isMermaidBlock, pastedMermaid, mermaidSource } from "@/lib/blog/mermaid-source";
it("detects declarations only in unlabelled blocks or explicit Mermaid", () => {
 expect(isMermaidBlock("", "flowchart LR\n A-->B")).toBe(true);
 expect(isMermaidBlock(null, "sequenceDiagram\n A->>B: Hi")).toBe(true);
 expect(isMermaidBlock("js", "graph LR")).toBe(false);
 expect(isMermaidBlock("", "some ordinary code")).toBe(false);
 expect(isMermaidBlock("mermaid", "bad syntax")).toBe(true);
});
it("recognizes complete fenced Mermaid paste without swallowing other content", () => {
 expect(pastedMermaid("```mermaid\nflowchart LR\n A-->B\n```")).toBe("flowchart LR\n A-->B");
 expect(pastedMermaid("intro\n```mermaid\nA\n```")).toBe(null);
 expect(pastedMermaid("```js\nA\n```")).toBe(null);
});

it("renders legacy fenced Mermaid blocks without changing stored source", () => {
 const inner = 'flowchart TD\n A["Yêu cầu"] --> B["Kết quả"]';
 const fenced = "```mermaid\n" + inner + "\n```";
 expect(isMermaidBlock(undefined, fenced)).toBe(true);
 expect(mermaidSource(fenced)).toBe(inner);
 expect(mermaidSource(inner)).toBe(inner);
 expect(isMermaidBlock(undefined, "```js\nconsole.log(1)\n```")).toBe(false);
});
