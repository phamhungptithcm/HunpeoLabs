import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spawn = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ spawnSync: spawn }));

describe("production CMS preflight", () => {
  const project = "hunpeolabs-prod";
  let output: string;
  let errors: string;
  const originalExit = process.exitCode;
  const originalFlag = process.env.REQUIRE_BLOG_RELEASE;

  beforeEach(() => {
    vi.resetModules();
    output = ""; errors = "";
    process.exitCode = 0;
    process.env.REQUIRE_BLOG_RELEASE = "true";
    vi.spyOn(process.stdout, "write").mockImplementation((value) => { output += String(value); return true; });
    vi.spyOn(process.stderr, "write").mockImplementation((value) => { errors += String(value); return true; });
  });
  afterEach(() => {
    vi.restoreAllMocks(); spawn.mockReset();
    process.exitCode = originalExit;
    if (originalFlag === undefined) delete process.env.REQUIRE_BLOG_RELEASE;
    else process.env.REQUIRE_BLOG_RELEASE = originalFlag;
  });

  function provider(runtime: unknown) {
    const ok = (value: unknown) => ({ status: 0, stdout: JSON.stringify(value), stderr: "" });
    spawn.mockReturnValueOnce({ status: 0, stdout: "14.19.1", stderr: "" })
      .mockReturnValueOnce(ok({ result: [{ projectId: project }] }))
      .mockReturnValueOnce(ok({ result: [{ backendId: "hunpeolabs" }] }))
      .mockReturnValueOnce(ok(runtime));
  }

  const config = () => ({
    spec: { template: { spec: { containers: [{ env: [
      { name: "BLOG_ENABLED", value: "true" },
      ...["BLOG_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID"].map((name) => ({ name, value: project })),
      ...["BLOG_STORAGE_BUCKET", "BLOG_TRUSTED_IP_HEADER", "NEXT_PUBLIC_BLOG_FIREBASE_API_KEY", "NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN"].map((name) => ({ name, value: "configured-fixture" })),
      { name: "BLOG_RATE_LIMIT_SECRET", valueFrom: { secretKeyRef: { name: "fixture-reference", key: "1" } } },
    ] }] } } },
    status: { conditions: [{ type: "Ready", status: "True" }] },
  });

  it("rejects an accessible backend without enabled CMS configuration", async () => {
    provider({ spec: { template: { spec: { containers: [{ env: [] }] } } } });
    await import("../../scripts/validate-firebase-production.mjs");
    expect(process.exitCode).toBe(1);
    expect(errors).toContain("CMS runtime flag is not enabled");
    expect(output).not.toContain("preflight passed");
  });

  it("accepts config shape while keeping live acceptance separate", async () => {
    provider(config());
    await import("../../scripts/validate-firebase-production.mjs");
    expect(process.exitCode).toBe(0);
    expect(errors).toBe("");
    expect(output).toContain("live CMS/provider acceptance remains a separate gate");
    expect(output).not.toContain("configured-fixture");
  });

  it("rejects inline secret values and emulator settings without printing values", async () => {
    const runtime = config();
    const env = runtime.spec.template.spec.containers[0].env;
    env.splice(env.findIndex((e) => e.name === "BLOG_RATE_LIMIT_SECRET"), 1);
    env.push({ name: "BLOG_RATE_LIMIT_SECRET", value: "inline-fixture-never-printed" });
    env.push({ name: "FIRESTORE_EMULATOR_HOST", value: "local-fixture" });
    provider(runtime);
    await import("../../scripts/validate-firebase-production.mjs");
    expect(process.exitCode).toBe(1);
    expect(errors).toContain("no inline value is allowed");
    expect(errors).toContain("must not contain emulator settings");
    expect(output + errors).not.toContain("inline-fixture-never-printed");
  });
});
