import { describe, expect, it } from "vitest";
import { beginProgress, progressSnapshot, subscribeProgress, withProgress } from "@/lib/ui/action-progress";

describe("shared action progress", () => {
  it("keeps concurrent actions pending until each finishes, with idempotent cleanup", () => {
    const first = beginProgress(), second = beginProgress();
    expect(progressSnapshot()).toBe(2);
    first(); first();
    expect(progressSnapshot()).toBe(1);
    second();
    expect(progressSnapshot()).toBe(0);
  });
  it("cleans up rejected and synchronously throwing operations", async () => {
    await expect(withProgress(async () => { throw new Error("offline"); })).rejects.toThrow("offline");
    await expect(withProgress(() => { throw new Error("cancelled"); })).rejects.toThrow("cancelled");
    expect(progressSnapshot()).toBe(0);
  });
  it("removes subscribers and returns operation results", async () => {
    let updates = 0;
    const unsubscribe = subscribeProgress(() => { updates++; });
    expect(await withProgress(async () => 42)).toBe(42);
    expect(updates).toBe(2);
    unsubscribe();
    await withProgress(async () => 1);
    expect(updates).toBe(2);
  });
});
