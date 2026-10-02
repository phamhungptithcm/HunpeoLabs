import { expect, test } from "@playwright/test";

// First-visit consent must not inherit the general navigation declined fixture.
test.use({ storageState: { cookies: [], origins: [] } });

const CONSENT_KEY = "hunpeolabs:analytics-consent:v1";
const ANALYTICS_HOST_PATTERN =
  /(^|\.)(firebase\.googleapis\.com|firebaseinstallations\.googleapis\.com|googletagmanager\.com|google-analytics\.com|analytics\.google\.com)$/;

test("sends no Analytics request before consent and remembers a decline", async ({
  page,
}) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (ANALYTICS_HOST_PATTERN.test(hostname))
      analyticsRequests.push(request.url());
  });
  await page.goto("/");
  const preferences = page.getByRole("region", {
    name: "Help us understand site traffic?",
  });
  await expect(preferences).toBeVisible();
  await page.waitForTimeout(250);
  expect(analyticsRequests).toEqual([]);

  await preferences.getByRole("button", { name: "No thanks" }).click();
  await expect(preferences).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBe("denied");
  expect(analyticsRequests).toEqual([]);

  await page.reload();
  await expect(
    page.getByRole("region", { name: "Analytics preferences" }),
  ).toHaveCount(0);
  expect(analyticsRequests).toEqual([]);

  await page.getByRole("button", { name: "Analytics preferences" }).click();
  await expect(page.getByText("Current choice: off.")).toBeVisible();
});

test("loads Firebase only after opt-in, initializes once, and supports revocation", async ({
  page,
}) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (ANALYTICS_HOST_PATTERN.test(hostname))
      analyticsRequests.push(request.url());
  });

  await page.route("https://firebase.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        projectId: "hunpeolabs-test",
        appId: "1:1234567890:web:abcdef1234567890",
        measurementId: "G-TEST12345",
      }),
    }),
  );
  await page.route("https://firebaseinstallations.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        name: "projects/hunpeolabs-test/installations/cTestInstallationId123456",
        fid: "cTestInstallationId123456",
        refreshToken: "test-refresh-token",
        authToken: { token: "test-auth-token", expiresIn: "604800s" },
      }),
    }),
  );
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route(
    /https:\/\/.*(?:google-analytics|analytics\.google)\.com\/.*/,
    (route) => route.fulfill({ status: 204, body: "" }),
  );
  await page.goto("/");
  expect(analyticsRequests).toEqual([]);
  await page.getByRole("button", { name: "Allow analytics" }).click();

  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBe("granted");
  await expect
    .poll(() =>
      analyticsRequests.some(
        (url) => new URL(url).hostname === "www.googletagmanager.com",
      ),
    )
    .toBe(true);

  const menu = page.getByRole("button", { name: "Menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page
    .getByRole("link", { name: "Privacy", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  expect(
    analyticsRequests.filter(
      (url) => new URL(url).hostname === "www.googletagmanager.com",
    ),
  ).toHaveLength(1);

  await page.getByRole("button", { name: "Analytics preferences" }).click();
  await page.getByRole("button", { name: "Turn off analytics" }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY),
  ).toBe("denied");

  const requestCountAfterRevocation = analyticsRequests.length;
  await page.reload();
  await page.waitForTimeout(250);
  expect(analyticsRequests).toHaveLength(requestCountAfterRevocation);
});
