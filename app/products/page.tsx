import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { ProductCatalogVisual } from "@/components/product-catalog-visual";
import { catalogDescription, getCatalogDestination, getCatalogGroups, type CatalogProduct, type ProductChannel } from "@/content/product-catalog";
import { StructuredData } from "@/components/structured-data";
import { createCatalogStructuredData } from "@/lib/structured-data";
import styles from "./products.module.css";

export const metadata = createPageMetadata({ title: "Products", description: catalogDescription, path: "/products" });

function ChannelControl({ channel, className, label, children }: { channel: ProductChannel; className: string; label: string; children: ReactNode }) {
  if (channel.state === "verified") return <a className={className} href={channel.href} aria-label={label}>{children}</a>;
  return <button type="button" className={className} disabled aria-label={label}>{children}</button>;
}

function ProductAction({ product }: { product: CatalogProduct }) {
  const channels = product.channels ?? [];
  const stores = channels.filter(({ kind }) => kind === "app-store" || kind === "google-play")
    .toSorted((a, b) => Number(a.kind === "google-play") - Number(b.kind === "google-play"));
  return <div className={styles.actions}>
    {channels.filter(({ kind }) => kind !== "app-store" && kind !== "google-play").map((channel) => {
      const primary = channel.kind === "npm" || channel.kind === "chrome-store";
      const label = channel.kind === "npm" ? "View on npm" : channel.kind === "chrome-store" ? "View in Chrome Web Store" : "Visit website";
      return <ChannelControl key={channel.kind} channel={channel} className={`${styles.channelLink} ${primary ? styles.primaryChannel : ""}`} label={`${label} — ${product.name}`}>
        {channel.kind === "npm" && <span className={styles.npmMark} aria-hidden="true">npm</span>}
        {channel.kind === "website" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></svg>}
        {label}<ArrowIcon />
      </ChannelControl>;
    })}
    {stores.length > 0 && <div className={styles.storeRow}>{stores.map((channel) => <ChannelControl key={channel.kind} channel={channel} className={styles.storeLink} label={`${product.name} on ${channel.kind === "app-store" ? "the App Store" : "Google Play"}`}>
      <Image unoptimized src={`/images/product-channels/${channel.kind === "app-store" ? "app-store.svg" : "google-play.png"}`} width={channel.kind === "app-store" ? 120 : 153} height={channel.kind === "app-store" ? 40 : 59} alt={channel.kind === "app-store" ? "Download on the App Store" : "Get it on Google Play"} className={channel.kind === "app-store" ? styles.appleBadge : styles.googleBadge} />
    </ChannelControl>)}</div>}
    <Link className={styles.explore} href={getCatalogDestination(product)}>{channels.length ? "Product overview" : `Explore ${product.name}`}<ArrowIcon /></Link>
  </div>;
}

export default function ProductsPage() {
  const { featured, other } = getCatalogGroups();
  return (
    <main className={styles.page}>
      <StructuredData data={createCatalogStructuredData()} />
      <section className={styles.hero}>
        <div><span className={styles.eyebrow}>The Hunpeo Labs collection</span><h1>Real problems.<br />Purpose-built <em>products.</em></h1></div>
        <div><p>From AI engineering and search visibility to new ideas for everyday life. Explore the Hunpeo Labs collection.</p>
          <nav className={styles.jump} aria-label="Product sections">
            {featured.length > 0 && <a href="#featured">Featured products ↓</a>}
            {other.length > 0 && <a href="#more-products">{featured.length ? "More from the lab" : "Explore products"} ↓</a>}
          </nav>
        </div>
      </section>
      {featured.length > 0 && <section id="featured" className={styles.section} aria-labelledby="featured-title">
        <div className={styles.sectionTitle}><h2 id="featured-title">Featured products</h2><span>01 — Selected from the lab</span></div>
        <div className={styles.featured}>
          {featured.map((product) => <article id={product.id} className={styles.card} key={product.id}>
            <ProductCatalogVisual product={product} />
            <div className={styles.cardCopy}>
              <span className={styles.category}>{product.category}</span>
              <h3>{product.name}</h3><p>{product.summary}</p>
              {product.badge && <span className={styles.badge}>{product.badge}</span>}<ProductAction product={product} />
            </div>
          </article>)}
        </div>
      </section>}
      {other.length > 0 && <section id="more-products" className={`${styles.section} ${styles.other}`} aria-labelledby="other-title">
        <div className={styles.sectionTitle}><h2 id="other-title">{featured.length ? "More from the lab" : "Explore products"}</h2><span>{featured.length ? "02" : "01"} — Keep exploring</span></div>
        <p className={styles.otherIntro}>Different ideas. The same care in how they’re built.</p>
        {other.map((product) => <article id={product.id} className={styles.otherCard} key={product.id}>
          <ProductCatalogVisual product={product} compact />
          <div className={styles.otherCopy}><h3>{product.name}</h3><span className={styles.category}>{product.category}</span><p>{product.summary}</p></div>
          <ProductAction product={product} />
        </article>)}
      </section>}
      {!featured.length && !other.length && <p className={styles.otherIntro}>Our product collection is being updated. Get in touch to learn what we’re building.</p>}
      <section className={styles.closing}><div><h2>A problem worth building for?</h2><p>Let’s talk about your next web, mobile, or AI product.</p></div><Link className="button button--primary" href="/contact">Start a conversation<ArrowIcon /></Link></section>
    </main>
  );
}
