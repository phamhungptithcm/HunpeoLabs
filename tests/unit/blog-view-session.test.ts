import { expect, it, vi } from "vitest";
import { viewSession } from "@/lib/blog/view-session";
it("reuses a tab session across refresh and retries", () => {
  let value: string | null = null;
  const storage = { getItem: () => value, setItem: (_: string, v: string) => { value = v; } };
  const uuid = vi.fn(() => "92fa37d5-174d-4f5a-8d56-e6198cb0ee11");
  expect(viewSession(storage, uuid)).toBe(viewSession(storage, uuid));
  expect(uuid).toHaveBeenCalledTimes(1);
});
it("falls back to read only when browser storage is blocked", () => {
  expect(viewSession({ getItem: () => { throw new Error("blocked"); }, setItem: vi.fn() }, vi.fn())).toBeNull();
});
