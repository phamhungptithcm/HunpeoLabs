import { getSiteUrl, SITE_NAME } from "@/app/seo";
import { getPublishedBlogPosts } from "@/content/blog";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const siteUrl = getSiteUrl();
  const blogUrl = new URL("/resources/blog", siteUrl).toString();
  const feedUrl = new URL("/resources/blog/feed.xml", siteUrl).toString();
  const items = getPublishedBlogPosts()
    .map((post) => {
      const postUrl = new URL(`/resources/blog/${post.slug}`, siteUrl).toString();
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(postUrl)}</link>
  <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
  <description>${escapeXml(post.summary)}</description>
  <author>${escapeXml(post.author)}</author>
  <pubDate>${new Date(`${post.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(`${SITE_NAME} Blog`)}</title>
  <link>${escapeXml(blogUrl)}</link>
  <description>Source-backed notes on product engineering, AI systems, platform engineering, and engineering practice.</description>
  <language>en</language>
  <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
