import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { countShare, validShareCount, SHARE_COUNT_EVENT } from "@/lib/blog/share-count";
const dispatch = vi.fn();
beforeEach(() => {
  vi.stubGlobal("window", { dispatchEvent: dispatch });
  dispatch.mockReset();
});
afterEach(() => vi.unstubAllGlobals());
it("accepts only bounded nonnegative integer counts", () => {
  for (const value of [null, {}, { shares: -1 }, { shares: 0.5 }, { shares: Infinity }, { shares: "4" }]) expect(validShareCount(value)).toBe(false);
  expect(validShareCount({ shares: 0 })).toBe(true);
});
it("notifies the matching post after accepted recording and uses a fresh event per action", async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ shares: 3 }) });
  vi.stubGlobal("fetch", fetcher);
  await countShare("post", "copy");
  await countShare("post", "linkedin");
  const first = JSON.parse(fetcher.mock.calls[0][1].body);
  const second = JSON.parse(fetcher.mock.calls[1][1].body);
  expect(first.channel).toBe("copy");
  expect(first.eventId).not.toBe(second.eventId);
  expect(fetcher.mock.calls[0][1].keepalive).toBe(true);
  expect(dispatch.mock.calls[0][0].type).toBe(SHARE_COUNT_EVENT);
  expect(dispatch.mock.calls[0][0].detail).toEqual({ postId: "post", shares: 3 });
});
it("never propagates a telemetry failure or publishes an invalid count", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  await expect(countShare("post", "device")).resolves.toBeUndefined();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  await expect(countShare("post", "email")).resolves.toBeUndefined();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ shares: -1 }) }));
  await countShare("post", "facebook");
  expect(dispatch).not.toHaveBeenCalled();
});
