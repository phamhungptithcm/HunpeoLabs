import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { LineIcon } from "@/components/line-icon";
import { enterpriseDimensions, work } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Selected work",
  description: "Selected product and open-source work from Hunpeo Labs.",
  path: "/work",
});

const reviewLenses = [
  ["Problem context", "What gap or operating condition gives the work a reason to exist."],
  ["Decision", "What direction or boundary the work makes explicit."],
  ["Constraints", "What the current scope and maturity do not claim."],
  ["Evidence", "What can be inspected or verified in the current public description."],
  ["Current status", "How the work is described today without implying a finished outcome."],
] as const;

export default function WorkPage() {
  return (
    <main className="concept-page">
      <section className="concept-intro concept-intro--split">
        <div>
          <p className="mono">Selected work</p>
          <h1>Engineering work with its status made explicit.</h1>
        </div>
        <p>
          Product profiles explain current capabilities. Work notes focus on the
          problem, decision, evidence, and boundary that can be reviewed today.
        </p>
      </section>
      <section className="work-index work-index--concept">
        {work.map((item, index) => {
          const href = item.productSlug ? `/products/${item.productSlug}` : `/work/${item.slug}`;
          return (
          <Link href={href} key={item.slug}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="mono">{item.category}</p>
              <h2>{item.name}</h2>
              <p>{item.summary}</p>
            </div>
            <div className="work-index__action">
              <span>{item.productSlug ? "Product profile" : item.status}</span>
              <ArrowIcon />
            </div>
          </Link>
          );
        })}
      </section>
      <section className="method-section method-section--standalone">
        <header>
          <p className="mono">How to read this work</p>
          <h2>Five lenses keep description separate from proof.</h2>
        </header>
        <ol>
          {reviewLenses.map(([title, body], index) => (
            <li key={title}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="enterprise-section">
        <h2>
          Built for environments where architecture, security, evidence, and human
          responsibility matter.
        </h2>
        <div>
          <p className="mono">Enterprise dimensions</p>
          <ul>
            {enterpriseDimensions.map((dimension, index) => (
              <li key={dimension}>
                <LineIcon name={["boundary", "database", "approval", "document", "code", "rollback"][index] as "boundary" | "database" | "approval" | "document" | "code" | "rollback"} />
                {dimension}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
