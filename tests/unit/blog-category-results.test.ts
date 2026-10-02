import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
const { listPublished } = vi.hoisted(() => ({ listPublished: vi.fn() }));
vi.mock("@/lib/blog/repository", () => ({ listPublished }));
vi.mock("@/app/seo", () => ({ getSiteUrl: () => "https://example.com", createPageMetadata: () => ({}) }));
vi.mock("@/components/blog-rss", () => ({ BlogRss: () => null }));
vi.mock("@/components/blog-account-link", () => ({ BlogAccountLink: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import BlogPage from "@/app/resources/blog/page";
const post = (id: string, category: string) => ({ id, slug: id, title: `Title ${id}`, category, author: "Writer", summary: "Summary", publishedAt: "2026-10-02T10:00:00Z", readingMinutes: 2 });
it("keeps the feature stable while showing the first matching post below category filters", async () => {
  listPublished.mockImplementation(async (query) => ({ items: query.category ? [post("filtered", "Design")] : [post("featured", "Engineering"), post("filtered", "Design")], next: null }));
  const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ category: "Design" }) }));
  expect(html).toContain('class="feature" href="/resources/blog/featured"');
  expect(html).toContain('class="story"');
  expect(html).toContain('href="/resources/blog/filtered"');
  expect(html).toContain("Engineering");
  expect(html).not.toContain("#latest");
});
it("renders empty filtered state while retaining feature and category choices", async () => {
  listPublished.mockImplementation(async (query) => ({ items: query.category ? [] : [post("featured", "Engineering")], next: null }));
  const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ category: "Design" }) }));
  expect(html).toContain('href="/resources/blog/featured"');
  expect(html).toContain("No matching posts.");
  expect(html).toContain("Engineering");
  expect(html).toContain("Design");
});

it("merges legacy AI tabs and canonicalizes old category links", async () => {
  listPublished.mockImplementation(async () => ({ items: [post("one", "AI Engineering in Practice"), post("two", "AI & Tự động hóa")], next: null }));
  const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ category: "AI Engineering in Practice" }) }));
  const nav = html.slice(html.indexOf('aria-label="Topics"'), html.indexOf("</nav>"));
  expect(nav.match(/>AI &amp; Automation</g)).toHaveLength(1);
  expect(nav).not.toContain("AI Engineering in Practice");
  expect(listPublished).toHaveBeenCalledWith(expect.objectContaining({ category: "AI & Automation" }));
});
