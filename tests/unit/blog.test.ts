import { describe, expect, it } from "vitest";
import {
  getPublishedBlogPost,
  getPublishedBlogPosts,
  isPublishableBlogPost,
  type BlogPost,
} from "@/content/blog";

const reviewedPost: BlogPost = {
  slug: "reviewable-engineering-note",
  title: "A reviewable engineering note",
  summary: "A concise summary grounded in inspectable material.",
  answer: "The short answer is explicit and reviewable.",
  category: "Engineering Practice",
  author: "Verified Author",
  publishedAt: "2026-07-28",
  readingMinutes: 4,
  status: "reviewed",
  sections: [
    {
      id: "main-point",
      title: "Main point",
      paragraphs: ["A substantive paragraph that explains the main point."],
    },
  ],
  sources: [{ title: "Primary source", url: "https://example.com/source" }],
  related: [{ title: "Related work", href: "/work", context: "Verified public work." }],
};

describe("blog publication gate", () => {
  it("publishes only reviewed posts with complete provenance", () => {
    expect(isPublishableBlogPost(reviewedPost)).toBe(true);
    expect(
      isPublishableBlogPost({ ...reviewedPost, slug: "draft-note", status: "draft" }),
    ).toBe(false);
    expect(
      isPublishableBlogPost({ ...reviewedPost, slug: "missing-sources", sources: [] }),
    ).toBe(false);
    expect(
      isPublishableBlogPost({ ...reviewedPost, slug: "missing-author", author: "" }),
    ).toBe(false);
  });

  it("keeps drafts out of index and detail queries", () => {
    const draft = { ...reviewedPost, slug: "draft-note", status: "draft" as const };
    expect(getPublishedBlogPosts([draft, reviewedPost])).toEqual([reviewedPost]);
    expect(getPublishedBlogPost("draft-note", [draft, reviewedPost])).toBeUndefined();
    expect(getPublishedBlogPost(reviewedPost.slug, [draft, reviewedPost])).toEqual(reviewedPost);
  });
});
