import { afterAll, expect, it, vi } from "vitest";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/firebase-admin", () => ({ blogEnabled: () => true, blogDb: () => db }));
import { createCategory } from "@/lib/blog/repository";
const enabled = process.env.TAXONOMY_EMULATOR_TEST === "true";
if (enabled && process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:18080")
  throw new Error("Taxonomy tests require the explicit local Firestore emulator");
const app = enabled ? initializeApp({ projectId: "demo-hunpeolabs-taxonomy-029" }, `taxonomy-${randomUUID()}`) : null;
const db = app ? getFirestore(app) : null;
const actor = { uid: "demo-admin", name: "Synthetic", verified: true, role: "admin" as const };
const created: string[] = [];
afterAll(async () => {
  if (!db || !app) return;
  for (const id of created) await db.collection("blogCategories").doc(id).delete();
  await db.terminate(); await deleteApp(app);
});
it.skipIf(!enabled)("concurrent create-only requests reuse one Firestore document and legacy names", async () => {
  const name = `Topic ${randomUUID()}`;
  const results = await Promise.all(Array.from({ length: 6 }, (_, i) => createCategory(actor, i % 2 ? name.toUpperCase() : ` ${name} `)));
  const docs = await db!.collection("blogCategories").where("name", "==", results[0].name).get();
  created.push(...docs.docs.map((doc) => doc.id));
  expect(new Set(results.map((result) => result.name)).size).toBe(1);
  expect(docs.size).toBe(1);
  await docs.docs[0].ref.update({ name: `Renamed ${name}` });
  const recreated = await Promise.all([createCategory(actor, name), createCategory(actor, name.toUpperCase())]);
  expect(recreated[0].name).toBe(recreated[1].name);
  const originals = await db!.collection("blogCategories").where("name", "==", recreated[0].name).get();
  created.push(...originals.docs.map((doc) => doc.id));
  expect(originals.size).toBe(1);
  expect((await docs.docs[0].ref.get()).get("name")).toBe(`Renamed ${name}`);
  const legacy = `Legacy ${randomUUID()}`;
  const ref = db!.collection("blogCategories").doc(`fixture-${randomUUID()}`);
  created.push(ref.id); await ref.set({ name: legacy });
  await expect(createCategory(actor, legacy.toUpperCase())).resolves.toEqual({ name: legacy });
  await expect(createCategory({ ...actor, role: "author" }, "Denied")).rejects.toMatchObject({ status: 403 });
}, 20000);
