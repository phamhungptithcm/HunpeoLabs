import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";

type PageHeroProps = {
  index: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export function PageHero({ index, title, description, action }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero__index mono">{index}</div>
      <h1>{title}</h1>
      <div className="page-hero__aside">
        <p>{description}</p>
        {action ? (
          <Link className="text-link" href={action.href}>
            {action.label}
            <ArrowIcon />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
