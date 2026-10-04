'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { parseReadingState } from '@/lib/blog/reading-state';
export function BlogSavedArticles(){
  const [slugs,setSlugs]=useState<string[]>([]);
  useEffect(()=>{const read=()=>{try{const items:string[]=[];for(let i=0;i<Math.min(localStorage.length,2000);i++){const key=localStorage.key(i);if(key?.startsWith('hl-reading-v1:')){const slug=key.slice(14);if(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length<=100 && parseReadingState(localStorage.getItem(key)).saved)items.push(slug);}}setSlugs(items.slice(0,100));}catch{setSlugs([]);}};read();window.addEventListener('focus',read);window.addEventListener('storage',read);return()=>{window.removeEventListener('focus',read);window.removeEventListener('storage',read);};},[]);
  return slugs.length ? <details className="container related-stories"><summary>Saved articles on this device ({slugs.length})</summary><ul>{slugs.map(slug=><li key={slug}><Link href={`/resources/blog/${slug}`}>{slug.replaceAll('-',' ')}</Link></li>)}</ul></details> : null;
}
