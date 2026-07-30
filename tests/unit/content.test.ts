import { describe, expect, it } from "vitest";
import {
  getProduct,
  getService,
  getWork,
  principles,
  products,
  services,
  work,
} from "@/content/site";

describe("public content registry", () => {
  it("uses unique slugs for every page family", () => {
    for (const collection of [services, products, work]) {
      expect(new Set(collection.map(({ slug }) => slug)).size).toBe(collection.length);
    }
  });

  it("contains the approved service and product scope", () => {
    expect(services.map(({ slug }) => slug)).toEqual([
      "web-development",
      "mobile-app-development",
      "ai-agent-development",
      "ai-product-engineering",
      "platform-modernization",
      "architecture-governance",
    ]);
    expect(products.map(({ slug }) => slug)).toEqual(["ai-agent-kit", "incov", "gig"]);
  });

  it("publishes only verified public repository links", () => {
    expect(getProduct("ai-agent-kit")?.repositoryUrl).toBe(
      "https://github.com/phamhungptithcm/ai-agent-kit",
    );
    expect(getWork("gig")?.repositoryUrl).toBe("https://github.com/phamhungptithcm/gig");
    expect(getProduct("gig")?.repositoryUrl).toBe(
      "https://github.com/phamhungptithcm/gig",
    );
    expect(getProduct("incov")?.repositoryUrl).toBeUndefined();
  });

  it("resolves known content and rejects unknown slugs", () => {
    expect(getService("web-development")?.name).toBe("Web Development");
    expect(getProduct("incov")?.name).toBe("IncOv");
    expect(getWork("gig")?.name).toBe("Gig");
    expect(getService("unknown")).toBeUndefined();
  });

  it("gives every service a distinct fit, boundary, and intended output", () => {
    for (const field of ["bestFor", "boundary", "outcome"] as const) {
      const values = services.map((service) => service[field]);
      expect(values.every(Boolean)).toBe(true);
      expect(new Set(values).size).toBe(services.length);
    }
    expect(getService("ai-agent-development")?.boundary).toMatch(/AI Product Engineering/);
    expect(getService("ai-product-engineering")?.boundary).toMatch(/AI Agent Development/);
    expect(getService("platform-modernization")?.boundary).toMatch(/modernization/);
    expect(getService("architecture-governance")?.boundary).toMatch(/decision ownership/);
  });

  it("keeps product intent canonical when work lacks independent case-study evidence", () => {
    expect(getWork("ai-agent-kit")?.productSlug).toBe("ai-agent-kit");
    expect(getWork("incov")?.productSlug).toBe("incov");
    expect(getWork("gig")?.productSlug).toBe("gig");
    expect(products.every(({ audience, purpose, boundary }) => audience && purpose && boundary)).toBe(
      true,
    );
  });

  it("makes the principles page the detailed source for operating practices", () => {
    expect(principles).toHaveLength(5);
    expect(principles.map(({ title }) => title)).toEqual([
      "See the real system",
      "Make risk visible",
      "Start small",
      "Prove it works",
      "Scale with care",
    ]);
    expect(principles.every(({ body, practice, avoid }) => body && practice && avoid)).toBe(true);
    expect(JSON.stringify(principles)).not.toMatch(/—|--/);
  });
});
