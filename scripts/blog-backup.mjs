import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const [mode, project, dir] = process.argv.slice(2);
if (
  !["export", "restore"].includes(mode) ||
  !project?.startsWith("demo-") ||
  !dir ||
  !process.env.FIRESTORE_EMULATOR_HOST ||
  !process.env.FIREBASE_STORAGE_EMULATOR_HOST
)
  throw new Error(
    "Local emulator only: blog-backup.mjs export|restore demo-PROJECT DIRECTORY",
  );
const app = initializeApp({
  projectId: project,
  storageBucket: `${project}.appspot.com`,
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();
const root = resolve(dir);
await mkdir(root, { recursive: true });
const names = [
  "blogPosts",
  "blogPublished",
  "blogAuthors",
  "blogCategories",
  "blogSlugs",
  "blogMedia",
];
if (mode === "export") {
  const archive = { schemaVersion: 1, collections: {}, revisions: {} };
  for (const name of names) {
    const entries = [];
    let cursor;
    while (true) {
      let q = db.collection(name).orderBy(FieldPath.documentId()).limit(100);
      if (cursor) q = q.startAfter(cursor);
      const snap = await q.get();
      for (const d of snap.docs) {
        entries.push({ id: d.id, data: d.data() });
        if (name === "blogPosts")
          archive.revisions[d.id] = (
            await d.ref.collection("revisions").get()
          ).docs.map((r) => ({ id: r.id, data: r.data() }));
        if (name === "blogMedia") {
          const [bytes] = await bucket.file(d.get("key")).download();
          await writeFile(resolve(root, `${d.id}.webp`), bytes);
        }
      }
      if (snap.size < 100) break;
      cursor = snap.docs.at(-1).id;
    }
    archive.collections[name] = entries;
  }
  await writeFile(
    resolve(root, "manifest.json"),
    JSON.stringify(archive, null, 2),
  );
  console.log(
    "Local content and media archive exported; reader/private community data excluded.",
  );
} else {
  const archive = JSON.parse(
    await readFile(resolve(root, "manifest.json"), "utf8"),
  );
  if (archive.schemaVersion !== 1) throw new Error("Unsupported archive");
  for (const name of names) {
    if (!(await db.collection(name).limit(1).get()).empty)
      throw new Error("Restore target must be empty");
  }
  for (const name of names) {
    for (const row of archive.collections[name] ?? []) {
      if (!/^[a-zA-Z0-9_-]+$/.test(row.id)) throw new Error("Invalid ID");
      if (name === "blogMedia") {
        if (!/^blog\/(?:authors\/)?[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.webp$/.test(row.data.key))
          throw new Error("Invalid key");
        await bucket
          .file(row.data.key)
          .save(await readFile(resolve(root, `${row.id}.webp`)), {
            metadata: {
              contentType: "image/webp",
              cacheControl: "private, no-store",
            },
          });
      }
      await db.collection(name).doc(row.id).create(row.data);
      if (name === "blogPosts")
        for (const r of archive.revisions[row.id] ?? [])
          await db
            .collection(name)
            .doc(row.id)
            .collection("revisions")
            .doc(r.id)
            .create(r.data);
    }
  }
  console.log("Local archive restored.");
}
