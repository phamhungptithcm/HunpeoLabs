import { createPageMetadata, SITE_CONTACT_EMAIL } from "@/app/seo";
import { ProjectBriefForm } from "@/components/project-brief-form";
import { contactDeliveryIsConfigured } from "@/lib/contact";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Prepare a project brief for Hunpeo Labs.",
  path: "/contact",
});

const usefulContext = [
  ["Current system", "How it works today, its boundaries, and pain points."],
  ["Business outcome", "The impact or decision the work needs to enable."],
  ["Constraints", "Technical, regulatory, budget, timeline, or team limits."],
  ["Timing", "Target milestones, deadlines, and decision windows."],
] as const;

const firstConversation = [
  ["Review", "Start from the brief and identify the decision or system change at its center."],
  ["Clarify", "Separate verified context from assumptions, unknowns, and constraints."],
  ["Confirm fit", "Determine whether the problem matches our services and a credible scope."],
  ["Define a next decision", "Make the next useful step explicit without implying work that has not been agreed."],
] as const;

export default function ContactPage() {
  const deliveryAvailable = contactDeliveryIsConfigured();

  return (
    <main className="concept-page">
      <section className="contact-hero">
        <div>
          <p className="mono">Contact</p>
          <h1>
            Bring us the system that needs to change<span>.</span>
          </h1>
          <p>
            Tell us what you are building, where it is stuck, and what a credible next
            step needs to accomplish.
          </p>
          <div className="contact-direct">
            <p className="mono">Prefer email?</p>
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
            <p>
              Write to us directly for a project inquiry. The project brief form remains
              available only when its verified delivery channel is configured.
            </p>
          </div>
        </div>
        <ProjectBriefForm deliveryAvailable={deliveryAvailable} />
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
