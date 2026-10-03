import { afterAll, expect, it, vi } from "vitest";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createHash, randomUUID } from "node:crypto";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({ blogEnabled: () => true, blogDb: () => db, blogApp: () => app }));
vi.mock("@/lib/blog/scheduler-auth", () => ({ authorizeScheduler: async () => {} }));
vi.mock("firebase-admin/auth", () => ({ getAuth: () => ({ getUser: async (uid:string) => ({ uid, email: "scheduler-test@example.com", emailVerified: true, disabled:false, providerData:[{providerId:"google.com"}] }) }) }));
import { POST as runWorker } from "@/app/api/internal/blog/scheduled/route";
import { accessId } from "@/lib/blog/access";
import { publish } from "@/lib/blog/repository";
import { createComment, changeComment, listComments } from "@/lib/blog/comments";
import { emptyDraft } from "@/lib/blog/schema";
const enabled = process.env.BLOG_RELIABILITY_EMULATOR === "true";
if(enabled && process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:18080") throw new Error("Explicit local emulator required");
const app = enabled ? initializeApp({projectId:"demo-hunpeolabs-reliability-039"},randomUUID()) : null;
const db = app ? getFirestore(app) : null;
const touched: string[]=[];
const actor={uid:"synthetic-admin",name:"Synthetic",verified:true,role:"admin" as const};
async function fixture(){
 const id=randomUUID(),authorId=randomUUID(),operationId=randomUUID();
 const draft={...emptyDraft,id,owner:actor.uid,revision:1,state:"draft",updatedAt:new Date().toISOString(),title:"Synthetic test",slug:`synthetic-${id}`,summary:"Synthetic summary",authorId,category:"Product",sources:[{title:"Reference",url:"https://example.com"}],body:{type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"Synthetic article body"}]}]}};
 await db!.doc(`blogPosts/${id}`).set(draft);await db!.doc(`blogAuthors/${authorId}`).set({name:"Synthetic"});
 touched.push(`blogPosts/${id}`,`blogAuthors/${authorId}`,`blogPublished/${id}`,`blogSlugs/${draft.slug}`,`blogSchedules/${id}`,`blogAudit/${id}_${operationId}`);
 return {id,operationId};
}
afterAll(async()=>{if(db&&app){for(const path of touched)await db.recursiveDelete(db.doc(path));await db.terminate();await deleteApp(app);}});
it.skipIf(!enabled)("scheduled publication is atomic, idempotent and respects cancellation/version changes",async()=>{
 const {id,operationId}=await fixture();
 const ref=db!.doc(`blogSchedules/${id}`);
 await ref.set({operationId,dueAt:new Date(Date.now()-1000).toISOString(),revision:1});
 await Promise.all([publish(id,actor,1,operationId,true),publish(id,actor,1,operationId,true)]);
 expect((await ref.get()).exists).toBe(false);expect((await db!.doc(`blogPublished/${id}`).get()).exists).toBe(true);
 const other=await fixture();
 await expect(publish(other.id,actor,1,other.operationId,true)).rejects.toThrow("SCHEDULE_CHANGED");
 await db!.doc(`blogSchedules/${other.id}`).set({operationId:other.operationId,dueAt:new Date(Date.now()-1000).toISOString()});
 await db!.doc(`blogPosts/${other.id}`).update({revision:2});
 await expect(publish(other.id,actor,1,other.operationId,true)).rejects.toThrow("REVISION_CONFLICT");
 expect((await db!.doc(`blogPublished/${other.id}`).get()).exists).toBe(false);
},30000);
it.skipIf(!enabled)("safe comments publish automatically and disappear after moderation hides them",async()=>{
 const {id,operationId}=await fixture();await publish(id,actor,1,operationId);
 const reader={uid:`synthetic-reader-${randomUUID()}`,name:"Synthetic reader",verified:true};const op=randomUUID();
 const cid=createHash("sha256").update(`${reader.uid}:${op}`).digest("hex");touched.push(`blogComments/${cid}`,`blogCommentReputation/${createHash("sha256").update(reader.uid).digest("hex")}`);
 await createComment(reader,{postId:id,text:"Synthetic comment",operationId:op});await createComment(reader,{postId:id,text:"Synthetic comment",operationId:op});
 expect((await listComments(id)).items).toHaveLength(1);
 await expect(changeComment(cid,reader,"approved",1)).rejects.toThrow("FORBIDDEN");
 await changeComment(cid,actor,"approved",1);expect((await listComments(id)).items).toHaveLength(1);
 await changeComment(cid,actor,"hidden",2);expect((await listComments(id)).items).toHaveLength(0);
},30000);

it.skipIf(!enabled)("worker rechecks grants and reports permission revocation without publication", async () => {
 const grantPath = `blogAccess/${accessId("scheduler-test@example.com")}`;
 touched.push(grantPath);
 await db!.doc(grantPath).set({ uid:actor.uid, active:false, role:"admin" });
 const {id,operationId}=await fixture();
 touched.push(`blogScheduleResults/${operationId}`,`blogScheduleStatus/${id}`);
 await db!.doc(`blogSchedules/${id}`).set({uid:actor.uid,operationId,revision:1,dueAt:new Date(Date.now()-1000).toISOString()});
 const response=await runWorker(new Request("http://localhost/worker",{method:"POST"}));
 expect(response.status).toBe(200);
 expect((await db!.doc(`blogPublished/${id}`).get()).exists).toBe(false);
 expect((await db!.doc(`blogScheduleStatus/${id}`).get()).get("error")).toBe("FORBIDDEN");
 expect((await db!.doc(`blogSchedules/${id}`).get()).exists).toBe(false);
},30000);
