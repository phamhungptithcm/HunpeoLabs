import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, getSiteUrl, SITE_NAME } from "@/app/seo";
import { BlogArticle } from "@/components/blog-article";
import { getPublishedBlogPost, getPublishedBlogPosts } from "@/content/blog";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const post = getPublishedBlogPost(slug);
  if (!post) {
    return { title: "Article not found", robots: { index: false, follow: false } };
  }

  const base = createPageMetadata({
    title: post.title,
    description: post.summary,
    path: `/resources/blog/${post.slug}`,
  });

  return {
    ...base,
    authors: [{ name: post.author }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      authors: [post.author],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const post = getPublishedBlogPost((await params).slug);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const articleUrl = new URL(`/resources/blog/${post.slug}`, siteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: post.title,
        description: post.summary,
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
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: siteUrl.toString() },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: new URL("/resources/blog", siteUrl).toString(),
          },
          { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <>
      <BlogArticle post={post} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
    </>
  );
}
