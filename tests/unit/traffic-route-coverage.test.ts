import { expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { isPublicPath } from '@/lib/traffic/schema';
import { getPublishedCatalog } from '@/content/product-catalog';
import { services } from '@/content/site';
function pages(folder:string):string[]{return readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?pages(join(folder,entry.name)):entry.name==='page.tsx'?[join(folder,entry.name)]:[]);}
it('covers every current concrete public page and all catalog routes',()=>{
 const paths=pages('app').map(file=>file.replace(/^app/,'').replace(/\/page.tsx$/,'')||'/').filter(path=>!path.startsWith('/admin/')&&!path.includes('[')&&path!=='/blog-account');
 for(const path of paths)expect(isPublicPath(path),path).toBe(true);
 for(const product of getPublishedCatalog())expect(isPublicPath(`/products/${product.id}`)).toBe(true);
 for(const service of services)expect(isPublicPath(`/services/${service.slug}`)).toBe(true);
 expect(isPublicPath('/blog-account')).toBe(false); // redirect/account entry: final public blog route is measured.
});
