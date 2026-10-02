import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, getSiteUrl } from "@/app/seo";
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
  const query = await searchParams;
  const { items: posts, next } = await listPublished(query);
  const [featured, ...remaining] = posts;
  const categories = Array.from(
    new Set([
      "Kỹ thuật",
      "AI & Tự động hóa",
      "Sản phẩm",
      "Thiết kế",
      ...posts.map((p) => p.category),
    ]),
  );
  return (
    <main className="container">
      <section className="journal-intro">
        <div>
          <div className="eyebrow tiny-rule">
            Góc nhìn từ người làm sản phẩm
          </div>
          <h1>
            Ideas into <em>practice.</em>
          </h1>
        </div>
        <div>
          <p>
            Chuyện xây sản phẩm, làm kỹ thuật và những điều học được trên hành
            trình tại HunpeoLabs.
          </p>
          <BlogAccountLink />
        </div>
      </section>
      {featured && (
        <Link className="feature" href={`/resources/blog/${featured.slug}`}>
          <div className="feature-art">
            <Cover
              id={featured.coverId}
              title={featured.title}
              loading="eager"
            />
          </div>
          <div className="feature-copy">
            <div className="eyebrow tiny-rule">
              Bài viết nổi bật · {featured.category}
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
                  {new Date(featured.publishedAt).toLocaleDateString("vi")} ·{" "}
                  {featured.readingMinutes} phút đọc
                </span>
              </span>
            </div>
            <span className="arrow-link">
              Đọc câu chuyện <BlogIcon name="arrow" />
            </span>
          </div>
        </Link>
      )}
      <section id="latest">
        <div className="feed-toolbar">
          <nav className="categories" aria-label="Chủ đề">
            <Link
              className={`category ${!query.category ? "active" : ""}`}
              href="/resources/blog#latest"
            >
              Tất cả bài viết
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                className={`category ${query.category === c ? "active" : ""}`}
                href={`/resources/blog?category=${encodeURIComponent(c)}#latest`}
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
            <input
              aria-label="Tìm bài viết"
              name="q"
              defaultValue={query.q}
              placeholder="Tìm bài viết…"
            />
            <button aria-label="Tìm kiếm" type="submit">
              <BlogIcon name="arrow" size={14} />
            </button>
          </form>
        </div>
        {(query.q || query.tag) && (
          <p className="private-note">
            Kết quả {query.q ? `cho từ khóa “${query.q}”` : ""}{" "}
            {query.tag ? `với tag #${query.tag}` : ""}. Tìm theo một từ trong
            tiêu đề, tóm tắt hoặc tags.{" "}
            <Link href="/resources/blog">Xóa bộ lọc</Link>
          </p>
        )}
        {remaining.length > 0 && (
          <div className="story-grid">
            {remaining.map((p) => (
              <article className="story" key={p.id}>
                <Link href={`/resources/blog/${p.slug}`}>
                  <div className="thumb">
                    <Cover id={p.coverId} title={p.title} />
                  </div>
                  <div className="eyebrow">{p.category}</div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div className="byline">
                    <span>{p.author}</span>
                    <span>·</span>
                    <span>{p.readingMinutes} phút đọc</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
        {!featured && (
          <div className="state-card journal-empty">
            <div className="state-icon">
              <BlogIcon name="file" size={22} />
            </div>
            <h2>
              {query.q || query.category || query.tag
                ? "Chưa có bài phù hợp."
                : "Chưa có bài viết."}
            </h2>
            <p>
              {query.q || query.category || query.tag
                ? "Thử một chủ đề hoặc từ khóa khác."
                : "Ghé lại sau hoặc theo dõi qua RSS nhé."}
            </p>
            {query.q || query.category || query.tag ? (
              <Link className="button" href="/resources/blog">
                Xem tất cả bài viết
              </Link>
            ) : (
              <Link className="button" href="/work">
                Khám phá công việc của chúng tôi{" "}
                <BlogIcon name="arrow" size={14} />
              </Link>
            )}
          </div>
        )}
        {next && (
          <Link
            className="button"
            href={`/resources/blog?${new URLSearchParams({ ...query, cursor: next })}`}
          >
            Xem thêm bài viết <BlogIcon name="arrow" size={14} />
          </Link>
        )}
      </section>
      <div className="journal-bottom">
        <div>
          <h3>Đọc bài mới qua RSS</h3>
          <p className="muted small">Thêm blog vào ứng dụng đọc tin của bạn.</p>
        </div>
        <BlogRss url={new URL("/resources/blog/feed.xml", getSiteUrl()).toString()} />
      </div>
    </main>
  );
}
