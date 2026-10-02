import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";
import {
  ProductEvidenceVisual,
  ProductHeroVisual,
  ProductProblemVisual,
  ProductWorkflow,
} from "@/components/product-detail-visuals";
import { LineIcon } from "@/components/line-icon";
import { ProductCommand, ProductVideo } from "@/components/product-video";
import type {
  ProductPageAction,
  ProductPageConfig,
} from "@/content/product-pages";

const capabilityIcons = [
  "code",
  "document",
  "approval",
  "platform",
  "database",
] as const;

function ActionLink({
  action,
  primary = false,
}: {
  action: ProductPageAction;
  primary?: boolean;
}) {
  const className = `button ${primary ? "button--primary" : "button--secondary"}`;
  const content = (
    <>
      {action.label}
      <ArrowIcon
        direction={!action.external && action.href.startsWith("#") ? "down" : "right"}
      />
    </>
  );

  if (action.external) {
    return (
      <a className={className} href={action.href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <Link className={className} href={action.href}>
      {content}
    </Link>
  );
}

function CapabilityList({ config }: { config: ProductPageConfig }) {
  return (
    <ol className="product-capabilities__list">
      {config.capabilities.map((item, index) => (
        <li key={item.title}>
          <LineIcon name={capabilityIcons[index]} />
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </li>
      ))}
    </ol>
  );
}

function EvidenceSection({ config }: { config: ProductPageConfig }) {
  return (
    <section className="product-evidence">
      <header>
        <p className="mono">{config.evidence.eyebrow}</p>
        <h2>{config.evidence.headline}</h2>
        <p>{config.evidence.body}</p>
      </header>
      {config.slug === "gig" ? (
        <div className="product-evidence__release-path">
          <span>Review ready <i aria-hidden="true" /></span>
          <ProductHeroVisual slug={config.slug} />
        </div>
      ) : null}
      <ProductEvidenceVisual slug={config.slug} />
    </section>
  );
}

export function ProductDetailPage({ config }: { config: ProductPageConfig }) {
  return (
    <main className={`product-page product-page--${config.slug}`}>
      <section className="product-hero">
        <header className="product-hero__copy">
          <p className="mono">{config.label}</p>
          <p className="product-status">
            <span aria-hidden="true" />
            {config.status}
          </p>
          <h1>
            {config.slug === "gig" ? (
              <>
                <span>Know what changed.</span>
                <span>Know what shipped.</span>
              </>
            ) : (
              config.headline
            )}
          </h1>
          <p className="product-hero__summary">{config.summary}</p>
          <div className="product-hero__actions">
            <ActionLink action={config.primaryAction} primary />
            <ActionLink action={config.secondaryAction} />
          </div>
          <ul className="product-meta" aria-label="Product characteristics">
            {config.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </header>
        <div className="product-hero__media">
          {config.slug === "gig" ? <ProductHeroVisual slug={config.slug} /> : null}
          <ProductVideo {...config.media} slug={config.slug} />
        </div>
      </section>

      {config.command ? <ProductCommand command={config.command} /> : null}

      <section className="product-problem">
        <div>
          <p className="mono">{config.problem.eyebrow}</p>
          <h2>{config.problem.headline}</h2>
          <p>{config.problem.body}</p>
        </div>
        {config.slug === "ai-agent-kit" ? (
          <ProductWorkflow config={config} />
        ) : (
          <ProductProblemVisual slug={config.slug} />
        )}
      </section>

      {config.slug === "ai-agent-kit" ? (
        <section className="product-capabilities" id="workflow">
          <header>
            <p className="mono">02 / What it controls</p>
            <h2>Context. Permission. Proof.</h2>
          </header>
          <CapabilityList config={config} />
        </section>
      ) : null}

      {config.slug === "incov" ? (
        <section className="product-composite product-composite--incov" id="workflow">
          <div className="product-composite__flow">
            <ProductWorkflow config={config} />
          </div>
          <div className="product-composite__capabilities">
            <header>
              <p className="mono">02 / What it reuses</p>
              <h2>Resolution knowledge that compounds.</h2>
            </header>
            <CapabilityList config={config} />
          </div>
        </section>
      ) : null}

      {config.slug === "gig" ? (
        <section className="product-workflow" id="workflow">
          <header>
            <h2>From change to truth.</h2>
          </header>
          <ProductWorkflow config={config} />
        </section>
      ) : null}

      {config.slug === "incov" && config.statement ? (
        <p className="product-statement">{config.statement}</p>
      ) : null}

      <EvidenceSection config={config} />

      {config.slug === "gig" ? (
        <section className="product-capabilities">
          <header>
            <p className="mono">02 / What Gig connects</p>
          </header>
          <CapabilityList config={config} />
        </section>
      ) : null}

      {config.slug === "gig" && config.statement ? (
        <p className="product-statement">{config.statement}</p>
      ) : null}

      <section className="product-boundary">
        <header>
          <p className="mono">{config.boundary.eyebrow}</p>
          <h2>{config.boundary.headline}</h2>
          <p>{config.boundary.body}</p>
        </header>
        <div className="product-faq">
          {config.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="product-final-cta">
          <h2>{config.finalCta.headline}</h2>
          <div>
            <ActionLink action={config.finalCta.primary} primary />
            <ActionLink action={config.finalCta.secondary} />
          </div>
        </div>
      </section>
    </main>
  );
}
