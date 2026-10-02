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
  await expect(
    page.getByText("Launch or rebuild a digital product"),
  ).toBeVisible();
  await expect(page.locator(".signal__trace")).toHaveCount(5);
  await expect(page.locator(".signal__feedback")).toHaveCount(1);
  await expect(page.locator(".signal__icon svg")).toHaveCount(5);
  await expect(
    page.getByText("Products built from real engineering problems."),
  ).toHaveCount(0);
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
      name: "Your next product. Built and delivered.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Build the experience." }),
  ).toBeVisible();
  await expect(page.locator(".services-surface .service-card")).toHaveCount(6);
  await expect(
    page.locator(".browser-frame, .diagram-node, .platform-layer"),
  ).toHaveCount(0);

  await page.goto("/products");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Real problems. Purpose-built products.",
    }),
  ).toBeVisible();
  for (const name of ["AI-Agent-Kit", "SatsunicSEO", "SatsunicMec", "BeFam"]) {
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator("main article")).toHaveCount(4);

  await page.goto("/resources");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Ideas, systems, and work in the open.",
    }),
  ).toBeVisible();
  await expect(page.getByText("In preparation")).toHaveCount(2);
});

test("wide desktop layouts keep primary visuals inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 1024 });

  await page.goto("/");
  await expect(page.locator(".signal")).toBeInViewport();
  await expect(page.locator(".signal")).toBeVisible();

  await page.goto("/products");
  const productFeature = page.locator("#ai-agent-kit");
  const featureBox = await productFeature.boundingBox();
  expect(featureBox).not.toBeNull();
  expect((featureBox?.x ?? 0) + (featureBox?.width ?? 0)).toBeLessThanOrEqual(
    1536,
  );
  const visualBox = await productFeature.locator("figure").boundingBox();
  expect(visualBox).not.toBeNull();
  for (const node of await productFeature.locator("figure li").all()) {
    const box = await node.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x ?? 0).toBeGreaterThanOrEqual(visualBox?.x ?? 0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      (visualBox?.x ?? 0) + (visualBox?.width ?? 0),
    );
  }

  await page.goto("/services");
  await expect(page.locator(".services-surface .service-card")).toHaveCount(6);
  await expect(page.locator(".services-surface .abstract")).toBeInViewport();
});

test("mobile editorial diagrams scroll internally without clipping page copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of ["/about", "/careers"]) {
    await page.goto(route);
    const headingBox = await page.locator("h1").boundingBox();
    expect(headingBox).not.toBeNull();
    expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(
      390,
    );
    if (route === "/about") {
      await expect(page.locator(".system-diagram__canvas")).toHaveCSS(
        "overflow-x",
        "auto",
      );
    } else {
      // Careers now uses a static studio card; preserve the same mobile readability boundary.
      const studio = page.getByRole("complementary", {
        name: "Studio today: one person",
      });
      await expect(studio).toBeVisible();
      const box = await studio.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(390);
      await expect(
        page.getByRole("region", { name: "Hiring status" }),
      ).toContainText("no advertised job opening");
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(390);
  }
});

test("mobile navigation exposes the approved information architecture", async ({
  page,
}) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: /menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", {
      name: "Services",
    })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Your next product. Built and delivered.",
    }),
  ).toBeVisible();
});

