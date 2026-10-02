import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
const route = vi.hoisted(() => ({ path: "/admin/blog" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.path }));
import { BlogChrome, StudioShell } from "@/components/blog-admin/chrome";

it("shows the signed-in identity at the bottom without the duplicate workspace card", () => {
  const html = renderToStaticMarkup(createElement(StudioShell, { user: { name: "Test Editor", role: "admin", avatar: "https://lh3.googleusercontent.com/a/editor" } } as Parameters<typeof StudioShell>[0], "Posts"));
  expect(html).not.toContain("Blog HunpeoLabs");
  expect(html).not.toContain('class="workspace"');
  const bottom = html.slice(html.indexOf('class="sidebar-bottom"'), html.indexOf("</aside>"));
  expect(bottom).toContain("Test Editor");
  expect(bottom).toContain('src="https://lh3.googleusercontent.com/a/editor"');
  expect(bottom).toContain('href="/admin/blog/account"');
  expect(bottom).toContain('referrerPolicy="no-referrer"');
});

it("rejects unsafe profile images and preserves sidebar role restrictions", () => {
  const html = renderToStaticMarkup(createElement(StudioShell, { user: { name: "Test Author", role: "author", avatar: "https://outside.example/image" } } as Parameters<typeof StudioShell>[0], "Posts"));
  expect(html).not.toContain("outside.example");
  expect(html).toContain('class="avatar dark"');
  expect(html).not.toContain('href="/admin/blog/settings"');
  expect(html).not.toContain('href="/admin/blog/comments"');
});

it("keeps account routes inside their respective website and Studio shells", () => {
  route.path = "/blog-account";
  expect(renderToStaticMarkup(createElement(BlogChrome, {} as Parameters<typeof BlogChrome>[0], "Website navbar"))).toContain("Website navbar");
  route.path = "/admin/blog/account";
  const html = renderToStaticMarkup(createElement(StudioShell, { user: { name: "Editor", role: "admin" } } as Parameters<typeof StudioShell>[0], "Account content"));
  expect(html).toContain('class="sidebar"');
  expect(html).toContain("Account content");
  route.path = "/admin/blog";
});
