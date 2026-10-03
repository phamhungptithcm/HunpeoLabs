import { createPageMetadata, SITE_CONTACT_EMAIL } from "@/app/seo";
import { satsunicPrivacy } from "@/content/satsunic-privacy";
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

      <section
        aria-labelledby="traffic-analytics-title"
        className="privacy-analytics"
        id="traffic-analytics"
      >
        <p className="mono">Optional measurement</p>
        <h2 id="traffic-analytics-title">Traffic analytics stays your choice.</h2>
        <div>
          <p>
            If traffic analytics is enabled and you choose Allow, Google Analytics for
            Firebase helps us understand aggregate visits, pages viewed, traffic sources,
            approximate location, and browser or device information. It may use Analytics
            cookies and a Firebase installation identifier.
          </p>
          <p>
            We do not send project brief fields, use User-ID, or enable advertising
            personalization. You can change your choice at any time through Analytics
            preferences in the footer. We review the linked property’s retention setting
            before production measurement is activated.
          </p>
        </div>
      </section>
      <section className="privacy-analytics" id="satsunic-extension" aria-labelledby="satsunic-privacy-title">
        <p className="mono">Chrome extension</p>
        <h2 id="satsunic-privacy-title">{satsunicPrivacy.title}</h2>
        <div style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <p>{satsunicPrivacy.introduction}</p>
        {satsunicPrivacy.sections.map((section) => (
          <article key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <p>For privacy questions or deletion requests, email <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.</p>
        </div>
      </section>
      {process.env.BLOG_ENABLED === 'true' && <section className="privacy-analytics" aria-labelledby="blog-privacy-title"><p className="mono">Blog accounts and discussion</p><h2 id="blog-privacy-title">Your public words, your private account.</h2><div><p>Firebase Authentication processes your email and sign-in details. A necessary session cookie keeps you signed in for up to one day. Your display name and approved comments are public; your email, account identifiers and reports are not included in public comment responses.</p><p>Comments are reviewed before publication. Editing a comment sends it back for review. Deleting a comment removes its public text and name; a placeholder may remain to preserve replies. Moderation records and backups follow our operational retention process. Contact us for account or data deletion requests.</p><p>Rate limits use per-account and shared site budgets to reduce spam; verified network identifiers may be hashed when trusted ingress is configured. Sharing buttons open the service you choose only when clicked; that service handles what you choose to publish. Article view counts use a random, tab-scoped session identifier to avoid counting reloads twice. The server stores only a keyed hash with a 24-hour expiry and an aggregate count; raw network addresses and account identities are not stored in view statistics. Separately opened tabs may count as separate views. Share totals count sharing actions from this website, including copied links; they do not verify publication on social networks. Random action identifiers are stored only as keyed hashes with a 24-hour expiry to avoid duplicate requests. We do not send comment text or account identity to traffic analytics.</p><p>For Studio editors, unsaved drafts may be kept in local storage on this device, separately for each account and article. A successful save clears the local copy. Recovery copies older than seven days are ignored and cleared when that article is opened again. They are not shared across devices.</p></div></section>}
    </main>
  );
}
