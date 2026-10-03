import {describe,it,expect,vi,afterEach} from 'vitest';
import {imageDimension,transferFiles,fetchImageFile,IMAGE_BYTES} from '@/lib/blog/editor-image';
import {validateBody} from '@/lib/blog/schema';
const image=(attrs:Record<string,unknown>)=>({type:'doc',content:[{type:'image',attrs:{src:'/api/blog/media/demo',alt:'Photo',...attrs}}]});
describe('persistent editor image dimensions',()=>{
 it('retains bounded rounded dimensions and legacy images without size',()=>{
  expect(validateBody(image({width:320.4,height:180.2})).content?.[0].attrs).toMatchObject({width:320,height:180});
  expect(validateBody(image({width:null,height:null})).content?.[0].attrs).not.toHaveProperty('width');
  expect(validateBody(image({})).content?.[0].attrs?.src).toBe('/api/blog/media/demo');
 });
 it('rejects unsafe dimensions and keeps owned media URL restriction',()=>{
  for(const width of [-1,0,Infinity,NaN,10001,'300','100%;position:fixed']) expect(()=>validateBody(image({width}))).toThrow('INVALID_IMAGE_SIZE');
  for(const src of ['https://example.com/a.png','data:image/png;base64,abc','blob:demo']) expect(()=>validateBody(image({src}))).toThrow('INVALID_IMAGE');
  expect(imageDimension(undefined)).toBeNull();
 });
 it('falls back to clipboard file items and does not duplicate direct files',()=>{
  const file={name:'photo.png',type:'image/png',size:123} as File;
  const items=[{kind:'string',getAsFile:()=>null},{kind:'file',getAsFile:()=>file}] as DataTransferItem[];
  expect(transferFiles({files:[] as unknown as FileList,items:items as unknown as DataTransferItemList})).toEqual([file]);
  expect(transferFiles({files:[file] as unknown as FileList,items:items as unknown as DataTransferItemList})).toEqual([file]);
 });
});

describe('bounded browser image import',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it('imports a supported image without credentials or referrer',async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/png'}}));vi.stubGlobal('fetch',fetch);
  const file=await fetchImageFile('https://images.example/a.png');expect(file.size).toBe(3);expect(file.type).toBe('image/png');expect(fetch.mock.calls[0][1]).toMatchObject({credentials:'omit',referrerPolicy:'no-referrer'});
 });
 it('rejects unsupported protocols, MIME and oversized streamed images',async()=>{
  await expect(fetchImageFile('http://images.example/a.png')).rejects.toThrow('Lưu ảnh');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('svg',{headers:{'content-type':'image/svg+xml'}})));await expect(fetchImageFile('https://images.example/a.png')).rejects.toThrow('JPG');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(new Uint8Array(IMAGE_BYTES+1),{headers:{'content-type':'image/png'}})));await expect(fetchImageFile('https://images.example/a.png')).rejects.toThrow('5 MB');
 });
});
