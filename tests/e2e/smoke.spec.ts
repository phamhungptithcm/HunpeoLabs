import { expect, test } from "@playwright/test";

test("critical marketing routes render across supported browser engines", async ({ page }) => {
  const consoleErrors: { text: string; url: string }[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push({ text: message.text(), url: message.location().url });
  });

  const homepage = await page.request.get("/");
  expect(homepage.ok()).toBe(true);
  expect(homepage.headers()["content-security-policy"]).toContain("default-src 'self'");
  const scriptSources = homepage.headers()["content-security-policy"]
    .split(";").map(directive => directive.trim())
    .find(directive => directive.startsWith("script-src "))?.split(/\s+/).slice(1);
  expect(scriptSources).toEqual(expect.arrayContaining([
    "'self'", "'unsafe-inline'", "https://www.googletagmanager.com",
  ]));
  expect(homepage.headers()["content-security-policy"]).toContain(
    "https://firebaseinstallations.googleapis.com",
  );
  expect(homepage.headers()["content-security-policy"]).not.toContain("doubleclick.net");
  expect(homepage.headers()["content-security-policy"]).not.toContain(
    "pagead2.googlesyndication.com",
  );
  expect(homepage.headers()["x-content-type-options"]).toBe("nosniff");
  expect(homepage.headers()["x-frame-options"]).toBe("DENY");

  const health = await page.request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(health.headers()["cache-control"]).toContain("no-store");
  expect(await health.json()).toMatchObject({
    status: "ok",
    service: "hunpeolabs-website",
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "We design and build web, mobile, and AI products.",
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => window.innerWidth),
  );

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Bring us the system that needs to change.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue in email" })).toBeEnabled();
  // Anonymous session discovery intentionally returns 401. WebKit reports
  // that HTTP response in the console; verify its auth contract explicitly
  // and keep every other resource/runtime error blocking.
  const sessionUrl = new URL("/api/blog/session", page.url()).href;
  const session = await page.request.get(sessionUrl);
  expect(session.status()).toBe(401);
  expect(await session.json()).toMatchObject({ error: "SIGN_IN_REQUIRED" });
  expect((await page.request.get("/api/admin/blog/posts")).status()).toBe(401);
  expect(consoleErrors.filter((error) => !(
    error.url === sessionUrl &&
    error.text === "Failed to load resource: the server responded with a status of 401 (Unauthorized)"
  ))).toEqual([]);
});
