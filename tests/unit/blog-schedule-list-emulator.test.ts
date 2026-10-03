import {afterAll, expect, it, vi} from "vitest";
import {initializeApp,deleteApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {randomUUID} from "node:crypto";
vi.mock("server-only",()=>({}));
vi.mock("@/lib/firebase-admin",()=>({blogDb:()=>db,blogEnabled:()=>true}));
import {listDrafts} from "@/lib/blog/repository";
const enabled=process.env.BLOG_SCHEDULE_LIST_EMULATOR==="true";
if(enabled && process.env.FIRESTORE_EMULATOR_HOST!=="127.0.0.1:18083")throw new Error("Dedicated synthetic local emulator required");
const app=enabled?initializeApp({projectId:"demo-hunpeolabs-schedule-design-044"},randomUUID()):null;
const db=app?getFirestore(app):null;
afterAll(async()=>{if(db&&app){await db.terminate();await deleteApp(app);}});
it.skipIf(!enabled)("schedule projection respects author ownership and removes cancelled jobs",async()=>{
 const actor={uid:randomUUID(),name:"Synthetic author",verified:true,role:"author" as const};
 const own=randomUUID(),assigned=randomUUID(),other=randomUUID();
 for(const [id,owner,assignee] of [[own,actor.uid,""],[assigned,"other",actor.uid],[other,"other",""]]){
  await db!.doc(`blogPosts/${id}`).set({id,owner,assignee,title:"Synthetic",state:"draft",revision:2,updatedAt:new Date().toISOString()});
  await db!.doc(`blogSchedules/${id}`).set({dueAt:"2026-10-04T14:00:00Z",revision:id===assigned?1:2,uid:"PRIVATE-SCHEDULER-UID",operationId:"PRIVATE-JOB-ID"});
 }
 let result=await listDrafts(actor);
 expect(result.items.map(p=>p.id).sort()).toEqual([own,assigned].sort());
 expect(result.items.find(p=>p.id===own)?.schedule).toEqual({dueAt:"2026-10-04T14:00:00Z",revision:2});
 expect(result.items.find(p=>p.id===assigned)?.schedule?.revision).toBe(1);
 expect(JSON.stringify(result)).not.toContain("PRIVATE-");
 await db!.doc(`blogSchedules/${own}`).delete();
 result=await listDrafts(actor);
 expect(result.items.find(p=>p.id===own)?.schedule).toBeUndefined();
 await db!.doc(`blogSchedules/${assigned}`).set({dueAt:"invalid",revision:2});
 expect((await listDrafts(actor)).items.find(p=>p.id===assigned)?.schedule).toBeUndefined();
},30000);
it.skipIf(!enabled)("projection is bounded to the visible twenty rows and empty lists work",async()=>{
 const actor={uid:randomUUID(),name:"Synthetic",verified:true,role:"author" as const};
 expect((await listDrafts(actor)).items).toEqual([]);
 for(let i=0;i<23;i++){
  const id=randomUUID();
  await db!.doc(`blogPosts/${id}`).set({id,owner:actor.uid,assignee:"",title:"Synthetic",state:"draft",revision:1,updatedAt:new Date(Date.UTC(2026,9,3,0,i)).toISOString()});
  await db!.doc(`blogSchedules/${id}`).set({dueAt:"2026-10-04T14:00:00Z",revision:1});
 }
 const result=await listDrafts(actor);
 expect(result.items).toHaveLength(20);expect(result.next).toBeTruthy();
 expect(result.items.every(p=>p.schedule?.revision===1)).toBe(true);
},30000);
