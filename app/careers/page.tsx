import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { SystemDiagram } from "@/components/system-diagram";

export const metadata = createPageMetadata({
  title: "Careers",
  description: "How Hunpeo Labs approaches future opportunities and working together.",
  path: "/careers",
});

const values = [
  ["Work from context", "Understand the people, constraints, and purpose before proposing a solution."],
  ["Own your decisions", "Explain trade-offs, ask for review, and stay accountable to the outcome."],
  ["Keep learning visible", "Share evidence, document what changed, and make useful lessons reusable."],
] as const;

const collaboration = [
  ["Shared context", "Start with a common understanding of the problem and its boundaries."],
  ["Clear ownership", "Know who decides, who contributes, and what outcome the work serves."],
  ["Open review", "Invite useful challenge early and make reasoning easy to inspect."],
  ["Continuous learning", "Use evidence and reflection to improve the work and the way we work."],
] as const;

export default function CareersPage() {
  return (
    <main className="concept-page">
      <section className="editorial-hero editorial-hero--careers">
        <div>
          <h1>
            Do thoughtful work with clear ownership<span>.</span>
          </h1>
          <p>
            When we collaborate, we value shared context, careful craft, open review,
            and responsibility for what the work enables.
          </p>
        </div>
        <SystemDiagram label="How we collaborate" variant="work" />
      </section>
      <section className="principle-strip">
        {values.map(([title, body], index) => (
          <article key={title}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <section className="dark-discipline dark-discipline--careers">
        <h2>How we work together<span>.</span></h2>
        <div>
          {collaboration.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="roles-row">
        <div>
          <h2>Open roles<span>.</span></h2>
          <p>No open roles are published today.</p>
        </div>
        <Link className="button button--secondary" href="/work">
          Follow our work
          <ArrowIcon />
        </Link>
      </section>
      <section className="roles-row">
        <h2>Interested in future opportunities?</h2>
        <Link className="button button--primary" href="/contact">
          Introduce yourself
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
