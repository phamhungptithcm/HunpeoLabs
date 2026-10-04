import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";
import { EngineeringSignal } from "@/components/engineering-signal";
import { CustomerAudiences } from "@/components/customer-audiences";
import { LineIcon } from "@/components/line-icon";

const servicePreview = [
  {
    name: "Launch or rebuild a digital product",
    href: "/services/web-development",
    body: "Shape a web or mobile experience around a clear user need and a maintainable delivery foundation.",
    icon: "web" as const,
  },
  {
    name: "Turn an AI prototype into a controlled system",
    href: "/services/ai-product-engineering",
    body: "Connect AI behavior to a real workflow, explicit evaluation, failure states, and human responsibility.",
    icon: "agent" as const,
  },
  {
    name: "Modernize without losing operational control",
    href: "/services/platform-modernization",
    body: "Map architecture, migration sequence, ownership, evidence, and rollback before change expands.",
    icon: "platform" as const,
  },
  {
    name: "Make a consequential technical decision reviewable",
    href: "/services/architecture-governance",
    body: "Bring dependencies, risk, decision ownership, approval, and verification into one change path.",
    icon: "document" as const,
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="hero hero--home">
        <div className="hero__copy">
          <h1>
            We design and build web, mobile, and <em>AI products.</em>
          </h1>
          <p>
            HunpeoLabs builds websites and digital tools for local shops, independent
            creators, and small businesses. Help customers understand what you offer,
            explore your work, and get in touch.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/contact">
              Start a project
              <ArrowIcon />
            </Link>
            <Link className="button button--secondary" href="/products">
              Explore our products
              <ArrowIcon />
            </Link>
          </div>
        </div>
        <EngineeringSignal />
      </section>

      <CustomerAudiences />
      <section className="home-services">
        <div className="home-services__heading">
          <p className="mono">More ways we can help</p>
          <h2>Already have a product or a system to improve?</h2>
        </div>
        <div className="home-services__list">
          {servicePreview.map((service) => (
            <Link href={service.href} key={service.name}>
              <span className="home-services__symbol" aria-hidden="true"><LineIcon name={service.icon} /></span>
              <strong>{service.name}</strong>
              <p>{service.body}</p>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
