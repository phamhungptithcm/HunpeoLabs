import { expect, it } from "vitest";
import { createGoogleLoginLock } from "@/lib/blog/google-login";
it("allows only one Google flow and releases it once", () => {
  const start = createGoogleLoginLock();
  const oneTap = start()!;
  expect(start()).toBeNull();
  oneTap();
  const popup = start()!;
  oneTap(); // An old completion must not unlock the new exchange.
  expect(start()).toBeNull();
  popup();
  expect(start()).toEqual(expect.any(Function));
});
