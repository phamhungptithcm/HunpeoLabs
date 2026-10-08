import { describe, expect, it } from "vitest";
import { chartPoints, collectedDays } from "@/lib/traffic/chart";
describe("traffic chart", () => {
  it("does not turn pre-collection days into measured zeroes", () => {
    const rows = ["2026-10-01", "2026-10-02"].map(date => ({date, visits:0,pageViews:0,blogOpens:0,reads:0}));
    expect(collectedDays(rows,null)).toEqual([]);
    expect(collectedDays(rows,"2026-10-02T12:00:00Z")).toEqual([rows[1]]);
  });
  it("keeps a zero baseline and renders one day without a fabricated trend", () => {
    expect(chartPoints([0,10],100,50,10)).toEqual([{x:0,y:50},{x:100,y:0}]);
    expect(chartPoints([0],100,50)).toEqual([{x:50,y:50}]);
    expect(chartPoints([],100,50)).toEqual([]);
  });
});
