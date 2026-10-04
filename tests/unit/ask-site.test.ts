import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/ask-hunpeolabs", () => ({ AskHunpeoLabs: ({ startCollapsed }: { startCollapsed: boolean }) => createElement("button", { "data-mode": startCollapsed ? "icon" : "input" }, "Ask") }));
import { AskSite, askRouteMode } from "@/components/ask-site";

describe("public Ask route boundary", () => {
  it("does not emit a fallback widget before the browser URL is available", () => {
    state.pathname = "/";
    expect(renderToStaticMarkup(createElement(AskSite))).toBe("");
  });
  it.each(["/admin", "/admin/blog", "/admin/blog/new", "/admin/blog/settings", "/admin/blog/account", "/admin/blog/example/preview", "/studio", "/studio/editor", null])("never renders Ask for %s", pathname => {
    expect(askRouteMode(pathname)).toBeNull();
  });
  it.each(["/", "/about", "/contact", "/products/ai-agent-kit", "/blog-account", "/administrator", "/studio-products"])("keeps public page %s in input mode", pathname => {
    expect(askRouteMode(pathname)).toBe("input");
  });
  it.each(["/resources/blog", "/resources/blog/example-post"])("starts blog %s compact", pathname => {
    expect(askRouteMode(pathname)).toBe("icon");
  });
});
