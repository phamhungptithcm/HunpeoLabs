import { GoogleOneTap } from "@/components/google-one-tap";
import { ActionProgress } from "@/components/action-progress";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MotionOrchestrator } from "@/components/motion-orchestrator";
import { StructuredData } from "@/components/structured-data";
import { AnalyticsConsent } from "@/components/analytics-consent";
import type { FirebaseAnalyticsConfigInput } from "@/lib/firebase-analytics";
import {
  createPageMetadata,
  DEFAULT_TITLE,
  getSiteUrl,
  SITE_CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/app/seo";
import "@/styles/globals.css";
import "@/styles/blog-design.css";
import { BlogChrome } from "@/components/blog-admin/chrome";

const siteUrl = getSiteUrl();
const firebaseAnalyticsConfig = {
  enabled: process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} satisfies FirebaseAnalyticsConfigInput;
const firebaseAnalyticsEnabled =
  firebaseAnalyticsConfig.enabled === "true" &&
  Boolean(
    firebaseAnalyticsConfig.apiKey &&
    firebaseAnalyticsConfig.appId &&
    firebaseAnalyticsConfig.projectId &&
    firebaseAnalyticsConfig.measurementId,
  );
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": new URL("/#organization", siteUrl).toString(),
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        email: `mailto:${SITE_CONTACT_EMAIL}`,
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
        <ActionProgress />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <BlogChrome>
          <SiteHeader />
        </BlogChrome>
        <GoogleOneTap />
        <MotionOrchestrator />
        <div id="main-content">{children}</div>
        <BlogChrome>
          <SiteFooter analyticsEnabled={firebaseAnalyticsEnabled} />
        </BlogChrome>
        <StructuredData data={structuredData} />
        <AnalyticsConsent config={firebaseAnalyticsConfig} />
      </body>
    </html>
  );
}
