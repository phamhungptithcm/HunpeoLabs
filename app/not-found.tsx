import Link from "next/link";
import { ArrowIcon } from "@/components/arrow-icon";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="mono">404 / Not found</p>
      <h1>This route is outside the system.</h1>
      <Link className="button button--primary" href="/">
        Return home
        <ArrowIcon />
      </Link>
    </main>
  );
}
