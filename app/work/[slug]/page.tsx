import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { DetailPage } from "@/components/detail-page";
import { StructuredData } from "@/components/structured-data";
import { getWork, work } from "@/content/site";
import { createWorkStructuredData } from "@/lib/structured-data";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return work.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const item = getWork(slug);
  if (item?.productSlug) {
    return createPageMetadata({
      title: item.name,
      description: item.summary,
      path: `/products/${item.productSlug}`,
      index: false,
    });
  }
  return item
    ? createPageMetadata({
        title: item.name,
        description: item.summary,
        path: `/work/${slug}`,
      })
    : { title: "Work not found", robots: { index: false, follow: false } };
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const item = getWork((await params).slug);
  if (!item) notFound();
  if (item.productSlug) permanentRedirect(`/products/${item.productSlug}`);

  return (
    <>
      <DetailPage
        contextItems={[{ title: "Decision lens", body: item.decision }]}
        description={item.summary}
        items={item.evidence}
        label={item.category}
        listEyebrow="Currently inspectable"
        listTitle="The evidence areas this work keeps in view."
        problem={item.context}
        problemTitle="The gap being explored"
        process={item.trace}
        processEyebrow="Trace through the work"
        status={item.status}
        title={item.name}
      />
      <StructuredData data={createWorkStructuredData(item)} />
    </>
  );
}
