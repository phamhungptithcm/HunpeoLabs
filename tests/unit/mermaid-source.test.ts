import { expect, it } from "vitest";
import { isMermaidBlock, pastedMermaid } from "@/lib/blog/mermaid-source";
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
