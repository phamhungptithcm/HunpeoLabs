const REQUIRED_CONTACT_KEYS = [
  "CONTACT_WEBHOOK_URL",
  "CONTACT_WEBHOOK_TOKEN",
  "CONTACT_PROVIDER_NAME",
  "CONTACT_RETENTION_NOTICE",
];

const FIREBASE_ANALYTICS_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
];

const EXPECTED_FIREBASE_PROJECT_ID = "hunpeolabs-prod";
const EXPECTED_FIREBASE_APP_ID = "1:91549992622:web:50f947dc656de933c18f3f";

function fail(message) {
  process.stderr.write(`production configuration error: ${message}\n`);
  process.exitCode = 1;
}

function publicHttpsUrl(value, name) {
  if (!value) {
    fail(`${name} is required.`);
    return;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost") ||
      url.username ||
      url.password
    ) {
      fail(`${name} must be a public HTTPS origin without embedded credentials.`);
    }
  } catch {
    fail(`${name} must be a valid URL.`);
  }
}

publicHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL");

const configuredContactKeys = REQUIRED_CONTACT_KEYS.filter((key) => process.env[key]?.trim());
if (configuredContactKeys.length > 0 && configuredContactKeys.length < REQUIRED_CONTACT_KEYS.length) {
  fail(
    `contact delivery is partially configured; provide all of ${REQUIRED_CONTACT_KEYS.join(", ")} or none of them.`,
  );
}

if (process.env.REQUIRE_CONTACT_DELIVERY === "true" && configuredContactKeys.length === 0) {
  fail("REQUIRE_CONTACT_DELIVERY=true but no verified contact delivery configuration exists.");
}

if (configuredContactKeys.length === REQUIRED_CONTACT_KEYS.length) {
  publicHttpsUrl(process.env.CONTACT_WEBHOOK_URL, "CONTACT_WEBHOOK_URL");
  if (process.env.CONTACT_WEBHOOK_TOKEN.trim().length < 16) {
    fail("CONTACT_WEBHOOK_TOKEN must contain at least 16 characters.");
  }
  if (process.env.CONTACT_PROVIDER_NAME.trim().length > 100) {
    fail("CONTACT_PROVIDER_NAME must not exceed 100 characters.");
  }
  if (
    process.env.CONTACT_RETENTION_NOTICE.trim().length < 10 ||
    process.env.CONTACT_RETENTION_NOTICE.trim().length > 500
  ) {
    fail("CONTACT_RETENTION_NOTICE must contain 10 to 500 reviewed characters.");
  }
}

const analyticsEnabled = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED === "true";
const analyticsFlag = process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED;
const configuredAnalyticsKeys = FIREBASE_ANALYTICS_KEYS.filter((key) =>
  process.env[key]?.trim(),
);

if (analyticsFlag && analyticsFlag !== "true" && analyticsFlag !== "false") {
  fail("NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED must be true or false.");
}

if (
  configuredAnalyticsKeys.length > 0 &&
  configuredAnalyticsKeys.length < FIREBASE_ANALYTICS_KEYS.length
) {
  fail(
    `Firebase Analytics is partially configured; provide all of ${FIREBASE_ANALYTICS_KEYS.join(", ")} or none of them.`,
  );
}

if (analyticsEnabled && configuredAnalyticsKeys.length !== FIREBASE_ANALYTICS_KEYS.length) {
  fail("Firebase Analytics is enabled without a complete public Web App configuration.");
}

if (configuredAnalyticsKeys.length === FIREBASE_ANALYTICS_KEYS.length) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.trim();
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID.trim();

  if (!/^AIza[\w-]{20,}$/.test(apiKey)) {
    fail("NEXT_PUBLIC_FIREBASE_API_KEY has an invalid public Web API key format.");
  }
  if (!/^\d+:\d+:web:[a-f0-9]+$/i.test(appId)) {
    fail("NEXT_PUBLIC_FIREBASE_APP_ID has an invalid Firebase Web App ID format.");
  }
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    fail("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID has an invalid GA4 measurement ID format.");
  }
  if (analyticsEnabled && projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
    fail(`enabled Analytics must target Firebase project ${EXPECTED_FIREBASE_PROJECT_ID}.`);
  }
  if (analyticsEnabled && appId !== EXPECTED_FIREBASE_APP_ID) {
    fail(`enabled Analytics must target Firebase Web App ${EXPECTED_FIREBASE_APP_ID}.`);
  }
}

if (!process.exitCode) {
  process.stdout.write(
    `production configuration valid; contact delivery ${
      configuredContactKeys.length ? "configured" : "disabled"
    }; Firebase Analytics ${analyticsEnabled ? "enabled" : "disabled"}.\n`,
  );
}
