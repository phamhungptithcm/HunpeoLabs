import type { NextConfig } from "next";
import { expect, it } from "vitest";
import { needsLoginDocumentReload } from "@/lib/blog/login-document";
const origin = "https://hunpeolabs.com";
it("reloads login reached from a blog document with a different CSP", () => {
  expect(needsLoginDocumentReload(`${origin}/resources/blog`, `${origin}/blog-account?returnTo=%2Fresources%2Fblog%2Fpost`)).toBe(true);
});
it("does not reload direct login entry or query/fragment changes", () => {
  expect(needsLoginDocumentReload(`${origin}/blog-account`, `${origin}/blog-account?returnTo=x#comments`)).toBe(false);
  expect(needsLoginDocumentReload(`${origin}/admin/blog/login`, `${origin}/admin/blog/login`)).toBe(false);
});
it("reloads Studio login reached through a client redirect", () => {
  expect(needsLoginDocumentReload(`${origin}/resources/blog`, `${origin}/admin/blog/login`)).toBe(true);
});
it("ignores non-login routes and unavailable/invalid timing entries", () => {
  expect(needsLoginDocumentReload(`${origin}/resources/blog`, `${origin}/admin/blog`)).toBe(false);
  expect(needsLoginDocumentReload(undefined, `${origin}/blog-account`)).toBe(false);
  expect(needsLoginDocumentReload("invalid", `${origin}/blog-account`)).toBe(false);
});
it("allows only configured authentication dependencies for in-page login", async () => {
  // App Hosting rewrites the config as a CJS wrapper during its build.
  // Keep this unit-only runtime import independent of that wrapper export shape.
  const configModule: unknown = await import("../../next.config");
  const config = (configModule as { default: NextConfig }).default;
  const rules = await config.headers!();
  const global = rules.find(rule => rule.source === "/:path*")!;
  const login = rules.find(rule => rule.source === "/blog-account")!;
  const header = (rule: typeof login, name: string) => rule.headers.find(h => h.key === name)?.value;
  expect(header(global, "Content-Security-Policy")).toContain("https://apis.google.com");
  expect(header(global, "Content-Security-Policy")).toContain("frame-ancestors 'none'");
  expect(header(global, "Content-Security-Policy")).toContain("https://accounts.google.com/gsi/");
  expect(header(login, "Content-Security-Policy")).toContain("https://apis.google.com");
  expect(header(global, "Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
  expect(header(login, "Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
});
