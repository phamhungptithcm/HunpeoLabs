"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/arrow-icon";
import { BrandMark } from "@/components/brand-mark";

const SCROLLED_THRESHOLD = 20;

const navigation = [
  ["Services", "/services"],
  ["Products", "/products"],
  ["Work", "/work"],
  ["Resources", "/resources"],
  ["About", "/about"],
  ["Careers", "/careers"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    function updateScrolledState() {
      const nextScrolled = window.scrollY > SCROLLED_THRESHOLD;
      if (nextScrolled === scrolledRef.current) return;

      scrolledRef.current = nextScrolled;
      setScrolled(nextScrolled);
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  return (
    <header
      className="site-header"
      data-menu-open={open}
      data-scrolled={scrolled}
    >
      <div className="site-header__inner">
        <BrandMark />
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
        </nav>
        <Link className="button button--primary header-cta" href="/contact">
          Start a project
          <ArrowIcon />
        </Link>
      </div>
    </header>
  );
}
