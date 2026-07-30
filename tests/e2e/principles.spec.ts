import { expect, test } from "@playwright/test";

const principleTitles = [
  "See the real system",
  "Make risk visible",
  "Start small",
  "Prove it works",
  "Scale with care",
];

test("principles read as one clear, compact working loop", async ({ page }) => {
  await page.goto("/company/principles");

  await expect(
    page.getByRole("heading", { level: 1, name: "How we work." }),
  ).toBeVisible();
  await expect(
    page.getByText("Five simple principles help us make better decisions."),
  ).toBeVisible();
  await expect(
    page.getByRole("figure", {
      name: /see, map, build, prove, and scale/i,
    }),
  ).toBeVisible();

  for (const title of principleTitles) {
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }

  await expect(page.locator("[data-principle]")).toHaveCount(5);
  await expect(page.getByText("Connect behavior to proof.")).toBeVisible();
  await expect(page.getByText("Scaling too early.")).toBeVisible();
  expect(await page.locator("main").innerText()).not.toMatch(/—|--/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("principles motion carries one signal through the loop", async ({ page }) => {
  test.setTimeout(45_000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/company/principles", { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-flow-path]").first()).toHaveCSS(
    "animation-name",
    /principle-path-draw/,
  );
  await expect(page.locator("[data-flow-signal]").first()).toHaveCSS(
    "animation-name",
    /principle-signal-x/,
  );
  await expect(page.locator("[data-flow-origin]").first()).toHaveCSS(
    "animation-iteration-count",
    "1",
  );
  await expect(page.locator("[data-flow-return-mask]").first()).toHaveCSS(
    "animation-name",
    /principle-path-draw/,
  );

  const connectorDelays = await page.locator("[data-flow-path]").evaluateAll((paths) =>
    paths.slice(0, 4).map((path) => Number.parseFloat(getComputedStyle(path).animationDelay)),
  );
  expect(connectorDelays).toEqual([0.28, 0.52, 0.76, 1]);

  const lastPrinciple = page.locator("[data-principle]").last();
  await expect(lastPrinciple).not.toHaveAttribute("data-visible", "true");
  await lastPrinciple.scrollIntoViewIfNeeded();
  await expect(lastPrinciple).toHaveAttribute("data-visible", "true");
  await expect(lastPrinciple.locator("dl")).toHaveCSS(
    "animation-name",
    /principle-row-enter/,
  );

  await page.goto("/about", { waitUntil: "domcontentloaded" });
  await page.goto("/company/principles", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-principle]")).toHaveCount(5);
  await expect(page.getByRole("heading", { level: 1, name: "How we work." })).toBeVisible();
});

test("reduced motion keeps the complete principles journey visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/company/principles");

  await expect(page.locator("[data-flow-path]").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator("[data-flow-signal]").first()).toBeHidden();
  await expect(page.locator("[data-flow-origin]").first()).toBeHidden();
  await expect(page.locator("[data-principle]").last()).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect(page.locator("[data-principle]").last().locator("dl")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("a live reduced-motion change reveals every pending row", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/company/principles");

  const lastPrinciple = page.locator("[data-principle]").last();
  await expect(lastPrinciple).not.toHaveAttribute("data-visible", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });

  await expect(lastPrinciple).toHaveAttribute("data-visible", "true");
  await expect(lastPrinciple.locator("dl")).toHaveCSS("animation-name", "none");
});

test("200% text scaling keeps the principles inside the viewport", async ({ page }) => {
  await page.goto("/company/principles");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  const heading = page.getByRole("heading", { level: 1, name: "How we work." });
  const headingBox = await heading.boundingBox();
  expect(headingBox).not.toBeNull();
  expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
  expect(await page.evaluate(() => document.querySelector("main")?.scrollWidth)).toBe(
    await page.evaluate(() => document.querySelector("main")?.clientWidth),
  );
});
