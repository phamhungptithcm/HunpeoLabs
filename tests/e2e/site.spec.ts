import { expect, test } from "@playwright/test";

test("homepage communicates the offer without becoming an all-in-one page", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "We design and build web, mobile, and AI products.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Start with the change")).toBeVisible();
  await expect(page.getByText("Launch or rebuild a digital product")).toBeVisible();
  await expect(page.locator(".signal__trace")).toHaveCount(5);
  await expect(page.locator(".signal__feedback")).toHaveCount(1);
  await expect(page.locator(".signal__icon svg")).toHaveCount(5);
  await expect(page.getByText("Products built from real engineering problems.")).toHaveCount(0);
  await page.getByRole("link", { name: "Start a project" }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Bring us the system that needs to change.",
    }),
  ).toBeVisible();
});

test("primary index content lives on separate routes", async ({ page }) => {
  await page.goto("/services");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Engineering services for product and platform change",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Digital Products" })).toBeVisible();
  await expect(page.locator(".service-svg")).toHaveCount(3);
  await expect(page.locator(".browser-frame, .diagram-node, .platform-layer")).toHaveCount(0);

  await page.goto("/products");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Products built from real engineering problems.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Agent Kit" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gig" })).toBeVisible();
  await expect(page.locator(".product-architecture")).toHaveCount(1);
  await expect(page.locator(".incov-architecture")).toHaveCount(1);
  await expect(page.locator(".gig-architecture")).toHaveCount(1);

  await page.goto("/resources");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Ideas, systems, and work in the open.",
    }),
  ).toBeVisible();
  await expect(page.getByText("In preparation")).toHaveCount(2);
});

test("wide desktop layouts keep primary visuals inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1024 });

  await page.goto("/");
  await expect(page.locator(".signal")).toBeInViewport();
  await expect(page.locator(".signal")).toBeVisible();

  await page.goto("/products");
  const productFeature = page.locator(".product-feature").filter({ hasText: "AI Agent Kit" });
  const featureBox = await productFeature.boundingBox();
  expect(featureBox).not.toBeNull();
  expect((featureBox?.x ?? 0) + (featureBox?.width ?? 0)).toBeLessThanOrEqual(1536);
  const architectureBox = await page.locator(".product-architecture").boundingBox();
  const architectureNodes = await page.locator(".product-architecture__nodes > div").all();
  expect(architectureBox).not.toBeNull();
  for (const node of architectureNodes) {
    const nodeBox = await node.boundingBox();
    expect(nodeBox).not.toBeNull();
    expect(nodeBox?.x ?? 0).toBeGreaterThanOrEqual(architectureBox?.x ?? 0);
    expect((nodeBox?.x ?? 0) + (nodeBox?.width ?? 0)).toBeLessThanOrEqual(
      (architectureBox?.x ?? 0) + (architectureBox?.width ?? 0),
    );
  }

  await page.goto("/services");
  await expect(page.locator(".service-svg")).toHaveCount(3);
  await expect(page.locator(".service-catalog")).toBeInViewport();
});

test("mobile editorial diagrams scroll internally without clipping page copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of ["/about", "/careers"]) {
    await page.goto(route);
    const headingBox = await page.locator("h1").boundingBox();
    expect(headingBox).not.toBeNull();
    expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(390);
    await expect(page.locator(".system-diagram__canvas")).toHaveCSS("overflow-x", "auto");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
});

test("mobile navigation exposes the approved information architecture", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: /menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", {
    name: "Services",
  }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Engineering services for product and platform change",
    }),
  ).toBeVisible();
});

