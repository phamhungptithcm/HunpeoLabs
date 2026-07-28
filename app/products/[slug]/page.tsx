import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { DetailPage } from "@/components/detail-page";
import { StructuredData } from "@/components/structured-data";
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
  const product = getProduct((await params).slug);
  if (!product) notFound();

  return (
    <>
      <DetailPage
        contextItems={[
          { title: "Product purpose", body: product.purpose },
          { title: "Current boundary", body: product.boundary },
        ]}
        description={product.summary}
        items={product.capabilities}
        label="Hunpeo Labs product"
        listEyebrow="Current capabilities"
        listTitle="The parts of the product currently described in public."
        problem={product.audience}
        problemTitle="Who this product is for"
        process={product.flow}
        processEyebrow="Product workflow"
        status={product.maturity}
        title={product.name}
      />
      <StructuredData data={createProductStructuredData(product)} />
    </>
  );
}
