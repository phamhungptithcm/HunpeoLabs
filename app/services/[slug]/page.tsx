import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/app/seo";
import { ServicesDetail } from "@/components/services-content";
import { StructuredData } from "@/components/structured-data";
import { getService, services } from "@/content/site";
import { createServiceStructuredData } from "@/lib/structured-data";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

// The catalog is finite. Reject unknown routes before a loading boundary can
// stream a successful response status.
export const dynamicParams = false;

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
      <ServicesDetail service={service} />
      <StructuredData data={createServiceStructuredData(service)} />
    </>
  );
}
