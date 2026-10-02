import Link from "next/link";
import { SITE_CONTACT_EMAIL } from "@/app/seo";
import { AnalyticsPreferencesButton } from "@/components/analytics-consent";

export function SiteFooter({ analyticsEnabled = false }: { analyticsEnabled?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__identity">
            <p className="site-footer__tagline">Digital products. AI systems. Enterprise engineering.</p>
            <address className="site-footer__address">Xóm 2, Đông Dương, Quảng Trạch, Quảng Trị 470000</address>
            <p className="site-footer__founder">Founded by <span>Hung Pham</span></p>
          </div>
          <div className="site-footer__contact">
            <div className="site-footer__direct">
              <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
              <span className="site-footer__dot" aria-hidden="true" />
              <a href="tel:+84889680497">+84 889 680 497</a>
            </div>
            <p className="site-footer__hours">Mon–Fri · 8 AM–5 PM</p>
          </div>
        </div>
        <div className="site-footer__meta">
          <span>© {new Date().getFullYear()} Hunpeo Labs</span>
          <div className="site-footer__legal">
            <Link href="/privacy">Privacy</Link>
            <AnalyticsPreferencesButton enabled={analyticsEnabled} />
          </div>
        </div>
      </div>
    </footer>
  );
}
