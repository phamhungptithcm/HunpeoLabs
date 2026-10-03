import { afterAll, expect, it, vi } from "vitest";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createHash, randomUUID } from "node:crypto";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({blogDb: () => db}));
import { createComment, changeComment, listComments, ownComments, publicThread, moderationQueue, reportComment } from "@/lib/blog/comments";
const enabled = process.env.BLOG_COMMENT_EMULATOR === "true";
if (enabled && process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:18082") throw new Error("Dedicated isolated local emulator required");
const app = enabled ? initializeApp({projectId:"demo-hunpeolabs-comment-auto-037"},randomUUID()) : null;
const db = app ? getFirestore(app) : null;
const moderator = {uid:"synthetic-moderator", name:"Synthetic moderator",verified:true,role:"admin" as const};
const reader = () => ({uid:randomUUID(),name:"Synthetic reader",verified:true});
async function fixture() {
  const id = randomUUID();
  await db!.doc(`blogPublished/${id}`).set({commentsEnabled:true,commentCount:0});
  await db!.doc(`blogPosts/${id}`).set({commentCount:0});
  return id;
}
async function send(actor: ReturnType<typeof reader>, postId: string, text: string, parentId = "", operationId = randomUUID()) {
  const result = await createComment(actor,{postId,text,parentId,operationId});
  return { ...result, id:createHash("sha256").update(`${actor.uid}:${operationId}`).digest("hex"),operationId };
}
async function counts(id: string, expected: number) {
  expect((await db!.doc(`blogPublished/${id}`).get()).get("commentCount")).toBe(expected);
  expect((await db!.doc(`blogPosts/${id}`).get()).get("commentCount")).toBe(expected);
}
afterAll(async()=>{if(db && app){await db.terminate(); await deleteApp(app);}});
it.skipIf(!enabled)("safe create is atomic, idempotent, private and verified-only",async()=>{
  const p=await fixture(), a=reader(),operationId=randomUUID();
  await expect(send({...a,verified:false},p,"Not verified")).rejects.toThrow("VERIFY_EMAIL");
  await expect(createComment(a,{postId:p,text:"Bot",operationId:randomUUID(),website:"bot.example"})).rejects.toThrow();
  await expect(send(a,p,"\u200B\u200D\uFEFF")).rejects.toThrow();
  const results=await Promise.all([send(a,p,"Useful explanation", "",operationId),send(a,p,"Useful explanation", "",operationId)]);
  expect(results.map(r=>r.status)).toEqual(["approved","approved"]);
  await counts(p,1);
  const list=await listComments(p);
  expect(list.items).toHaveLength(1);
  for(const value of [list, await ownComments(p,a),await publicThread(p,results[0].id)]) {
    expect(JSON.stringify(value)).not.toContain(a.uid);
    expect(JSON.stringify(value)).not.toContain("moderationReasons");
    expect(JSON.stringify(value)).not.toContain("reputation");
  }
  await expect(changeComment(results[0].id,reader(),"edit",1,"Hijack")).rejects.toThrow("FORBIDDEN");
  await expect(changeComment(results[0].id,a,"approved",1)).rejects.toThrow("FORBIDDEN");
},30000);
it.skipIf(!enabled)("simultaneous repeated submissions hold one, and moderators see reasons",async()=>{
  const p=await fixture(),a=reader();
  const result=await Promise.all([send(a,p,"Same content"),send(a,p," SAME  content ")]);
  expect(result.map(r=>r.status).sort()).toEqual(["approved","pending"]);
  await counts(p,1);
  const queue=await moderationQueue(moderator);
  expect(queue.find(c=>c.id===result.find(r=>r.status==="pending")!.id)?.moderationReasons).toContain("Nội dung lặp lại trong 24 giờ");
  await expect(moderationQueue(a)).rejects.toThrow("FORBIDDEN");
  const other=await fixture();
  expect((await send(a,other,"Same content")).status).toBe("pending");
},30000);
it.skipIf(!enabled)("edits recheck spam and maintain complete thread counts, conflicts and closed posts",async()=>{
  const p=await fixture(),a=reader();
  const root=await send(a,p,"Helpful root"),reply=await send(reader(),p,"Helpful reply",root.id);
  await counts(p,2);
  expect((await changeComment(root.id,a,"edit",1,"Updated clean root")).status).toBe("approved");
  await counts(p,2);
  expect((await changeComment(root.id,a,"edit",2,"https://example.com/a https://example.com/b")).status).toBe("pending");
  await counts(p,0);
  await expect(publicThread(p,reply.id)).rejects.toThrow("NOT_FOUND");
  await expect(send(reader(),p,"New reply",root.id)).rejects.toThrow("INVALID_PARENT");
  await expect(changeComment(root.id,a,"edit",2,"Old revision")).rejects.toThrow("REVISION_CONFLICT");
  await changeComment(root.id,moderator,"approved",3);
  await counts(p,2);
  await changeComment(root.id,a,"delete",4);
  await counts(p,1);
  expect((await publicThread(p,reply.id)).parent.text).toBe("");
  await db!.doc(`blogPublished/${p}`).update({commentsEnabled:false});
  await expect(send(reader(),p,"Closed")).rejects.toThrow("COMMENTS_CLOSED");
},30000);
it.skipIf(!enabled)("trust cannot be farmed by auto approvals, restrictions reverse on restore, reports never hide",async()=>{
  const p=await fixture(),a=reader();
  const roots=[];
  for(let i=0;i<3;i++)roots.push(await send(a,p,`Clean distinct ${i}`));
  const links="References https://example.com/a https://example.com/b";
  const held=await send(a,p,links);
  expect(held.status).toBe("pending");
  for(const root of roots)await changeComment(root.id,moderator,"approved",1);
  // Repeating the same manually approved action cannot manufacture extra trust credit.
  await changeComment(roots[0].id,moderator,"approved",2);
  const repRef=db!.doc(`blogCommentReputation/${createHash("sha256").update(a.uid).digest("hex")}`);
  expect((await repRef.get()).get("approvedCount")).toBe(3);
  expect((await send(a,p,`${links}/c`)).status).toBe("approved");
  await changeComment(roots[0].id,moderator,"hidden",3);
  expect((await send(a,p,"Clean while restricted")).status).toBe("pending");
  expect((await repRef.get()).get("restrictedCount")).toBe(1);
  await changeComment(roots[0].id,moderator,"approved",4);
  expect((await repRef.get()).get("restrictedCount")).toBe(0);
  expect((await send(a,p,"Clean after restored")).status).toBe("approved");
  const reporter=reader();
  await reportComment(roots[1].id,reporter,"Synthetic report");
  await reportComment(roots[1].id,reporter,"Synthetic retry");
  expect((await db!.doc(`blogComments/${roots[1].id}`).get()).get("status")).toBe("approved");
  expect((await repRef.get()).get("restrictedCount")).toBe(0);
  await changeComment(roots[1].id,a,"edit",2,"Clean edited content");
  expect((await repRef.get()).get("approvedCount")).toBe(2);
},30000);
it.skipIf(!enabled)("deleted restricted comments retain their history, invalid edits roll back, legacy comments still work",async()=>{
  const p=await fixture(),a=reader(),c=await send(a,p,"A normal comment");
  await expect(changeComment(c.id,a,"edit",1," ")).rejects.toThrow();
  expect((await db!.doc(`blogComments/${c.id}`).get()).get("revision")).toBe(1);
  await counts(p,1);
  await changeComment(c.id,moderator,"rejected",1);
  await changeComment(c.id,a,"delete",2);
  expect((await send(a,p,"New clean content")).status).toBe("pending");
  const legacy=await send(reader(),p,"Legacy fixture");
  const legacyDoc=db!.doc(`blogComments/${legacy.id}`);
  const old=(await legacyDoc.get()).data()!;
  delete old.reputationCredit; delete old.reputationRestriction;delete old.moderationReasons;
  await legacyDoc.set(old);
  await changeComment(legacy.id,moderator,"hidden",1);
  await counts(p,0);
},30000);

it.skipIf(!enabled)("reply edits under held roots remain private and independent creates do not lose counts",async()=>{
  const p=await fixture(),a=reader();
  const root=await send(a,p,"Root to hold"), replyAuthor=reader();
  const reply=await send(replyAuthor,p,"Reply before root held",root.id);
  await changeComment(root.id,a,"edit",1,"Buy now!");
  expect((await changeComment(reply.id,replyAuthor,"edit",1,"Clean revised reply")).status).toBe("pending");
  await counts(p,0);
  await changeComment(root.id,moderator,"approved",2);
  await counts(p,1);
  await changeComment(reply.id,moderator,"approved",2);
  await counts(p,2);
  await Promise.all([send(reader(),p,"Distinct A"),send(reader(),p,"Distinct B"),send(reader(),p,"Distinct C")]);
  await counts(p,5);
},30000);
