import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, getSiteUrl, SITE_NAME } from "@/app/seo";
import { BlogContent } from "@/components/blog-content";
import { getPublished, listPublished } from "@/lib/blog/repository";
export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPublished(slug);
  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const base = createPageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
    path: `/resources/blog/${post.slug}`,
  });

  return {
    ...base,
    authors: [{ name: post.author }],
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [`/resources/blog/${post.slug}/opengraph-image`],
    },
    openGraph: {
      ...base.openGraph,
      type: "article",
      images: [
        {
          url: `/resources/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      authors: [post.author],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const post = await getPublished((await params).slug);
  if (!post) notFound();

  const related = (
    await listPublished({ category: post.category, limit: 4 })
  ).items
    .filter((p) => p.id !== post.id)
    .slice(0, 3);
  const siteUrl = getSiteUrl();
  const articleUrl = new URL(
    `/resources/blog/${post.slug}`,
    siteUrl,
  ).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: post.title,
        description: post.seoDescription || post.summary,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        author: {
          "@type": "Person",
          name: post.author,
        },
        publisher: {
          "@id": new URL("/#organization", siteUrl).toString(),
        },
        mainEntityOfPage: articleUrl,
        url: articleUrl,
        inLanguage: post.language,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: siteUrl.toString(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: new URL("/resources/blog", siteUrl).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <BlogContent post={post} url={articleUrl} />
      {related.length > 0 && (
        <section
          className="container related-stories"
          aria-label="Related articles"
        >
          <h2>Related posts</h2>
          <div className="story-grid">
            {related.map((p) => (
              <Link
                className="story"
                href={`/resources/blog/${p.slug}`}
                key={p.id}
              >
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </>
  );
}
