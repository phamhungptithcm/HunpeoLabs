/* eslint-disable @next/next/no-img-element -- Media authorization must run per request; images are resized on upload. */
import { isMermaidBlock } from "@/lib/blog/mermaid-source";
import { MermaidDiagram } from "./mermaid-diagram";
import type { ReactNode } from "react";
import type { RichNode, PublishedPost } from "@/lib/blog/schema";
import { safeUrl } from "@/lib/blog/schema";
import { BlogShares } from "./blog-shares";
import { BlogViews } from "./blog-views";
import { BlogShare } from "./blog-share";
import { Comments } from "./blog-comments/comments";
import Link from "next/link";
import { Avatar, Cover, BlogIcon } from "./blog-admin/ui";
function render(n: RichNode, key: string): ReactNode {
  const children = n.content?.map((c, i) => render(c, `${key}-${i}`));
  switch (n.type) {
    case "doc":
      return children;
    case "text": {
      let text: ReactNode = n.text;
      for (const m of n.marks ?? []) {
        if (m.type === "bold") text = <strong>{text}</strong>;
        if (m.type === "italic") text = <em>{text}</em>;
        if (m.type === "strike") text = <s>{text}</s>;
        if (m.type === "code") text = <code>{text}</code>;
        if (m.type === "underline") text = <u>{text}</u>;
        if (m.type === "link" && safeUrl(String(m.attrs?.href)))
          text = (
            <a href={String(m.attrs?.href)} rel="noopener noreferrer">
              {text}
            </a>
          );
      }
      return <span key={key}>{text}</span>;
    }
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading":
      return n.attrs?.level === 3 ? (
        <h3 id={`section-${key}`} key={key}>
          {children}
        </h3>
      ) : n.attrs?.level === 4 ? (
        <h4 id={`section-${key}`} key={key}>
          {children}
        </h4>
      ) : (
        <h2 id={`section-${key}`} key={key}>
          {children}
        </h2>
      );
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      if (isMermaidBlock(n.attrs?.language, (n.content ?? []).map((c) => c.text ?? "").join(""))) return <MermaidDiagram key={key} source={(n.content ?? []).map((c) => c.text ?? "").join("")} />;
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    case "image":
      return (
        <figure key={key}>
          {/* Auth-checked media cannot use a public optimization cache. */}
          <img
            src={String(n.attrs?.src)}
            alt={String(n.attrs?.alt ?? "")}
            loading="lazy"
          />
          {n.attrs?.title ? (
            <figcaption>{String(n.attrs.title)}</figcaption>
          ) : null}
        </figure>
      );
    default:
      return null;
  }
}
export function BlogContent({
  post,
  url,
  preview = false,
}: {
  post: PublishedPost;
  url: string;
  preview?: boolean;
}) {
  const copy = (vi: string, en: string) => preview ? vi : en;
  const date = (v: string) =>
    new Intl.DateTimeFormat(preview ? post.language : "en", { dateStyle: "long" }).format(
      new Date(v),
    );
  const headings =
    post.body.content?.flatMap((n, i) =>
      n.type === "heading"
        ? [
            {
              id: `section-0-${i}`,
              text: n.content?.map((c) => c.text ?? "").join(""),
            },
          ]
        : [],
    ) ?? [];
  return (
    <main className="container" lang={preview ? post.language : "en"}>
      <header className="article-heading">
        <div className="breadcrumbs">
          <Link href="/resources/blog">Journal</Link>
          <span>/</span>
          <Link
            href={`/resources/blog?category=${encodeURIComponent(post.category)}`}
          >
            {post.category}
          </Link>
          <span>/</span>
          <span>{copy("Góc nhìn từ HunpeoLabs", "Perspectives from Hunpeo Labs")}</span>
        </div>
        <div className="eyebrow tiny-rule">{post.category} · Field notes</div>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.summary}</p>
        <div className="article-meta">
          <div className="byline">
            <Avatar
              name={post.author}
              mediaId={post.authorAvatarId}
              className="dark big"
            />
            <span>
              <strong style={{ color: "var(--ink)", fontWeight: 550 }}>
                {post.author}
              </strong>
              <br />
              <span className="small">
                {date(post.publishedAt)} · {post.readingMinutes} {copy("phút đọc", "min read")}
                {!preview && <BlogViews postId={post.id} />}
                {!preview && <BlogShares postId={post.id} />}
              </span>
              {post.updatedAt !== post.publishedAt && (
                <span className="small" style={{ display: "block" }}>
                  {copy("Cập nhật", "Updated")} {date(post.updatedAt)}
                </span>
              )}
            </span>
          </div>
          {!preview && (
            <div className="flex">
              <a className="button small" href="#comments">
                <BlogIcon name="comment" size={15} />
                {copy("Bình luận", "Comments")}
              </a>
              <BlogShare postId={preview ? undefined : post.id} url={url} title={post.title} />
            </div>
          )}
        </div>
      </header>
      <div className="reading-cover">
        <Cover language={preview ? "vi" : "en"} id={post.coverId} title={post.title} loading="eager" />
      </div>
      <div className="caption">
        {post.category} · {post.author}
      </div>
      <div className="reading-layout">
        <aside className="toc" aria-label={copy("Mục lục", "Contents")}>
          <div className="eyebrow">{copy("Trong bài viết", "In this post")}</div>
          {headings.map((h, i) => (
            <a
              key={h.id}
              className={i === 0 ? "current" : ""}
              href={`#${h.id}`}
            >
              {h.text}
            </a>
          ))}
          <a href="#sources">{copy("Nguồn tham khảo", "Sources")}</a>
          {!preview && <a href="#comments">{copy("Tham gia thảo luận", "Join the discussion")}</a>}
        </aside>
        <article className="article-body">
          {post.answer && (
            <div className="insight">
              <div className="eyebrow">{copy("Ý chính", "Key takeaways")}</div>
              {post.answer}
            </div>
          )}
          <div className="article-prose" lang={post.language}>{render(post.body, "0")}</div>
          <section id="sources">
            <h2>{copy("Nguồn tham khảo", "Sources")}</h2>
            <ol>
              {post.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </section>
          <div className="article-end">
            <div className="flex" style={{ flexWrap: "wrap" }}>
              {post.tags.map((t) => (
                <Link
                  className="badge"
                  key={t}
                  href={`/resources/blog?tag=${encodeURIComponent(t)}`}
                >
                  #{t}
                </Link>
              ))}
            </div>
            {!preview && <BlogShare postId={preview ? undefined : post.id} url={url} title={post.title} />}
          </div>
          <div className="author-card">
            <Avatar
              name={post.author}
              mediaId={post.authorAvatarId}
              className="big dark"
            />
            <div>
              <div className="eyebrow muted" style={{ fontSize: 9 }}>
                {copy("Người viết", "Author")}
              </div>
              <h3>{post.author}</h3>
              <p>
                {post.authorBio ||
                  copy("Góc nhìn được chia sẻ trên HunpeoLabs Journal.", "Writing from Hunpeo Labs Journal.")}
              </p>
            </div>
          </div>
          {!preview && <Comments postId={post.id} />}
        </article>
        {!preview && (
          <aside className="side-share" aria-label={copy("Chia sẻ bài", "Share post")}>
            <span className="small">{copy("CHIA SẺ", "SHARE")}</span>
            <BlogShare postId={preview ? undefined : post.id} url={url} title={post.title} compact />
            <a
              className="icon-button"
              href="#comments"
              aria-label={copy("Đến bình luận", "Go to comments")}
            >
              <BlogIcon name="comment" size={16} />
            </a>
          </aside>
        )}
      </div>
    </main>
  );
}
