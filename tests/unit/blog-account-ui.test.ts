import { beforeEach, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Actor } from "@/lib/blog/schema";
const session = vi.hoisted(() => ({ actor: null as Actor | null, checked: true }));
vi.mock("@/components/use-blog-session", () => ({ useBlogSession: () => session }));
import { NavAccount } from "@/components/nav-account";
import { SiteHeader } from "@/components/site-header";
vi.mock("next/navigation", () => ({ usePathname: () => "/resources/blog" }));
import { StudioNavLink } from "@/components/studio-nav-link";
import { BlogAccountLink } from "@/components/blog-account-link";
beforeEach(() => { session.actor = null; session.checked = true; });
it("shows login only to signed-out readers", () => {
  const entry = renderToStaticMarkup(createElement(BlogAccountLink));
  expect(entry).toContain("Sign in");
  expect(entry).toContain('aria-haspopup="dialog"');
  expect(entry).not.toContain("href=");
  expect(renderToStaticMarkup(createElement(StudioNavLink))).toBe("");
});
it("shows a reader's name/avatar and hides the intro login without granting Studio", () => {
  session.actor = { uid: "reader", verified: true, name: "Test Reader", avatar: "https://lh3.googleusercontent.com/a/test" };
  const nav = renderToStaticMarkup(createElement(NavAccount)) + renderToStaticMarkup(createElement(StudioNavLink));
  expect(nav).toContain("Test Reader");
  expect(nav).toContain('referrerPolicy="no-referrer"');
  expect(nav).not.toContain('href="/admin/blog"');
  expect(renderToStaticMarkup(createElement(BlogAccountLink))).toBe("");
});
it("shows Studio only for editorial roles and falls back for unsafe avatar URLs", () => {
  session.actor = { uid: "editor", verified: true, name: "Editor", role: "admin", avatar: "https://outside.example/avatar" };
  const nav = renderToStaticMarkup(createElement(NavAccount)) + renderToStaticMarkup(createElement(StudioNavLink));
  expect(nav).toContain('href="/admin/blog"');
  expect(nav).not.toContain("outside.example");
  expect(nav).not.toContain("<img");
});

it("places the signed-in account after the project CTA outside navigation", () => {
  session.actor = { uid: "reader", verified: true, name: "Test Reader" };
  const header = renderToStaticMarkup(createElement(SiteHeader));
  expect(header.indexOf('aria-haspopup="dialog"')).toBeGreaterThan(header.indexOf("Start a project"));
  expect(header.indexOf('aria-haspopup="dialog"')).toBeGreaterThan(header.indexOf("</nav>"));
  expect(header).not.toContain('href="/blog-account"');
});
