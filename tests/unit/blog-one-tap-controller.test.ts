import { expect, it, vi } from "vitest";
import { createOneTapController, type GoogleOneTapIdentity } from "@/lib/blog/one-tap-controller";
function fixture(exchange = vi.fn<(credential: string) => Promise<void>>().mockResolvedValue(undefined)) {
  let callback!: Parameters<GoogleOneTapIdentity["initialize"]>[0]["callback"];
  const google = { initialize: vi.fn((options: Parameters<GoogleOneTapIdentity["initialize"]>[0]) => { callback = options.callback; }), prompt: vi.fn(), cancel: vi.fn() };
  const finish = vi.fn();
  const actions = { exchange, start: vi.fn<() => (() => void) | null>(() => finish), success: vi.fn(), error: vi.fn() };
  const controller = createOneTapController(google, "123-fixture.apps.googleusercontent.com", actions);
  return { controller, google, actions, finish, callback: (credential = "fixture") => callback({ credential }) };
}
it("keeps credential callback alive through repeated anonymous focus checks", async () => {
  const f = fixture(); f.controller.update(true);
  f.controller.update(true); f.controller.update(true);
  await f.callback();
  expect(f.google.initialize).toHaveBeenCalledOnce();
  expect(f.google.prompt).toHaveBeenCalledOnce();
  expect(f.actions.exchange).toHaveBeenCalledWith("fixture");
  expect(f.actions.success).toHaveBeenCalledOnce();
});
it("finishes a selected credential while session eligibility changes in flight", async () => {
  let resolve!: () => void;
  const f = fixture(vi.fn(() => new Promise<void>(done => { resolve = done; })));
  f.controller.update(true); const pending = f.callback();
  f.controller.update(false); f.controller.update(true);
  expect(f.google.cancel).not.toHaveBeenCalled();
  await f.callback("duplicate");
  expect(f.actions.exchange).toHaveBeenCalledOnce();
  resolve(); await pending;
  expect(f.actions.success).toHaveBeenCalledOnce();
  expect(f.finish).toHaveBeenCalledOnce();
});
it("can retry failed exchange without resetting the SDK callback", async () => {
  const f = fixture(vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined));
  f.controller.update(true); await f.callback();
  expect(f.actions.error).toHaveBeenCalledOnce();
  expect(f.actions.success).not.toHaveBeenCalled();
  f.controller.retry(); await f.callback();
  expect(f.google.prompt).toHaveBeenCalledTimes(2);
  expect(f.google.initialize).toHaveBeenCalledOnce();
  expect(f.actions.success).toHaveBeenCalledOnce();
});
it("blocks unmounted callbacks and ignores UI completion after unmount", async () => {
  let resolve!: () => void;
  const f = fixture(vi.fn(() => new Promise<void>(done => { resolve = done; })));
  f.controller.update(true); const pending = f.callback(); f.controller.dispose();
  resolve(); await pending; await f.callback();
  expect(f.actions.exchange).toHaveBeenCalledOnce();
  expect(f.actions.success).not.toHaveBeenCalled();
  expect(f.finish).toHaveBeenCalledOnce();
});
it("cancels a prompt for explicit manual login without invalidating future callbacks", async () => {
  const f = fixture(); f.controller.update(true); f.controller.update(false);
  expect(f.google.cancel).toHaveBeenCalledOnce();
  f.controller.update(true); f.controller.retry(); await f.callback();
  expect(f.actions.success).toHaveBeenCalledOnce();
});
it("does not exchange a credential while manual Firebase login owns the shared lock", async () => {
  const f = fixture(); f.actions.start.mockReturnValueOnce(null);
  f.controller.update(true); await f.callback();
  expect(f.actions.exchange).not.toHaveBeenCalled();
  expect(f.actions.success).not.toHaveBeenCalled();
  await f.callback();
  expect(f.actions.exchange).toHaveBeenCalledOnce();
});
