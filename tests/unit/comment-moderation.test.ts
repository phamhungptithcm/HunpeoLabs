import { describe, expect, it } from "vitest";
import { classifyComment, commentFingerprint, readReputation } from "@/lib/blog/comment-moderation";
const now = "2026-10-03T12:00:00Z";
const fresh = readReputation();
describe("automatic moderation policy", () => {
  it("allows ordinary multilingual discussion and a single reference", () => {
    for (const text of ["Bài viết hữu ích, cảm ơn bạn!", "I disagree with this AI product analysis.", "Source: https://example.com/reference"])
      expect(classifyComment(text, "new", fresh, now).status).toBe("approved");
  });
  it("holds link-heavy content with explicit reasons and bounded trusted allowances", () => {
    const text = "https://example.com/a https://example.com/b";
    expect(classifyComment(text, "new", fresh, now).reasons).toEqual(["links"]);
    const trusted = { ...fresh, approvedCount: 3 };
    expect(classifyComment(text, "new", trusted, now).status).toBe("approved");
    expect(classifyComment(`${text} www.example.com/c`, "new", trusted, now).reasons).toEqual(["links"]);
  });
  it("normalizes Unicode, invisible separators and whitespace for duplicate detection", () => {
    const recent = [{id:"previous",hash:commentFingerprint("Useful comment"),at:now}];
    const rep = { ...fresh, recent };
    expect(classifyComment("ＵＳＥＦＵＬ\u200b  comment", "new", rep, now).reasons).toContain("duplicate");
    expect(classifyComment("Useful comment", "previous", rep, now).status).toBe("approved");
    expect(classifyComment("Useful comment", "new", rep, "2026-10-04T12:00:00Z").status).toBe("approved");
  });
  it("never gives restricted accounts a trust bypass", () => {
    expect(classifyComment("Normal text", "new", {...fresh,approvedCount:20,restrictedCount:1},now).reasons).toEqual(["restricted"]);
    expect(classifyComment("Mua ngay!", "new", {...fresh,approvedCount:20},now).reasons).toEqual(["promotion"]);
  });
  it("bounds recent fingerprints and safely handles missing legacy fields", () => {
    expect(readReputation({approvedCount:-1, restrictedCount:"2",recent:[null,{}]})).toEqual(fresh);
    const recent = Array.from({length:25},(_,i)=>({id:`id${i}`,hash:String(i),at:now}));
    expect(classifyComment("A new comment", "new", {...fresh,recent},now).recent).toHaveLength(20);
  });
});
