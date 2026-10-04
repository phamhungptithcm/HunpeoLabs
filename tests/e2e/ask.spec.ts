import { test, expect } from "@playwright/test";

test("home question opens a sourced founder profile and preserves conversation on close", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox", { name: "Ask HunpeoLabs" }).fill("Founder của HunpeoLabs là ai?");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
  await expect(dialog.getByRole("img", { name: "Hung Pham", exact: true })).toBeVisible();
  await expect.poll(() => dialog.getByRole("img", { name: "Hung Pham", exact: true }).evaluate((image: HTMLImageElement) => image.naturalWidth), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(dialog.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/hunpham/");
  await expect(dialog.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/phamhungptithcm");
  await expect(dialog.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", "https://www.facebook.com/hawaihouu");
  await expect(dialog.getByRole("textbox")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục hội thoại" }).click();
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("service answers keep follow-up context and never invent a price", async ({ page }) => {
  await page.goto("/services/web-development", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("I need a mobile app");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Mobile App Development" })).toBeVisible();
  await dialog.getByRole("textbox").fill("What will I receive?");
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByText("Source code, build instructions, release checklist, and handover documentation.")).toBeVisible();
  await dialog.getByRole("textbox").fill("How much does it cost?");
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByRole("heading", { name: "How does pricing work?" })).toBeVisible();
  await expect(dialog.getByText(/There is no confirmed public price list/)).toBeVisible();
});

test("failed and truncated streams preserve the question and allow retry", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/ask", route => {
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 200, contentType: "application/x-ndjson", body: '{"type":"status","phase":"retrieving"}\n' });
    return route.fetch({ headers: { ...route.request().headers(), origin: process.env.NEXT_PUBLIC_SITE_URL || new URL(route.request().url()).origin }, postData: JSON.stringify({ ...route.request().postDataJSON(), question: "Who is the founder?" }) }).then(response => route.fulfill({ response }));
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("Please help me choose an option");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("Your question is still here");
  await expect(dialog.getByRole("textbox")).toHaveValue("Please help me choose an option");
  await dialog.getByRole("button", { name: "Try again" }).click();
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
  expect(attempts).toBe(2);
});

test("stop cancels a pending request and hide can reopen the composer", async ({ page }) => {
  let release: (() => void) | undefined;
  let requests = 0;
  await page.route("**/api/ask", async route => {
    requests++;
    await new Promise<void>(resolve => { release = resolve; });
    await route.abort().catch(() => {});
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("Please help me choose an option");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect.poll(() => requests).toBe(1);
  await dialog.getByRole("button", { name: "Stop response" }).click();
  release?.();
  await expect(dialog.getByText("Response stopped.")).toBeVisible();
  await dialog.getByRole("button", { name: "Close conversation" }).click();
  await idle.getByRole("button", { name: "Hide Ask HunpeoLabs" }).click();
  await page.getByRole("button", { name: "Ask HunpeoLabs", exact: true }).click();
  await expect(dialog.getByText("Response stopped.")).toBeVisible();
});

test("public Ask appears once across public page families", async ({ context }) => {
  test.setTimeout(120_000); // Eight independently loaded route families, including cold dev compilation.
  for (const path of ["/about", "/contact", "/products", "/products/gig", "/work", "/resources", "/privacy", "/careers"]) {
    const page = await context.newPage();
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("complementary", { name: "Ask HunpeoLabs" })).toHaveCount(1);
    await page.close();
  }
});

test("typing and answer arrival preserve reading position and composer geometry", async ({ page }) => {
  let release: (() => void) | undefined;
  let calls = 0;
  await page.route("**/api/ask", async route => {
    calls++;
    if (calls === 2) await new Promise<void>(resolve => { release = resolve; });
    const answer = { title: `Published response ${calls}`, paragraphs: Array(5).fill("Published service scope and handover information. ".repeat(24)), bullets: [], sourceIds: ["services"], founder: false, action: "contact", followUp: null, language: "en", mode: "published" };
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: JSON.stringify({ type: "answer", answer }) + "\n" });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("Explain options for my situation");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  const log = dialog.getByRole("log");
  await expect(dialog.getByRole("heading", { name: "Published response 1" })).toBeVisible();
  await dialog.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  const input = dialog.getByRole("textbox");
  const before = await input.boundingBox();
  await input.pressSequentially("Tell me more about that option", { delay: 10 });
  await expect(input).toHaveValue("Tell me more about that option");
  expect(await input.boundingBox()).toEqual(before);
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect.poll(() => calls).toBe(2);
  // Wait for the finite open/new-question scroll, then read an older passage.
  await log.evaluate(async element => {
    await new Promise(resolve => setTimeout(resolve, 450));
    element.scrollTo({ top: 100, behavior: "instant" });
  });
  const pendingBox = await input.boundingBox();
  const reading = await log.evaluate(element => element.scrollTop);
  release?.();
  await expect(dialog.getByRole("heading", { name: "Published response 2" })).toBeAttached();
  expect(Math.abs((await log.evaluate(element => element.scrollTop)) - reading)).toBeLessThan(2);
  expect(await input.boundingBox()).toEqual(pendingBox);
});

test("open close and hide use finite motion and respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  const capsule = await idle.boundingBox();
  await idle.getByRole("textbox").fill("HunpeoLabs");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  const panel = await dialog.boundingBox();
  expect(panel?.width).toBeCloseTo(capsule!.width, 0);
  expect(panel!.width).toBeLessThan(page.viewportSize()!.width);
  expect(panel!.height).toBeLessThan(page.viewportSize()!.height);
  expect(await dialog.evaluate(element => getComputedStyle(element, "::backdrop").backdropFilter)).toBe("blur(4px)");
  expect(await dialog.getByRole("button", { name: "Close conversation" }).evaluate(button => {
    (button as HTMLButtonElement).click();
    return button.closest("dialog")?.getAnimations().some(animation => animation.playState === "running");
  })).toBe(true);
  await expect(dialog).not.toBeVisible();
  await idle.getByRole("button", { name: "Hide Ask HunpeoLabs" }).click();
  await expect(page.getByRole("button", { name: "Ask HunpeoLabs", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ask HunpeoLabs", exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dialog.getByRole("button", { name: "Close conversation" }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Continue conversation" }).click();
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.getAnimations().filter(animation => animation.playState === "running").length)).toBe(0);
});

test("collapsed icon is compact and its invitation appears briefly", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("button", { name: "Hide Ask HunpeoLabs" }).click();
  const launcher = page.getByRole("button", { name: "Ask HunpeoLabs", exact: true });
  await expect(launcher).toBeEnabled();
  const box = await launcher.boundingBox();
  expect(box?.width).toBe(56); expect(box?.height).toBe(56);
  await expect(launcher).toHaveAttribute("data-hint", "true", { timeout: 7000 });
  await expect(launcher).not.toHaveAttribute("data-hint", "true", { timeout: 4000 });
  await launcher.click();
  await expect(idle.getByRole("textbox")).toBeVisible();
});


