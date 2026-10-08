import { afterEach, expect, it, vi } from 'vitest';
import {trafficCollectionStatus} from '@/lib/traffic/config';
afterEach(()=>vi.unstubAllEnvs());
it('distinguishes disabled from missing production prerequisites without exposing secrets',()=>{
 vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','false');expect(trafficCollectionStatus()).toBe('disabled');
 vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','true');vi.stubEnv('BLOG_ENABLED','true');vi.stubEnv('BLOG_FIREBASE_PROJECT_ID','live-project');
 for(const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST','BLOG_RATE_LIMIT_SECRET','BLOG_TRUSTED_IP_HEADER'])vi.stubEnv(key,'');
 expect(trafficCollectionStatus()).toBe('blocked');vi.stubEnv('BLOG_RATE_LIMIT_SECRET','x'.repeat(32));vi.stubEnv('BLOG_TRUSTED_IP_HEADER','x-verified-ip');expect(trafficCollectionStatus()).toBe('configured');
});

it('supports explicit global budgets without trusting request headers',()=>{
 vi.stubEnv('NEXT_PUBLIC_TRAFFIC_ENABLED','true');vi.stubEnv('BLOG_ENABLED','true');vi.stubEnv('BLOG_FIREBASE_PROJECT_ID','live-project');
 for(const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST','BLOG_TRUSTED_IP_HEADER'])vi.stubEnv(key,'');
 vi.stubEnv('BLOG_RATE_LIMIT_SECRET','x'.repeat(32));vi.stubEnv('TRAFFIC_RATE_LIMIT_MODE','global');expect(trafficCollectionStatus()).toBe('configured');
 vi.stubEnv('BLOG_RATE_LIMIT_SECRET','');expect(trafficCollectionStatus()).toBe('blocked');
});
