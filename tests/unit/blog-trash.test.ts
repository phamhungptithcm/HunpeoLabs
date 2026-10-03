import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
const state=vi.hoisted(()=>({ post:null as unknown, published:false, writes:[] as {path:string;data:Record<string,unknown>}[] }));
vi.mock('@/lib/firebase-admin',()=>({
 blogEnabled:()=>true,
 blogDb:()=>({collection:(name:string)=>({doc:(id:string)=>({path:`${name}/${id}`,collection:(sub:string)=>({doc:(rev:string)=>({path:`${name}/${id}/${sub}/${rev}`})})})}),
 runTransaction:async(fn:(tx:unknown)=>Promise<unknown>)=>fn({get:async(ref:{path:string})=>({exists:ref.path.startsWith('blogPublished')?state.published:true,data:()=>state.post}),set:(ref:{path:string},data:Record<string,unknown>)=>state.writes.push({path:ref.path,data})})}),
}));
import { saveDraft } from '@/lib/blog/repository';
import { emptyDraft, type Actor, type Post } from '@/lib/blog/schema';
const actor:Actor={uid:'owner',name:'Writer',role:'author',verified:true};
function fixture():Post{return {...emptyDraft,id:'article',owner:'owner',assignee:'owner',state:'archived',revision:3,updatedAt:'2026-01-01T00:00:00Z'};}
afterEach(()=>{state.writes=[];state.published=false});
it('restores archived article as a draft without publishing or changing ownership',async()=>{
 const old=fixture();state.post=old;
 const restored=await saveDraft(old.id,actor,old,3);
 expect(restored.state).toBe('draft');expect(restored.owner).toBe('owner');expect(restored.revision).toBe(4);
 expect(state.writes.some(w=>w.path.startsWith('blogPublished'))).toBe(false);
});
it('rejects unauthorized restoration and stale revisions without writes',async()=>{
 const old=fixture();state.post=old;
 await expect(saveDraft(old.id,{...actor,uid:'other'},old,3)).rejects.toThrow('FORBIDDEN');
 await expect(saveDraft(old.id,actor,old,2)).rejects.toThrow('REVISION_CONFLICT');expect(state.writes).toEqual([]);
});
it('retains guard requiring published articles to be unpublished before trash',async()=>{
 const old=fixture();state.post=old;state.published=true;
 await expect(saveDraft(old.id,actor,old,3,'archived')).rejects.toThrow('UNPUBLISH_FIRST');expect(state.writes).toEqual([]);
});
