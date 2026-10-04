import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { customerAudiences, getCustomerAudience, audienceContactHref } from "@/content/customer-audiences";
import { services } from "@/content/site";
import { CONTACT_PROJECT_TYPES } from "@/lib/contact";
import { buildAnswer, retrieveSelection } from "@/lib/ask/retrieval";

const request = { history: [], language: "vi" as const, sessionId: "c155e52e-2396-41a9-ae40-b65d5fa50a74" };
describe("customer audience paths", () => {
  it("uses real services and accepted brief types with an editable static template", () => {
    expect(new Set(customerAudiences.map(audience => audience.id)).size).toBe(3);
    for (const audience of customerAudiences) {
      expect(services.some(service => service.slug === audience.service)).toBe(true);
      expect(CONTACT_PROJECT_TYPES).toContain(audience.projectType);
      expect(getCustomerAudience(audience.id)).toBe(audience);
      expect(audience.brief.length).toBeGreaterThan(20);
      expect(audienceContactHref(audience)).toBe(`/contact?audience=${audience.id}`);
    }
  });
  it.each([undefined, null, "", "unknown", ["local-shops"], "<script>alert(1)</script>", "https://other.example"])("rejects unknown or non-scalar query input %s", input => {
    expect(getCustomerAudience(input)).toBeUndefined();
  });
  it.each(["Tôi có cửa hàng điện máy", "Tôi làm chụp hình", "I am a photographer", "I run a small business", "Do you build e-commerce?", "Tôi cần bán hàng online", "Ecommerce checkout"])("answers locally for %s", question => {
    const selection = retrieveSelection({ ...request, question });
    expect(selection.topic).toBe("services");
    expect(selection.service).toBe("web-development");
    const answer = buildAnswer(selection, "vi");
    expect(answer.followUp).toContain("Bạn đang kinh doanh gì");
    expect(answer.sourceIds).toContain("web-development");
  });
  it("preserves pricing and explicit AI/mobile intent before audience fallback", () => {
    expect(retrieveSelection({ ...request, question: "Website cửa hàng giá bao nhiêu?" }).topic).toBe("pricing");
    expect(retrieveSelection({ ...request, question: "AI agent cho cửa hàng" }).service).toBe("ai-agent-development");
    expect(retrieveSelection({ ...request, question: "Mobile app for my shop" }).service).toBe("mobile-app-development");
    expect(retrieveSelection({ ...request, question: "Founder Hung Pham có cửa hàng không?" }).topic).toBe("founder");
  });
});
