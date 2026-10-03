import { describe, expect, it, vi, beforeEach } from "vitest";
import { addTag, taxonomyKey } from "@/lib/blog/taxonomy-input";
const db = vi.hoisted(() => {
  const query = { limit: vi.fn(), doc: vi.fn() };
  const tx = { get: vi.fn(), create: vi.fn() };
  return { query, tx, collection: vi.fn(), runTransaction: vi.fn() };
});
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({ blogEnabled: () => true, blogDb: () => db }));
import { createCategory } from "@/lib/blog/repository";
const actor = { uid: "synthetic-admin", name: "Demo", verified: true, role: "admin" as const };
beforeEach(() => {
  vi.resetAllMocks();
  db.collection.mockReturnValue(db.query);
  db.query.doc.mockImplementation((id) => ({ id }));
  db.query.limit.mockReturnValue({ query: true });
  db.runTransaction.mockImplementation((fn) => fn(db.tx));
  db.tx.get.mockResolvedValueOnce({ exists: false }).mockResolvedValueOnce({ docs: [], size: 0 });
});
describe("editor tag rules", () => {
  it("trims input and preserves accents", () => {
    expect(addTag([], "  Kỹ thuật  ")).toEqual({ tags: ["Kỹ thuật"] });
  });
  it("ignores empty and case/unicode-equivalent duplicates even at capacity", () => {
    const tags = ["Café", ...Array.from({ length: 9 }, (_, i) => `tag-${i}`)];
    expect(addTag(tags, " CAFÉ ")).toEqual({ tags });
    expect(addTag(tags, "Cafe\u0301")).toEqual({ tags });
    expect(addTag(tags, " ")).toEqual({ tags });
  });
  it("allows the tenth tag, rejects the eleventh and allows removal/re-add", () => {
    const nine = Array.from({ length: 9 }, (_, i) => `tag-${i}`);
    const ten = addTag(nine, "tenth").tags!;
    expect(ten).toHaveLength(10);
    expect(addTag(ten, "eleventh").error).toContain("10");
    expect(addTag(ten.slice(1), "eleventh").tags).toHaveLength(10);
  });
  it("enforces the schema's 40-character boundary", () => {
    expect(addTag([], "a".repeat(40)).tags).toHaveLength(1);
    expect(addTag([], "a".repeat(41)).error).toContain("40");
  });
});
describe("category create-only transaction", () => {
  it("denies publishers and authors before database access", async () => {
    for (const role of ["publisher", "author"] as const)
      await expect(createCategory({ ...actor, role }, "New")).rejects.toMatchObject({ status: 403 });
    expect(db.collection).not.toHaveBeenCalled();
  });
  it("rejects blank or oversized names before database access", async () => {
    for (const value of [" ", "a".repeat(81)])
      await expect(createCategory(actor, value)).rejects.toMatchObject({ status: 400 });
    expect(db.collection).not.toHaveBeenCalled();
  });
  it("creates a trimmed name with deterministic identity", async () => {
    await expect(createCategory(actor, "  Kỹ thuật ")).resolves.toEqual({ name: "Kỹ thuật" });
    expect(db.tx.create).toHaveBeenCalledWith(expect.objectContaining({ id: expect.stringMatching(/^category-[a-f0-9]{64}$/) }), { name: "Kỹ thuật" });
    expect(taxonomyKey(" KỸ THUẬT ")).toBe(taxonomyKey("Kỹ thuật"));
  });
  it("reuses deterministic and legacy records without overwriting their names", async () => {
    db.tx.get.mockReset().mockResolvedValueOnce({ exists: true, get: () => "Design" });
    await expect(createCategory(actor, "design")).resolves.toEqual({ name: "Design" });
    expect(db.tx.create).not.toHaveBeenCalled();
    db.tx.get.mockReset().mockResolvedValueOnce({ exists: false }).mockResolvedValueOnce({ docs: [{ get: () => "Kỹ thuật" }], size: 1 });
    await expect(createCategory(actor, "KỸ THUẬT")).resolves.toEqual({ name: "Kỹ thuật" });
    expect(db.tx.create).not.toHaveBeenCalled();
  });
  it("preserves renamed deterministic entries when the original name is created again", async () => {
    db.tx.get.mockReset()
      .mockResolvedValueOnce({ exists: true, get: () => "Renamed" })
      .mockResolvedValueOnce({ docs: [{ id: "existing", get: () => "Renamed" }], size: 1 })
      .mockResolvedValueOnce({ exists: false });
    await expect(createCategory(actor, "Original")).resolves.toEqual({ name: "Original" });
    expect(db.tx.create).toHaveBeenCalledWith(expect.objectContaining({ id: expect.stringMatching(/-1$/) }), { name: "Original" });
  });
  it("fails closed when the visible catalog is full and propagates storage failure", async () => {
    db.tx.get.mockReset().mockResolvedValueOnce({ exists: false }).mockResolvedValueOnce({ docs: [], size: 100 });
    await expect(createCategory(actor, "New")).rejects.toMatchObject({ code: "CATEGORY_LIMIT" });
    expect(db.tx.create).not.toHaveBeenCalled();
    db.runTransaction.mockRejectedValueOnce(new Error("offline"));
    await expect(createCategory(actor, "New")).rejects.toThrow("offline");
  });
});
