import Link from "next/link";
import { SITE_CONTACT_EMAIL } from "@/app/seo";
import { BrandMark } from "@/components/brand-mark";
import { AnalyticsPreferencesButton } from "@/components/analytics-consent";

const footerLinks = [
  ["Services", "/services"],
  ["Products", "/products"],
  ["Blog", "/resources/blog"],
  ["About", "/about"],
  ["Careers", "/careers"],
] as const;

export function SiteFooter({ analyticsEnabled = false }: { analyticsEnabled?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <BrandMark />
        <nav aria-label="Footer navigation">
          {footerLinks.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="site-footer__meta">
        <span>Digital products. AI systems. Enterprise engineering.</span>
        <div>
          <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
          <Link href="/privacy">Privacy</Link>
          <AnalyticsPreferencesButton enabled={analyticsEnabled} />
          <span>© {new Date().getFullYear()} Hunpeo Labs</span>
        </div>
      </div>
    </footer>
  );
}
