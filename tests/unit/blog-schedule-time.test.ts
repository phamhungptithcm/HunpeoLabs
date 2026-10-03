import { describe, expect, it } from "vitest";
import { validScheduleTime } from "@/lib/blog/schedule-time";
describe("publication schedule boundary", () => {
  const now = Date.UTC(2026, 9, 2);
  it("rejects malformed, past and too-near times", () => {
    expect(validScheduleTime("bad", now)).toBe(false);
    expect(validScheduleTime(new Date(now-1).toISOString(), now)).toBe(false);
    expect(validScheduleTime(new Date(now+60000).toISOString(), now)).toBe(false);
  });
  it("accepts a future instant and caps scheduling horizon", () => {
    expect(validScheduleTime(new Date(now+3600000).toISOString(), now)).toBe(true);
    expect(validScheduleTime(new Date(now+367*86400000).toISOString(), now)).toBe(false);
  });
});
