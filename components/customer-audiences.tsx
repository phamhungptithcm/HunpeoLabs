import Link from "next/link";
import { customerAudiences, audienceContactHref } from "@/content/customer-audiences";
import styles from "./customer-audiences.module.css";

export function CustomerAudiences({ examples = false }: { examples?: boolean }) {
  return <section className={styles.section} aria-labelledby={examples ? "customer-examples" : "customer-start"}>
    <div className={styles.heading}>
      <p className={styles.eyebrow}>BUILT AROUND YOUR BUSINESS</p>
      <h2 id={examples ? "customer-examples" : "customer-start"}>{examples ? "See what your website could look like." : "What would you like to make easier?"}</h2>
      <p>For local shops, independent creators, and small businesses. Start with what your customers need to do.</p>
    </div>
    <div className={styles.cards}>{customerAudiences.map((audience, index) => <article className={styles.card} key={audience.id} id={examples ? audience.id : undefined}>
      <span className={styles.number}>0{index + 1}</span>
      <h3>{audience.title}</h3><p>{audience.summary}</p>
      <ul>{audience.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul>
      <Link className={styles.action} href={examples ? audienceContactHref(audience) : `/services#${audience.id}`}>{examples ? "Tell us about your business" : "Explore this option"} <span aria-hidden="true">↗</span></Link>
    </article>)}</div>
    {examples && <>
      <div className={styles.examples}>
        <article className={styles.example}>
          <p className={styles.eyebrow}>EXAMPLE LAYOUT · LOCAL SHOP</p>
          <div className={styles.shop} aria-label="Illustrative local shop website">
            <div className={styles.demoHeader}><strong>Your local shop</strong><span>Products · Visit us</span></div>
            <h3>Find what you need.<br />Talk to someone nearby.</h3>
            <p>Introduce your shop and help customers ask about the products that interest them.</p>
            <div className={styles.products}>{["Home appliances", "Everyday essentials", "Product advice"].map((label, i) => <div key={label}><span aria-hidden="true">{["▤", "◉", "↗"][i]}</span><strong>{label}</strong></div>)}</div>
            <span className={styles.demoNote}>Your products · Your contact details · Your location</span>
          </div>
          <p>An illustrative catalogue and contact layout. We also build e-commerce websites; cart, checkout, payments, shipping, inventory integrations, hosting, and ongoing support are agreed in the project scope.</p>
          <Link href={audienceContactHref(customerAudiences[0])}>Discuss a website for your shop ↗</Link>
        </article>
        <article className={styles.example}>
          <p className={styles.eyebrow}>EXAMPLE LAYOUT · CREATIVE PORTFOLIO</p>
          <div className={styles.portfolio} aria-label="Illustrative photographer portfolio website">
            <div className={styles.demoHeader}><strong>Your name / Studio</strong><span>Work · Services · Contact</span></div>
            <h3>Your work.<br />A place of its own.</h3>
            <div className={styles.gallery} aria-hidden="true"><div /><div /><div /></div>
            <span className={styles.demoNote}>Your photographs · Your services · Enquire about a shoot</span>
          </div>
          <p>A portfolio and enquiry layout. The colour panels represent your own images; booking systems and calendar integrations need an agreed scope.</p>
          <Link href={audienceContactHref(customerAudiences[1])}>Discuss your portfolio ↗</Link>
        </article>
      </div>
      <div className={styles.scope}><h3>A clear scope before a price.</h3><p>Choose the pages and actions you need first. We then agree on the deliverables, price, and timing. Domain names, hosting, third-party services, and ongoing support are discussed separately.</p><Link href="/services/web-development">See website deliverables and handover ↗</Link></div>
    </>}
  </section>;
}
