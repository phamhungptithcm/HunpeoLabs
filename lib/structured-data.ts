import { getSiteUrl, SITE_NAME } from "@/app/seo";
import { getProduct, type Product, type Service, type WorkItem } from "@/content/site";

import { getPublishedCatalog, getCatalogDestination, type CatalogProduct } from "@/content/product-catalog";

type BreadcrumbItem = {
  name: string;
  path: string;
};

function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

function organizationReference() {
  return { "@id": absoluteUrl("/#organization") };
}

export function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createServiceStructuredData(service: Service) {
  const path = `/services/${service.slug}`;
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.name,
        description: service.summary,
        serviceType: service.name,
        provider: organizationReference(),
        url,
      },
      createBreadcrumbList([
        { name: SITE_NAME, path: "/" },
        { name: "Services", path: "/services" },
        { name: service.name, path },
      ]),
    ],
  };
}

export function createProductStructuredData(product: Product) {
  const path = `/products/${product.slug}`;
  const url = absoluteUrl(path);
  const entity = product.repositoryUrl
    ? {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#software`,
        name: product.name,
        description: product.summary,
        codeRepository: product.repositoryUrl,
        creator: organizationReference(),
        url,
      }
    : {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        description: product.summary,
        brand: organizationReference(),
        url,
      };

  return {
    "@context": "https://schema.org",
    "@graph": [
      entity,
      createBreadcrumbList([
        { name: SITE_NAME, path: "/" },
        { name: "Products", path: "/products" },
        { name: product.name, path },
      ]),
    ],
  };
}

export function createWorkStructuredData(item: WorkItem) {
  const path = `/work/${item.slug}`;
  const url = absoluteUrl(path);
  const entity = item.repositoryUrl
    ? {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#software`,
        name: item.name,
        description: item.summary,
        codeRepository: item.repositoryUrl,
        creator: organizationReference(),
        url,
      }
    : {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: item.name,
        description: item.summary,
        creator: organizationReference(),
        url,
      };

  return {
    "@context": "https://schema.org",
    "@graph": [
      entity,
      createBreadcrumbList([
        { name: SITE_NAME, path: "/" },
        { name: "Work", path: "/work" },
        { name: item.name, path },
      ]),
    ],
  };
}

/** Only the catalog's public facts; no invented offers, ratings or availability. */
export function createCatalogProductStructuredData(product: CatalogProduct) {
  const path = getCatalogDestination(product);
  const url = absoluteUrl(path);
  const verifiedSource = getProduct(product.id);
  if (product.action.kind === "internal" && verifiedSource?.repositoryUrl) {
    return createProductStructuredData({ ...verifiedSource, name: product.name, summary: product.summary });
  }
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "CreativeWork", "@id": `${url}#product`, name: product.name,
      description: product.summary, url, creator: organizationReference() },
    createBreadcrumbList([{ name: SITE_NAME, path: "/" }, { name: "Products", path: "/products" }, { name: product.name, path }]),
  ] };
}
export function createCatalogStructuredData() {
  return { "@context": "https://schema.org", "@type": "CollectionPage", "@id": absoluteUrl("/products#collection"),
    name: "HunpeoLabs Products", url: absoluteUrl("/products"), publisher: organizationReference(),
    mainEntity: { "@type": "ItemList", itemListElement: getPublishedCatalog().map((product, index) => ({
      "@type": "ListItem", position: index + 1, name: product.name, url: absoluteUrl(getCatalogDestination(product)),
    })) },
  };
}
