import { createPageMetadata } from "@/app/seo";
import { ResourcePlaceholder } from "@/components/resource-placeholder";

export const metadata = createPageMetadata({
  title: "Research",
  description:
    "Source-backed explorations of governed AI, architecture, evidence, and operational systems.",
  path: "/resources/research",
  index: false,
});

export default function ResearchPage() {
  return (
    <ResourcePlaceholder
      description="Source-backed explorations of governed AI, architecture, evidence, and operational systems."
      index="04.2 / Research"
      title="Questions worth examining deeply."
    />
  );
}
