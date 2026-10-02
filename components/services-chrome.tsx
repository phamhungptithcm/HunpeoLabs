"use client";

import Link from "next/link";
import { NavAccount } from "@/components/nav-account";
import { StudioNavLink } from "@/components/studio-nav-link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnalyticsPreferencesButton } from "@/components/analytics-consent";
import "@/app/services/services.css";

/** Keep the approved Services shell isolated from the rest of the website. */
export function ServicesChrome({
  kind,
  children,
  analyticsEnabled = false,
}: {
  kind: "header" | "footer";
  children: ReactNode;
  analyticsEnabled?: boolean;
}) {
  const pathname = usePathname();
  if (pathname !== "/services" && !pathname.startsWith("/services/")) return children;

  if (kind === "header") {
    return (
      <div className="services-surface">
        <header className="header wrap">
          <Link className="brand" href="/">
            <span className="mark" aria-hidden="true" />Hunpeo Labs
          </Link>
          <nav className="nav" aria-label="Primary navigation">
            <Link className="active" href="/services" aria-current={pathname === "/services" ? "page" : undefined}>Services</Link>
            <Link className="secondary-link" href="/products">Products</Link>
            <Link className="secondary-link" href="/about">Company</Link>
            <StudioNavLink />
            <Link className="btn" href="/contact">Let’s talk <span aria-hidden="true">↗</span></Link>
            <NavAccount />
          </nav>
        </header>
      </div>
    );
  }

  return (
    <div className="services-surface">
      <footer>
        <div className="footer wrap">
          <Link href="/"><strong>Hunpeo Labs</strong> · Design. Engineer. Deliver.</Link>
          <span>Web · Mobile · AI · Platforms</span>
          <span>© {new Date().getFullYear()} Hunpeo Labs</span>
        </div>
        <div className="footer-legal wrap">
          <Link href="/privacy">Privacy</Link>
          <AnalyticsPreferencesButton enabled={analyticsEnabled} />
        </div>
      </footer>
    </div>
  );
}
