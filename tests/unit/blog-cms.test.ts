import { describe, it, expect } from "vitest";
import {
  validateBody,
  validatePublish,
  emptyDraft,
  canEdit,
  searchTokens,
  mediaIds,
  safeUrl,
} from "@/lib/blog/schema";
import { shareLinks } from "@/lib/blog/share";
describe("blog trust boundaries", () => {
  it("rejects executable nodes, unsafe marks and external images", () => {
    for (const content of [
      { type: "script" },
      {
        type: "text",
        text: "x",
        marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
      },
      { type: "image", attrs: { src: "https://remote.example/image.png" } },
    ])
      expect(() => validateBody({ type: "doc", content: [content] })).toThrow();
  });
  it("strips unknown attributes and permits only bounded structured content", () => {
    expect(
      validateBody({
        type: "doc",
        attrs: { onclick: "bad" },
        content: [
          {
            type: "heading",
            attrs: { level: 99 },
            content: [{ type: "text", text: "Xin chào" }],
          },
        ],
      }),
    ).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Xin chào" }],
        },
      ],
    });
    let n: unknown = { type: "paragraph" };
    for (let i = 0; i < 20; i++) n = { type: "doc", content: [n] };
    expect(() => validateBody(n)).toThrow();
  });
  it("does not allow readers or unrelated authors to edit posts", () => {
    const p = { owner: "one", assignee: "two" };
    expect(canEdit({ uid: "three", verified: true, name: "Reader" }, p)).toBe(
      false,
    );
    expect(
      canEdit(
        { uid: "three", verified: true, name: "Writer", role: "author" },
        p,
      ),
    ).toBe(false);
    expect(
      canEdit(
        { uid: "two", verified: true, name: "Writer", role: "author" },
        p,
      ),
    ).toBe(true);
  });
  it("requires a real manuscript, provenance and a safe slug", () => {
    expect(() => validatePublish(emptyDraft)).toThrow();
    expect(() =>
      validatePublish({
        ...emptyDraft,
        title: "Title",
        summary: "Summary",
        authorId: "writer",
        slug: "../bad",
        body: { type: "doc", content: [{ type: "text", text: "Text" }] },
        sources: [{ title: "Source", url: "https://example.com" }],
      }),
    ).toThrow();
  });
  it("normalizes Vietnamese search and keeps media references explicit", () => {
    expect(searchTokens("Đường đến tương lai")).toContain("duong");
    expect(
      mediaIds({
        type: "doc",
        content: [
          { type: "image", attrs: { src: "/api/blog/media/media-id" } },
        ],
      }),
    ).toEqual(["media-id"]);
    expect(safeUrl("https://user:pass@example.com")).toBe(false);
  });
  it("shares canonical public URLs with encoded Vietnamese titles", () => {
    const links = shareLinks(
      "https://hunpeolabs.com/resources/blog/test?preview=secret#draft",
      "Viết & chia sẻ",
    );
    expect(links.canonical).toBe("https://hunpeolabs.com/resources/blog/test");
    expect(links.x).toContain(encodeURIComponent("Viết & chia sẻ"));
    expect(JSON.stringify(links)).not.toContain("secret");
    expect(() => shareLinks("javascript:alert(1)", "test")).toThrow();
  });
});
