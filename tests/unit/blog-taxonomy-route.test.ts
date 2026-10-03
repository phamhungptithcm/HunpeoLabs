import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ requireStaff: vi.fn(), sameOrigin: vi.fn(), createCategory: vi.fn(), updateCatalog: vi.fn(), catalog: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/blog/auth", () => ({ requireStaff: mocks.requireStaff, sameOrigin: mocks.sameOrigin }));
vi.mock("@/lib/blog/repository", () => ({ createCategory: mocks.createCategory, updateCatalog: mocks.updateCatalog, catalog: mocks.catalog }));
import { POST } from "@/app/api/admin/blog/taxonomy/route";
import { BlogError } from "@/lib/blog/schema";
const actor = { uid: "demo-admin", role: "admin", verified: true };
const request = (body: unknown) => new Request("http://localhost/api/admin/blog/taxonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.resetAllMocks(); mocks.requireStaff.mockResolvedValue(actor);
  mocks.createCategory.mockResolvedValue({ name: "Design" });
  mocks.updateCatalog.mockResolvedValue({ ok: true });
});
it("uses the create-only path and returns the stored name", async () => {
  const response = await POST(request({ name: "Design", createOnly: true }));
  expect(response.status).toBe(200); expect(await response.json()).toEqual({ name: "Design" });
  expect(mocks.sameOrigin).toHaveBeenCalledOnce();
  expect(mocks.createCategory).toHaveBeenCalledWith(actor, "Design");
  expect(mocks.updateCatalog).not.toHaveBeenCalled();
});
it("preserves existing catalog edit requests", async () => {
  const body = { id: "existing", name: "Renamed" };
  expect((await POST(request(body))).status).toBe(200);
  expect(mocks.updateCatalog).toHaveBeenCalledWith("taxonomy", actor, body);
  expect(mocks.createCategory).not.toHaveBeenCalled();
});
it("rejects invalid create-only contracts", async () => {
  for (const body of [{ createOnly: "true", name: "Design" }, { createOnly: true, name: {} }])
    expect((await POST(request(body))).status).toBe(400);
  expect(mocks.createCategory).not.toHaveBeenCalled();
});
it("rejects cross-origin requests before authentication or writes", async () => {
  mocks.sameOrigin.mockImplementation(() => { throw new BlogError(403, "FORBIDDEN"); });
  expect((await POST(request({ name: "Design", createOnly: true }))).status).toBe(403);
  expect(mocks.requireStaff).not.toHaveBeenCalled();
  expect(mocks.createCategory).not.toHaveBeenCalled();
});
it("returns permission and capacity errors without falling back to editing", async () => {
  for (const [status, code] of [[403, "FORBIDDEN"], [409, "CATEGORY_LIMIT"]] as const) {
    mocks.createCategory.mockRejectedValueOnce(new BlogError(status, code));
    const response = await POST(request({ name: "Design", createOnly: true }));
    expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ error: code });
  }
  expect(mocks.updateCatalog).not.toHaveBeenCalled();
});
