import { categoryLabel } from "@/lib/blog/categories";
import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, getSiteUrl } from "@/app/seo";
import { BlogFeedTransition } from "@/components/blog-feed-transition";
import { BlogRss } from "@/components/blog-rss";
import { BlogAccountLink } from "@/components/blog-account-link";
import { Avatar, Cover, BlogIcon } from "@/components/blog-admin/ui";
import { listPublished } from "@/lib/blog/repository";

const description =
  "Source-backed notes on product engineering, AI systems, platform engineering, and engineering practice.";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { items: posts } = await listPublished({ limit: 1 });
  const baseMetadata = createPageMetadata({
    title: "Blog",
    description,
    path: "/resources/blog",
    index: posts.length > 0,
  });

  return {
    ...baseMetadata,
    alternates: {
      ...baseMetadata.alternates,
      types: {
        "application/rss+xml": "/resources/blog/feed.xml",
      },
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    cursor?: string;
  }>;
}) {
  const rawQuery = await searchParams;
  const query = { ...rawQuery, category: rawQuery.category ? categoryLabel(rawQuery.category) : undefined };
  const filtered = Boolean(query.q || query.tag || query.category || query.cursor);
  const results = listPublished(query);
  const [page, overview] = await Promise.all([
    results,
    filtered ? listPublished({}) : results,
  ]);
  const { items: posts, next } = page;
  const featured = overview.items[0];
  const remaining = filtered ? posts : posts.slice(1);
  const categories = Array.from(
    new Set([
      "Engineering",
      "AI & Automation",
      "Product",
      "Design",
      ...overview.items.map((p) => categoryLabel(p.category)),
      ...(query.category ? [query.category] : []),
    ]),
  );
  return (
    <main className="container">
      <section className="journal-intro">
        <div>
          <div className="eyebrow tiny-rule">
            Notes from the people building products
          </div>
          <h1>
            Ideas into <em>practice.</em>
          </h1>
        </div>
        <div>
          <p>
            Stories about building products, engineering and what we learn along the way at Hunpeo Labs.
          </p>
          <BlogAccountLink />
        </div>
      </section>
      {featured && (
        <Link className="feature" href={`/resources/blog/${featured.slug}`}>
          <div className="feature-art">
            <Cover language="en"
              id={featured.coverId}
              title={featured.title}
              loading="eager"
            />
          </div>
          <div className="feature-copy">
            <div className="eyebrow tiny-rule">
              Featured post · {categoryLabel(featured.category)}
            </div>
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
            <div className="byline">
              <Avatar
                name={featured.author}
                mediaId={featured.authorAvatarId}
              />
              <span>
                {featured.author}
                <br />
                <span className="small">
                  {new Date(featured.publishedAt).toLocaleDateString("en")} ·{" "}
                  {featured.readingMinutes} min read
                </span>
              </span>
            </div>
            <span className="arrow-link">
              Read the story <BlogIcon name="arrow" />
            </span>
          </div>
        </Link>
      )}
      <BlogFeedTransition>
        <div className="feed-toolbar">
          <nav className="categories" aria-label="Topics">
            <Link
              scroll={false}
              data-blog-category
              aria-current={!query.category ? "page" : undefined}
              className={`category ${!query.category ? "active" : ""}`}
              href="/resources/blog"
            >
              All posts
            </Link>
            {categories.map((c) => (
              <Link
                scroll={false}
                data-blog-category
                aria-current={query.category === c ? "page" : undefined}
                key={c}
                className={`category ${query.category === c ? "active" : ""}`}
                href={`/resources/blog?category=${encodeURIComponent(c)}`}
              >
                {c}
              </Link>
            ))}
          </nav>
          <form action="/resources/blog" className="search">
            <BlogIcon name="search" size={15} />
            {query.category && (
              <input type="hidden" name="category" value={query.category} />
            )}
            {query.tag && <input type="hidden" name="tag" value={query.tag} />}
            <input
              maxLength={160}
              aria-label="Search posts"
              name="q"
              defaultValue={query.q}
              placeholder="Search posts…"
            />
            <button aria-label="Search" type="submit">
              <BlogIcon name="arrow" size={14} />
            </button>
          </form>
        </div>
        {(query.q || query.tag) && (
          <p className="private-note">
            Results {query.q ? `for “${query.q}”` : ""}{" "}
            {query.tag ? `tagged #${query.tag}` : ""}. Matching titles, topics and article content.{" "}
            <Link href="/resources/blog">Clear filters</Link>
          </p>
        )}
        <div className="blog-feed-results" key={JSON.stringify(query)}>
        {remaining.length > 0 && (
          <div className="story-grid">
            {remaining.map((p) => (
              <article className="story" key={p.id}>
                <Link href={`/resources/blog/${p.slug}`}>
                  <div className="thumb">
                    <Cover language="en" id={p.coverId} title={p.title} />
                  </div>
                  <div className="eyebrow">{categoryLabel(p.category)}</div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div className="byline">
                    <span>{p.author}</span>
                    <span>·</span>
                    <span>{p.readingMinutes} min read</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
        {posts.length === 0 && (
          <div className="state-card journal-empty">
            <div className="state-icon">
              <BlogIcon name="file" size={22} />
            </div>
            <h2>
              {query.q || query.category || query.tag
                ? (next && query.q ? "Keep searching older posts." : "No matching posts.")
                : "No posts yet."}
            </h2>
            <p>
              {query.q || query.category || query.tag
                ? (next && query.q ? "Continue below, or try another search term." : "Try another topic or search term.")
                : "Check back later or follow via RSS."}
            </p>
            {query.q || query.category || query.tag ? (
              <Link className="button" href="/resources/blog">
                View all posts
              </Link>
            ) : (
              <Link className="button" href="/work">
                Explore our work{" "}
                <BlogIcon name="arrow" size={14} />
              </Link>
            )}
          </div>
        )}
        {next && (
          <Link
            className="button"
            href={`/resources/blog?${new URLSearchParams({ ...rawQuery, ...(query.category ? { category: query.category } : {}), cursor: next })}`}
          >
            {query.q ? "Continue search" : "More posts"} <BlogIcon name="arrow" size={14} />
          </Link>
        )}
        </div>
      </BlogFeedTransition>
      <div className="journal-bottom">
        <div>
          <h3>Follow new posts via RSS</h3>
          <p className="muted small">Add this blog to your feed reader.</p>
        </div>
        <BlogRss url={new URL("/resources/blog/feed.xml", getSiteUrl()).toString()} />
      </div>
    </main>
  );
}
