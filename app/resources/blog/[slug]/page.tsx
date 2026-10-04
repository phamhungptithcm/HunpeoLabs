import Link from "next/link";
import { relatedPublicPosts } from "@/lib/blog/discovery";
import type { PublishedPost } from "@/lib/blog/schema";
import { Cover } from "@/components/blog-admin/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, getSiteUrl, SITE_NAME } from "@/app/seo";
import { BlogContent } from "@/components/blog-content";
import { Suspense } from "react";
import { RelatedPostsLoading } from "@/components/blog-loading";
import { listPublished } from "@/lib/blog/repository";
import { getPublishedForRender } from "@/lib/blog/public-read";
import { articleServiceIds } from "@/content/service-discovery";
import { services } from "@/content/site";
export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const post = await getPublishedForRender(slug);
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
  const post = await getPublishedForRender((await params).slug);
  if (!post) notFound();

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
      {articleServiceIds[post.slug]?.length > 0 && <section className="container related-stories" aria-label="Related services">
        <h2>Build an AI workflow with HunpeoLabs</h2>
        <p>Explore the scope, deliverables, and review process for related services.</p>
        <ul>{services.filter(service => articleServiceIds[post.slug].includes(service.slug)).map(service =>
          <li key={service.slug}><Link href={`/services/${service.slug}`}>{service.name}</Link></li>
        )}</ul>
      </section>}
      <Suspense fallback={<RelatedPostsLoading />}>
        <RelatedPosts current={post} />
      </Suspense>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </>
  );
}

async function RelatedPosts({ current }: { current: PublishedPost }) {
  let related;
  try {
    const [sameTopic, recent] = await Promise.all([listPublished({ category: current.category, limit:20 }), listPublished({ limit:20 })]);
    related = relatedPublicPosts(current, [...sameTopic.items, ...recent.items]);
  } catch {
    // Optional recommendations must not replace a readable article with an error.
    return (
      <section className="container related-stories" aria-label="Related articles">
        <h2>Related posts</h2>
        <p>Related posts are unavailable right now. <Link href="/resources/blog">Browse the blog</Link></p>
      </section>
    );
  }
  if (related.length === 0) return null;
  return (
    <section className="container related-stories" aria-label="Related articles">
      <h2>Related posts</h2>
      <div className="story-grid">
        {related.map((post) => (
          <Link className="story" href={`/resources/blog/${post.slug}`} key={post.id}>
            <div className="thumb"><Cover id={post.coverId} title={post.title} language="en" /></div><div className="story-copy"><span className="small">{post.category} · {post.readingMinutes} min read</span><h3>{post.title}</h3><p>{post.summary}</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