test("top navigation stays visible and settles into its scrolled surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "false");

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveAttribute("data-scrolled", "true");

  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(Math.abs(headerBox?.y ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(1);
  await expect(header).toHaveCSS("position", "sticky");
});

test("mobile menu remains attached to the sticky header after scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 400));

  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await page.getByRole("button", { name: /menu/i }).click();

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation).toBeVisible();
  await expect
    .poll(async () => {
      const currentHeader = await header.boundingBox();
      const currentNavigation = await navigation.boundingBox();
      return Math.abs(
        (currentNavigation?.y ?? 0) -
          (currentHeader?.height ?? Number.POSITIVE_INFINITY),
      );
    })
    .toBeLessThanOrEqual(1);

  const headerBox = await header.boundingBox();
  const navigationBox = await navigation.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(navigationBox).not.toBeNull();
  expect(Math.abs(headerBox?.y ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(1);
  expect(Math.abs((navigationBox?.y ?? 0) - (headerBox?.height ?? 0))).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("homepage motion reveals content without changing the approved structure", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/motion-ready/);

  const heading = page.getByRole("heading", {
    level: 1,
    name: "We design and build web, mobile, and AI products.",
  });
  await expect(heading).toHaveCSS("animation-name", "hero-enter");

  const services = page.locator(".home-services");
  await services.scrollIntoViewIfNeeded();
  await expect(services).toHaveClass(/is-visible/);
  await expect(services).toHaveCSS("opacity", "1");
});

test("reduced motion keeps all content visible and disables orchestration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("html")).toHaveClass(/motion-ready/);
  await expect(page.locator(".home-services")).toBeVisible();
  await expect(page.locator(".home-services")).toHaveClass(/is-visible/);
});

test("dynamic product and work routes render maturity without invented metrics", async ({
  page,
}) => {
  await page.goto("/products/incov");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Turn every incident into better judgment.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Applied AI / Under validation")).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI recommends. People decide." })).toBeVisible();
  await expect(page.getByText("Under validation. Built to be reviewed.")).toBeVisible();

  await page.goto("/work/gig");
  await expect(page).toHaveURL(/\/products\/gig$/);
  await expect(page.getByText("Open-source engineering project")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Know what changed. Know what shipped.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "See the whole trail. Then inspect any step.",
    }),
  ).toBeVisible();
});

test("overlapping product work URLs consolidate into the canonical product profile", async ({
  page,
}) => {
  await page.goto("/work/ai-agent-kit");
  await expect(page).toHaveURL(/\/products\/ai-agent-kit$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Give AI agents room to work. Keep control.",
    }),
  ).toBeVisible();

  await page.goto("/work/incov");
  await expect(page).toHaveURL(/\/products\/incov$/);

  await page.goto("/work/gig");
  await expect(page).toHaveURL(/\/products\/gig$/);
});

