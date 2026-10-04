import { describe, expect, it } from "vitest";
import { services } from "@/content/site";
import { getPublishedCatalog, getCatalogDestination } from "@/content/product-catalog";
import { articleServiceIds, serviceDiscovery } from "@/content/service-discovery";

describe("service buyer guidance", () => {
  it("covers every existing service without introducing orphan service records", () => {
    expect(Object.keys(serviceDiscovery).sort()).toEqual(services.map(service => service.slug).sort());
    for (const service of services) {
      const guidance = serviceDiscovery[service.slug];
      expect(guidance.questions.length).toBeGreaterThan(0);
      expect(new Set(guidance.questions.map(item => item.question)).size).toBe(guidance.questions.length);
      expect(guidance.questions.every(item => item.question.trim() && item.answer.trim())).toBe(true);
    }
  });
  it("links only to currently published canonical products", () => {
    const catalog = getPublishedCatalog();
    for (const guidance of Object.values(serviceDiscovery)) {
      for (const id of guidance.productIds) {
        const product = catalog.find(item => item.id === id);
        expect(product, `unknown or unpublished product ${id}`).toBeDefined();
        expect(getCatalogDestination(product!)).toBe(`/products/${id}`);
      }
    }
  });
  it("matches existing AI articles to real services without assigning unrelated articles", () => {
    for (const ids of Object.values(articleServiceIds)) {
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.every(id => services.some(service => service.slug === id))).toBe(true);
    }
    expect(articleServiceIds["unrelated-article"]).toBeUndefined();
  });
});
