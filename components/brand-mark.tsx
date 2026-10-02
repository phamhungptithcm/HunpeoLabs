import Link from "next/link";

export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label={href === "/" ? "Hunpeo Labs home" : "Hunpeo Labs"}>
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Hunpeo Labs</span>
    </Link>
  );
}
