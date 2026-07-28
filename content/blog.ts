export type BlogSource = {
  title: string;
  url: string;
  publisher?: string;
};

export type BlogRelatedLink = {
  title: string;
  href: string;
  context: string;
};

export type BlogSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  answer: string;
  category: "Product Engineering" | "AI Systems" | "Platform Engineering" | "Engineering Practice";
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  status: "draft" | "reviewed";
  sections: BlogSection[];
  sources: BlogSource[];
  related: BlogRelatedLink[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isPublishableBlogPost(post: BlogPost): boolean {
  return (
    post.status === "reviewed" &&
    SAFE_SLUG.test(post.slug) &&
    hasText(post.title) &&
    hasText(post.summary) &&
    hasText(post.answer) &&
    hasText(post.author) &&
    ISO_DATE.test(post.publishedAt) &&
    Number.isInteger(post.readingMinutes) &&
    post.readingMinutes > 0 &&
    post.sections.length > 0 &&
    post.sections.every(
      (section) =>
        SAFE_SLUG.test(section.id) &&
        hasText(section.title) &&
        section.paragraphs.length > 0 &&
        section.paragraphs.every(hasText) &&
        (section.points?.every(hasText) ?? true),
    ) &&
    post.sources.length > 0 &&
    post.sources.every((source) => hasText(source.title) && isHttpUrl(source.url)) &&
    post.related.every(
      (item) =>
        hasText(item.title) &&
        hasText(item.context) &&
        item.href.startsWith("/") &&
        !item.href.startsWith("//"),
    )
  );
}

/*
 * Publication is intentionally empty until a separately reviewed content change
 * provides a verified author, date, substantive manuscript, and inspectable sources.
 */
export const blogPosts = [] satisfies readonly BlogPost[];

export function getPublishedBlogPosts(posts: readonly BlogPost[] = blogPosts): BlogPost[] {
  return posts
    .filter(isPublishableBlogPost)
    .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getPublishedBlogPost(
  slug: string,
  posts: readonly BlogPost[] = blogPosts,
): BlogPost | undefined {
  return getPublishedBlogPosts(posts).find((post) => post.slug === slug);
}
