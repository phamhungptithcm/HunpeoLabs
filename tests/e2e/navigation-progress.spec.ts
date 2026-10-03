import { expect, test } from "@playwright/test";
// Dedicated synthetic fixture: real SiteHeader/ProgressLink/ActionProgress with delayed
// Next routes, no production data or auth. Run with NAV_PROGRESS_FIXTURE=<base URL>.
const fixture = process.env.NAV_PROGRESS_FIXTURE;
test.skip(!fixture, "Requires isolated delayed-route navigation fixture");
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", route => route.fulfill({status:401,json:{error:"SIGN_IN_REQUIRED"}}));
  await page.goto(fixture!);
  await page.locator("html[data-fixture-hydrated=true]").waitFor();
});
test("navbar signals pending immediately, latest navigation completes and clears", async ({ page, isMobile }) => {
  if(isMobile) await page.getByRole("button",{name:"Menu",exact:true}).click();
  await page.getByRole("link",{name:"Services",exact:true}).click();
  await expect(page.getByRole("progressbar")).toBeVisible({timeout:250});
  if(isMobile) await page.getByRole("button",{name:"Menu",exact:true}).click();
  await page.getByRole("link",{name:"Products",exact:true}).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Products destination"})).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
});
test("read link hands progress to loading boundary, including reduced motion",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.getByRole("link",{name:"Read the story",exact:true}).click();
  await expect(page.getByRole("progressbar")).toBeVisible({timeout:250});
  await expect(page.getByText("Loading story skeleton")).toBeVisible();
  const animation=await page.locator('.action-progress > span').evaluate(el=>getComputedStyle(el).animationName);
  expect(animation).toBe("none");
  await expect(page.getByRole("heading",{name:"Story destination"})).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
});
test("anchors, current page and new tabs do not leave progress running",async({page})=>{
  await page.getByRole("link",{name:"Jump to details"}).click();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await page.getByRole("link",{name:"Current page"}).click();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  const popupPromise=page.waitForEvent('popup');
  await page.getByRole("link",{name:"Open new tab"}).click();
  const popup=await popupPromise;
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await popup.close();
});
