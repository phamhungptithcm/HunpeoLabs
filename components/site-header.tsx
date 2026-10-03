"use client";

import { ProgressLink as Link } from "@/components/progress-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/arrow-icon";
import { BrandMark } from "@/components/brand-mark";

import { NavAccount } from "@/components/nav-account";
import { StudioNavLink } from "@/components/studio-nav-link";

const SCROLLED_THRESHOLD = 20;
const COMPACT_SCROLL_END = 140;

const navigation = [
  ["Services", "/services"],
  ["Products", "/products"],
  ["Blog", "/resources/blog"],
  ["About", "/about"],
  ["Careers", "/careers"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let previousProgress = -1;

    function updateScrolledState() {
      frame = null;
      // Keep open mobile navigation targets still while the page scrolls.
      if (open) return;
      const nextScrolled = window.scrollY > SCROLLED_THRESHOLD;
      const progress = reducedMotion.matches
        ? Number(nextScrolled)
        : Math.min(1, Math.max(0,
          (window.scrollY - SCROLLED_THRESHOLD) /
            (COMPACT_SCROLL_END - SCROLLED_THRESHOLD),
        ));
      if (progress !== previousProgress) {
        headerRef.current?.style.setProperty("--header-scroll-progress", String(progress));
        previousProgress = progress;
      }
      if (nextScrolled === scrolledRef.current) return;

      scrolledRef.current = nextScrolled;
      setScrolled(nextScrolled);
    }

    function scheduleUpdate() {
      if (frame === null) frame = window.requestAnimationFrame(updateScrolledState);
    }

    updateScrolledState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    reducedMotion.addEventListener("change", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <header
      className="site-header"
      data-menu-open={open}
      data-scrolled={scrolled}
      ref={headerRef}
    >
      <div className="site-header__inner">
        <BrandMark />
        <nav
          className="site-nav"
          data-open={open}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {navigation.map(([label, href]) => (
            <Link
              aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <StudioNavLink onNavigate={() => setOpen(false)} />
        </nav>
        <div className="header-actions">
          <Link className="button button--primary header-cta" href="/contact">
            Start a project
            <ArrowIcon />
          </Link>
          <NavAccount onNavigate={() => setOpen(false)} />
          <button
            aria-controls="primary-navigation"
            aria-expanded={open}
            className="menu-button"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span className="menu-button__lines" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
