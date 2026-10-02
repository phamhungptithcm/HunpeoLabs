"use client";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";

export function BlogFeedTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <section id="latest" className="blog-feed" aria-busy={pending} data-pending={pending} onClickCapture={(event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[data-blog-category]");
      if (!link || link.target || link.hasAttribute("download")) return;
      event.preventDefault();
      startTransition(() => router.push(link.getAttribute("href")!, { scroll: false }));
    }}>
      {children}
      <span className="sr-only" role="status">{pending ? "Loading posts…" : ""}</span>
    </section>
  );
}
