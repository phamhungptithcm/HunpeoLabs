import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/app/seo";
import { services } from "@/content/site";
import { getPublishedCatalog, getCatalogDestination } from "@/content/product-catalog";
import { listDiscoveryPosts } from "@/lib/blog/repository";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const blogPosts = await listDiscoveryPosts();
  const staticRoutes = [
    "",
    "/services",
    "/products",
    ...(blogPosts.length ? ["/resources/blog"] : []),
    "/about",
    "/careers",
    "/company/principles",
    "/contact",
    "/privacy",
  ];
  const dynamicRoutes = [
    ...services.map(({ slug }) => `/services/${slug}`),
    ...getPublishedCatalog().map(getCatalogDestination),
  ];

  const pages: MetadataRoute.Sitemap = [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
  return [...pages, ...blogPosts.map(post => {
    const changedAt = post.updatedAt || post.publishedAt;
    return { url: new URL(`/resources/blog/${post.slug}`, siteUrl).toString(),
      ...(changedAt && Number.isFinite(Date.parse(changedAt)) ? { lastModified: changedAt } : {}),
      changeFrequency: "monthly" as const, priority: 0.7 };
  })];
}
