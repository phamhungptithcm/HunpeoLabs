import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { trafficInput, isPublicPath } from "@/lib/traffic/schema";
import { trafficSession } from "@/lib/traffic/session";
const fake = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), actor: undefined as unknown, rate: vi.fn(), serial: Promise.resolve() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/blog/auth", async () => { const { BlogError } = await import("@/lib/blog/schema"); return { currentActor: async () => { if(fake.actor) return fake.actor; throw new BlogError(401,"SIGN_IN_REQUIRED"); } }; });
vi.mock("@/lib/blog/rate-limit", () => ({rateLimit:fake.rate}));
vi.mock("@/lib/firebase-admin", () => {
 type Ref = {path:string; collection:(n:string)=>{doc:(id:string)=>Ref};get:()=>Promise<unknown>};
 const ref = (path:string):Ref => ({path,collection:n=>({doc:id=>ref(`${path}/${n}/${id}`)}),get:async()=>snap(path)});
 const snap = (path:string)=>({id:path.split('/').at(-1),exists:fake.docs.has(path),get:(key:string)=>fake.docs.get(path)?.[key]});
 return {blogDb:()=>({collection:(n:string)=>({doc:(id:string)=>ref(`${n}/${id}`)}),getAll:async(...refs:{path:string}[])=>refs.map(r=>snap(r.path)),runTransaction:async(fn:(tx:unknown)=>Promise<unknown>)=>{
   const operation=fake.serial.then(async()=>{const writes:{path:string;data:Record<string,unknown>;merge:boolean}[]=[]; const result=await fn({getAll:async(...refs:{path:string}[])=>refs.map(r=>snap(r.path)),set:(r:{path:string},data:Record<string,unknown>,opts?:{merge:boolean})=>writes.push({path:r.path,data,merge:!!opts?.merge})});for(const w of writes){const existing=w.merge?fake.docs.get(w.path)??{}:{}; const value={...existing};for(const [k,v]of Object.entries(w.data)){const op=v as {_methodName?:string;operand?:number};value[k]=v !== null && typeof v === 'object' && typeof op.operand === 'number'?Number(existing[k]??0)+Number(op.operand):v;}fake.docs.set(w.path,value);}return result;});fake.serial=operation.then(()=>undefined,()=>undefined);return operation;
 }})};
});
import { recordTraffic, trafficSummary } from "@/lib/traffic/repository";
const session='92fa37d5-174d-4f5a-8d56-e6198cb0ee11',nonce='12fa37d5-174d-4f5a-8d56-e6198cb0ee11';
const request=new Request('http://localhost/api/traffic',{headers:{'user-agent':'test-browser'}});
const event={kind:'page',path:'/resources/blog/post',session,nonce,consent:'granted',postId:'post'};
beforeEach(()=>{fake.docs.clear();fake.actor=undefined;fake.rate.mockReset();fake.serial=Promise.resolve();vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','true');vi.stubEnv('FIRESTORE_EMULATOR_HOST','localhost');vi.stubEnv('BLOG_TRUSTED_IP_HEADER','');fake.docs.set('blogPublished/post',{slug:'post'});fake.docs.set('blogPostStats/post',{views:42,shares:3});});
afterEach(()=>vi.unstubAllEnvs());
describe('traffic capture',()=>{
 it('validates consent, read threshold and excluded routes',()=>{expect(trafficInput.safeParse({...event,consent:'denied'}).success).toBe(false);expect(trafficInput.safeParse({...event,kind:'read'}).success).toBe(false);for(const path of ['/admin/blog','/api/blog','/resources/blog/post?token=x'])expect(isPublicPath(path)).toBe(false);});
 it('deduplicates concurrent retry and preserves post statistics',async()=>{await Promise.all([recordTraffic(request,event),recordTraffic(request,event)]);expect([...fake.docs.entries()].filter(([k])=>k.includes('/shards/')).reduce((n,[,v])=>n+Number(v.pageViews),0)).toBe(1);expect(fake.docs.get('blogPostStats/post')).toEqual({views:42,shares:3});expect(JSON.stringify([...fake.docs])).not.toContain(session);});
 it('records qualified reads once per session and preserves views/shares',async()=>{const read={...event,kind:'read',activeMs:10000,progress:.25};await recordTraffic(request,read);await recordTraffic(request,{...read,nonce:'22fa37d5-174d-4f5a-8d56-e6198cb0ee11'});expect(fake.docs.get('blogPostStats/post')).toMatchObject({views:42,shares:3,engagedReads:1});});
 it('does not count staff, recognized bots, drafts or mismatched routes',async()=>{fake.actor={verified:true,role:'admin'};expect(await recordTraffic(request,event)).toEqual({excluded:true});fake.actor=undefined;expect(await recordTraffic(new Request(request,{headers:{'user-agent':'crawler'}}),event)).toEqual({excluded:true});await expect(recordTraffic(request,{...event,path:'/resources/blog/other'})).rejects.toMatchObject({status:404});expect(fake.docs.has('trafficConfig/start')).toBe(false);});
 it('fails closed on ingress, rate limiting and disabled collection',async()=>{vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','false');await expect(recordTraffic(request,event)).rejects.toMatchObject({status:503});vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','true');vi.stubEnv('FIRESTORE_EMULATOR_HOST','');await expect(recordTraffic(request,event)).rejects.toMatchObject({status:503});vi.stubEnv('FIRESTORE_EMULATOR_HOST','localhost');fake.rate.mockRejectedValueOnce(new Error('limited'));await expect(recordTraffic(request,event)).rejects.toThrow('limited');expect(fake.docs.has('trafficConfig/start')).toBe(false);});
 it('restricts reports to admins and bounded ranges, preserves unknown start',async()=>{await expect(trafficSummary({verified:true,role:'author'} as never,7)).rejects.toMatchObject({status:403});await expect(trafficSummary({verified:true,role:'admin'} as never,90)).rejects.toMatchObject({status:400});expect((await trafficSummary({verified:true,role:'admin'} as never,7)).startedAt).toBe(null);});
 it('rotates idle sessions and handles unavailable/corrupt storage',()=>{let data='';const store={getItem:()=>data,setItem:(_:string,v:string)=>{data=v;}};expect(trafficSession(store,0,()=>session)).toBe(session);expect(trafficSession(store,1000,()=>nonce)).toBe(session);expect(trafficSession(store,1801001,()=>nonce)).toBe(nonce);expect(trafficSession({getItem:()=>{throw Error();},setItem:()=>{}},0,()=>session)).toBe(null);});
});
it('counts an out-of-order qualified read visit once', async () => {
 await recordTraffic(request,{...event,kind:'read',activeMs:10000,progress:.25});
 await recordTraffic(request,{...event,nonce:'32fa37d5-174d-4f5a-8d56-e6198cb0ee11'});
 const report=await trafficSummary({verified:true,role:'admin'} as never,1);
 expect(report.total).toMatchObject({visits:1,pageViews:1,blogOpens:1,reads:1});
});
it('does not render corrupt or overflowed aggregates as valid counts',async()=>{
 fake.docs.set('trafficLifetime/0',{visits:-1});
 await expect(trafficSummary({verified:true,role:'admin'} as never,1)).rejects.toMatchObject({code:'COUNTER_INVALID'});
 fake.docs.set('trafficLifetime/0',{visits:Number.MAX_SAFE_INTEGER});fake.docs.set('trafficLifetime/1',{visits:1});
 await expect(trafficSummary({verified:true,role:'admin'} as never,1)).rejects.toMatchObject({code:'COUNTER_LIMIT'});
});

it('enforces site and session budgets independently of spoofed IP headers',async()=>{
 vi.stubEnv('TRAFFIC_RATE_LIMIT_MODE','global');vi.stubEnv('FIRESTORE_EMULATOR_HOST','');vi.stubEnv('BLOG_RATE_LIMIT_SECRET','x'.repeat(32));
 await recordTraffic(new Request(request,{headers:{'x-forwarded-for':'attacker'}}),event);
 expect(fake.rate).toHaveBeenNthCalledWith(1,'traffic:global',1200,600000);
 expect(fake.rate.mock.calls[1][0]).toMatch(/^traffic:session:[a-f0-9]{64}$/);
 fake.rate.mockRejectedValueOnce(new Error('limited'));
 await expect(recordTraffic(request,{...event,nonce:'42fa37d5-174d-4f5a-8d56-e6198cb0ee11'})).rejects.toThrow('limited');
});
