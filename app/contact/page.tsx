import { createPageMetadata, SITE_CONTACT_EMAIL } from "@/app/seo";
import { ProjectBriefForm } from "@/components/project-brief-form";
import { contactDeliveryIsConfigured } from "@/lib/contact";
import { getCustomerAudience } from "@/content/customer-audiences";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Prepare a project brief for Hunpeo Labs.",
  path: "/contact",
});

const usefulContext = [
  ["Your business", "What you sell or do, and who your customers are."],
  ["Your goal", "What customers should find, understand, or do."],
  ["What you have", "Your photos, product details, existing website, and budget range."],
  ["Timing", "When you would like to start and any date we need to discuss."],
] as const;

const firstConversation = [
  ["Review", "Understand your business and the task you want to make easier."],
  ["Clarify", "Discuss the pages, content, and actions you need."],
  ["Confirm fit", "Check whether our services fit your needs and budget."],
  ["Agree on a next step", "Explain what we need before confirming scope, price, and timing."],
] as const;

export default async function ContactPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const deliveryAvailable = contactDeliveryIsConfigured();
  const audience = getCustomerAudience((await searchParams)?.audience);

  return (
    <main className="concept-page">
      <section className="contact-hero">
        <div>
          <p className="mono">Contact</p>
          <h1>
            Tell us about your business<span>.</span>
          </h1>
          <p>
            What do you do, who are your customers, and what would you like them to do
            on your website? Start with a short description; we can discuss the details together.
          </p>
          <div className="contact-direct">
            <p className="mono">Prefer email?</p>
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
            <p>
              Write to us directly, or fill in the form to prepare your project brief.
              Tell us what you need and how we can reach you.
            </p>
          </div>
        </div>
        <ProjectBriefForm key={audience?.id ?? "general"} contactEmail={SITE_CONTACT_EMAIL} deliveryAvailable={deliveryAvailable} initialProjectType={audience?.projectType} initialBrief={audience?.brief} />
      </section>
      <section className="contact-steps">
        {usefulContext.map(([title, body], index) => (
          <article key={title}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <section className="dark-discipline dark-discipline--contact">
        <h2>A useful first conversation does four things<span>.</span></h2>
        <div>
          {firstConversation.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
