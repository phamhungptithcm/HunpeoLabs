import Link from "next/link";
import { services, type Service } from "@/content/site";

const phases = [
  ["Agree on the work", "Define deliverables, responsibilities, and what completion means."],
  ["Design the solution", "Review the experience and technical approach before the build."],
  ["Build in increments", "See working progress at the milestones agreed for your project."],
  ["Check the result", "Review the work against acceptance criteria and record limitations."],
  ["Hand over clearly", "Receive the agreed source, documentation, and release guidance."],
];

export function ServicesCta() {
  return (
    <section className="cta">
      <div>
        <span className="eyebrow">LET’S MAKE IT HAPPEN</span>
        <h2>What would you<br />like us to build?</h2>
        <p>Tell us about your idea, your users, and what a successful delivery would look like.</p>
      </div>
      <Link className="btn primary" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
    </section>
  );
}

export function ServicesDelivery({ steps }: { steps?: string[] }) {
  return (
    <section className="delivery">
      <div className="wrap">
        <span className="eyebrow">FROM FIRST CONVERSATION TO HANDOVER</span>
        <h2>Clear scope. Visible progress.<br />A practical handover.</h2>
        <div className={`steps${steps ? " compact" : ""}`}>
          {(steps ?? phases.map(([title]) => title)).map((title, index) => (
            <div className="step" key={title}>
              <small>0{index + 1}</small>
              <h3>{title}</h3>
              {!steps && <p>{phases[index][1]}</p>}
            </div>
          ))}
        </div>
        <div className="handover">
          <strong>Completion is agreed before work begins.</strong>
          <p>Launch and ongoing support are defined in the project scope.</p>
        </div>
      </div>
    </section>
  );
}

export function ServicesDetail({ service }: { service: Service }) {
  const index = services.findIndex(({ slug }) => slug === service.slug);
  const related = services.filter((_, candidate) => candidate !== index && Math.floor(candidate / 2) === Math.floor(index / 2));
  return (
    <main className="services-surface">
      <div className="detail">
        <div className="wrap">
          <div className="crumb"><Link href="/services">Services</Link> / {service.name}</div>
          <section className="hero">
            <div>
              <span className="eyebrow">0{index + 1} / {service.name.toUpperCase()}</span>
              <h1>{service.headline}</h1>
              <p>{service.summary}</p>
              <div className="actions">
                <Link className="btn primary" href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link>
                <a className="btn" href="#deliverables">What we deliver ↓</a>
              </div>
            </div>
            <aside className="deliver-summary">
              <small>THE OUTCOME</small>
              <h2>What you leave with.</h2>
              <p>{service.outcome}</p>
            </aside>
          </section>
          <section className="fit"><h2>When to bring us in.</h2><p>{service.bestFor}</p></section>
          <section className="section deliverables" id="deliverables">
            <div>
              <span className="eyebrow">WHAT WE DELIVER</span>
              <h2>Concrete work.<br />Clear handover.</h2>
              <p>We define the deliverables and acceptance criteria together before work begins.</p>
              <div className="scope"><h3>Agreed for your project.</h3><p>{service.boundary}</p></div>
            </div>
            <ol className="outputs">
              {service.deliverables.map((item, i) => <li key={item}><b>0{i + 1}</b><span>{item}</span></li>)}
            </ol>
          </section>
        </div>
        <ServicesDelivery steps={service.process} />
        <div className="wrap">
          <section className="section">
            <span className="eyebrow">FIND THE RIGHT FIT</span>
            <h2>Explore related services.</h2>
            <div className="related">
              {related.map((item) => <Link key={item.slug} href={`/services/${item.slug}`}>{item.name} ↗</Link>)}
              <Link href="/services">All services ↗</Link>
            </div>
          </section>
          <ServicesCta />
        </div>
      </div>
    </main>
  );
}
