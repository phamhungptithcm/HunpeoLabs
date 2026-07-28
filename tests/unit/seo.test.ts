import { afterEach, describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { createPageMetadata, getSiteUrl, isIndexableDeployment } from "@/app/seo";
import sitemap from "@/app/sitemap";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalVercelEnv = process.env.VERCEL_ENV;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  restoreEnvironment("NEXT_PUBLIC_SITE_URL", originalSiteUrl);
  restoreEnvironment("VERCEL_ENV", originalVercelEnv);
});

describe("SEO discovery contract", () => {
  it("normalizes a valid site URL and rejects insecure public origins", () => {
    expect(getSiteUrl("https://example.com/base?query=1#hash").toString()).toBe(
      "https://example.com/",
    );
    expect(getSiteUrl("http://localhost:3000").toString()).toBe("http://localhost:3000/");
    expect(() => getSiteUrl("http://example.com")).toThrow(/must use HTTPS/);
  });

  it("only enables indexing for an explicit HTTPS production deployment", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.VERCEL_ENV = "preview";
    expect(isIndexableDeployment()).toBe(false);

    process.env.VERCEL_ENV = "production";
    expect(isIndexableDeployment()).toBe(true);
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(isIndexableDeployment()).toBe(false);
  });

  it("creates canonical page-specific social metadata", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.VERCEL_ENV = "production";

    const metadata = createPageMetadata({
      title: "Web Development",
      description: "A page-specific description.",
      path: "/services/web-development/",
    });

    expect(metadata.alternates).toEqual({ canonical: "/services/web-development" });
    expect(metadata.openGraph).toMatchObject({
      title: "Web Development",
      description: "A page-specific description.",
      url: "/services/web-development",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Web Development",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("keeps placeholder content non-indexable in every environment", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.VERCEL_ENV = "production";

    const metadata = createPageMetadata({
      title: "Blog",
      description: "A placeholder.",
      path: "/resources/blog",
      index: false,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("keeps robots and sitemap aligned with the production URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.VERCEL_ENV = "production";

    expect(robots()).toMatchObject({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://example.com/sitemap.xml",
      host: "https://example.com",
    });

    const urls = sitemap().map(({ url }) => url);
    expect(urls).toContain("https://example.com/");
    expect(urls).toContain("https://example.com/resources/open-source");
    expect(urls).not.toContain("https://example.com/resources/blog");
    expect(urls).not.toContain("https://example.com/resources/research");
    expect(urls).not.toContain("https://example.com/resources/talks");
    expect(urls).not.toContain("https://example.com/work/ai-agent-kit");
    expect(urls).not.toContain("https://example.com/work/incov");
    expect(urls).toContain("https://example.com/work/gig");
  });
});
