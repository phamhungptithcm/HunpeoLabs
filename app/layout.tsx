import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MotionOrchestrator } from "@/components/motion-orchestrator";
import { StructuredData } from "@/components/structured-data";
import {
  createPageMetadata,
  DEFAULT_TITLE,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/app/seo";
import "@/styles/globals.css";

const siteUrl = getSiteUrl();
const homeMetadata = createPageMetadata({
  title: DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata: Metadata = {
  ...homeMetadata,
  metadataBase: siteUrl,
  title: {
    default: DEFAULT_TITLE,
    template: "%s — Hunpeo Labs",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": new URL("/#organization", siteUrl).toString(),
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: siteUrl.toString(),
      },
      {
        "@type": "WebSite",
        "@id": new URL("/#website", siteUrl).toString(),
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: siteUrl.toString(),
        publisher: {
          "@id": new URL("/#organization", siteUrl).toString(),
        },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html className="motion-ready" data-scroll-behavior="smooth" lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <MotionOrchestrator />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <StructuredData data={structuredData} />
      </body>
    </html>
  );
}
