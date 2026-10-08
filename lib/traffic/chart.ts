import type { Counts } from "./schema";
export type TrafficDay = { date: string } & Counts;
/** Before collection starts, a missing day is unavailable rather than zero. */
export function collectedDays(rows: TrafficDay[], startedAt: string | null) {
  return startedAt ? rows.filter(row => row.date >= startedAt.slice(0, 10)) : [];
}
export function chartPoints(values: number[], width: number, height: number, maximum = Math.max(1, ...values)) {
  return values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : index * width / Math.max(1, values.length - 1),
    y: height - value / Math.max(1, maximum) * height,
  }));
}
