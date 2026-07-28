import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { ServiceVisual } from "@/components/service-visual";
import { services } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Services",
  description:
    "Web, mobile, AI-agent, product, platform modernization, architecture, and governance services from Hunpeo Labs.",
  path: "/services",
});

const groups = [
  {
    index: "01",
    title: "Digital Products",
    type: "digital" as const,
    body: "Websites, SaaS platforms, and mobile apps designed around real users and business outcomes.",
    slugs: ["web-development", "mobile-app-development"],
  },
  {
    index: "02",
    title: "AI Systems",
    type: "ai" as const,
    body: "Agents, copilots, and intelligent workflows built with evaluation, evidence, and human control.",
    slugs: ["ai-agent-development", "ai-product-engineering"],
  },
  {
    index: "03",
    title: "Enterprise Engineering",
    type: "enterprise" as const,
    body: "Architecture and platforms that help organizations modernize without losing operational control.",
    slugs: ["platform-modernization", "architecture-governance"],
  },
] as const;

export default function ServicesPage() {
  return (
    <main className="concept-page">
      <section className="concept-intro">
        <h1>Engineering services for product and platform change</h1>
        <span aria-hidden="true" />
        <p>
          Select the engagement by the decision, workflow, or system boundary that
          needs to become clearer.
        </p>
      </section>
      <section className="service-catalog">
        {groups.map((group) => (
          <article key={group.title}>
            <div className="service-catalog__label">
              <span className="mono">{group.index}</span>
              <strong>{group.title}</strong>
            </div>
            <ServiceVisual type={group.type} />
            <h2>{group.title}</h2>
            <p>{group.body}</p>
            <ul>
              {services
                .filter((service) => group.slugs.includes(service.slug as never))
                .map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`}>
                      {service.name}
                      <ArrowIcon />
                    </Link>
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="method-section method-section--standalone">
        <header>
          <p className="mono">Choose by situation</p>
          <h2>Six services with distinct starting conditions.</h2>
        </header>
        <ol>
          {services.map((service, index) => (
            <li key={service.slug}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>
                <Link href={`/services/${service.slug}`}>{service.name}</Link>
              </h3>
              <p>{service.bestFor}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
