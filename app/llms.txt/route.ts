import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/app/seo";
import { products, services, work } from "@/content/site";

export function GET() {
  const siteUrl = getSiteUrl();
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
    "## Services",
    ...services.map(
      (service) =>
        `- ${service.name}: ${new URL(`/services/${service.slug}`, siteUrl)} — ${service.summary}`,
    ),
    "",
    "## Products",
    ...products.map(
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
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
