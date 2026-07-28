"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = "main > section";

export function MotionOrchestrator() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );

    sections.forEach((section, index) => {
      section.classList.add("reveal-section");
      if (index === 0 || reducedMotion.matches) section.classList.add("is-visible");
    });

    if (reducedMotion.matches) {
      return () => {
        sections.forEach((section) => {
          section.classList.remove("reveal-section", "is-visible");
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("reveal-section", "is-visible");
      });
    };
  }, [pathname]);

  return <span className="motion-orchestrator" hidden />;
}
