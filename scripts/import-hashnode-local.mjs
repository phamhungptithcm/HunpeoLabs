/** Import the checked-in, user-owned originals into the local preview only. */
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const root = path.resolve(import.meta.dirname, "..");
const collection = JSON.parse(fs.readFileSync(path.join(root, "content/blog/collection.json"), "utf8"));
const origin = "http://localhost:3120";
const receiptPath = path.join(root, ".ai/local/blog-editorial/import-receipt.json");
function inline(text, marks = []) {
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)| {2}\n/g;
  const nodes = []; let cursor = 0;
  for (const match of text.matchAll(re)) {
    if (match.index > cursor) nodes.push({type:"text", text:text.slice(cursor,match.index), ...(marks.length?{marks}:{})});
    if (match[1]) nodes.push(...inline(match[1],[...marks,{type:"bold"}]));
    else if (match[2]) nodes.push(...inline(match[2],[...marks,{type:"italic"}]));
    else if (match[3]) nodes.push({type:"text",text:match[3],marks:[...marks,{type:"code"}]});
    else if (match[4]) nodes.push(...inline(match[4],[...marks,{type:"link",attrs:{href:match[5]}}]));
    else nodes.push({type:"hardBreak"});
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push({type:"text",text:text.slice(cursor),...(marks.length?{marks}:{})});
  return nodes;
}
function richText(markdown, title) {
  assert(markdown.startsWith(`# ${title}\n`));
  const body = markdown.slice(markdown.indexOf("\n")+1).trim();
  const content = [];
  for (const block of body.split(/\n\s*\n/)) {
    if (block === "* * *") {content.push({type:"horizontalRule"});continue;}
    const h=block.match(/^(#{2,3}) (.+)$/s);
    if (h) {content.push({type:"heading",attrs:{level:h[1].length},content:inline(h[2])});continue;}
    if (block.startsWith("*   ")) {
      const item={type:"listItem",content:[{type:"paragraph",content:inline(block.slice(4))}]};
      if(content.at(-1)?.type==="bulletList") content.at(-1).content.push(item);
      else content.push({type:"bulletList",content:[item]});
      continue;
    }
    assert(!/^(?:#{1,6} |>|!\[|```|- )/.test(block),"Unsupported Markdown block");
    content.push({type:"paragraph",content:inline(block)});
  }
  // Compare prose independently of formatting. Exact original Markdown is retained too.
  const plain = body.replace(/^#{2,3} /gm,"").replace(/^\*   /gm,"").replace(/^\* \* \*$/gm,"")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,"$1").replace(/\*\*|`|\*/g,"");
  const text=n=>(n.text||"")+(n.content||[]).map(text).join(n.type==="paragraph"||n.type==="heading"?"":" ");
  const normalize=s=>s.replace(/\s+/g,"");
  assert.equal(normalize(text({content})),normalize(plain),"Content changed during conversion");
  return {type:"doc",content};
}
const drafts = collection.posts.map(post=>{
  const bytes=fs.readFileSync(path.join(root,"content/blog",post.file));
  assert.equal(createHash("sha256").update(bytes).digest("hex"),post.sourceSha256);
  return {...post,body:richText(bytes.toString("utf8"),post.title)};
});
if (!process.argv.includes("--publish-local")) {
  console.log(`Validated ${drafts.length} original documents and lossless text conversion. Use --publish-local for localhost:3120 preview.`);
  process.exit(0);
}
// Exact emulator endpoint and project are deliberately not configurable.
const emulator=await fetch("http://127.0.0.1:19441/emulators").then(r=>r.json());
assert.equal(emulator.auth?.port,19109,"Preview Auth emulator unavailable");
const email="hunpeo@gmail.com";
const jwt=[Buffer.from(JSON.stringify({alg:"none",typ:"JWT"})).toString("base64url"),Buffer.from(JSON.stringify({sub:email,email,email_verified:true,name:"Local Google Owner"})).toString("base64url"),""].join(".");
const signed=await fetch("http://127.0.0.1:19109/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestUri:origin,postBody:new URLSearchParams({id_token:jwt,providerId:"google.com"}).toString(),returnSecureToken:true})}).then(r=>r.json());
assert(signed.idToken,"Emulator sign-in failed");
const claims=JSON.parse(Buffer.from(signed.idToken.split(".")[1],"base64url").toString());
assert.equal(claims.aud,"demo-hunpeolabs-blog-preview-003");
let cookie="";
async function api(url,method="GET",body) {
  const response=await fetch(origin+url,{method,headers:{origin,"x-blog-request":"1","Content-Type":"application/json",...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(url==="/api/blog/session"&&method==="POST")cookie=response.headers.get("set-cookie")?.split(";")[0]||"";
  const data=await response.json();
  assert(response.ok,`${method} ${url}: ${response.status} ${JSON.stringify(data)}`);return data;
}
await api("/api/blog/session","POST",{idToken:signed.idToken});
await api("/api/admin/blog/authors","POST",collection.author);
const existing=[];let cursor;
do {const page=await api("/api/admin/blog/posts"+(cursor?"?cursor="+encodeURIComponent(cursor):""));existing.push(...page.items);cursor=page.next;}while(cursor);
const result=[];
for (const post of drafts) {
  let current=existing.find(p=>p.slug===post.slug);
  current=current?await api(`/api/admin/blog/posts/${current.id}`):await api("/api/admin/blog/posts","POST");
  const draft={title:post.title,slug:post.slug,summary:post.summary,answer:"",authorId:collection.author.id,assignee:current.assignee,category:post.category,tags:post.tags,language:"en",coverId:current.coverId||"",commentsEnabled:true,seoTitle:post.title,seoDescription:post.summary,sources:[{title:post.title,url:post.sourceUrl}],body:post.body};
  const saved=await api(`/api/admin/blog/posts/${current.id}`,"PUT",{revision:current.revision,draft});
  await api(`/api/admin/blog/posts/${current.id}/publish`,"POST",{revision:saved.revision,operationId:randomUUID()});
  const readback=await api(`/api/admin/blog/posts/${current.id}`);
  assert.deepEqual(readback.body,post.body);
  result.push({id:current.id,slug:post.slug,sourceSha256:post.sourceSha256});
}
// Only retire known untouched design fixtures; never delete drafts or arbitrary user posts.
for(const id of ["66wA9yRQrEDqvIj7fjZw","3Q3TQvNNwsM70w2kr8Xx","AdQCCvj8EBrgXPh1zYQg"]){
  const old=existing.find(p=>p.id===id);if(!old||old.state!=="published")continue;
  const full=await api(`/api/admin/blog/posts/${id}`);
  if(JSON.stringify(full.body).includes("Bài mẫu để duyệt giao diện blog."))
    await api(`/api/admin/blog/posts/${id}/unpublish`,"POST",{revision:full.revision});
}
fs.mkdirSync(path.dirname(receiptPath),{recursive:true});
fs.writeFileSync(receiptPath,JSON.stringify({origin,project:claims.aud,articles:result},null,2)+"\n");
console.log(JSON.stringify({imported:result.length,urls:result.map(p=>origin+"/resources/blog/"+p.slug)},null,2));
