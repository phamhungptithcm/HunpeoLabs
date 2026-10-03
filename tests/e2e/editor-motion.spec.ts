import { test, expect, type Page } from '@playwright/test';
test.skip(process.env.EDITOR_MOTION_E2E !== 'true', 'Requires isolated synthetic editor fixture');
const origin = 'http://127.0.0.1:3144';
async function setup(page: Page) {
  await page.route('**/api/**', route => route.fulfill({contentType:'application/json',body:JSON.stringify(route.request().url().includes('schedule') ? {dueAt:null,error:null} : [])}));
  await page.goto(`${origin}/editor-fixture`);
  await expect(page.locator('.tiptap')).toBeVisible();
  await expect(page.getByRole('button',{name:'Lưu bản nháp',exact:true})).toBeEnabled();
}
test('desktop header contracts smoothly and sidebar remains accessible independently', async ({page}) => {
  await page.setViewportSize({width:1440,height:700});
  await setup(page);
  const header=page.locator('.editor-top'), sidebar=page.locator('.editor-settings');
  await expect.poll(()=>header.evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(73);
  await page.evaluate(()=>window.scrollTo(0,800));
  await expect(page.locator('.editor-shell')).toHaveClass(/editor-shell--compact/);
  await expect.poll(()=>header.evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(56);
  await expect.poll(()=>header.evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBe(0);
  await expect.poll(()=>sidebar.evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBe(56);
  const scrollBefore=await page.evaluate(()=>window.scrollY);
  await sidebar.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await expect(page.getByRole('button',{name:'Xem trước SEO & chia sẻ',exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>window.scrollY)).toBe(scrollBefore);
  await expect(page.getByRole('button',{name:'Lưu trữ',exact:true})).toBeInViewport();
  await page.screenshot({path:'/tmp/editor-motion-desktop.png'});
  await page.getByRole('button',{name:'Xem trước SEO & chia sẻ',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Lưu trữ',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect.poll(()=>header.evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(73);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('short viewport and reduced motion retain controls without animation', async ({page}) => {
  await page.setViewportSize({width:1280,height:480});
  await page.emulateMedia({reducedMotion:'reduce'});
  await setup(page);
  await page.evaluate(()=>window.scrollTo(0,500));
  await expect.poll(()=>page.locator('.editor-top').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(56);
  expect(await page.locator('.editor-top').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  const sidebar=page.locator('.editor-settings');
  await sidebar.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await expect(page.getByRole('button',{name:'Lưu trữ',exact:true})).toBeInViewport();
  await page.getByRole('button',{name:'Lưu trữ',exact:true}).focus();
  await expect(page.getByRole('button',{name:'Lưu trữ',exact:true})).toBeFocused();
  await page.screenshot({path:'/tmp/editor-motion-short.png'});
});
test('mobile keeps one column and touch targets available', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  try {
    await setup(page);
    await page.evaluate(()=>window.scrollTo(0,500));
    await expect.poll(()=>page.locator('.editor-top').evaluate(el=>Math.round(el.getBoundingClientRect().height))).toBe(56);
    expect(await page.locator('.editor-settings').evaluate(el=>getComputedStyle(el).position)).toBe('static');
    expect(await page.locator('.editor-layout').evaluate(el=>getComputedStyle(el).display)).toBe('block');
    await page.getByRole('button',{name:'Lưu trữ',exact:true}).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button',{name:'Lưu trữ',exact:true})).toBeInViewport();
    const targets=await page.locator('.editor-top button, .editor-settings .button').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().width>0).map(el=>el.getBoundingClientRect().height));
    expect(targets.every(height=>height>=44)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:'/tmp/editor-motion-mobile.png'});
    await page.setViewportSize({width:320,height:700});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  } finally {await context.close();}
});
