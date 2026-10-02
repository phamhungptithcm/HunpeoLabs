import Link from "next/link";
import { createPageMetadata, SITE_CONTACT_EMAIL } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import styles from "./careers.module.css";

export const metadata = createPageMetadata({
  title: "Careers",
  description:
    "Hunpeo Labs is a one-person startup looking for people with a shared vision to build useful products together.",
  path: "/careers",
});

const values = [
  {
    label: "01 / Shared purpose",
    title: "Build things that help people.",
    body: "Care about the person using the product. Be curious about their problems and willing to change an idea when it doesn’t help.",
  },
  {
    label: "02 / Hands-on building",
    title: "Help shape it, then make it real.",
    body: "Bring your own ideas and a willingness to do the work. At this stage, deciding what to build matters as much as building it well.",
  },
  {
    label: "03 / Long-term trust",
    title: "Be someone we can count on.",
    body: "Speak honestly, make room for disagreement, and follow through. A shared vision needs trust to become shared work.",
  },
] as const;

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Find your people · Build together</p>
          <h1>A shared vision.<br />Something <em>worth building.</em></h1>
          <p className={styles.intro}>
            Hunpeo Labs is one person today. I’m looking for people who share the
            belief that thoughtful software can make everyday life better—and
            want to help shape what this becomes.
          </p>
          <div className={styles.actions}>
            <a className={styles.button} href="#connect">Let’s get to know each other <span aria-hidden="true">↓</span></a>
            <Link className={styles.textLink} href="/products">See what I’m building <ArrowIcon /></Link>
          </div>
        </div>
        <aside className={styles.studio} aria-label="Studio today: one person">
          <div className={styles.studioTop}><span>The studio today</span><span>Hunpeo Labs</span></div>
          <div className={styles.number} aria-hidden="true">01<span>.</span></div>
          <div className={styles.studioBottom}>
            <strong>Starting solo. Open to company.</strong>
            <p>The work has started.<br />The next chapter could be something we shape together.</p>
          </div>
        </aside>
      </section>
      <section className={styles.status} aria-label="Hiring status">
        <strong><span className={styles.dot} aria-hidden="true" />Looking for people who care about the same things.</strong>
        <p>There’s no advertised job opening today. This is an invitation to meet,
          compare ambitions, and explore whether there’s something we want to build together.</p>
      </section>
      <section className={styles.values}>
        <div className={styles.sectionTitle}>
          <h2>What could bring us together.</h2>
          <p>A shared direction starts with an honest conversation.</p>
        </div>
        <div className={styles.grid}>
          {values.map(({ label, title, body }) => (
            <article key={label}>
              <span className={styles.index}>{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.connect} id="connect" aria-labelledby="connect-title" tabIndex={-1}>
        <div>
          <p className={styles.eyebrow}>It starts with a conversation</p>
          <h2 id="connect-title">What do you<br />want to build?</h2>
        </div>
        <div>
          <p>Tell me what you care about, what you’d love to build, and why Hunpeo Labs
            resonates with you. Share something you’ve made or learned, if you’d like.
            Let’s see where our ideas meet.</p>
          <a className={styles.button} href={`mailto:${SITE_CONTACT_EMAIL}?subject=Hello%20Hunpeo%20Labs`}>
            Let’s talk <ArrowIcon />
          </a>
          <p className={styles.note}>We’ll talk openly about availability, responsibilities,
            and compensation or other terms before agreeing to work together.
            There’s no expectation to start work just by saying hello.</p>
        </div>
      </section>
    </main>
  );
}
