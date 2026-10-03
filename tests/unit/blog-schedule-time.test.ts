import { describe, expect, it } from "vitest";
import { localDay, localScheduleInstant, scheduleLabel, validScheduleTime } from "@/lib/blog/schedule-time";
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

describe("local calendar conversion", () => {
  it("rejects impossible dates and malformed times", () => {
    for(const value of ["2026-02-30T09:00","2026-04-31T09:00","2026-10-04T25:00","","2026-10-04"])
      expect(localScheduleInstant(value)).toBeNull();
    expect(localScheduleInstant("2028-02-29T09:00")).not.toBeNull();
  });
  it("formats local calendar keys without converting them to UTC dates", () => {
    expect(localDay(new Date(2026,0,1,12))).toBe("2026-01-01");
    expect(scheduleLabel("2026-10-04T14:00:00Z","Asia/Ho_Chi_Minh")).toContain("21:00");
  });
  it("rejects skipped DST times and shows the selected offset for repeated times", () => {
    const previous=process.env.TZ;
    try {
      process.env.TZ="America/New_York";
      expect(localScheduleInstant("2027-03-14T02:30")).toBeNull();
      expect(localScheduleInstant("2026-11-01T01:30")).toBe("2026-11-01T05:30:00.000Z");
      expect(scheduleLabel("2026-11-01T05:30:00Z","America/New_York")).toContain("GMT-4");
    } finally { if(previous===undefined) delete process.env.TZ; else process.env.TZ=previous; }
  });
});
