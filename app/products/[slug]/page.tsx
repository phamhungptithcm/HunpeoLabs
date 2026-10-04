import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { ProductDetailPage } from "@/components/product-detail-page";
import { StructuredData } from "@/components/structured-data";
import { getProductPage } from "@/content/product-pages";
import { getPublishedCatalog, getCatalogDestination, getProductChannels } from "@/content/product-catalog";
import { createCatalogProductStructuredData } from "@/lib/structured-data";
import styles from "../products.module.css";

export const dynamicParams = false;
type ProductPageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return getPublishedCatalog().map(product => ({ slug: product.id }));
}
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getPublishedCatalog().find(product => product.id === slug);
  return product ? createPageMetadata({ title: product.name, description: product.summary, path: getCatalogDestination(product) })
    : { title: "Product not found", robots: { index: false, follow: false } };
}
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getPublishedCatalog().find(product => product.id === slug);
  if (!product) notFound();
  const detail = getProductPage(slug);
  const channels = getProductChannels(product);
  return <>
    {detail ? <ProductDetailPage config={detail} /> : <main className={styles.page}>
      <section className={styles.hero}>
        <div><Link href="/products">All products</Link><p className={styles.eyebrow}>{product.category}</p><h1>{product.name}</h1></div>
        <div><p>{product.summary}</p>{product.badge && <span className={styles.badge}>{product.badge}</span>}</div>
      </section>
      <section className={styles.section}>
        <h2>About {product.name}</h2>
        <p>{product.action.kind === "summary" ? product.action.description : product.summary}</p>
        <h2>Availability</h2>
        {channels.length ? <ul>{channels.map(channel => <li key={channel.kind}><a href={channel.href}>View {product.name} on {channel.kind === "chrome-store" ? "Chrome Web Store" : channel.kind === "npm" ? "npm" : channel.kind}</a></li>)}</ul>
          : <p>Download and website links have not been confirmed. Contact HunpeoLabs for current availability.</p>}
        <Link href="/contact">Ask about {product.name} →</Link>
      </section>
    </main>}
    <StructuredData data={createCatalogProductStructuredData(product)} />
  </>;
}
