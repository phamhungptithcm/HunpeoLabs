import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { DetailPage } from "@/components/detail-page";
import { StructuredData } from "@/components/structured-data";
import { getService, services } from "@/content/site";
import { createServiceStructuredData } from "@/lib/structured-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const service = getService(slug);
  return service
    ? createPageMetadata({
        title: service.name,
        description: service.summary,
        path: `/services/${slug}`,
      })
    : { title: "Service not found", robots: { index: false, follow: false } };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = getService((await params).slug);
  if (!service) notFound();

  return (
    <>
      <DetailPage
        contextItems={[
          { title: "Choose this service when", body: service.bestFor },
          { title: "Engagement boundary", body: service.boundary },
          { title: "Intended engagement output", body: service.outcome },
        ]}
        description={service.summary}
        items={service.deliverables}
        label="Service"
        listEyebrow="Typical engagement outputs"
        listTitle="Concrete artifacts for the scoped change."
        problem={service.problem}
        problemTitle="The situation this service addresses"
        process={service.process}
        processEyebrow="Delivery path"
        title={service.name}
      />
      <StructuredData data={createServiceStructuredData(service)} />
    </>
  );
}
