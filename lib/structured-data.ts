import { getSiteUrl, SITE_NAME } from "@/app/seo";
import type { Product, Service, WorkItem } from "@/content/site";

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
