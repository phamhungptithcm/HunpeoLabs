import { createPageMetadata } from "@/app/seo";
import { PrinciplesFlow } from "@/components/principles-flow";
import { principles } from "@/content/site";
import { PrinciplesMotion } from "./principles-motion";
import styles from "./principles.module.css";

export const metadata = createPageMetadata({
  title: "Principles",
  description: "Five simple principles that guide how Hunpeo Labs works.",
  path: "/company/principles",
});

export default function PrinciplesPage() {
  return (
    <main className={styles.page} data-principles-page>
      <section className={styles.hero} aria-labelledby="principles-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>05.1 / Principles</p>
            <h1 id="principles-title">How we work.</h1>
            <p className={styles.intro}>
              Five simple principles help us make better decisions.
            </p>
          </div>
          <PrinciplesFlow />
        </div>
      </section>

      <section className={styles.journey} aria-labelledby="principles-journey-title">
        <div className={styles.journeyInner}>
          <h2 className={styles.visuallyHidden} id="principles-journey-title">
            Five principles, one loop
          </h2>
          <p className={styles.journeyLabel} aria-hidden="true">
            Five principles / one loop
          </p>
          <div className={styles.journeyTrack}>
            <div className={styles.rail} aria-hidden="true" data-principles-rail />
            <span className={styles.railReturn} aria-hidden="true" />
            <ol className={styles.principleList}>
              {principles.map((principle, index) => (
                <li key={principle.title}>
                  <article
                    className={styles.principle}
                    data-principle
                    data-step={String(index + 1).padStart(2, "0")}
                  >
                    <div className={styles.principleLead}>
                      <span className={styles.number} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.principleCopy}>
                        <h3>{principle.title}</h3>
                        <p>{principle.body}</p>
                      </div>
                    </div>
                    <span className={styles.node} aria-hidden="true" />
                    <dl className={styles.details}>
                      <div>
                        <dt>Do</dt>
                        <dd>{principle.practice}</dd>
                      </div>
                      <div>
                        <dt>Avoid</dt>
                        <dd>{principle.avoid}</dd>
                      </div>
                    </dl>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <PrinciplesMotion />
    </main>
  );
}
