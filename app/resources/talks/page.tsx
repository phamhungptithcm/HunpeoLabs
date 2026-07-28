import { createPageMetadata } from "@/app/seo";
import { ResourcePlaceholder } from "@/components/resource-placeholder";

export const metadata = createPageMetadata({
  title: "Talks",
  description: "Public presentations and supporting material from Hunpeo Labs.",
  path: "/resources/talks",
  index: false,
});

export default function TalksPage() {
  return (
    <ResourcePlaceholder
      description="Public presentations and supporting material will be published here when available."
      index="04.4 / Talks"
      title="Ideas built to be discussed."
    />
  );
}