test("shared footer shows compact contact details and metadata", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator(".site-footer");
  await expect(footer.getByRole("navigation")).toHaveCount(0);
  await expect(footer.locator(".brand, .site-footer__main")).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
  await expect(footer.locator("a[href^='mailto:']")).toBeVisible();
  await expect(footer.locator("address")).toHaveText("Xóm 2, Đông Dương, Quảng Trạch, Quảng Trị 470000");
  await expect(footer.getByRole("link", { name: "+84 889 680 497", exact: true })).toHaveAttribute("href", "tel:+84889680497");
  await expect(footer).toContainText("Hung Pham");
  await expect(footer).toContainText("Mon–Fri · 8 AM–5 PM");
  await expect(footer).toContainText("Digital products. AI systems. Enterprise engineering.");
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Hunpeo Labs`);
  await expect(page.locator(".site-header .brand")).toBeVisible();
});

test("shared navigation exposes Blog directly on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/");
  const menu = page.locator(".menu-button");
  const mobileMenu = await menu.isVisible();
  if (mobileMenu) await menu.click();

  const primary = page.getByRole("navigation", { name: "Primary navigation" });
  const labels = ["Services", "Products", "Blog", "About", "Careers"];
  await expect(primary.getByRole("link")).toHaveText(labels);

  await primary.getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page).toHaveURL(/\/resources\/blog$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Ideas into practice." }),
  ).toBeVisible();
  await expect(page.locator(".site-header .brand")).toBeVisible();
  await expect(page.locator(".site-header .brand")).toHaveAttribute(
    "href",
    "/",
  );
  const article = page.locator("a.feature");
  if (await article.count()) {
    await article.click();
    await expect(page).toHaveURL(/\/resources\/blog\/[^/]+$/);
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/resources\/blog$/);
  }
  await expect(page.locator(".site-footer .brand")).toHaveCount(0);
  await expect(page.locator(".site-footer").getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
});

test("top navigation stays visible and settles into its scrolled surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "false");

  await expect(header).toHaveCSS("height", "88px");
  const initialContentTop = await page.locator("#main-content").evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate(() => window.scrollTo({ top: 80, behavior: "instant" }));
  await expect.poll(async () => (await header.boundingBox())?.height).toBe(76);
  await expect.poll(async () => page.locator("#main-content").evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  )).toBe(initialContentTop);

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect(header).toHaveCSS("height", "64px");

  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(
    Math.abs(headerBox?.y ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(1);
  await expect(header).toHaveCSS("position", "sticky");
  await page.evaluate(() => window.scrollTo({ top: 80, behavior: "instant" }));
  await expect.poll(async () => (await header.boundingBox())?.height).toBe(76);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveCSS("height", "88px");
  await expect(header).toHaveAttribute("data-scrolled", "false");
});

test("compact navbar respects reduced motion and privacy mobile sizing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header).toHaveCSS("height", "72px");
  await page.evaluate(() => window.scrollTo({ top: 80, behavior: "instant" }));
  await expect(header).toHaveCSS("height", "60px");
  await expect(header.locator(".brand")).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(header).toHaveCSS("height", "66px");
  await page.goto("/privacy");
  await expect(header).toHaveCSS("height", "54px");
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect(header).toHaveCSS("height", "54px");
});

test("mobile menu remains attached to the sticky header after scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 400));

  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect(header).toHaveCSS("height", "60px");
  await page.getByRole("button", { name: /menu/i }).click();

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveCSS("height", "60px");

  const navigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
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
  expect(
    Math.abs(headerBox?.y ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs((navigationBox?.y ?? 0) - (headerBox?.height ?? 0)),
  ).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: /close/i }).click();
  await expect(header).toHaveCSS("height", "72px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
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

test("reduced motion keeps all content visible and disables orchestration", async ({
  page,
}) => {
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
  await expect(
    page.getByRole("heading", { name: "AI recommends. People decide." }),
  ).toBeVisible();
  await expect(
    page.getByText("Under validation. Built to be reviewed."),
  ).toBeVisible();

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
    await expect(
      page.getByRole("heading", { level: 1, name: product.heading }),
    ).toBeVisible();
    await expect(page.locator("video source")).toHaveAttribute(
      "src",
      product.video,
    );
    await expect(page.locator("video")).toHaveAttribute(
      "poster",
      /\/media\/products\//,
    );
    await expect(
      page.getByRole("heading", { name: product.boundary }),
    ).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "When to bring us in." }),
  ).toBeVisible();
  await expect(page.getByText(/choose AI Product Engineering/)).toBeVisible();

  await page.goto("/services/ai-product-engineering");
  await expect(page.getByText(/choose AI Agent Development/)).toBeVisible();

  await page.goto("/services/architecture-governance");
  await expect(page.getByText(/This is an advisory engagement/)).toBeVisible();
});

test("public routes expose canonical and page-specific social metadata", async ({
  page,
}) => {
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

  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const serviceSchema = schemas.find((schema) =>
    schema.includes('"@type":"Service"'),
  );
  expect(serviceSchema).toMatch(
    /"@id":"https?:\/\/[^"]+\/services\/web-development#service"/,
  );

  const llmsResponse = await page.request.get("/llms.txt");
  expect(llmsResponse.status()).toBe(200);
  expect(await llmsResponse.text()).toContain(
    "This file is a discovery aid. It does not override robots.txt",
  );
});

test("blog journal indexes reviewed articles and preserves the empty-state boundary", async ({
  page,
}) => {
  await page.goto("/resources/blog");

  await expect(
    page.getByRole("heading", { level: 1, name: "Ideas into practice." }),
  ).toBeVisible();
  const populated = await page.locator("a.feature").count();
  if (populated) {
    await expect(page.locator("a.feature h2")).toBeVisible();
    await expect(page.locator("a.feature")).toHaveAttribute(
      "href",
      /\/resources\/blog\/[^/]+$/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, nofollow/,
    );
  } else {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Chưa có bài viết.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Ghé lại sau hoặc theo dõi qua RSS nhé."),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex, nofollow/,
    );
  }
  const subscribe = page.getByRole("link", { name: /Theo dõi qua RSS/ });
  await expect(subscribe).toHaveAttribute("href", /\/resources\/blog\/feed.xml$/);
  await expect(subscribe).toHaveAttribute("aria-haspopup", "dialog");
  await subscribe.click();
  const dialog = page.getByRole("dialog", { name: "Đọc bài mới qua RSS" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Địa chỉ RSS", { exact: true })).toHaveValue(
    /\/resources\/blog\/feed.xml$/,
  );
  await expect(dialog.getByRole("link", { name: "Mở RSS gốc (XML)" })).toHaveAttribute(
    "href", /\/resources\/blog\/feed.xml$/,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  const feed = await page.request.get("/resources/blog/feed.xml");
  expect(feed.ok()).toBe(true);
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  expect(await feed.text()).toContain("<title>Hunpeo Labs Blog</title>");
});

test("about introduces the founder and keeps its existing layout", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /About\s+Hunpeo Labs\./,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hung Pham — Founder" })).toBeVisible();
  const profiles = page.getByRole("navigation", { name: "Hung Pham social profiles" });
  await expect(profiles.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/hunpham/");
  await expect(profiles.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", "https://www.facebook.com/hawaihouu");
  await expect(profiles.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/phamhungptithcm");
  await expect(page.getByRole("link", { name: "Follow Hunpeo Labs on Facebook" })).toHaveAttribute("href", "https://www.facebook.com/profile.php?id=61579548848441");
  await expect(page.locator(".system-diagram__node")).toHaveCount(7);
  await expect(
    page.locator(".system-diagram--thinking path[marker-end]"),
  ).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await profiles.getByRole("link", { name: "LinkedIn" }).focus();
  await expect(profiles.getByRole("link", { name: "LinkedIn" })).toBeFocused();
  await page.goto("/company/about");
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "Hung Pham — Founder" })).toBeVisible();
});

test("careers and contact stay honest and independently addressable", async ({ page, isMobile }) => {
  await page.goto("/careers");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A shared vision.Something worth building.",
  );
  await expect(page.getByText(/Hunpeo Labs is one person today/)).toBeVisible();
  await expect(
    page.getByText(/There’s no advertised job opening today/),
  ).toBeVisible();
  const introduce = page.getByRole("link", {
    name: /Let’s get to know each other/,
  });
  const products = page.getByRole("link", { name: "See what I’m building" });
  const email = page.getByRole("link", { name: "Let’s talk" });
  await expect(products).toHaveAttribute("href", "/products");
  await expect(email).toHaveAttribute(
    "href",
    "mailto:support@hunpeolabs.com?subject=Hello%20Hunpeo%20Labs",
  );
  if (isMobile) {
    await introduce.tap();
  } else {
    await introduce.focus();
    await page.keyboard.press("Tab");
    await expect(products).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(introduce).toBeFocused();
    await page.keyboard.press("Enter");
  }
  await expect(page).toHaveURL(/\/careers#connect$/);
  await expect(
    page.getByRole("heading", { name: "What do you want to build?" }),
  ).toBeInViewport();
  if (!isMobile) {
    await page.keyboard.press("Tab");
    await expect(email).toBeFocused();
  } else {
    await expect(email).toBeVisible();
  }
  await expect(
    page.getByText(/There’s no expectation to start work just by saying hello/),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /one-person startup/,
  );

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", {
      name: "A useful first conversation does four things.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Confirm fit" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Continue in your email app, then send the prepared brief. You can also copy it and email us directly.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue in email" }),
  ).toBeEnabled();
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
    page.getByRole("heading", {
      level: 1,
      name: "Engineering work with its status made explicit.",
    }),
  ).toBeVisible();
  await expect(page.getByText("How to read this work")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Observe the real system" }),
  ).toHaveCount(0);
});


test("contact email handoff retains inputs and supports clipboard failure", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as unknown as { copiedBrief: string }).copiedBrief = value; } } });
  });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Continue in email", exact: true }).waitFor();
  await expect(page.getByRole("button", { name: "Continue in email", exact: true })).toBeEnabled();
  await page.screenshot({ path: `.ai/local/contact-001-${test.info().project.name}.png`, fullPage: true });
  const name = page.getByLabel("Name", { exact: true });
  await page.getByRole("button", { name: "Copy brief", exact: true }).click();
  await expect(name).toHaveValue("");
  await expect(page.locator(".project-brief__status").last()).not.toContainText("Brief copied");
  await name.fill("Test person");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Project type").selectOption("AI system");
  await page.getByLabel("What needs to change?", { exact: true }).fill("Build a useful research tool with clear next steps.");
  await page.getByRole("button", { name: "Copy brief", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("Brief copied");
  expect(await page.evaluate(() => (window as unknown as { copiedBrief: string }).copiedBrief)).toContain("Reply email: test@example.com");
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied"); } } }); });
  await page.getByRole("button", { name: "Copy brief", exact: true }).click();
  await expect(page.getByLabel("Prepared brief")).toHaveValue(/Build a useful research tool/);
  await expect(page.locator(".project-brief__status").last()).toContainText("copy it manually");
  await page.getByRole("button", { name: "Continue in email", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("Send it to support@hunpeolabs.com");
  await expect(name).toHaveValue("Test person");
  await expect(page.getByLabel("What needs to change?", { exact: true })).toHaveValue("Build a useful research tool with clear next steps.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("contact configured webhook preserves delivery and offers email on failure", async ({ page }) => {
  test.skip(!process.env.CONTACT_WEBHOOK_URL, "Requires isolated configured server");
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Test person");
  await page.getByLabel("Work email").fill("test@example.com");
  await page.getByLabel("Project type").selectOption("Web product");
  await page.getByLabel("What needs to change?", { exact: true }).fill("A project brief used for local validation only.");
  await page.route("**/api/contact", route => route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ message: "Delivery failed. Try email." }) }));
  await page.getByRole("button", { name: "Send project brief", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("Delivery failed");
  await expect(page.getByRole("button", { name: "Continue in email", exact: true })).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Test person");
  await page.getByRole("button", { name: "Continue in email", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("Opening your email app");
  await page.route("**/api/contact", route => route.abort());
  await page.getByRole("button", { name: "Send project brief", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("Check your connection");
  await expect(page.getByRole("button", { name: "Continue in email", exact: true })).toBeVisible();
  await page.route("**/api/contact", route => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ message: "Delivered" }) }));
  await page.getByRole("button", { name: "Send project brief", exact: true }).click();
  await expect(page.locator(".project-brief__status").last()).toContainText("delivered for review");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
});


test("contact without JavaScript offers direct email and prevents native data submission", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/contact");
  await expect(page.locator(".project-brief").getByRole("button").first()).toBeDisabled();
  await expect(page.locator(".project-brief").getByRole("button", { name: "Copy brief" })).toBeDisabled();
  await expect(page.locator(".contact-direct").getByRole("link", { name: "support@hunpeolabs.com" })).toHaveAttribute("href", "mailto:support@hunpeolabs.com");
  await context.close();
});
