import { expect, it } from 'vitest';
import { codeSource, matchesPublicPost, queryWords, relatedPublicPosts, scanPublicSearch } from '@/lib/blog/discovery';
import { emptyDraft, type PublishedPost } from '@/lib/blog/schema';
function post(id: string, category='Engineering', tags=['agents']): PublishedPost {
 return { ...emptyDraft, id, slug:id, title:'An agent at work', summary:'A practical example', category, tags, author:'Writer', authorAvatarId:'', authorBio:'', publishedAt:'2026-01-01T00:00:00Z', updatedAt:'2026-01-01T00:00:00Z', readingMinutes:1, revision:1, body:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Ví dụ dễ hiểu về kiểm thử và sơ đồ.'}]}]} };
}
it('matches all query words in published prose or topics, insensitive to case and Vietnamese accents', () => {
 const article = post('a');
 expect(matchesPublicPost(article, queryWords('KIEM THU'))).toBe(true);
 expect(matchesPublicPost(article, queryWords('AI nonexistent'))).toBe(false);
 expect(matchesPublicPost(article, queryWords('agent engineering'))).toBe(true);
 expect(queryWords('!!!')).toEqual([]);
 expect(queryWords('Đồ đồ')).toEqual(['do']);
});
function loader(length: number) {
 let reads = 0;
 return { load:async(cursor: string|undefined,limit:number)=>{const from=Number(cursor||0); const items=Array.from({length:Math.min(limit,length-from)},(_,i)=>from+i+1);reads+=items.length;return {items,next:from+items.length<length?String(from+items.length):null};}, reads:()=>reads };
}
it('cursor preserves unprocessed fetched documents when result page fills', async()=>{
 const data=loader(80);
 const first=await scanPublicSearch(data.load,String,n=>n%3===0,{limit:4});
 expect(first.items).toEqual([3,6,9,12]);expect(first.next).toBe('12');
 const second=await scanPublicSearch(data.load,String,n=>n%3===0,{cursor:first.next!,limit:4});
 expect(second.items).toEqual([15,18,21,24]);
});
it('bounded sparse search continues into older posts rather than claiming global no results',async()=>{
 const data=loader(220);
 const first=await scanPublicSearch(data.load,String,n=>n===215,{limit:20});
 expect(first.items).toEqual([]);expect(first.next).toBe('200');expect(data.reads()).toBe(200);
 const second=await scanPublicSearch(data.load,String,n=>n===215,{cursor:first.next!,limit:20});
 expect(second.items).toEqual([215]);expect(second.next).toBeNull();
});
it('related articles rank shared tags/category, exclude self, duplicates and unrelated content',()=>{
 const current=post('self'); const tagOnly=post('tag','Product'); const sameTopic=post('topic','Engineering',[]); const strong=post('both');
 expect(relatedPublicPosts(current,[current,tagOnly,sameTopic,strong,strong,post('other','Design',[]) ]).map(p=>p.id)).toEqual(['both','topic','tag']);
});
it('code copy preserves whitespace, special characters and line breaks exactly',()=>{
 expect(codeSource({content:[{text:'  const x = "<>&";\n'},{text:'\treturn x;\n'}]})).toBe('  const x = "<>&";\n\treturn x;\n');
});
