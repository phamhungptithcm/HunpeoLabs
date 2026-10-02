import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
import { Account } from "@/components/blog-admin/account";
it("renders reader identity without a standalone auth shell or Studio action", () => {
  const html = renderToStaticMarkup(createElement(Account, { name: "Test Reader", avatar: "https://outside.example/avatar" }));
  expect(html).toContain("Test Reader");
  expect(html).toContain("Đăng xuất");
  expect(html).not.toContain("outside.example");
  expect(html).not.toContain("auth-wrap");
  expect(html).not.toContain('href="/admin/blog"');
});
it("renders verified profile image and Studio action for staff", () => {
  const html = renderToStaticMarkup(createElement(Account, { name: "Editor", avatar: "https://lh3.googleusercontent.com/a/editor", staff: true, embedded: true }));
  expect(html).toContain('src="https://lh3.googleusercontent.com/a/editor"');
  expect(html).toContain('href="/admin/blog"');
  expect(html).toContain('referrerPolicy="no-referrer"');
});
