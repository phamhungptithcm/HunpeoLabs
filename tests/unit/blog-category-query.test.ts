import { beforeEach, expect, it, vi } from "vitest";
const db = vi.hoisted(() => {
  const query = { where: vi.fn(), orderBy: vi.fn(), limit: vi.fn(), get: vi.fn() };
  return { query, collection: vi.fn() };
});
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({ blogEnabled: () => true, blogDb: () => db }));
import { listPublished } from "@/lib/blog/repository";
beforeEach(() => {
  vi.clearAllMocks();
  db.collection.mockReturnValue(db.query);
  db.query.where.mockReturnValue(db.query);
  db.query.orderBy.mockReturnValue(db.query);
  db.query.limit.mockReturnValue(db.query);
  db.query.get.mockResolvedValue({ docs: [], size: 0 });
});
it("queries all AI aliases for both new and legacy category links", async () => {
  for (const category of ["AI & Automation", "AI Engineering in Practice", "AI & Tự động hóa"]) {
    await listPublished({ category });
    expect(db.query.where).toHaveBeenLastCalledWith("category", "in", ["AI & Automation", "AI & Tự động hóa", "AI Engineering in Practice"]);
  }
});
it("retains equality filters for custom topics", async () => {
  await listPublished({ category: "Other topic" });
  expect(db.query.where).toHaveBeenCalledWith("category", "==", "Other topic");
});
