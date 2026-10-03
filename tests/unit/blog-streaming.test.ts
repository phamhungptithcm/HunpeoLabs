import { createElement } from "react";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
const { getPost, list } = vi.hoisted(() => ({ getPost: vi.fn(), list: vi.fn() }));
vi.mock("@/lib/blog/public-read", () => ({ getPublishedForRender: getPost }));
vi.mock("@/lib/blog/repository", () => ({ listPublished: list }));
vi.mock("@/components/blog-content", () => ({ BlogContent: ({ post }: { post: { title: string } }) => createElement("main", null, createElement("h1", null, post.title)) }));
vi.mock("@/components/action-progress", () => ({ PendingNavigation: () => null }));
vi.mock("@/app/seo", () => ({ getSiteUrl: () => new URL("https://example.com"), createPageMetadata: () => ({}), SITE_NAME: "Fixture site" }));
import ArticlePage, { generateMetadata } from "@/app/resources/blog/[slug]/page";
import { BlogLoading } from "@/components/blog-loading";

const post = { id: "primary", slug: "primary", title: "Readable primary article", category: "Engineering", tags: [], summary: "Summary", author: "Fixture author", language: "en", publishedAt: "2026-10-03T00:00:00Z", updatedAt: "2026-10-03T00:00:00Z" };
beforeEach(() => { vi.resetAllMocks(); getPost.mockResolvedValue(post); });
const params = () => ({ params: Promise.resolve({ slug: "primary" }) });

it("streams the article and fallback before related posts complete", async () => {
  let resolve!: (value: unknown) => void;
  const related = new Promise((done) => { resolve = done; });
  list.mockReturnValue(related);
  // Model the parent shell supplied by the app layout; a standalone Fragment is buffered by React.
  const stream = await renderToReadableStream(createElement("div", { id: "main-content" }, await ArticlePage(params())));
  const reader = stream.getReader();
  const first = new TextDecoder().decode((await reader.read()).value);
  expect(first).toContain("Readable primary article");
  expect(first).toContain("Loading related posts");
  resolve({ items: [post, { ...post, id: "related", slug: "related", title: "Related fixture" }] });
  let rest = "";
  for (;;) { const chunk = await reader.read(); if (chunk.done) break; rest += new TextDecoder().decode(chunk.value); }
  expect(first + rest).toContain('"@type":"Article"');
  expect(rest).toContain("Related fixture");
  expect(rest).not.toContain('href="/resources/blog/primary"');
  expect(list).toHaveBeenCalledWith({ category: "Engineering", limit: 20 });
  expect(list).toHaveBeenCalledWith({ limit: 20 });
});

it("preserves readable content when optional related queries fail", async () => {
  list.mockRejectedValue(new Error("synthetic provider failure"));
  const stream = await renderToReadableStream(await ArticlePage(params()));
  const html = await new Response(stream).text();
  expect(html).toContain("Readable primary article");
  expect(html).toContain("Related posts are unavailable right now");
  expect(html).not.toContain("synthetic provider failure");
});

it("retains empty-related and missing-post behavior", async () => {
  list.mockResolvedValue({ items: [] });
  const html = await new Response(await renderToReadableStream(await ArticlePage(params()))).text();
  expect(html).toContain("Readable primary article");
  getPost.mockResolvedValue(null);
  await expect(ArticlePage(params())).rejects.toThrow();
  expect(await generateMetadata(params())).toMatchObject({ robots: { index: false, follow: false } });
});

it.each([false, true])("renders accessible loading layout on the server without JavaScript (article=%s)", (article) => {
  const html = renderToStaticMarkup(createElement(BlogLoading, { article }));
  expect(html).toContain('aria-busy="true"');
  expect(html).toContain('role="status"');
  expect(html).toContain(article ? "Loading article" : "Loading posts");
  expect(html).toContain('aria-hidden="true"');
});