test("published FAQs work when the API is unavailable", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/ask", route => { requests++; return route.abort(); });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("What does HunpeoLabs do?");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/independent product and engineering studio/)).toBeVisible();
  await dialog.getByRole("textbox").fill("Who is the founder?");
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
  expect(requests).toBe(0);
});


test("outside click collapses only the open panel and preserves the idle input", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("Who is the founder?");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
  await dialog.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))); });
  await page.mouse.click(4, 4);
  await expect(dialog).not.toBeVisible();
  await expect(idle.getByRole("textbox")).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(idle.getByRole("textbox")).toBeVisible();
  await page.getByRole("button", { name: "Continue conversation" }).click();
  await expect(dialog.getByRole("article", { name: "Hung Pham profile" })).toBeVisible();
});


test("approved content answers timing work and general handover without the API", async ({ page }) => {
  await page.route("**/api/ask", route => route.abort());
  await page.goto("/");
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("Làm website mất bao lâu?");
  await idle.getByRole("button", { name: "Send question" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Thời gian triển khai" })).toBeVisible();
  await dialog.getByRole("textbox").fill("HunpeoLabs có dự án nào?");
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByRole("link", { name: "IncOv" })).toHaveAttribute("href", "/products/incov");
  await dialog.getByRole("textbox").fill("What are the ownership terms after handover?");
  await dialog.getByRole("button", { name: "Send question" }).click();
  await expect(dialog.getByRole("heading", { name: "Handover and support" })).toBeVisible();
});


test("blog starts as an icon and private namespaces exclude Ask", async ({ page, context }) => {
  test.setTimeout(90_000); // Multiple SSR navigations, including an unpublished article response.
  await page.goto("/resources/blog", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("complementary", { name: "Ask HunpeoLabs" })).toHaveCount(0);
  const launcher = page.getByRole("button", { name: "Ask HunpeoLabs", exact: true });
  await expect(launcher).toBeEnabled();
  await launcher.click();
  const idle = page.getByRole("complementary", { name: "Ask HunpeoLabs" });
  await idle.getByRole("textbox").fill("What is Gig?");
  await idle.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Gig", exact: true })).toBeVisible();
  await page.goto("/resources/blog/unpublished-test-slug", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Ask HunpeoLabs", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/about");
  await expect(page.getByRole("complementary", { name: "Ask HunpeoLabs" })).toHaveCount(1);
  const studio = await context.newPage();
  await studio.goto("/admin/ask-route-policy-check", { waitUntil: "domcontentloaded" });
  await expect(studio.getByRole("complementary", { name: "Ask HunpeoLabs" })).toHaveCount(0);
  await expect(studio.getByRole("button", { name: "Ask HunpeoLabs", exact: true })).toHaveCount(0);
  await studio.goto("/studio/ask-route-policy-check", { waitUntil: "domcontentloaded" });
  await expect(studio.getByRole("complementary", { name: "Ask HunpeoLabs" })).toHaveCount(0);
  await expect(studio.getByRole("button", { name: "Ask HunpeoLabs", exact: true })).toHaveCount(0);
  await studio.close();
});
