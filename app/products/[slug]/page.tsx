import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { ProductDetailPage } from "@/components/product-detail-page";
import { StructuredData } from "@/components/structured-data";
import { getProductPage } from "@/content/product-pages";
import { getProduct, products } from "@/content/site";
import { createProductStructuredData } from "@/lib/structured-data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const product = getProduct(slug);
  return product
    ? createPageMetadata({
        title: product.name,
        description: product.summary,
        path: `/products/${slug}`,
      })
    : { title: "Product not found", robots: { index: false, follow: false } };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slug = (await params).slug;
  const product = getProduct(slug);
  const page = getProductPage(slug);
  if (!product || !page) notFound();

  return (
    <>
      <ProductDetailPage config={page} />
      <StructuredData data={createProductStructuredData(product)} />
    </>
  );
}
