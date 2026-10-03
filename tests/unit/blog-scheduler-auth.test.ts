import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const verify = vi.hoisted(() => vi.fn());
vi.mock("google-auth-library", () => ({ OAuth2Client: class { verifyIdToken = verify; } }));
import { authorizeScheduler, schedulerConfigured } from "@/lib/blog/scheduler-auth";
afterEach(() => { vi.unstubAllEnvs(); verify.mockReset(); });
it("requires configured identity and correct OIDC claims without secret fallback", async () => {
 vi.stubEnv("BLOG_SCHEDULER_SERVICE_ACCOUNT","scheduler@example.iam.gserviceaccount.com");
 vi.stubEnv("BLOG_SCHEDULER_AUDIENCE","https://example.com/worker");
 vi.stubEnv("BLOG_SCHEDULER_SECRET","x".repeat(32));
 expect(schedulerConfigured()).toBe(true);
 verify.mockResolvedValue({ getPayload: () => ({ email:"other@example.com",email_verified:true }) });
 await expect(authorizeScheduler(new Request("https://example.com",{headers:{authorization:"Bearer fake"}}))).rejects.toThrow("FORBIDDEN");
 verify.mockResolvedValue({ getPayload: () => ({ email:"scheduler@example.iam.gserviceaccount.com",email_verified:true }) });
 await authorizeScheduler(new Request("https://example.com",{headers:{authorization:"Bearer good"}}));
 expect(verify).toHaveBeenLastCalledWith({idToken:"good",audience:"https://example.com/worker"});
});
it("denies missing configuration and forged or malformed bearer values", async () => {
 vi.stubEnv("BLOG_SCHEDULER_SERVICE_ACCOUNT","");vi.stubEnv("BLOG_SCHEDULER_AUDIENCE","");vi.stubEnv("BLOG_SCHEDULER_SECRET","");
 expect(schedulerConfigured()).toBe(false);
 await expect(authorizeScheduler(new Request("https://example.com"))).rejects.toThrow();
});
