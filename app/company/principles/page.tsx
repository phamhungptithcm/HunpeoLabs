import { createPageMetadata } from "@/app/seo";
import { PageHero } from "@/components/page-hero";
import { principles } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Principles",
  description: "The working principles behind Hunpeo Labs.",
  path: "/company/principles",
});

export default function PrinciplesPage() {
  return (
    <main>
      <PageHero
        description="A small set of principles keeps the work focused when the systems, stakeholders, and risks become complex."
        index="05.1 / Principles"
        title="How we approach change."
      />
      <section className="principles-index">
        {principles.map((principle, index) => (
          <article key={principle.title}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <h2>{principle.title}</h2>
            <p>{principle.body}</p>
            <p>
              <strong>In practice:</strong> {principle.practice}
            </p>
            <p>
              <strong>We avoid:</strong> {principle.avoid}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
