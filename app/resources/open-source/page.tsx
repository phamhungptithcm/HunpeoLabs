import Link from "next/link";
import { createPageMetadata } from "@/app/seo";
import { ArrowIcon } from "@/components/arrow-icon";
import { PageHero } from "@/components/page-hero";
import { products, work } from "@/content/site";

export const metadata = createPageMetadata({
  title: "Open Source",
  description: "Open-source engineering work from Hunpeo Labs.",
  path: "/resources/open-source",
});

export default function OpenSourcePage() {
  const aiAgentKit = products[0];
  const gig = work.find((item) => item.slug === "gig")!;
  const items = [
    {
      href: `/products/${aiAgentKit.slug}`,
      repositoryUrl: aiAgentKit.repositoryUrl,
      name: aiAgentKit.name,
      summary:
        "Inspect the governed workflow concepts behind repository-aware agents, including authorization, evidence, repository intelligence, and memory boundaries.",
      status: aiAgentKit.maturity,
      focus: aiAgentKit.capabilities,
    },
    {
      href: `/work/${gig.slug}`,
      repositoryUrl: gig.repositoryUrl,
      name: gig.name,
      summary:
        "Inspect a release-intelligence exploration centered on traceability from source change to production truth.",
      status: gig.status,
      focus: gig.evidence,
    },
  ];

  return (
    <main>
      <PageHero
        description="Reusable engineering foundations and focused experiments developed in the open."
        index="04.3 / Open Source"
        title="Engineering that can be inspected."
      />
      <section className="index-list">
        {items.map((item, index) => (
          <Link href={item.repositoryUrl ?? item.href} key={item.name}>
            <span className="mono">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{item.name}</h2>
              <p>{item.summary}</p>
              <p className="mono">{item.status}</p>
              <p>Inspectable focus: {item.focus.join(", ")}.</p>
              <p className="mono">
                {item.repositoryUrl ? "View verified public repository" : "Repository link pending verification"}
              </p>
            </div>
            <ArrowIcon />
          </Link>
        ))}
      </section>
    </main>
  );
}
