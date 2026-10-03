import {expect,test,type Page} from '@playwright/test';
const origin=process.env.SCHEDULE_DESIGN_FIXTURE;
test.skip(!origin,'Requires isolated synthetic editor/list fixture');
async function setup(page:Page) {
 await page.clock.setFixedTime(new Date('2026-10-03T12:00:00Z'));
 await page.route('**/api/**',route=>{
  const req=route.request();
  return route.fulfill({json:req.url().includes('schedule') ? (req.method()==='POST'?{ok:true,dueAt:req.postDataJSON().dueAt}:{dueAt:null,error:null}):[]});
 });
 await page.goto(`${origin}/editor-fixture`);
 await expect(page.locator('.tiptap')).toBeVisible();
 await page.getByRole('button',{name:'Xuất bản',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
}
test('calendar keyboard selection and matched actions schedule the selected local instant',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await setup(page);
 const dialog=page.getByRole('dialog'),now=dialog.getByRole('button',{name:'Xuất bản ngay',exact:true}),schedule=dialog.getByRole('button',{name:'Lên lịch',exact:true});
 await expect(schedule).toBeDisabled();
 await expect(dialog.locator('[data-day="2026-10-02"]')).toBeDisabled();
 await dialog.locator('[data-day="2026-10-03"]').focus();
 await page.keyboard.press('ArrowRight');await expect(dialog.locator('[data-day="2026-10-04"]')).toBeFocused();
 await page.keyboard.press('Enter');await expect(schedule).toBeEnabled();
 await page.getByLabel('Giờ xuất bản',{exact:true}).fill('10:30');
 await expect(dialog.locator('.schedule-summary')).toContainText('10:30');
 const a=await now.boundingBox(),b=await schedule.boundingBox();
 expect(a&&b).toBeTruthy();expect(Math.abs(a!.y-b!.y)).toBeLessThan(1);expect(Math.abs(a!.width-b!.width)).toBeLessThan(1);expect(a!.height).toBeGreaterThanOrEqual(44);
 const backgrounds=await dialog.locator('.publish-actions button').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));expect(backgrounds[0]).toBe(backgrounds[1]);
 await page.screenshot({path:test.info().outputPath('calendar-desktop.png')});
 const sent=page.waitForRequest(r=>r.method()==='POST'&&r.url().includes('/schedule'));
 await schedule.click();expect((await sent).postDataJSON().dueAt).toBe('2026-10-04T03:30:00.000Z');
 await expect(page).toHaveURL(`${origin}/admin/blog`);
});
test('mobile and short viewport retain calendar controls, error feedback and close focus',async({page})=>{
 await page.setViewportSize({width:390,height:600});await page.emulateMedia({reducedMotion:'reduce'});await setup(page);
 const dialog=page.getByRole('dialog');
 await dialog.locator('[data-day="2026-10-04"]').click();
 await page.getByLabel('Giờ xuất bản',{exact:true}).fill('09:00');
 await dialog.getByRole('button',{name:'Tháng sau'}).click();await expect(dialog.getByRole('grid')).toHaveAttribute('aria-label',/11/);
 await dialog.getByRole('button',{name:'Tháng trước'}).click();await expect(dialog.locator('[data-day="2026-10-04"]')).toHaveAttribute('aria-selected','true');
 await page.route('**/api/admin/blog/posts/*/schedule',route=>route.fulfill({status:503,json:{error:'SCHEDULER_NOT_CONFIGURED'}}));
 const schedule=dialog.getByRole('button',{name:'Lên lịch',exact:true});await schedule.scrollIntoViewIfNeeded();await schedule.click();
 await expect(dialog).toBeVisible();await expect(schedule).toBeEnabled();
 await expect(page.locator('.blog-toast[role=status]')).toContainText('Lịch đăng');
 await page.screenshot({path:test.info().outputPath('calendar-mobile.png')});
 await page.setViewportSize({width:320,height:480});
 expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await schedule.scrollIntoViewIfNeeded();await expect(schedule).toBeInViewport();
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Xuất bản',exact:true})).toBeFocused();
});
test('workspace shows real schedule dates and a stale revision hint without hiding draft status',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${origin}/list-fixture`);
 const row=page.getByRole('row').filter({hasText:'Bài viết đã lên lịch'});
 await expect(row).toContainText('Bản nháp');await expect(row).toContainText('Đã lên lịch');
 await expect(row.locator('time')).toHaveAttribute('datetime','2026-10-04T14:00:00Z');
 await expect(row.locator('time')).toContainText('04/10/2026');
 await expect(page.getByRole('row').filter({hasText:'Bản nháp đã thay đổi'})).toContainText('cần cập nhật lịch');
 await page.screenshot({path:test.info().outputPath('schedule-list.png')});
 expect(errors).toEqual([]);
});

test('direct month and year selection clamps allowed months and preserves the chosen date',async({page})=>{
 await setup(page);
 const dialog=page.getByRole('dialog'),month=dialog.getByLabel('Chọn tháng',{exact:true}),year=dialog.getByLabel('Chọn năm',{exact:true});
 await dialog.locator('[data-day="2026-10-04"]').click();
 await year.selectOption('2027');await month.selectOption('0');
 await expect(dialog.getByRole('grid')).toHaveAttribute('aria-label',/1 năm 2027/);
 await expect(dialog.locator('.schedule-summary')).toContainText('04/10/2026');
 await year.selectOption('2026');await expect(month).toHaveValue('9');
 await expect(month.locator('option[value="8"]')).toBeDisabled();
 await year.selectOption('2027');await expect(month.locator('option[value="10"]')).toBeDisabled();
 await month.selectOption('9');await expect(dialog.locator('[data-day="2027-10-05"]')).toBeDisabled();
 await page.setViewportSize({width:320,height:480});
 await month.scrollIntoViewIfNeeded();await expect(month).toBeInViewport();await expect(year).toBeInViewport();
 await expect(dialog.getByRole('button',{name:'Tháng trước'})).toBeInViewport();await expect(dialog.getByRole('button',{name:'Tháng sau'})).toBeInViewport();
 expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await page.screenshot({path:test.info().outputPath('month-year-mobile.png')});
});

for (const action of ['publish','schedule'] as const) test(`${action} shows immediate button progress and returns to article list on success`,async({page})=>{
 await setup(page);
 const dialog=page.getByRole('dialog');
 if(action==='schedule') await dialog.locator('[data-day="2026-10-04"]').click();
 let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});let calls=0;
 await page.route(`**/api/admin/blog/posts/*/${action}`,async route=>{calls++;await pending;await route.fulfill({json:{ok:true,dueAt:'2026-10-04T02:00:00Z'}});});
 const button=dialog.locator('.publish-actions button').nth(action==='publish'?0:1);
 await button.click();await expect(button).toHaveAttribute('aria-busy','true');await expect(button.locator('.publish-button-progress')).toBeVisible();
 await expect(dialog.locator('.publish-actions button').first()).toBeDisabled();await expect(dialog.locator('.publish-actions button').last()).toBeDisabled();
 await page.keyboard.press('Escape');await expect(dialog).toBeVisible();expect(calls).toBe(1);
 release();await expect(page).toHaveURL(`${origin}/admin/blog`);
});
test('publish failure keeps editor open and permits retry',async({page})=>{
 await setup(page);await page.route('**/api/admin/blog/posts/*/publish',route=>route.fulfill({status:503,json:{error:'SERVICE_UNAVAILABLE'}}));
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Xuất bản ngay',exact:true}).click();
 await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Xuất bản ngay',exact:true})).toBeEnabled();await expect(page).toHaveURL(`${origin}/editor-fixture`);
});
