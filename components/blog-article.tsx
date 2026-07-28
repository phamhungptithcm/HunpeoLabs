import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";
import type { BlogPost } from "@/content/blog";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <article className="blog-article">
      <header className="blog-article__hero">
        <p className="mono">{post.category}</p>
        <h1>{post.title}</h1>
        <p className="blog-article__summary">{post.summary}</p>
        <dl className="blog-article__meta">
          <div>
            <dt>Author</dt>
            <dd>{post.author}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{formatDate(post.publishedAt)}</dd>
          </div>
          {post.updatedAt ? (
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(post.updatedAt)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Reading time</dt>
            <dd>{post.readingMinutes} min</dd>
          </div>
        </dl>
      </header>

      <div className="blog-article__layout">
        <aside>
          <p className="mono">In this article</p>
          <nav aria-label="Article sections">
            {post.sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="blog-article__body">
          <section className="blog-answer">
            <p className="mono">Short answer</p>
            <p>{post.answer}</p>
          </section>

          {post.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points?.length ? (
                <ul>
                  {section.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="blog-sources">
            <p className="mono">Sources</p>
            <h2>References that can be inspected.</h2>
            <ol>
              {post.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noreferrer" target="_blank">
                    <span>{source.title}</span>
                    {source.publisher ? <small>{source.publisher}</small> : null}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <footer className="blog-article__footer">
        <div>
          <p className="mono">Continue exploring</p>
          <h2>Related work and context.</h2>
        </div>
        <div>
          {post.related.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.context}</small>
              </span>
              <ArrowIcon />
            </Link>
          ))}
          <Link href="/resources/blog">
            <span>
              <strong>All blog notes</strong>
              <small>Return to the publication index.</small>
            </span>
            <ArrowIcon />
          </Link>
        </div>
      </footer>
    </article>
  );
}
