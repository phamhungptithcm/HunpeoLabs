import { describe, expect, it } from "vitest";
import { buildContactEmailUrl, formatContactEmailBrief } from "@/lib/contact-email";

const brief = { name: " Linh & Team ", email: "linh+work@example.com", company: "", projectType: "AI system", brief: "Build a tool for Tiếng Việt & research?\nKeep details intact." };

describe("contact email handoff", () => {
  it("keeps contact details and multiline brief in plain text", () => {
    expect(formatContactEmailBrief(brief)).toBe("Name: Linh & Team\nReply email: linh+work@example.com\nCompany: Not provided\nProject type: AI system\n\nWhat needs to change?\nBuild a tool for Tiếng Việt & research?\nKeep details intact.");
  });
  it("encodes Unicode and query delimiters without adding recipients or headers", () => {
    const url = new URL(buildContactEmailUrl("support@hunpeolabs.com", { ...brief, brief: `${brief.brief}\n&bcc=other@example.com#fragment` }));
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("support@hunpeolabs.com");
    expect([...url.searchParams.keys()]).toEqual(["subject", "body"]);
    expect(url.searchParams.get("body")).toContain("&bcc=other@example.com#fragment");
    expect(url.hash).toBe("");
  });
  it("preserves the full maximum brief for copy fallback", () => {
    expect(formatContactEmailBrief({ ...brief, brief: "x".repeat(5000) })).toContain("x".repeat(5000));
  });
});
