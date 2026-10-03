import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({records:[] as Record<string,unknown>[], reads:0, collections:[] as string[]}));
vi.mock('@/lib/firebase-admin',()=>({blogEnabled:()=>true,blogDb:()=>({collection:(name:string)=>{
 state.collections.push(name); if(name!=='blogPublished') throw new Error('PRIVATE_COLLECTION_READ');
 const conditions: {field:string;op:string;value:unknown}[]=[]; let after:string|undefined;let limit=20;
 const query={where:(field:string,op:string,value:unknown)=>{conditions.push({field,op,value});return query;},orderBy:()=>query,startAfter:(_date:string,id:string)=>{after=id;return query;},limit:(n:number)=>{limit=n;return query;},get:async()=>{
  const filtered=state.records.filter(post=>conditions.every(c=>c.op==='in'?(c.value as unknown[]).includes(post[c.field]):c.op==='array-contains'?(post[c.field] as unknown[]).includes(c.value):post[c.field]===c.value));
  const from=after?filtered.findIndex(p=>p.id===after)+1:0;
  const selected=filtered.slice(from,from+limit);state.reads+=selected.length;
  return {size:selected.length,docs:selected.map(post=>({id:post.id as string,data:()=>post,get:(key:string)=>post[key]}))};
 }};return query;
}})}));
import { listPublished } from '@/lib/blog/repository';
import { emptyDraft } from '@/lib/blog/schema';
function article(index:number,word='Hidden keyword') {return {...emptyDraft,id:`p${String(index).padStart(4,'0')}`,slug:`article-${index}`,title:'Public title',summary:'Public summary',category:'Engineering',tags:['agents'],author:'Writer',authorAvatarId:'',authorBio:'',publishedAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',readingMinutes:1,revision:1,body:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:word}]}]}};}
afterEach(()=>{state.records=[];state.reads=0;state.collections=[]});
it('actual public repository searches body with all words and respects topic/tag filters',async()=>{
 state.records=[article(1),{...article(2),category:'Design'},{...article(3),tags:['other']}];
 const found=await listPublished({q:'hidden keyword',category:'Engineering',tag:'agents'});
 expect(found.items.map(p=>p.id)).toEqual(['p0001']);
 expect((await listPublished({q:'hidden absent'})).items).toEqual([]);
 expect(new Set(state.collections)).toEqual(new Set(['blogPublished']));
});
it('actual repository paginates search without dropping fetched matches',async()=>{
 state.records=Array.from({length:60},(_,i)=>article(i+1));
 const first=await listPublished({q:'keyword',limit:20});
 const second=await listPublished({q:'keyword',limit:20,cursor:first.next!});
 expect(first.items.at(-1)?.id).toBe('p0020');expect(second.items[0].id).toBe('p0021');
 expect(new Set([...first.items,...second.items].map(p=>p.id)).size).toBe(40);
});
it('sparse repository search bounds reads including lookahead and resumes later candidates',async()=>{
 state.records=Array.from({length:220},(_,i)=>article(i+1,i===214?'needle':'ordinary'));
 const first=await listPublished({q:'needle'});
 expect(first.items).toEqual([]);expect(first.next).toBeTruthy();expect(state.reads).toBe(204);
 const second=await listPublished({q:'needle',cursor:first.next!});
 expect(second.items.map(p=>p.id)).toEqual(['p0215']);expect(second.next).toBeNull();
});
it('punctuation-only queries do not silently return the entire feed',async()=>{
 state.records=[article(1)];expect((await listPublished({q:'!!!'})).items).toEqual([]);expect(state.reads).toBe(0);
});
