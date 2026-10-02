if (process.env.NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED === "true") {
  if (process.env.BLOG_ENABLED !== "true")
    throw new Error("One Tap requires blog authentication");
  if (
    !/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(
      process.env.NEXT_PUBLIC_BLOG_GOOGLE_CLIENT_ID || "",
    )
  )
    throw new Error("One Tap requires a Google OAuth Web client ID");
}
const required = [
  "BLOG_FIREBASE_PROJECT_ID",
  "BLOG_STORAGE_BUCKET",
  "BLOG_RATE_LIMIT_SECRET",
  "BLOG_RATE_LIMIT_MODE",
  "NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_BLOG_FIREBASE_API_KEY",
  "NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN",
];
if (process.env.BLOG_ENABLED !== "true") {
  console.log("Blog disabled");
  process.exit(0);
}
if (!["identity-global", "trusted-ingress"].includes(process.env.BLOG_RATE_LIMIT_MODE))
  throw new Error("Invalid rate-limit mode");
if (process.env.BLOG_RATE_LIMIT_MODE === "trusted-ingress") required.push("BLOG_TRUSTED_IP_HEADER");
const missing = required.filter((k) => !process.env[k]);
if (missing.length)
  throw new Error(`Missing blog configuration: ${missing.join(", ")}`);
if (
  process.env.BLOG_FIREBASE_PROJECT_ID !==
  process.env.NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID
)
  throw new Error("Server/client project mismatch");
if (process.env.BLOG_RATE_LIMIT_SECRET.length < 32)
  throw new Error("Rate-limit secret must have at least 32 characters");
if (
  !process.env.BLOG_FIREBASE_PROJECT_ID.startsWith("demo-") &&
  [
    "FIRESTORE_EMULATOR_HOST",
    "FIREBASE_AUTH_EMULATOR_HOST",
    "FIREBASE_STORAGE_EMULATOR_HOST",
    "NEXT_PUBLIC_BLOG_AUTH_EMULATOR_URL",
  ].some((k) => process.env[k])
)
  throw new Error("Emulator settings cannot target real project");
if (
  !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(
    process.env.NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN,
  )
)
  throw new Error("Invalid auth domain");
console.log("Blog config shape valid; provider readiness NOT VERIFIED");
