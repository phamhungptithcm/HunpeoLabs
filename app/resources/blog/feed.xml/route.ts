import { getSiteUrl, SITE_NAME } from "@/app/seo";
import { listPublished } from "@/lib/blog/repository";
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const blogUrl = new URL("/resources/blog", siteUrl).toString();
  const feedUrl = new URL("/resources/blog/feed.xml", siteUrl).toString();
  const items = (await listPublished({ limit: 100 })).items
    .map((post) => {
      const postUrl = new URL(
        `/resources/blog/${post.slug}`,
        siteUrl,
      ).toString();
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(postUrl)}</link>
  <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
  <description>${escapeXml(post.summary)}</description>
  <dc:creator>${escapeXml(post.author)}</dc:creator>
  <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
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
      "Cache-Control": "no-store",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
