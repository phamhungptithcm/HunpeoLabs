/** Configuration status only: does not attest to deployed ingress or live capture. */
export function trafficCollectionStatus(): "disabled" | "blocked" | "configured" {
  if (process.env.NEXT_PUBLIC_TRAFFIC_ENABLED !== "true") return "disabled";
  if (process.env.BLOG_ENABLED !== "true" || !process.env.BLOG_FIREBASE_PROJECT_ID) return "blocked";
  const emulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIREBASE_STORAGE_EMULATOR_HOST);
  if (emulated) return process.env.BLOG_FIREBASE_PROJECT_ID.startsWith("demo-") && Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIREBASE_STORAGE_EMULATOR_HOST) && (process.env.NODE_ENV !== "production" || process.env.BLOG_ALLOW_EMULATORS === "true") ? "configured" : "blocked";
  return (process.env.BLOG_RATE_LIMIT_SECRET?.length ?? 0) >= 32 && (process.env.TRAFFIC_RATE_LIMIT_MODE === "global" || /^[a-z0-9-]+$/i.test(process.env.BLOG_TRUSTED_IP_HEADER ?? "")) ? "configured" : "blocked";
}
