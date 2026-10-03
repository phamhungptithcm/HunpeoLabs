import { expect, it, vi } from "vitest";
import { openSavedPreview } from "@/lib/blog/open-preview";
function setup() {
  const tab = { closed: false, close: vi.fn(), location: { replace: vi.fn() } };
  const options = { url: "/admin/blog/example/preview", open: vi.fn(() => tab), prepare: vi.fn(async () => true), navigate: vi.fn(), onError: vi.fn() };
  return { tab, options };
}
it("opens during the click and waits for saving before navigating", async () => {
  const { tab, options } = setup();
  let resolve!: (value: boolean) => void;
  options.prepare.mockImplementation(() => new Promise(r => { resolve = r; }));
  const pending = openSavedPreview(options);
  expect(options.open).toHaveBeenCalledOnce();
  expect(tab.location.replace).not.toHaveBeenCalled();
  resolve(true); await pending;
  expect(tab.location.replace).toHaveBeenCalledWith(options.url);
});
it("uses current-tab navigation when popups are blocked", async () => {
  const { options } = setup();
  await openSavedPreview({ ...options, open: () => null });
  expect(options.navigate).toHaveBeenCalledWith(options.url);
});
it("does not show stale content when saving fails", async () => {
  const { tab, options } = setup();
  options.prepare.mockResolvedValue(false);
  await openSavedPreview(options);
  expect(tab.close).toHaveBeenCalledOnce();
  expect(tab.location.replace).not.toHaveBeenCalled();
  expect(options.navigate).not.toHaveBeenCalled();
});
it("respects manual tab closure while the save is pending", async () => {
  const { tab, options } = setup(); tab.closed = true;
  await openSavedPreview(options);
  expect(options.navigate).not.toHaveBeenCalled();
  expect(tab.location.replace).not.toHaveBeenCalled();
});
it("reports preparation errors and closes the placeholder", async () => {
  const { tab, options } = setup();
  options.prepare.mockRejectedValue(new Error("SAVE_FAILED"));
  await openSavedPreview(options);
  expect(tab.close).toHaveBeenCalled();
  expect(options.onError).toHaveBeenCalledWith(expect.any(Error));
});
it("falls back if popup navigation is unavailable", async () => {
  const { tab, options } = setup();
  tab.location.replace.mockImplementation(() => { throw new Error("blocked"); });
  await openSavedPreview(options);
  expect(options.navigate).toHaveBeenCalledWith(options.url);
});
