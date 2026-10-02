import { expect, test } from "@playwright/test";

const names = ["AI-Agent-Kit", "SatsunicSEO", "SatsunicMec", "BeFam"];

test("catalog shows distribution controls and disables missing destinations", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator("h1")).toHaveText(
    "Real problems.Purpose-built products.",
  );
  await expect(page.locator("main article")).toHaveCount(4);
  for (const name of names)
    await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(
      1,
    );
  await expect(page.locator("#featured article")).toHaveCount(2);
  await expect(page.locator("#more-products article")).toHaveCount(2);
  for (const name of ["SatsunicMec", "BeFam"]) {
    await expect(page.getByRole("button", { name: `Visit website — ${name}`, exact: true })).toBeDisabled();
  }
  for (const label of ["BeFam on the App Store", "BeFam on Google Play"]) {
    const button = page.getByRole("button", { name: label, exact: true });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
    await expect(button).not.toHaveAttribute("href");
  }
  await expect(page.locator("#satsunic-seo").getByText("Visit website", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Some links are not yet available.", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "View on npm — AI-Agent-Kit", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@hunpeolabs/ai-agent-kit",
  );
  await expect(
    page.getByRole("link", {
      name: "View in Chrome Web Store — SatsunicSEO",
      exact: true,
    }),
  ).toHaveAttribute("href", /chromewebstore\.google\.com\/detail\//);
  await expect(page.locator('main article a[href*="github.com"]')).toHaveCount(
    0,
  );
  await expect(
    page.locator(
      'main article a[href*="apps.apple.com"], main article a[href*="play.google.com"], main article a[href="#"]',
    ),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Product overview", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/ai-agent-kit$/);
});

test("catalog remains usable at mobile, tablet and desktop widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(width);
    for (const name of names)
      await expect(
        page.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
    for (const figure of await page.locator("main figure").all()) {
      expect(
        await figure.evaluate(
          (el) =>
            el.scrollWidth <= el.clientWidth &&
            el.scrollHeight <= el.clientHeight + 1,
        ),
      ).toBe(true);
    }
    for (const badge of await page.locator('#befam button img').all()) {
      await badge.scrollIntoViewIfNeeded();
      await expect(badge).toBeVisible();
      await expect.poll(() => badge.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
  }
  await page.getByRole("link", { name: "More from the lab ↓" }).click();
  await expect(page).toHaveURL(/#more-products$/);
});

test("catalog metadata and discovery use the current names without losing legacy profiles", async ({
  page,
  request,
}) => {
  await page.goto("/products");
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  for (const name of names) expect(description).toContain(name);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/products$/,
  );
  const discovery = await (await request.get("/llms.txt")).text();
  for (const name of names) expect(discovery).toContain(name);
  for (const slug of ["incov", "gig"]) {
    expect((await request.get(`/products/${slug}`)).status()).toBe(200);
  }
});
