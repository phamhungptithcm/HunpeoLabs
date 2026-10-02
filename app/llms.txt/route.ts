import { listDiscoveryPosts } from "@/lib/blog/repository";
export const dynamic = "force-dynamic";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/app/seo";
import { products, services, work } from "@/content/site";
import {
  getPublishedCatalog,
  getCatalogDestination,
} from "@/content/product-catalog";

export async function GET() {
  const siteUrl = getSiteUrl();
  const catalog = getPublishedCatalog();
  const catalogDestinations = new Set(catalog.map(getCatalogDestination));
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
    `- Selected work: ${new URL("/work", siteUrl)}`,
    `- Open source: ${new URL("/resources/open-source", siteUrl)}`,
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
    "## Existing engineering product profiles",
    ...products
      .filter(
        (product) => !catalogDestinations.has(`/products/${product.slug}`),
      )
      .map(
        (product) =>
          `- ${product.name}: ${new URL(`/products/${product.slug}`, siteUrl)} — ${product.summary}`,
      ),
    "",
    "## Source-verified open work",
    ...work
      .filter((item) => item.repositoryUrl)
      .map((item) => `- ${item.name}: ${item.repositoryUrl} — ${item.summary}`),
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
