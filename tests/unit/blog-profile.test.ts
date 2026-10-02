import { expect, it } from "vitest";
import { googleAvatar } from "@/lib/blog/profile";

it("accepts HTTPS Google profile images", () => {
  expect(googleAvatar("https://lh3.googleusercontent.com/a/avatar=s96-c")).toBe("https://lh3.googleusercontent.com/a/avatar=s96-c");
});
it.each([undefined, "javascript:alert(1)", "http://lh3.googleusercontent.com/a", "https://lh3.googleusercontent.com.evil.test/a", "https://evil.test/a", "https://user:password@lh3.googleusercontent.com/a", "https://lh3.googleusercontent.com:8443/a"])("rejects unsafe profile image %s", (value) => {
  expect(googleAvatar(value)).toBeUndefined();
});
