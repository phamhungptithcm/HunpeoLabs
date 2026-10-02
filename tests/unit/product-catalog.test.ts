import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductsPage from "@/app/products/page";
import * as catalog from "@/content/product-catalog";
import { describe, expect, it, vi } from "vitest";
import { getCatalogDestination, getCatalogGroups, getProductChannels, getPublishedCatalog, productCatalog, type CatalogProduct } from "@/content/product-catalog";
import { GET } from "@/app/llms.txt/route";

vi.mock('server-only', () => ({}));

// Isolate the unrelated blog store; catalog discovery assertions use the real route.
vi.mock("@/lib/blog/repository", () => ({ listPublished: async () => ({ items: [] }), listDiscoveryPosts: async () => [] }));

const entry = (patch: Partial<CatalogProduct> = {}): CatalogProduct => ({ ...productCatalog[0], ...patch });

describe("product catalog publication", () => {
  it("publishes each owner-confirmed product once in its editorial group", () => {
    const groups = getCatalogGroups();
    expect(groups.featured.map((p) => p.name)).toEqual(["AI-Agent-Kit", "SatsunicSEO"]);
    expect(groups.other.map((p) => p.name)).toEqual(["SatsunicMec", "BeFam"]);
    expect(new Set([...groups.featured, ...groups.other].map((p) => p.id)).size).toBe(4);
  });

  it("excludes drafts and archives, supports future entries, and does not mutate input", () => {
    const entries = [entry({ id: "z-new", sortOrder: 5, featured: false }), entry({ id: "draft", publicationState: "draft" }), entry({ id: "old", publicationState: "archived" }), entry({ id: "a-new", sortOrder: 5 })];
    expect(getPublishedCatalog(entries).map((p) => p.id)).toEqual(["a-new", "z-new"]);
    expect(entries[0].id).toBe("z-new");
    expect(getCatalogGroups(entries).other[0].id).toBe("z-new");
  });

  it("handles empty, all-featured and no-featured collections", () => {
    expect(getCatalogGroups([])).toEqual({ featured: [], other: [] });
    expect(getCatalogGroups([entry()]).other).toEqual([]);
    expect(getCatalogGroups([entry({ featured: false })]).featured).toEqual([]);
  });

  it("rejects duplicate IDs, missing content and invalid destinations", () => {
    expect(() => getPublishedCatalog([entry(), entry()])).toThrow(/duplicate/);
    expect(() => getPublishedCatalog([entry({ id: "bad id" })])).toThrow(/Invalid/);
    expect(() => getPublishedCatalog([entry({ summary: " " })])).toThrow(/Incomplete/);
    expect(() => getPublishedCatalog([entry({ sortOrder: NaN })])).toThrow(/Incomplete/);
    expect(() => getPublishedCatalog([entry({ action: { kind: "summary", description: " " } })])).toThrow(/Missing/);
    expect(() => getPublishedCatalog([entry({ action: { kind: "internal", href: "/products/not-built" } })])).toThrow(/Unimplemented/);
    for (const href of ["javascript:alert(1)", "http://example.com", "https://user:pass@example.com"]) {
      expect(() => getPublishedCatalog([entry({ action: { kind: "external", href } })])).toThrow();
    }
    expect(getPublishedCatalog([entry({ action: { kind: "external", href: "https://example.com/product" } })])).toHaveLength(1);
  });

  it("uses actual catalog anchors for summaries without inventing detail routes", async () => {
    const text = await (await GET()).text();
    for (const product of getPublishedCatalog()) {
      expect(text).toContain(product.name);
      expect(text).toContain(getCatalogDestination(product));
    }
    expect(text).toContain("/products#satsunic-mec");
    expect(text).toContain("/products/incov");
    expect(text).toContain("/products/gig");

  });
});

describe("product distribution channels", () => {
  it("keeps pending URLs out of destinations without changing existing discovery", () => {
    const befam = productCatalog.find((p) => p.id === "befam")!;
    expect(getProductChannels(befam)).toEqual([]);
    expect(getCatalogDestination(productCatalog[0])).toBe("/products/ai-agent-kit");
    expect(getProductChannels(productCatalog[0])[0].href).toBe("https://www.npmjs.com/package/@hunpeolabs/ai-agent-kit");
  });

  it("rejects wrong store hosts, incomplete listings and duplicate channels", () => {
    const invalid = [
      { kind: "npm", href: "https://www.npmjs.com.evil.test/package/foo" },
      { kind: "app-store", href: "https://apps.apple.com/" },
      { kind: "google-play", href: "https://play.google.com/store/apps/details" },
      { kind: "chrome-store", href: "https://chromewebstore.google.com/detail/missing" },
      { kind: "website", href: "javascript:alert(1)" },
      { kind: "website", href: "https://user:secret@example.com" },
    ] as const;
    for (const channel of invalid) expect(() => getPublishedCatalog([entry({ channels: [{ ...channel, state: "verified" }] })])).toThrow();
    expect(() => getPublishedCatalog([entry({ channels: [{ kind: "website", state: "pending" }, { kind: "website", state: "pending" }] })])).toThrow(/Duplicate/);
  });

  it("requires open-source evidence for repository links in either action model", () => {
    for (const href of ["https://github.com/org/project", "https://www.github.com/org/project", "https://gitlab.com/org/project"]) {
      expect(() => getPublishedCatalog([entry({ action: { kind: "external", href } })])).toThrow(/open-source/);
      expect(() => getPublishedCatalog([entry({ channels: [{ kind: "website", state: "verified", href }] })])).toThrow(/open-source/);
      expect(getPublishedCatalog([entry({ openSourceEvidence: "Owner verified public repository and license", action: { kind: "external", href } })])).toHaveLength(1);
    }
  });

  it("renders future mobile channels with official badges and accessible names", () => {
    const product = entry({
      id: "future-app", name: "Future app", featured: false,
      action: { kind: "summary", description: "A future product" },
      channels: [
        { kind: "google-play", state: "verified", href: "https://play.google.com/store/apps/details?id=com.example.app" },
        { kind: "app-store", state: "verified", href: "https://apps.apple.com/us/app/example/id123456" },
        { kind: "website", state: "pending" },
      ],
    });
    getPublishedCatalog([product]);
    const spy = vi.spyOn(catalog, "getCatalogGroups").mockReturnValue({ featured: [], other: [product] });
    try {
      const html = renderToStaticMarkup(createElement(ProductsPage));
      expect(html).toContain('aria-label="Future app on the App Store"');
      expect(html).toContain('aria-label="Future app on Google Play"');
      expect(html).toContain('/images/product-channels/app-store.svg');
      expect(html).toContain('/images/product-channels/google-play.png');
      expect(html.indexOf('href="https://apps.apple.com')).toBeLessThan(html.indexOf('href="https://play.google.com'));
      expect(html).toContain("Visit website");
      expect(html).toContain('disabled=""');
      expect(html).not.toContain("Some links are not yet available.");
      expect(html).not.toContain("aria-describedby");
      expect(html).not.toContain("Explore Future app");
    } finally { spy.mockRestore(); }
  });
});
