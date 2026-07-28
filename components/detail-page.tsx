import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";

type DetailPageProps = {
  label: string;
  title: string;
  description: string;
  status?: string;
  problemTitle: string;
  problem: string;
  listTitle: string;
  listEyebrow?: string;
  items: string[];
  process: string[];
  processEyebrow?: string;
  contextItems?: Array<{
    title: string;
    body: string;
  }>;
};

export function DetailPage({
  label,
  title,
  description,
  status,
  problemTitle,
  problem,
  listTitle,
  listEyebrow = "What you can expect",
  items,
  process,
  processEyebrow = "How we move forward",
  contextItems = [],
}: DetailPageProps) {
  return (
    <main>
      <section className="detail-hero">
        <p className="mono detail-hero__label">{label}</p>
        <h1>{title}</h1>
        <p className="detail-hero__summary">{description}</p>
        {status ? <p className="detail-hero__status">{status}</p> : null}
      </section>
      <section className="detail-split">
        <h2>{problemTitle}</h2>
        <p>{problem}</p>
      </section>
      {contextItems.map(({ title: contextTitle, body }) => (
        <section className="detail-split" key={contextTitle}>
          <h2>{contextTitle}</h2>
          <p>{body}</p>
        </section>
      ))}
      <section className="detail-list">
        <div>
          <p className="mono">{listEyebrow}</p>
          <h2>{listTitle}</h2>
        </div>
        <ol>
          {items.map((item, index) => (
            <li key={item}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ol>
      </section>
      <section className="process-strip">
        <p className="mono">{processEyebrow}</p>
        <ol>
          {process.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
      <section className="final-cta final-cta--compact">
        <h2>Bring us the system that needs to change.</h2>
        <Link className="button button--primary" href="/contact">
          Start a project
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
