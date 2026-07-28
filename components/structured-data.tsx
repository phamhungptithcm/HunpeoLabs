import { serializeJsonLd } from "@/lib/structured-data";

type StructuredDataProps = {
  data: Parameters<typeof serializeJsonLd>[0];
};

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