test("each product profile includes its own real demo and reviewable boundary", async ({
  page,
}) => {
  const products = [
    {
      route: "/products/ai-agent-kit",
      heading: "Give AI agents room to work. Keep control.",
      video: "/media/products/ai-agent-kit/bootstrap-demo.mp4",
      boundary: "Open source. Inspectable by design.",
    },
    {
      route: "/products/incov",
      heading: "Turn every incident into better judgment.",
      video: "/media/products/incov/architecture-walkthrough.mp4",
      boundary: "Under validation. Built to be reviewed.",
    },
    {
      route: "/products/gig",
      heading: "Know what changed. Know what shipped.",
      video: "/media/products/gig/release-showcase.mp4",
      boundary: "Open source. Evidence first.",
    },
  ];

  for (const product of products) {
    await page.goto(product.route);
    await expect(page.getByRole("heading", { level: 1, name: product.heading })).toBeVisible();
    await expect(page.locator("video source")).toHaveAttribute("src", product.video);
    await expect(page.locator("video")).toHaveAttribute("poster", /\/media\/products\//);
    await expect(page.getByRole("heading", { name: product.boundary })).toBeVisible();
    await expect(page.locator(".product-faq details")).toHaveCount(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("product demos transition from the designed cover to real footage", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products/ai-agent-kit");

  await expect(page.locator(".product-demo")).toHaveCSS(
    "animation-name",
    "product-panel-enter",
  );
  await page.getByRole("button", { name: "Play Governed bootstrap" }).click();
  await expect(page.locator(".product-demo")).toHaveClass(/is-playing/);
  await expect(page.locator(".product-demo video")).toHaveCSS("opacity", "1");

  const problem = page.locator(".product-problem");
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toHaveClass(/is-visible/);
});

test("service pages state fit and boundaries that distinguish adjacent engagements", async ({
  page,
}) => {
  await page.goto("/services/ai-agent-development");
  await expect(page.getByRole("heading", { name: "Choose this service when" })).toBeVisible();
  await expect(page.getByText(/better framed as AI Product Engineering/)).toBeVisible();

  await page.goto("/services/ai-product-engineering");
  await expect(page.getByText(/better framed as AI Agent Development/)).toBeVisible();

  await page.goto("/services/architecture-governance");
  await expect(page.getByText(/does not imply delivery of the resulting modernization program/)).toBeVisible();
});

test("public routes expose canonical and page-specific social metadata", async ({ page }) => {
  await page.goto("/services/web-development");

  await expect(page).toHaveTitle("Web Development — Hunpeo Labs");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/services\/web-development$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Web Development",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /\/services\/web-development$/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const serviceSchema = schemas.find((schema) => schema.includes('"@type":"Service"'));
  expect(serviceSchema).toMatch(
    /"@id":"https?:\/\/[^"]+\/services\/web-development#service"/,
  );

  const llmsResponse = await page.request.get("/llms.txt");
  expect(llmsResponse.status()).toBe(200);
  expect(await llmsResponse.text()).toContain(
    "This file is a discovery aid. It does not override robots.txt",
  );
});

test("blog foundation is useful but remains non-indexable without reviewed articles", async ({
  page,
}) => {
  await page.goto("/resources/blog");

  await expect(page.getByRole("heading", { level: 1, name: "Notes from the work." })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "The publishing system is ready. The first article is not public yet.",
    }),
  ).toBeVisible();
  await expect(page.getByText("A named, verified author")).toBeVisible();
  await expect(page.getByRole("link", { name: "RSS feed" })).toHaveAttribute(
    "href",
    "/resources/blog/feed.xml",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, nofollow/,
  );

  const feed = await page.request.get("/resources/blog/feed.xml");
  expect(feed.ok()).toBe(true);
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  expect(await feed.text()).toContain("<title>Hunpeo Labs Blog</title>");
});

test("about, careers, and contact stay honest and independently addressable", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "We build with clarity, evidence, and responsibility.",
    }),
  ).toBeVisible();
  await expect(page.locator(".system-diagram__node")).toHaveCount(7);
  await expect(page.locator(".system-diagram--thinking path[marker-end]")).toHaveCount(7);

  await page.goto("/careers");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Do thoughtful work with clear ownership.",
    }),
  ).toBeVisible();
  await expect(page.getByText("How we collaborate")).toBeVisible();
  await expect(page.locator(".system-diagram__node--collaboration")).toHaveCount(4);
  await expect(page.locator(".system-diagram--work path[marker-end]")).toHaveCount(4);
  await expect(page.getByText("No open roles are published today.")).toBeVisible();

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "A useful first conversation does four things." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Confirm fit" })).toBeVisible();
  await expect(
    page.getByText(
      "Use this form to shape your brief. Delivery will be enabled after a verified contact channel is configured.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send project brief" })).toBeDisabled();
  await expect(
    page.locator(".contact-direct").getByRole("link", {
      name: "support@hunpeolabs.com",
    }),
  ).toHaveAttribute("href", "mailto:support@hunpeolabs.com");

  const siteGraphText = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(siteGraphText).not.toBeNull();
  const siteGraph = JSON.parse(siteGraphText!) as {
    "@graph": Array<Record<string, unknown>>;
  };
  expect(
    siteGraph["@graph"].find((item) => item["@type"] === "Organization"),
  ).toMatchObject({
    email: "mailto:support@hunpeolabs.com",
  });

  await page.goto("/privacy");
  await expect(
    page.getByRole("link", { name: "support@hunpeolabs.com" }).first(),
  ).toHaveAttribute("href", "mailto:support@hunpeolabs.com");

  const unavailableDelivery = await page.request.post("/api/contact", {
    data: {
      name: "Test person",
      email: "test@example.com",
      projectType: "Web product",
      brief: "A verified project brief flow used only in automated validation.",
      website: "",
    },
  });
  expect(unavailableDelivery.status()).toBe(503);
  expect(await unavailableDelivery.json()).toMatchObject({
    ok: false,
    code: "DELIVERY_UNAVAILABLE",
  });

  await page.goto("/company/about");
  await expect(page).toHaveURL(/\/about$/);
});

test("principles own the detailed operating method instead of repeating the work page", async ({
  page,
}) => {
  await page.goto("/company/principles");
  await expect(page.getByText("Do", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Avoid", { exact: true }).first()).toBeVisible();

  await page.goto("/work");
  await expect(
    page.getByRole("heading", { level: 1, name: "Engineering work with its status made explicit." }),
  ).toBeVisible();
  await expect(page.getByText("How to read this work")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observe the real system" })).toHaveCount(0);
});
