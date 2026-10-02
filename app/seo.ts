import type { Metadata } from "next";

const LOCAL_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "Hunpeo Labs";
export const SITE_CONTACT_EMAIL = "support@hunpeolabs.com";
export const SITE_DESCRIPTION =
  "Hunpeo Labs designs and builds web, mobile, and AI products with product taste, engineering depth, and responsible AI.";
export const DEFAULT_TITLE =
  "Hunpeo Labs — Digital products, AI systems, enterprise engineering";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`SEO path must start with "/": ${path}`);
  }
  return path === "/" ? path : path.replace(/\/+$/, "");
}

export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): URL {
  const url = new URL(value ?? LOCAL_SITE_URL);
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  if (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS, except for localhost development.");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

export function isIndexableDeployment(): boolean {
  const siteUrl = getSiteUrl();
  const explicitProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return explicitProduction && siteUrl.protocol === "https:";
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataInput): Metadata {
  const canonicalPath = normalizePath(path);
  const shouldIndex = index && isIndexableDeployment();

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: canonicalPath,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
    },
  };
}
