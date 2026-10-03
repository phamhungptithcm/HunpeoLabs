import { expect, it } from "vitest";
import { validateBody } from "@/lib/blog/schema";
const cell = { type: "tableHeader", attrs: { colspan: 2, rowspan: 1, onclick: "unsafe" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Tiêu đề" }] }] };
it("preserves valid table structure and strips unexpected cell attributes", () => {
 const result = validateBody({ type: "doc", content: [{ type: "table", content: [{ type: "tableRow", content: [cell] }] }] });
 expect(result.content?.[0].content?.[0].content?.[0].attrs).toEqual({ colspan: 2, rowspan: 1 });
});
it("rejects invalid spans and table row structure", () => {
 expect(() => validateBody({ type: "doc", content: [{ ...cell, attrs: { colspan: 999 } }] })).toThrow();
 expect(() => validateBody({ type: "doc", content: [{ type: "table", content: [{ type: "paragraph" }] }] })).toThrow();
});
