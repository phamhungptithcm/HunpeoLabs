import { afterEach, describe, expect, it } from "vitest";
import { products, services, work } from "@/content/site";
import {
  createProductStructuredData,
  createServiceStructuredData,
  createWorkStructuredData,
  serializeJsonLd,
} from "@/lib/structured-data";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("source-verified structured data", () => {
  it("links a service and its breadcrumb to the canonical organization graph", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const data = createServiceStructuredData(services[0]);

    expect(data["@graph"][0]).toMatchObject({
      "@type": "Service",
      "@id": "https://example.com/services/web-development#service",
      name: "Web Development",
      provider: { "@id": "https://example.com/#organization" },
      url: "https://example.com/services/web-development",
    });
    expect(data["@graph"][1]).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Hunpeo Labs", item: "https://example.com/" },
        { position: 2, name: "Services", item: "https://example.com/services" },
        {
          position: 3,
          name: "Web Development",
          item: "https://example.com/services/web-development",
        },
      ],
    });
  });

  it("uses a verified repository only when one exists", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const openSourceProduct = createProductStructuredData(products[0]);
    const validationProduct = createProductStructuredData(products[1]);
    const openWork = createWorkStructuredData(work.find((item) => item.slug === "gig")!);

    expect(openSourceProduct["@graph"][0]).toMatchObject({
      "@type": "SoftwareSourceCode",
      codeRepository: "https://github.com/phamhungptithcm/ai-agent-kit",
    });
    expect(validationProduct["@graph"][0]).toMatchObject({
      "@type": "Product",
      name: "IncOv",
    });
    expect(validationProduct["@graph"][0]).not.toHaveProperty("codeRepository");
    expect(openWork["@graph"][0]).toMatchObject({
      "@type": "SoftwareSourceCode",
      codeRepository: "https://github.com/phamhungptithcm/gig",
    });
  });

  it("escapes markup-significant characters in JSON-LD", () => {
    expect(serializeJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });
});
