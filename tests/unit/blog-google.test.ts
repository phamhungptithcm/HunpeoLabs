import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { DecodedIdToken } from "firebase-admin/auth";
import {
  accessEmail,
  accessId,
  googleIdentity,
  INITIAL_ADMINS,
} from "@/lib/blog/access";
import { titleSlug, slugSchema } from "@/lib/blog/schema";
describe("Google identity and editorial boundaries", () => {
  const token = (overrides: Record<string, unknown> = {}) =>
    ({
      uid: "fixture",
      email: "hunpeo@gmail.com",
      email_verified: true,
      firebase: { sign_in_provider: "google.com" },
      ...overrides,
    }) as DecodedIdToken;
  it("seeds only the two explicitly approved identities", () =>
    expect(INITIAL_ADMINS).toEqual([
      "hunpeo@gmail.com",
      "phamhung.pitit@gmail.com",
    ]));
  it("normalizes case without granting Gmail alias equivalence", () => {
    expect(accessEmail(" Hunpeo@GMAIL.com ")).toBe("hunpeo@gmail.com");
    expect(accessId("Hunpeo@gmail.com")).toBe(accessId("hunpeo@gmail.com"));
    expect(accessId("hunpeo+other@gmail.com")).not.toBe(
      accessId("hunpeo@gmail.com"),
    );
  });
  it("accepts only verified Google claims", () => {
    expect(googleIdentity(token())).toBe("hunpeo@gmail.com");
    for (const invalid of [
      { email_verified: false },
      { email: undefined },
      { firebase: { sign_in_provider: "password" } },
      { firebase: { sign_in_provider: "custom" } },
    ])
      expect(() => googleIdentity(token(invalid))).toThrow();
  });
  it("rejects malformed email identifiers", () => {
    for (const email of ["", "a/b", "someone@", "@gmail.com"])
      expect(() => accessId(email)).toThrow();
  });
});
describe("natural editor slug suggestions", () => {
  it("preserves readable Vietnamese words", () =>
    expect(titleSlug("Đọc và viết: một góc nhìn mới!")).toBe(
      "doc-va-viet-mot-goc-nhin-moi",
    ));
  it("keeps long suggestions within the actual publish schema", () => {
    const slug = titleSlug("Đường dẫn rất dài ".repeat(30));
    expect(slug.length).toBeLessThanOrEqual(100);
    expect(slugSchema.parse(slug)).toBe(slug);
  });
  it("does not turn punctuation into an invalid slug", () => {
    expect(titleSlug("?! ")).toBe("");
    expect(titleSlug(" Hello   world ")).toBe("hello-world");
  });
});
