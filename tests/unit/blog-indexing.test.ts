import { afterEach, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";

const discovery = vi.hoisted(() => ({ posts: vi.fn() }));
vi.mock("@/lib/blog/repository", () => ({ listDiscoveryPosts: discovery.posts }));

afterEach(() => {
  vi.unstubAllEnvs();
  discovery.posts.mockReset();
});

it("discovers a newly published blog URL on the next sitemap request and removes withdrawn entries", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hunpeolabs.com");
  discovery.posts.mockResolvedValueOnce([]).mockResolvedValueOnce([
    { slug: "published-example", publishedAt: "2026-10-01T12:00:00Z", updatedAt: "2026-10-03T12:00:00Z" },
  ]).mockResolvedValueOnce([]);
  const article = "https://hunpeolabs.com/resources/blog/published-example";
  expect((await sitemap()).map(item => item.url)).not.toContain(article);
  const published = await sitemap();
  expect(published.filter(item => item.url === article)).toHaveLength(1);
  expect(published.find(item => item.url === article)?.lastModified).toBe("2026-10-03T12:00:00Z");
  expect(published.map(item => item.url)).toContain("https://hunpeolabs.com/resources/blog");
  expect((await sitemap()).map(item => item.url)).not.toContain(article);
  expect(discovery.posts).toHaveBeenCalledTimes(3);
});

it("uses publication date when no update exists and omits unparseable dates", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hunpeolabs.com");
  discovery.posts.mockResolvedValue([
    { slug: "first-publication", publishedAt: "2026-10-01T12:00:00Z" },
    { slug: "invalid-date", publishedAt: "invalid" },
  ]);
  const entries = await sitemap();
  expect(entries.find(item => item.url.endsWith("/first-publication"))?.lastModified).toBe("2026-10-01T12:00:00Z");
  expect(entries.find(item => item.url.endsWith("/invalid-date"))?.lastModified).toBeUndefined();
  expect(entries.find(item => item.url === "https://hunpeolabs.com/")?.lastModified).toBeUndefined();
});

it("contains only public canonical paths when discovery supplies published posts", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hunpeolabs.com");
  discovery.posts.mockResolvedValue([{ slug: "public-post", publishedAt: "2026-10-01T12:00:00Z" }]);
  const urls = (await sitemap()).map(item => new URL(item.url));
  expect(urls.every(url => url.origin === "https://hunpeolabs.com" && !url.search && !url.hash)).toBe(true);
  expect(urls.some(url => /\/(admin|studio|api)\b|\/preview\b/.test(url.pathname))).toBe(false);
});
