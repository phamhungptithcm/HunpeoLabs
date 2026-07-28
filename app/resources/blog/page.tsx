import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { getPublishedBlogPosts } from "@/content/blog";

const description =
  "Source-backed notes on product engineering, AI systems, platform engineering, and engineering practice.";
const posts = getPublishedBlogPosts();
const baseMetadata = createPageMetadata({
  title: "Blog",
  description,
  path: "/resources/blog",
  index: posts.length > 0,
});

export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...baseMetadata.alternates,
    types: {
      "application/rss+xml": "/resources/blog/feed.xml",
    },
  },
};

const editorialScope = [
  ["Product Engineering", "Interfaces, product decisions, and software built around real use."],
  ["AI Systems", "Agents, evaluation, evidence, guardrails, and human control."],
  ["Platform Engineering", "Architecture, modernization, ownership, and operational boundaries."],
  ["Engineering Practice", "Reviewable decisions, reusable learning, and delivery evidence."],
] as const;

export default function BlogPage() {
  const [featured, ...remaining] = posts;

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div>
          <p className="mono">04.1 / Blog</p>
          <h1>Notes from the work.</h1>
        </div>
        <div>
          <p>{description}</p>
          <a className="text-link" href="/resources/blog/feed.xml">
            RSS feed
            <ArrowIcon />
          </a>
        </div>
      </section>

      {featured ? (
        <>
          <section className="blog-featured">
            <p className="mono">Latest article</p>
            <Link href={`/resources/blog/${featured.slug}`}>
              <div>
                <span className="mono">{featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
              </div>
              <div className="blog-card__meta mono">
                <span>{featured.publishedAt}</span>
                <span>{featured.readingMinutes} min read</span>
                <ArrowIcon />
              </div>
            </Link>
          </section>
          {remaining.length ? (
            <section className="blog-index" aria-label="More articles">
              {remaining.map((post, index) => (
                <Link href={`/resources/blog/${post.slug}`} key={post.slug}>
                  <span className="mono">{String(index + 2).padStart(2, "0")}</span>
                  <div>
                    <p className="mono">{post.category}</p>
                    <h2>{post.title}</h2>
                    <p>{post.summary}</p>
                  </div>
                  <div className="blog-card__meta mono">
                    <span>{post.publishedAt}</span>
                    <span>{post.readingMinutes} min read</span>
                    <ArrowIcon />
                  </div>
                </Link>
              ))}
            </section>
          ) : null}
        </>
      ) : (
        <section className="blog-empty">
          <div>
            <p className="mono">Publication status</p>
            <h2>The publishing system is ready. The first article is not public yet.</h2>
            <p>
              Articles appear here only after their writing, author, dates, and sources
              have been reviewed. Until then, the index stays intentionally empty.
            </p>
            <div className="blog-empty__actions">
              <Link className="text-link" href="/work">
                Explore selected work
                <ArrowIcon />
              </Link>
              <Link className="text-link" href="/resources/open-source">
                Inspect open source
                <ArrowIcon />
              </Link>
            </div>
          </div>
          <div>
            <p className="mono">Publication requirements</p>
            <ol>
              {[
                "A named, verified author",
                "A reviewed and substantive manuscript",
                "Inspectable sources for factual claims",
                "Publication and update history",
              ].map((requirement, index) => (
                <li key={requirement}>
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  {requirement}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="blog-scope">
        <header>
          <p className="mono">Editorial scope</p>
          <h2>Four areas, one standard: make the reasoning reusable.</h2>
        </header>
        <div>
          {editorialScope.map(([title, body], index) => (
            <article key={title}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
