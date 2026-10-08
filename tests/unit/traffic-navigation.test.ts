import { describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({role: "admin"}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/blog/auth", () => ({requireStaffPage: vi.fn(async () => ({role:state.role}))}));
vi.mock("next/navigation", () => ({notFound: () => {throw new Error("NOT_FOUND");}}));
vi.mock("@/components/blog-admin/traffic-panel", () => ({TrafficPanel: () => null}));
import Page from "@/app/admin/blog/analytics/page";
describe("Studio analytics page", () => {
  it("allows admin", async () => {state.role="admin"; expect(await Page()).toBeTruthy();});
  it.each(["author","publisher","reader"])("rejects %s from the site report", async role => {state.role=role; await expect(Page()).rejects.toThrow("NOT_FOUND");});
});
