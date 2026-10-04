import { listDiscoveryPosts } from "@/lib/blog/repository";
export const dynamic = "force-dynamic";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/app/seo";
import { services } from "@/content/site";
import {
  getPublishedCatalog,
  getCatalogDestination,
} from "@/content/product-catalog";

export async function GET() {
  const siteUrl = getSiteUrl();
  const catalog = getPublishedCatalog();
  const posts = await listDiscoveryPosts();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Primary pages",
    `- Home: ${new URL("/", siteUrl)}`,
    `- Services: ${new URL("/services", siteUrl)}`,
    `- Products: ${new URL("/products", siteUrl)}`,
    `- About: ${new URL("/about", siteUrl)}`,
    "",
    "## Blog",
    ...posts.map(
      (p) => `- ${p.title}: ${new URL(`/resources/blog/${p.slug}`, siteUrl)}`,
    ),
    "",
    "## Services",
    ...services.map(
      (service) =>
        `- ${service.name}: ${new URL(`/services/${service.slug}`, siteUrl)} — ${service.summary}`,
    ),
    "",
    "## Products",
    ...catalog.map(
      (product) =>
        `- ${product.name}: ${new URL(getCatalogDestination(product), siteUrl)} — ${product.summary}`,
    ),
    "",
    "This file is a discovery aid. It does not override robots.txt or page-level indexing directives.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
