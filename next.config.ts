import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const blogAuthEmulatorOrigin =
  !isProduction &&
  /^http:\/\/127\.0\.0\.1:\d+$/.test(
    process.env.NEXT_PUBLIC_BLOG_AUTH_EMULATOR_URL ?? "",
  )
    ? process.env.NEXT_PUBLIC_BLOG_AUTH_EMULATOR_URL
    : "";
const oneTapEnabled = process.env.NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED !== "false";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${oneTapEnabled ? " https://accounts.google.com/gsi/client" : ""}${isProduction ? "" : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline'${oneTapEnabled ? " https://accounts.google.com/gsi/style" : ""}`,
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self'${oneTapEnabled ? " https://accounts.google.com/gsi/" : ""} https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${isProduction ? "" : ` ws: wss: ${blogAuthEmulatorOrigin}`}`,
  ...(oneTapEnabled
    ? ["frame-src 'self' https://accounts.google.com/gsi/"]
    : []),
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const authDomain =
  process.env.NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN ||
  (process.env.NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID
    ? `${process.env.NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID}.firebaseapp.com`
    : "");
if (authDomain && !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(authDomain))
  throw new Error("Invalid blog auth domain");
const authOrigin = authDomain ? `https://${authDomain}` : "";
const loginCsp =
  contentSecurityPolicy
    .replace(/; frame-src[^;]*/, "")
    .replace("script-src 'self'", "script-src 'self' https://apis.google.com")
    .replace("connect-src 'self'", `connect-src 'self' ${authOrigin}`) +
  `; frame-src 'self' ${authOrigin} ${blogAuthEmulatorOrigin}`;
const loginHeaders = securityHeaders.map((h) =>
  h.key === "Content-Security-Policy"
    ? { ...h, value: loginCsp }
    : h.key === "Cross-Origin-Opener-Policy"
      ? { ...h, value: "same-origin-allow-popups" }
      : h,
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/admin/blog/login", headers: loginHeaders },
      { source: "/blog-account", headers: loginHeaders },
    ];
  },
};

export default nextConfig;
