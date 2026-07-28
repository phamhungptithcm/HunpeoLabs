import { NextResponse } from "next/server";
import {
  checkContactRateLimit,
  parseContactPayload,
  readContactDeliveryConfig,
} from "@/lib/contact";

export const runtime = "nodejs";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function response(
  status: number,
  code: string,
  message: string,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(
    { ok: status < 400, code, message },
    { status, headers: { ...JSON_HEADERS, ...headers } },
  );
}

export async function POST(request: Request) {
  const config = readContactDeliveryConfig();
  if (!config) {
    return response(
      503,
      "DELIVERY_UNAVAILABLE",
      "Project brief delivery is not configured yet. Please try again later.",
      { "Retry-After": "3600" },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return response(415, "UNSUPPORTED_MEDIA_TYPE", "Send the project brief as JSON.");
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return response(403, "ORIGIN_NOT_ALLOWED", "This request origin is not allowed.");
  }

  const rateLimit = checkContactRateLimit(request);
  if (!rateLimit.allowed) {
    return response(429, "RATE_LIMITED", "Too many project briefs. Please try again later.", {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return response(400, "INVALID_JSON", "The project brief must contain valid JSON.");
  }

  const parsed = parseContactPayload(payload);
  if (!parsed.ok) {
    return response(400, parsed.code, parsed.message);
  }

  try {
    const deliveryResponse = await fetch(config.webhookUrl, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
      headers: {
        Authorization: `Bearer ${config.webhookToken}`,
        "Content-Type": "application/json",
        "User-Agent": "HunpeoLabs-Website/1.0",
      },
      body: JSON.stringify({
        source: "hunpeolabs-website",
        submittedAt: new Date().toISOString(),
        ...parsed.value,
      }),
    });

    if (!deliveryResponse.ok) {
      return response(
        502,
        "DELIVERY_FAILED",
        "The project brief could not be delivered. Please try again later.",
      );
    }
  } catch {
    return response(
      502,
      "DELIVERY_FAILED",
      "The project brief could not be delivered. Please try again later.",
    );
  }

  return response(202, "DELIVERED", "Your project brief was delivered for review.");
}
