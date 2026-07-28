import Link from "next/link";

export function BrandMark() {
  return (
    <Link className="brand" href="/" aria-label="Hunpeo Labs home">
      <span className="brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Hunpeo Labs</span>
    </Link>
  );
}
