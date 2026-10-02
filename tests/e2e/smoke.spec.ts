import { expect, test } from "@playwright/test";

test("critical marketing routes render across supported browser engines", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const homepage = await page.request.get("/");
  expect(homepage.ok()).toBe(true);
  expect(homepage.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(homepage.headers()["content-security-policy"]).toContain(
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  );
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
  await expect(page.getByRole("button", { name: "Send project brief" })).toBeDisabled();
  expect(consoleErrors).toEqual([]);
});
