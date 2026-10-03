import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
const state = vi.hoisted(()=>({ counts:new Map<string,number>() }));
vi.mock("@/lib/firebase-admin",()=>({blogDb:()=>({collection:()=>({doc:(id:string)=>({id})}),runTransaction:async(fn:(tx:unknown)=>Promise<unknown>)=>fn({get:async(ref:{id:string})=>({get:()=>state.counts.get(ref.id)||0}),set:(ref:{id:string},data:{count:number})=>state.counts.set(ref.id,data.count)})})}));
import { requestLimits } from "@/lib/blog/rate-limit";
afterEach(()=>{vi.unstubAllEnvs();state.counts.clear()});
it("site budget remains shared even when caller changes IP headers",async()=>{
 vi.stubEnv("BLOG_RATE_LIMIT_SECRET","test-only-".repeat(5));vi.stubEnv("BLOG_RATE_LIMIT_MODE","global");
 for(let i=0;i<30;i++)await requestLimits(new Request("https://example.com",{headers:{"x-forwarded-for":`192.0.2.${i}`}}),`u${i}`);
 await expect(requestLimits(new Request("https://example.com",{headers:{"x-forwarded-for":"198.51.100.1"}}),"new-user")).rejects.toThrow("RATE_LIMITED");
});
it("per-user budget still applies before the shared cap",async()=>{
 vi.stubEnv("BLOG_RATE_LIMIT_SECRET","test-only-".repeat(5));vi.stubEnv("BLOG_RATE_LIMIT_MODE","global");
 for(let i=0;i<5;i++)await requestLimits(new Request("https://example.com"),"u");
 await expect(requestLimits(new Request("https://example.com"),"u")).rejects.toThrow("RATE_LIMITED");
});
