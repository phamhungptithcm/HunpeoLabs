import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableDeployment } from "@/app/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isIndexable = isIndexableDeployment();

  return {
    rules: isIndexable
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: isIndexable ? siteUrl.origin : undefined,
  };
}
