import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({path:'/',consent:'granted' as string | null,effect:undefined as (()=>void|(()=>void))|undefined}));
vi.mock('react',()=>({useEffect:(effect:()=>void|(()=>void))=>{state.effect=effect;},useSyncExternalStore:()=>state.consent}));
vi.mock('next/navigation',()=>({usePathname:()=>state.path}));
vi.mock('@/lib/firebase-analytics',()=>({readAnalyticsConsent:()=>state.consent,clearAnalyticsConsentOverride:vi.fn(),ANALYTICS_CONSENT_STORAGE_KEY:"consent-key"}));
import { SiteTraffic, subscribeTrafficConsent } from '@/components/site-traffic';
let cleanup:void|(()=>void), visible:string, top:number, storage:Map<string,string>;
const fetchMock=vi.fn();
function mount(postId?:string){SiteTraffic({postId});cleanup=state.effect?.();}
beforeEach(()=>{
 vi.useFakeTimers({toFake:['Date','performance','setTimeout','clearTimeout','setInterval','clearInterval']});vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','true');
 state.path='/';state.consent='granted';visible='visible';top=0;storage=new Map();fetchMock.mockReset().mockResolvedValue({ok:true,status:200});
 vi.stubGlobal('fetch',fetchMock);vi.stubGlobal('innerHeight',800);
 vi.stubGlobal('sessionStorage',{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)});
 vi.stubGlobal('window',Object.assign(new EventTarget(),{setTimeout,clearTimeout,setInterval,clearInterval}));
 vi.stubGlobal('document',{get visibilityState(){return visible;},querySelector:()=>({getBoundingClientRect:()=>({top,bottom:top+1000,height:1000})}),addEventListener:vi.fn(),removeEventListener:vi.fn()});
});
afterEach(()=>{cleanup?.();cleanup=undefined;vi.useRealTimers();vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('actual traffic collector lifecycle',()=>{
 it.each(['/','/about','/products','/products/satsunicmec','/services','/services/web-development','/contact','/careers','/privacy','/company/principles','/resources/blog','/resources/blog/authors/hung-pham'])('emits one visible entry for %s',async path=>{state.path=path;mount();await vi.advanceTimersByTimeAsync(3000);expect(fetchMock).toHaveBeenCalledTimes(1);expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({kind:'page',path,consent:'granted'});});
 it.each(['/admin/blog','/admin/blog/analytics','/admin/blog/post/preview','/api/traffic','/resources/blog/article'])('global collector excludes %s',path=>{state.path=path;mount();expect(fetchMock).not.toHaveBeenCalled();});
 it('does not track without consent or with inaccessible session storage',()=>{state.consent='denied';mount();expect(fetchMock).not.toHaveBeenCalled();state.consent='granted';vi.stubGlobal('sessionStorage',{getItem:()=>{throw Error('blocked');},setItem:()=>{}});mount();expect(fetchMock).not.toHaveBeenCalled();});
 it('does not count hidden time and requires visible reading progress',async()=>{state.path='/resources/blog/article';visible='hidden';mount('article');await vi.advanceTimersByTimeAsync(15000);expect(fetchMock).not.toHaveBeenCalled();visible='visible';top=700;await vi.advanceTimersByTimeAsync(10000);expect(fetchMock).toHaveBeenCalledTimes(1);top=0;await vi.advanceTimersByTimeAsync(1000);expect(fetchMock).toHaveBeenCalledTimes(2);expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({kind:'read',postId:'article'});await vi.advanceTimersByTimeAsync(20000);expect(fetchMock).toHaveBeenCalledTimes(2);});
 it('retries a timed-out request with the same nonce without disabling later reads',async()=>{fetchMock.mockImplementationOnce((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('timeout')))));state.path='/resources/blog/article';top=700;mount('article');await vi.advanceTimersByTimeAsync(11000);expect(fetchMock).toHaveBeenCalledTimes(2);expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body);top=0;await vi.advanceTimersByTimeAsync(1000);expect(JSON.parse(fetchMock.mock.calls[2][1].body).kind).toBe('read');});
 it('stops reads on consent denial and clears scheduled work on cleanup',async()=>{state.path='/resources/blog/article';mount('article');await vi.advanceTimersByTimeAsync(5000);state.consent='denied';await vi.advanceTimersByTimeAsync(15000);expect(fetchMock).toHaveBeenCalledTimes(1);cleanup?.();cleanup=undefined;expect(vi.getTimerCount()).toBe(0);});
});

it('does not revive failed-persistence consent via unrelated storage changes',()=>{
 const local={};Object.assign(window,{localStorage:local});const notify=vi.fn();const unsubscribe=subscribeTrafficConsent(notify);
 const unrelated=Object.assign(new Event('storage'),{key:'another-key',storageArea:local});window.dispatchEvent(unrelated);expect(notify).not.toHaveBeenCalled();
 const relevant=Object.assign(new Event('storage'),{key:'consent-key',storageArea:local});window.dispatchEvent(relevant);expect(notify).toHaveBeenCalledTimes(1);unsubscribe();window.dispatchEvent(relevant);expect(notify).toHaveBeenCalledTimes(1);
});
