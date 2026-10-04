import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { SystemDiagram } from "@/components/system-diagram";
import styles from "./about.module.css";

export const metadata = createPageMetadata({
  title: "About",
  description: "Hunpeo Labs is an independent product and engineering studio founded by Hung Pham.",
  path: "/about",
});

const disciplines = [
  ["Product design", "Research, strategy, and interface design grounded in real needs."],
  ["Software engineering", "Robust software built with testing, automation, and maintainable boundaries."],
  ["AI systems", "Agents and workflows shaped by evaluation, evidence, and human control."],
  ["Enterprise architecture", "Platforms and integrations aligned to ownership and operational reality."],
] as const;

export default function AboutPage() {
  return (
    <main className="concept-page">
      <section className="editorial-hero">
        <div>
          <h1>
            About <br />Hunpeo Labs<span>.</span>
          </h1>
          <p>
            An independent product and engineering studio, founded by Hung Pham.
          </p>
          <div className={styles.founder}>
            <h2>Hung Pham — Founder</h2>
            <nav className={styles.links} aria-label="Hung Pham social profiles">
              <a href="https://www.linkedin.com/in/hunpham/">LinkedIn <ArrowIcon /></a>
              <a href="https://www.facebook.com/hawaihouu">Facebook <ArrowIcon /></a>
              <a href="https://github.com/phamhungptithcm">GitHub <ArrowIcon /></a>
            </nav>
            <a className={styles.studio} href="https://www.facebook.com/profile.php?id=61579548848441">
              Follow Hunpeo Labs on Facebook <ArrowIcon />
            </a>
          </div>
        </div>
        <SystemDiagram label="How we think" variant="thinking" />
      </section>
      <section className="about-work">
        <h2>What makes us Hunpeo Labs.</h2>
        <div className="about-work__points">
          {[
            ["Product and engineering stay together.", "We connect user needs, interface decisions, and system behavior."],
            ["Boundaries are part of the design.", "We clarify dependencies, ownership, risk, and operational limits."],
            ["AI remains accountable to people.", "We design evaluation, guardrails, and human decisions into the workflow."],
            ["Learning stays reusable.", "We preserve decisions and evidence so the next change starts with context."],
          ].map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <Link className="text-link" href="/company/principles">
          Read our operating principles
          <ArrowIcon />
        </Link>
      </section>
      <section className="dark-discipline">
        <h2>What we bring together<span>.</span></h2>
        <div>
          {disciplines.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="page-cta">
        <h2>Let&apos;s build systems that create impact<span>.</span></h2>
        <Link className="button button--primary" href="/contact">
          Start a project
          <ArrowIcon />
        </Link>
        <Link className="button button--secondary" href="/products">
          Explore our products
          <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
