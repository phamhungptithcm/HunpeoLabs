import { afterEach, describe, expect, it, vi } from "vitest";
import { createBlogSessionStore, unknownSession } from "@/lib/blog/session-store";

const actor = { uid: "fixture-reader", name: "Fixture Reader", verified: true, role: "author" };
const response = (status: number, body: unknown = actor) => new Response(JSON.stringify(body), { status });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
const cleanups: (() => void)[] = [];
function mount(store: ReturnType<typeof createBlogSessionStore>) {
  const stop = store.subscribe(vi.fn());
  cleanups.push(stop);
  return stop;
}
afterEach(() => {
  cleanups.splice(0).forEach((stop) => stop());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("shared blog session presentation state", () => {
  it("shares one in-flight request across mounted consumers and late mounts on the same route", async () => {
    const first = deferred<Response>();
    const request = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(response(401));
    const store = createBlogSessionStore(request);
    mount(store); mount(store); mount(store);
    store.refreshForPath("/resources/blog"); store.refreshForPath("/resources/blog");
    expect(request).toHaveBeenCalledTimes(1);
    first.resolve(response(200));
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("authenticated"));
    mount(store); store.refreshForPath("/resources/blog");
    expect(request).toHaveBeenCalledTimes(1);
    store.refreshForPath("/products"); store.refreshForPath("/products");
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("anonymous"));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each([403, 429, 503])("never mistakes HTTP %s for an anonymous session", async (status) => {
    const store = createBlogSessionStore(async () => response(status));
    mount(store);
    await vi.waitFor(() => expect(store.getSnapshot()).toEqual({ actor: null, status: "unavailable", refreshing: false }));
  });

  it.each([null, { ...actor, verified: false }, { ...actor, role: "owner" }])("rejects invalid successful session data (%#)", async (body) => {
    const store = createBlogSessionStore(async () => response(200, body));
    mount(store);
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("unavailable"));
  });

  it("only a 401 confirms an anonymous visitor", async () => {
    const store = createBlogSessionStore(async () => response(401));
    mount(store);
    await vi.waitFor(() => expect(store.getSnapshot()).toEqual({ actor: null, status: "anonymous", refreshing: false }));
  });

  it("clears old identity immediately on session change and ignores stale successful responses", async () => {
    const old = deferred<Response>();
    const fresh = deferred<Response>();
    const request = vi.fn().mockResolvedValueOnce(response(200)).mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
    const store = createBlogSessionStore(request);
    mount(store); mount(store);
    await vi.waitFor(() => expect(store.getSnapshot().actor?.uid).toBe(actor.uid));
    store.refresh();
    const oldSignal = request.mock.calls[1][0] as AbortSignal;
    store.invalidate();
    expect(oldSignal.aborted).toBe(true);
    expect(store.getSnapshot().actor).toBeNull();
    fresh.resolve(response(401));
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("anonymous"));
    old.resolve(response(200));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getSnapshot().status).toBe("anonymous");
    expect(store.getSnapshot().actor).toBeNull();
  });

  it("bounds slow checks, ignores late responses, and allows retry after timeout", async () => {
    vi.useFakeTimers();
    const slow = deferred<Response>();
    const request = vi.fn().mockReturnValueOnce(slow.promise).mockResolvedValue(response(401));
    const store = createBlogSessionStore(request, 1000);
    mount(store);
    await vi.advanceTimersByTimeAsync(1000);
    expect((request.mock.calls[0][0] as AbortSignal).aborted).toBe(true);
    expect(store.getSnapshot().status).toBe("unavailable");
    store.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getSnapshot().status).toBe("anonymous");
    slow.resolve(response(200));
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getSnapshot().actor).toBeNull();
  });

  it("keeps a request alive while another consumer remains and cleans up after the last consumer", () => {
    vi.useFakeTimers();
    const request = vi.fn(() => new Promise<Response>(() => {}));
    const store = createBlogSessionStore(request);
    const first = mount(store), second = mount(store);
    first();
    expect((request.mock.calls[0] as unknown as [AbortSignal])[0].aborted).toBe(false);
    second();
    expect((request.mock.calls[0] as unknown as [AbortSignal])[0].aborted).toBe(true);
    expect(store.getSnapshot()).toBe(unknownSession);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shares browser listeners, retries after offline failure, and invalidates on logout events", async () => {
    const browser = new EventTarget();
    const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
    vi.stubGlobal("window", browser); vi.stubGlobal("document", document);
    const add = vi.spyOn(browser, "addEventListener"), remove = vi.spyOn(browser, "removeEventListener");
    const request = vi.fn().mockRejectedValueOnce(new TypeError("offline")).mockResolvedValueOnce(response(200)).mockResolvedValueOnce(response(401));
    const store = createBlogSessionStore(request);
    const first = mount(store), second = mount(store);
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("unavailable"));
    browser.dispatchEvent(new Event("focus")); document.dispatchEvent(new Event("visibilitychange"));
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("authenticated"));
    expect(request).toHaveBeenCalledTimes(2);
    browser.dispatchEvent(new Event("hl:session-changed"));
    expect(store.getSnapshot().actor).toBeNull();
    await vi.waitFor(() => expect(store.getSnapshot().status).toBe("anonymous"));
    expect(add).toHaveBeenCalledTimes(2);
    first(); second();
    expect(remove).toHaveBeenCalledTimes(2);
  });
});
