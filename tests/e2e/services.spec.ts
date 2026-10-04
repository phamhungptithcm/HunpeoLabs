import { expect, test } from "@playwright/test";
import { services } from "../../content/site";

test("approved Services experience connects offers, proof, FAQ and contact", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  const recordError = (error: Error) => errors.push(error.message);
  page.on("pageerror", recordError);
  await page.goto("/services");
  await expect(page.locator("h1")).toHaveText("A better placefor your business online.");
  await expect(page.locator(".service-card")).toHaveCount(6);
  await expect(page.getByText("DESIGN PREVIEW", { exact: false })).toHaveCount(0);
  await expect(page.getByLabel("Preview page")).toHaveCount(0);
  await page.getByText("Can we start with an idea?", { exact: true }).click();
  await expect(page.locator("details[open]")).toContainText("Discovery defines the first scope");
  // Assert console health on the owned Services screen. Cross-page WebKit
  // prefetch cancellations on existing product/contact screens are recorded
  // separately from this scoped rendering check.
  expect(errors).toEqual([]);
  page.off("pageerror", recordError);
  await page.locator(".project").filter({ hasText: "AI-Agent-Kit" }).getByRole("link").click();
  await expect(page).toHaveURL(/\/products\/ai-agent-kit$/, { timeout: 15_000 });
  // Wait for visible product content; background dev/prefetch traffic may never idle.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("agent");
  await page.goto("/services");
  await page.locator(".service-card").filter({ hasText: "Web Development" }).click();
  await expect(page).toHaveURL(/\/services\/web-development$/, { timeout: 15_000 });
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.locator(".outputs li")).toHaveCount(5);
  await page.getByRole("link", { name: "Discuss your project" }).click();
  await expect(page).toHaveURL(/\/contact$/, { timeout: 15_000 });
  await expect(page.locator(".site-header")).toBeVisible();
});

test("all service routes retain approved copy, schema, privacy and responsive layouts", async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const service of services) {
      await page.goto(`/services/${service.slug}`);
      await expect(page.locator("h1")).toHaveText(service.headline);
      await expect(page.locator(".outputs li")).toHaveText(service.deliverables.map((item, i) => `0${i + 1}${item}`));
      await expect(page.locator(".deliver-summary")).toContainText(service.outcome);
      await expect(page.locator(".scope")).toContainText(service.boundary);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", service.summary);
      const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(schema.some((json) => JSON.parse(json)["@graph"]?.some((entity: { "@type": string; description?: string }) => entity["@type"] === "Service" && entity.description === service.summary))).toBe(true);
    }
    await page.goto("/services");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});

test("Services is useful without JavaScript and rejects unknown service routes", async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(new URL("/services", baseURL).href);
  await expect(page.locator(".service-card")).toHaveCount(6);
  await page.locator(".service-card").filter({ hasText: "AI Agent Development" }).click();
  await expect(page.locator("h1")).toHaveText(services[2].headline);
  await context.close();
  const unknown = await request.get("/services/not-a-service");
  expect(unknown.status()).toBe(404);
  const discovery = await request.get("/llms.txt");
  expect(await discovery.text()).toContain(services[2].summary);
});

test("Services inherits the shared site header, footer and mobile navigation", async ({ page, isMobile }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const header = page.locator(".site-header");
  const footer = page.locator(".site-footer");
  const homeLinks = await header.locator("a").evaluateAll((links) => links.map((link) => ({ text: link.textContent, href: link.getAttribute("href") })));
  const homeFooter = await footer.innerText();
  for (const route of ["/services", ...services.map((service) => `/services/${service.slug}`)]) {
    await page.goto(route);
    await expect(header).toHaveCount(1);
    await expect(footer).toHaveCount(1);
    expect(await header.locator("a").evaluateAll((links) => links.map((link) => ({ text: link.textContent, href: link.getAttribute("href") })))).toEqual(homeLinks);
    expect(await footer.innerText()).toEqual(homeFooter);
    await expect(header.getByRole("link", { name: "Services", exact: true, includeHidden: true })).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".services-surface header, .services-surface footer")).toHaveCount(0);
  }
  if (isMobile) await header.getByRole("button", { name: "Menu", exact: true }).click();
  await header.getByRole("link", { name: "Products", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  if (isMobile) await expect(header.getByRole("button", { name: "Menu", exact: true })).toHaveAttribute("aria-expanded", "false");
  if (isMobile) await header.getByRole("button", { name: "Menu", exact: true }).click();
  await header.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator(".service-card")).toHaveCount(6);
});
