import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
const [project, uid] = process.argv.slice(2);
if (
  !project ||
  !uid ||
  (!project.startsWith("demo-") && process.env.BLOG_CONFIRM_PROJECT !== project)
)
  throw new Error(
    "Usage: blog-bootstrap-owner.mjs PROJECT UID; real projects require BLOG_CONFIRM_PROJECT exact match and separate operator approval",
  );
if (
  project.startsWith("demo-") &&
  (!process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST)
)
  throw new Error("Demo requires Auth and Firestore emulators");
const app = initializeApp({
  projectId: project,
  ...(project.startsWith("demo-") ? {} : { credential: applicationDefault() }),
});
const user = await getAuth(app).getUser(uid);
const initial = ["hunpeo@gmail.com", "phamhung.pitit@gmail.com"];
const email = user.email?.trim().toLowerCase();
if (!email || !initial.includes(email) || !user.emailVerified || user.disabled || !user.providerData.some(p => p.providerId === "google.com"))
  throw new Error("Bootstrap requires an initial approved verified Google identity");
const { createHash } = await import("node:crypto");
const key = value => createHash("sha256").update(value).digest("hex");
const db = getFirestore(app);
await db.runTransaction(async tx => {
  const policy = db.collection("blogPolicy").doc("editorial-access-v1");
  const ref = db.collection("blogAccess").doc(key(email));
  const [state, grant] = await Promise.all([tx.get(policy), tx.get(ref)]);
  if (!state.exists) {
    const at = new Date().toISOString();
    for (const address of initial) tx.create(db.collection("blogAccess").doc(key(address)), { email: address, role:"admin", active:true, createdAt:at, updatedAt:at, ...(address === email ? { uid:user.uid, name:user.displayName || "Admin" } : {}) });
    tx.create(policy,{initializedAt:at,revision:1});
  } else {
    if (!grant.exists || !grant.get("active") || grant.get("role") !== "admin" || (grant.get("uid") && grant.get("uid") !== user.uid)) throw new Error("Bootstrap will not restore removed or changed access");
    tx.update(ref,{uid:user.uid,name:user.displayName || "Admin"});
  }
});
console.log("Initial Google owner verified; existing editorial access policy preserved.");
