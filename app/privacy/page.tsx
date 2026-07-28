import { createPageMetadata } from "@/app/seo";
import { PageHero } from "@/components/page-hero";
import { readContactDeliveryConfig } from "@/lib/contact";

export const metadata = createPageMetadata({
  title: "Privacy",
  description: "Privacy information for the Hunpeo Labs website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const contactDelivery = readContactDeliveryConfig();

  return (
    <main>
      <PageHero
        description="This page describes the current website behavior without claiming integrations that are not present."
        index="Legal / Privacy"
        title="A minimal, transparent website footprint."
      />
      <section className="legal-copy">
        <h2>Current website behavior</h2>
        <p>
          This version does not include account registration, payment processing,
          newsletter signup, or customer tracking.
        </p>
        {contactDelivery ? (
          <>
            <h2>Project brief delivery</h2>
            <p>
              Project briefs are sent to {contactDelivery.providerName} only after you
              submit the contact form. The form collects your name, work email, optional
              company, project type, and the brief you write.
            </p>
            <p>{contactDelivery.retentionNotice}</p>
          </>
        ) : (
          <>
            <h2>Project brief delivery</h2>
            <p>
              A verified delivery channel has not been configured. The form cannot send
              or store a project brief in this state.
            </p>
          </>
        )}
        <h2>Hosting and operational data</h2>
        <p>
          A hosting provider may process standard technical request data required to
          deliver and protect the website. Production hosting and analytics have not
          yet been selected.
        </p>
        <h2>Updates</h2>
        <p>
          This notice must be reviewed before production launch and updated whenever a
          form, analytics service, authentication system, or third-party integration is
          introduced.
        </p>
      </section>
    </main>
  );
}
