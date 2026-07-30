import { createPageMetadata, SITE_CONTACT_EMAIL } from "@/app/seo";
import { PrivacySignal } from "@/components/privacy-signal";
import { readContactDeliveryConfig } from "@/lib/contact";

export const metadata = createPageMetadata({
  title: "Privacy",
  description:
    "A simple explanation of how Hunpeo Labs uses the information you choose to share.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const contactDelivery = readContactDeliveryConfig();

  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero__copy">
          <p className="mono">Privacy / 01</p>
          <h1>
            <span className="privacy-hero__line">Privacy,</span>
            {" "}
            <span className="privacy-hero__line">
              without the maze<span className="privacy-hero__period">.</span>
            </span>
          </h1>
          <p className="privacy-hero__description">
            <span>Share only what you’re comfortable with.</span>
            {" "}
            <span>We’ll keep it to the conversation you started.</span>
          </p>
        </div>
        <PrivacySignal />
      </section>

      <section className="privacy-statements" aria-labelledby="privacy-statements-title">
        <h2 className="privacy-visually-hidden" id="privacy-statements-title">
          How we handle what you share
        </h2>
        <div className="privacy-statements__rail" aria-hidden="true" />
        <article>
          <span className="privacy-statement__number mono">01</span>
          <p className="privacy-statement__label mono">When you reach out</p>
          <p>We use what you share to understand your needs and get back to you.</p>
        </article>
        <article>
          <span className="privacy-statement__number mono">02</span>
          <p className="privacy-statement__label mono">Nothing more</p>
          <p>We don’t sell your information or use it to target ads.</p>
        </article>
        <article>
          <span className="privacy-statement__number mono">03</span>
          <p className="privacy-statement__label mono">Still curious?</p>
          <p>
            Talk to us at{" "}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
        </article>
        {contactDelivery ? (
          <aside className="privacy-provider">
            <p className="mono">Project briefs</p>
            <p>
              Project briefs are delivered through {contactDelivery.providerName}.
            </p>
            <p>{contactDelivery.retentionNotice}</p>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
