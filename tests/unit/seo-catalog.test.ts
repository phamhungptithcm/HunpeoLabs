import { afterEach, expect, it, vi } from "vitest";
import { getPublishedCatalog, getCatalogDestination } from "@/content/product-catalog";
import { createCatalogStructuredData, createCatalogProductStructuredData } from "@/lib/structured-data";
vi.mock("@/lib/blog/repository", () => ({ listDiscoveryPosts: vi.fn() }));
import { listDiscoveryPosts } from "@/lib/blog/repository";
import sitemap from "@/app/sitemap";
const original = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => { if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL; else process.env.NEXT_PUBLIC_SITE_URL = original; });
it("uses every published canonical product in schema without invented offers", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://hunpeolabs.com";
  const products = getPublishedCatalog();
  expect(createCatalogStructuredData().mainEntity.itemListElement.map(item => item.url)).toEqual(products.map(p => `https://hunpeolabs.com${getCatalogDestination(p)}`));
  for (const product of products) {
    const data = JSON.stringify(createCatalogProductStructuredData(product));
    expect(data).toContain(product.name);
    expect(data).toContain(getCatalogDestination(product));
    expect(data).not.toMatch(/aggregateRating|offers/);
  }
  expect(createCatalogProductStructuredData(products[0])["@graph"][0]["@type"]).toBe("SoftwareSourceCode");
});
it("emits only real valid blog modification dates and no static fake timestamps", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://hunpeolabs.com";
  vi.mocked(listDiscoveryPosts).mockResolvedValue([
    { slug: "updated", updatedAt: "2026-10-02T10:00:00Z", publishedAt: "2026-10-01T10:00:00Z" },
    { slug: "published", updatedAt: "", publishedAt: "2026-10-01T10:00:00Z" },
    { slug: "invalid", updatedAt: "invalid" },
  ] as Awaited<ReturnType<typeof listDiscoveryPosts>>);
  const rows = await sitemap();
  expect(rows.find(row => row.url.endsWith("/updated"))?.lastModified).toBe("2026-10-02T10:00:00Z");
  expect(rows.find(row => row.url.endsWith("/published"))?.lastModified).toBe("2026-10-01T10:00:00Z");
  expect(rows.find(row => row.url.endsWith("/invalid"))?.lastModified).toBeUndefined();
  expect(rows.filter(row => !row.url.includes("/resources/blog/")).every(row => row.lastModified === undefined)).toBe(true);
});
