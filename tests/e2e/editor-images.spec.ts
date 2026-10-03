import {test,expect,type Page} from '@playwright/test';
const origin=process.env.EDITOR_IMAGE_FIXTURE;
test.skip(!origin,'Requires isolated synthetic image editor fixture');
async function setup(page:Page){
 await page.route('**/api/blog/media/demo',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#dbe4ff"/></svg>'}));
 await page.goto(`${origin}/image-fixture`);await expect(page.locator('.tiptap img')).toBeVisible();
}
async function transfer(page:Page,kind:'paste'|'drop',type='image/png',mixed=false){
 await page.locator('.tiptap').focus();
 await page.locator('.tiptap').evaluate((element,{kind,type,mixed})=>{
 const data=new DataTransfer();data.items.add(new File([new Uint8Array([137,80,78,71])],'photo.png',{type}));if(mixed)data.setData('text/plain','photo.png');
 if(kind==='paste')element.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));
 else {const rect=element.getBoundingClientRect();element.dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true,cancelable:true,clientX:rect.left+30,clientY:rect.top+20}));}
 },{kind,type,mixed});
}
test('resize and width presets persist through validation and public preview, with centered fit',async({page})=>{
 await setup(page);const image=page.locator('.tiptap img');await image.click();
 const tools=page.getByRole('toolbar',{name:'Chỉnh ảnh'});await expect(tools).toBeVisible();
 await tools.getByRole('button',{name:'Chiều rộng ảnh 50%'}).click();
 const body=JSON.parse(await page.locator('#body').innerText());const attrs=body.content.find((n:{type:string})=>n.type==='image').attrs;
 expect(attrs.width).toBeGreaterThan(100);expect(attrs.height/attrs.width).toBeCloseTo(360/640,2);
 await expect(page.locator('.article-image')).toHaveAttribute('style',new RegExp(`width: ${attrs.width}px`));
 expect(await page.locator('.article-image').evaluate(e=>e.getBoundingClientRect().width)).toBeLessThanOrEqual(attrs.width);
 const handle=page.locator('[data-resize-handle="bottom-right"]');const box=await handle.boundingBox();expect(box).toBeTruthy();
 await page.mouse.move(box!.x+5,box!.y+5);await page.mouse.down();await page.mouse.move(box!.x+70,box!.y+40,{steps:8});await page.mouse.up();
 const resized=JSON.parse(await page.locator('#body').innerText()).content.find((n:{type:string})=>n.type==='image').attrs;expect(resized.width).not.toBe(attrs.width);
 await page.getByRole('button',{name:'Save and reopen'}).click();await expect(image).toHaveAttribute('style',new RegExp(`width: ${resized.width}px`));await image.click();
 await tools.getByRole('button',{name:'Tự cân',exact:true}).click();expect(JSON.parse(await page.locator('#body').innerText()).content.find((n:{type:string})=>n.type==='image').attrs.width).toBeUndefined();
 await page.setViewportSize({width:320,height:700});expect((await image.boundingBox())!.width).toBeLessThanOrEqual(280);
 await expect.poll(async()=>{const b=await tools.boundingBox();return b!==null&&b.x>=0&&b.x+b.width<=320;}).toBe(true);
 await page.screenshot({path:test.info().outputPath('image-mobile.png')});
});
test('paste with filename and external file drop upload once and insert without extra modal',async({page})=>{
 await setup(page);await transfer(page,'paste','image/png',true);await expect(page.locator('.tiptap img')).toHaveCount(2);await expect(page.locator('#uploads')).toHaveText('1');await expect(page.getByRole('dialog')).toHaveCount(0);
 await transfer(page,'drop');await expect(page.locator('.tiptap img')).toHaveCount(3);await expect(page.locator('#uploads')).toHaveText('2');
 await page.getByRole('button',{name:'Hoàn tác',exact:true}).click();await expect(page.locator('.tiptap img')).toHaveCount(2);await page.getByRole('button',{name:'Làm lại',exact:true}).click();await expect(page.locator('.tiptap img')).toHaveCount(3);
});
test('unsupported clipboard file is rejected and a valid retry succeeds',async({page})=>{
 await setup(page);await transfer(page,'paste','image/svg+xml');await expect(page.locator('#error')).toContainText('JPG');await expect(page.locator('#uploads')).toHaveText('0');await transfer(page,'paste');await expect(page.locator('.tiptap img')).toHaveCount(2);
});

test('blocked website image preserves content and permits file retry under existing CSP',async({page})=>{
 await setup(page);
 await page.locator('.tiptap').evaluate(element=>{const data=new DataTransfer();data.setData('text/html','<img src="https://images.example/photo.png">');data.setData('text/plain','https://images.example/photo.png');element.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));});
 await expect(page.locator('#error')).toContainText('Lưu ảnh về máy');await expect(page.locator('#uploads')).toHaveText('0');await expect(page.locator('.tiptap img')).toHaveCount(1);
 await transfer(page,'paste');await expect(page.locator('.tiptap img')).toHaveCount(2);
});
test('upload failure releases lock and typing during retry is retained',async({page})=>{
 await setup(page);await page.evaluate(()=>localStorage.setItem('fail-upload','1'));await transfer(page,'paste');await expect(page.locator('#error')).toContainText('Upload failed');await expect(page.locator('.tiptap img')).toHaveCount(1);
 await page.evaluate(()=>localStorage.removeItem('fail-upload'));await transfer(page,'paste');await page.keyboard.type('Still writing');await expect(page.locator('.tiptap img')).toHaveCount(2);await expect(page.locator('#body')).toContainText('Still writing');
});
