import { createHash } from "node:crypto";

export const CONTACT_PROJECT_TYPES = [
  "Web product",
  "Mobile product",
  "AI system",
  "Enterprise engineering",
  "Architecture review",
] as const;

export type ContactProjectType = (typeof CONTACT_PROJECT_TYPES)[number];

export type ContactBrief = {
  name: string;
  email: string;
  company?: string;
  projectType: ContactProjectType;
  brief: string;
};

export type ContactDeliveryConfig = {
  webhookUrl: URL;
  webhookToken: string;
  providerName: string;
  retentionNotice: string;
};

type ContactEnvironment = Record<string, string | undefined>;

type ContactParseResult =
  | { ok: true; value: ContactBrief }
  | { ok: false; code: "INVALID_REQUEST"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitBuckets = new Map<string, number[]>();

function readBoundedText(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
): ContactParseResult | string {
  if (typeof value !== "string") {
    return { ok: false, code: "INVALID_REQUEST", message: `${field} is required.` };
  }

  const normalized = value.trim();
  if (normalized.length < minimum || normalized.length > maximum) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: `${field} must be between ${minimum} and ${maximum} characters.`,
    };
  }
  return normalized;
}

export function parseContactPayload(value: unknown): ContactParseResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, code: "INVALID_REQUEST", message: "A valid project brief is required." };
  }

  const payload = value as Record<string, unknown>;
  if (typeof payload.website === "string" && payload.website.trim()) {
    return { ok: false, code: "INVALID_REQUEST", message: "The project brief could not be accepted." };
  }

  const name = readBoundedText(payload.name, "Name", 2, 120);
  if (typeof name !== "string") return name;

  const email = readBoundedText(payload.email, "Work email", 5, 254);
  if (typeof email !== "string") return email;
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, code: "INVALID_REQUEST", message: "Enter a valid work email." };
  }

  const brief = readBoundedText(payload.brief, "Project brief", 20, 5000);
  if (typeof brief !== "string") return brief;

  if (
    typeof payload.projectType !== "string" ||
    !CONTACT_PROJECT_TYPES.includes(payload.projectType as ContactProjectType)
  ) {
    return { ok: false, code: "INVALID_REQUEST", message: "Select a supported project type." };
  }

  let company: string | undefined;
  if (payload.company !== undefined && payload.company !== "") {
    const parsedCompany = readBoundedText(payload.company, "Company", 2, 160);
    if (typeof parsedCompany !== "string") return parsedCompany;
    company = parsedCompany;
  }

  return {
    ok: true,
    value: {
      name,
      email: email.toLowerCase(),
      company,
      projectType: payload.projectType as ContactProjectType,
      brief,
    },
  };
}

function isSafeWebhookUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const blockedHostname =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
      hostname.includes(":");

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      blockedHostname
    ) {
      return undefined;
    }
    return url;
  } catch {
    return undefined;
  }
}

export function readContactDeliveryConfig(
  environment: ContactEnvironment = process.env,
): ContactDeliveryConfig | undefined {
  const webhookUrl = environment.CONTACT_WEBHOOK_URL?.trim();
  const webhookToken = environment.CONTACT_WEBHOOK_TOKEN?.trim();
  const providerName = environment.CONTACT_PROVIDER_NAME?.trim();
  const retentionNotice = environment.CONTACT_RETENTION_NOTICE?.trim();

  if (!webhookUrl || !webhookToken || !providerName || !retentionNotice) {
    return undefined;
  }

  const parsedUrl = isSafeWebhookUrl(webhookUrl);
  if (
    !parsedUrl ||
    webhookToken.length < 16 ||
    providerName.length > 100 ||
    retentionNotice.length > 500
  ) {
    return undefined;
  }

  return {
    webhookUrl: parsedUrl,
    webhookToken,
    providerName,
    retentionNotice,
  };
}

export function contactDeliveryIsConfigured(
  environment: ContactEnvironment = process.env,
): boolean {
  return Boolean(readContactDeliveryConfig(environment));
}

function clientRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex").slice(0, 24);
}

export function checkContactRateLimit(
  request: Request,
  now = Date.now(),
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const key = clientRateLimitKey(request);
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  for (const [bucketKey, timestamps] of rateLimitBuckets) {
    const current = timestamps.filter((timestamp) => timestamp > cutoff);
    if (current.length) rateLimitBuckets.set(bucketKey, current);
    else rateLimitBuckets.delete(bucketKey);
  }

  const timestamps = rateLimitBuckets.get(key) ?? [];
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  rateLimitBuckets.set(key, [...timestamps, now]);
  return { allowed: true };
}
