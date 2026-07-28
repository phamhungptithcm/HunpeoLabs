import { describe, expect, it } from "vitest";
import {
  contactDeliveryIsConfigured,
  parseContactPayload,
  readContactDeliveryConfig,
} from "@/lib/contact";

const validPayload = {
  name: "Test person",
  email: "Test@Example.com",
  company: "Example",
  projectType: "Web product",
  brief: "A substantive project brief used only for validation.",
  website: "",
};

describe("contact delivery contract", () => {
  it("accepts bounded, supported project briefs", () => {
    expect(parseContactPayload(validPayload)).toEqual({
      ok: true,
      value: {
        name: "Test person",
        email: "test@example.com",
        company: "Example",
        projectType: "Web product",
        brief: "A substantive project brief used only for validation.",
      },
    });
  });

  it("rejects honeypot, invalid email, short copy, and unsupported project types", () => {
    expect(parseContactPayload({ ...validPayload, website: "spam.example" })).toMatchObject({
      ok: false,
    });
    expect(parseContactPayload({ ...validPayload, email: "not-an-email" })).toMatchObject({
      ok: false,
    });
    expect(parseContactPayload({ ...validPayload, brief: "Too short" })).toMatchObject({
      ok: false,
    });
    expect(parseContactPayload({ ...validPayload, projectType: "Anything" })).toMatchObject({
      ok: false,
    });
  });

  it("fails closed until the full verified delivery and privacy contract exists", () => {
    expect(contactDeliveryIsConfigured({})).toBe(false);
    expect(
      readContactDeliveryConfig({
        CONTACT_WEBHOOK_URL: "https://contact.example.test/hooks/hunpeo",
        CONTACT_WEBHOOK_TOKEN: "a-secure-token-value",
        CONTACT_PROVIDER_NAME: "Verified provider",
      }),
    ).toBeUndefined();
  });

  it("rejects insecure or local webhook destinations", () => {
    for (const webhookUrl of [
      "http://example.com/hook",
      "https://localhost/hook",
      "https://127.0.0.1/hook",
      "https://example.com/hook?secret=value",
    ]) {
      expect(
        readContactDeliveryConfig({
          CONTACT_WEBHOOK_URL: webhookUrl,
          CONTACT_WEBHOOK_TOKEN: "a-secure-token-value",
          CONTACT_PROVIDER_NAME: "Verified provider",
          CONTACT_RETENTION_NOTICE: "A verified retention notice.",
        }),
      ).toBeUndefined();
    }
  });

  it("accepts a complete HTTPS configuration without exposing its token", () => {
    const config = readContactDeliveryConfig({
      CONTACT_WEBHOOK_URL: "https://contact.example.test/hooks/hunpeo",
      CONTACT_WEBHOOK_TOKEN: "a-secure-token-value",
      CONTACT_PROVIDER_NAME: "Verified provider",
      CONTACT_RETENTION_NOTICE: "A verified retention notice.",
    });

    expect(config?.webhookUrl.toString()).toBe(
      "https://contact.example.test/hooks/hunpeo",
    );
    expect(config?.providerName).toBe("Verified provider");
  });
});
