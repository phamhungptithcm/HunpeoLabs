"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { AskHunpeoLabs } from "./ask-hunpeolabs";

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  return () => window.removeEventListener("popstate", notify);
};
const browserPathname = () => window.location.pathname;
const serverPathname = () => null;

export function askRouteMode(pathname: string | null) {
  if (!pathname || /^\/(admin|studio)(\/|$)/.test(pathname)) return null;
  return /^\/resources\/blog(\/|$)/.test(pathname) ? "icon" : "input";
}

export function AskSite({ aiAvailable = false }: { aiAvailable?: boolean }) {
  usePathname();
  // Global not-found pages can expose a fallback route through usePathname.
  // Check the actual browser URL too; Next navigation still triggers renders.
  const pathname = useSyncExternalStore(subscribe, browserPathname, serverPathname);
  const mode = askRouteMode(pathname);
  if (!mode) return null;
  // Page-scoped conversations clean up pending requests/dialogs on navigation.
  // Every blog entry begins compact, regardless of the preceding public page.
  return <AskHunpeoLabs key={pathname} aiAvailable={aiAvailable} startCollapsed={mode === "icon"} />;
}
