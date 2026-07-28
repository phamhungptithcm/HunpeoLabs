import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/app/seo";
import { products, services, work } from "@/content/site";
import { getPublishedBlogPosts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const blogPosts = getPublishedBlogPosts();
  const staticRoutes = [
    "",
    "/services",
    "/products",
    "/work",
    "/resources",
    "/resources/open-source",
    ...(blogPosts.length ? ["/resources/blog"] : []),
    "/about",
    "/careers",
    "/company/principles",
    "/contact",
    "/privacy",
  ];
  const dynamicRoutes = [
    ...services.map(({ slug }) => `/services/${slug}`),
    ...products.map(({ slug }) => `/products/${slug}`),
    ...work.filter(({ productSlug }) => !productSlug).map(({ slug }) => `/work/${slug}`),
    ...blogPosts.map(({ slug }) => `/resources/blog/${slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
