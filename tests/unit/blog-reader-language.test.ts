import { expect, it } from "vitest";
import { categoryAliases, categoryLabel } from "@/lib/blog/categories";
import { message } from "@/components/blog-admin/client";
it("maps every legacy category filter to all matching stored names", () => {
  for (const name of ["AI & Automation", "AI & Tự động hóa", "AI Engineering in Practice"]) {
    expect(categoryLabel(name)).toBe("AI & Automation");
    expect(categoryAliases(name)).toEqual(["AI & Automation", "AI & Tự động hóa", "AI Engineering in Practice"]);
  }
  expect(categoryAliases("Engineering")).toContain("Kỹ thuật");
  expect(categoryAliases("Custom topic")).toEqual(["Custom topic"]);
});
it("uses English reader errors without changing Studio defaults", () => {
  expect(message(new Error("SESSION_EXPIRED"), "en")).toBe("Your session expired. Please sign in again.");
  expect(message(new Error("SESSION_EXPIRED"))).toBe("Phiên đăng nhập đã hết. Bạn đăng nhập lại nhé.");
  expect(message(new Error("UNKNOWN"), "en")).toBe("Something went wrong. Please try again.");
});
