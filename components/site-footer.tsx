import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const footerLinks = [
  ["Services", "/services"],
  ["Products", "/products"],
  ["Work", "/work"],
  ["Resources", "/resources"],
  ["About", "/about"],
  ["Careers", "/careers"],
] as const;

export function SiteFooter() {
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
          <Link href="/privacy">Privacy</Link>
          <span>© {new Date().getFullYear()} Hunpeo Labs</span>
        </div>
      </div>
    </footer>
  );
}
