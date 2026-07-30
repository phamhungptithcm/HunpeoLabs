import { expect, test } from "@playwright/test";

test("privacy explains the information path in a few natural sentences", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(page).toHaveTitle("Privacy — Hunpeo Labs");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A simple explanation of how Hunpeo Labs uses the information you choose to share.",
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy, without the maze." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Share only what you’re comfortable with. We’ll keep it to the conversation you started.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("We use what you share to understand your needs and get back to you."),
  ).toBeVisible();
  await expect(
    page.getByText("We don’t sell your information or use it to target ads."),
  ).toBeVisible();

  const email = page
    .locator(".privacy-statements")
    .getByRole("link", { name: "support@hunpeolabs.com" });
  await expect(email).toHaveAttribute("href", "mailto:support@hunpeolabs.com");
  await expect(page.locator(".privacy-signal__diagram--desktop text")).toHaveCount(5);
  await expect(page.getByText("A verified delivery channel has not been configured.")).toHaveCount(
    0,
  );
});

test("privacy diagram adapts without creating horizontal page overflow", async ({
  page,
}) => {
  await page.goto("/privacy");

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth),
  );

  const isMobile = (await page.viewportSize())?.width === 390;
  await expect(
    page.locator(
      isMobile
        ? ".privacy-signal__diagram--mobile"
        : ".privacy-signal__diagram--desktop",
    ),
  ).toBeVisible();
});

test("privacy has a complete static equivalent for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/privacy");

  await expect(page.locator(".privacy-hero")).toBeVisible();
  await expect(page.locator(".privacy-statements")).toBeVisible();
  await expect(page.locator(".privacy-signal__path-draw").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".privacy-signal__traveler").first()).toHaveCSS("opacity", "0");
});

test("privacy motion plays once and settles after repeated navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/privacy");

  const visibleDiagram = page.locator(".privacy-signal__diagram:visible");
  await expect(visibleDiagram.locator(".privacy-signal__path-draw")).toHaveCSS(
    "animation-iteration-count",
    "1",
  );
  await expect(visibleDiagram.locator(".privacy-signal__traveler")).toHaveCSS(
    "animation-iteration-count",
    "1",
  );
  await page.waitForTimeout(1_300);
  await expect(visibleDiagram.locator(".privacy-signal__node--reply")).toBeVisible();

  await page.goto("/");
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy, without the maze." }),
  ).toBeVisible();
});
