import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";
import { PageHero } from "@/components/page-hero";

type ResourcePlaceholderProps = {
  index: string;
  title: string;
  description: string;
};

export function ResourcePlaceholder({
  index,
  title,
  description,
}: ResourcePlaceholderProps) {
  return (
    <main>
      <PageHero description={description} index={index} title={title} />
      <section className="empty-editorial">
        <p className="mono">Publication status</p>
        <h2>Thoughtful work takes a little time.</h2>
        <p>
          This section is ready for practical, source-backed ideas. We will publish the
          first entry after it has been reviewed.
        </p>
        <Link className="text-link" href="/resources">
          Back to resources
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
