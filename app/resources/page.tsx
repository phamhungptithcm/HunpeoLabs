import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";

export const metadata = createPageMetadata({
  title: "Resources",
  description: "Blog, research, open-source work, and talks from Hunpeo Labs.",
  path: "/resources",
});

const resources = [
  {
    title: "Blog",
    href: "/resources/blog",
    body: "The publishing foundation for reviewed, source-backed engineering notes.",
    available: true,
  },
  {
    title: "Research",
    href: "/resources/research",
    body: "This section will open after its first source-backed exploration is reviewed.",
    available: false,
  },
  {
    title: "Open Source",
    href: "/resources/open-source",
    body: "Verified public repositories and the engineering context behind them.",
    available: true,
  },
  {
    title: "Talks",
    href: "/resources/talks",
    body: "This section will open when verified presentation material is available.",
    available: false,
  },
] as const;

export default function ResourcesPage() {
  return (
    <main className="concept-page">
      <section className="concept-intro concept-intro--split">
        <div>
          <p className="mono">Resources</p>
          <h1>Ideas, systems, and work in the open.</h1>
        </div>
        <p>
          When substantive work is published, it should identify its author, sources,
          update history, and reason to exist.
        </p>
      </section>
      <section className="resource-rail">
        {resources.map((resource, index) =>
          resource.available ? (
            <Link href={resource.href} key={resource.href}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h2>{resource.title}</h2>
              <p>{resource.body}</p>
              <ArrowIcon />
            </Link>
          ) : (
            <article aria-label={`${resource.title} — in preparation`} key={resource.href}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h2>{resource.title}</h2>
              <p>{resource.body}</p>
              <span className="mono resource-rail__status">In preparation</span>
            </article>
          ),
        )}
      </section>
      <section className="resource-principle">
        <p className="mono">Publishing standard</p>
        <h2>Make the reasoning reusable.</h2>
        <p>
          The standard is not volume. A useful resource should help someone understand
          a system, evaluate a decision, or build from evidence that can be inspected.
        </p>
      </section>
    </main>
  );
}
