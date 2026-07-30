"use client";

import { useLayoutEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function PrinciplesMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-principles-page]");
    if (!root) return;

    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-principle]"));
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let observer: IntersectionObserver | null = null;

    const revealAll = () => {
      rows.forEach((row) => {
        row.dataset.visible = "true";
      });
    };

    root.dataset.motionEnhanced = "true";

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealAll();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const row = entry.target as HTMLElement;
            row.dataset.visible = "true";
            observer?.unobserve(row);
          });
        },
        {
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.16,
        },
      );

      rows.forEach((row) => observer?.observe(row));
    }

    const handleReducedMotion = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer?.disconnect();
      revealAll();
    };

    reducedMotion.addEventListener("change", handleReducedMotion);

    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", handleReducedMotion);
      delete root.dataset.motionEnhanced;
      rows.forEach((row) => {
        delete row.dataset.visible;
      });
    };
  }, []);

  return null;
}
