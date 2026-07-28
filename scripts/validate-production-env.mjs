const REQUIRED_CONTACT_KEYS = [
  "CONTACT_WEBHOOK_URL",
  "CONTACT_WEBHOOK_TOKEN",
  "CONTACT_PROVIDER_NAME",
  "CONTACT_RETENTION_NOTICE",
];

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

if (!process.exitCode) {
  process.stdout.write(
    `production configuration valid; contact delivery ${
      configuredContactKeys.length ? "configured" : "disabled"
    }.\n`,
  );
}
