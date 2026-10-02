import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { DecodedIdToken } from "firebase-admin/auth";
import { blogDb } from "@/lib/firebase-admin";
import { Actor, BlogError, Role } from "./schema";

// Initial policy only. Subsequent edits are authoritative in Firestore and never reseeded.
export const INITIAL_ADMINS = [
  "hunpeo@gmail.com",
  "phamhung.pitit@gmail.com",
] as const;
export const accessEmail = (email: string) =>
  z.email().parse(email.trim().toLowerCase());
export const accessId = (email: string) =>
  createHash("sha256").update(accessEmail(email)).digest("hex");
const roles = ["author", "publisher", "admin"] as const;
const policy = () =>
  blogDb().collection("blogPolicy").doc("editorial-access-v1");
const entries = () => blogDb().collection("blogAccess");
export function googleIdentity(token: DecodedIdToken) {
  if (
    token.firebase?.sign_in_provider !== "google.com" ||
    !token.email_verified ||
    !token.email
  )
    throw new BlogError(403, "GOOGLE_ACCOUNT_REQUIRED");
  return accessEmail(token.email);
}
export async function initializeAccess() {
  await blogDb().runTransaction(async (tx) => {
    const ref = policy();
    if ((await tx.get(ref)).exists) return;
    const at = new Date().toISOString();
    for (const email of INITIAL_ADMINS)
      tx.create(entries().doc(accessId(email)), {
        email,
        role: "admin",
        active: true,
        createdAt: at,
        updatedAt: at,
      });
    tx.create(ref, { initializedAt: at, revision: 1 });
  });
}
export async function accessFor(
  token: DecodedIdToken,
  bind = false,
): Promise<Role | undefined> {
  const email = googleIdentity(token),
    ref = entries().doc(accessId(email));
  if (bind) await initializeAccess();
  return blogDb().runTransaction(async (tx) => {
    const d = await tx.get(ref);
    if (
      !d.exists ||
      d.get("active") !== true ||
      d.get("email") !== email ||
      !roles.includes(d.get("role"))
    )
      return undefined;
    if (d.get("uid") && d.get("uid") !== token.uid)
      throw new BlogError(403, "IDENTITY_CHANGED");
    if (bind || !d.get("uid"))
      tx.update(ref, {
        uid: token.uid,
        name: String(token.name || "Thành viên").slice(0, 80),
        lastSignInAt: new Date().toISOString(),
      });
    return d.get("role") as Role;
  });
}
export async function listAccess(actor: Actor) {
  if (actor.role !== "admin") throw new BlogError(403, "FORBIDDEN");
  const snap = await entries().where("active", "==", true).limit(100).get();
  return snap.docs.map((d) => ({
    id: d.id,
    email: d.get("email") as string,
    name: String(d.get("name") || "Chưa đăng nhập"),
    role: d.get("role") as Role,
    connected: Boolean(d.get("uid")),
  }));
}
export async function changeAccess(
  actor: Actor,
  input: { id?: string; email?: string; role?: string },
  remove = false,
) {
  if (actor.role !== "admin" || !actor.email)
    throw new BlogError(403, "FORBIDDEN");
  const email = input.email ? accessEmail(input.email) : undefined;
  const id = input.id
    ? z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .parse(input.id)
    : email
      ? accessId(email)
      : "";
  if (!id) throw new BlogError(400, "MEMBER_REQUIRED");
  const role = remove
    ? "reader"
    : z.enum(["author", "publisher", "admin", "reader"]).parse(input.role);
  const ownId = accessId(actor.email);
  if (id === ownId) throw new BlogError(400, "CANNOT_CHANGE_SELF");
  await blogDb().runTransaction(async (tx) => {
    const ref = entries().doc(id);
    // Reading the caller's current grant and locking policy serializes cross-admin revocations.
    const [own, current, state] = await Promise.all([
      tx.get(entries().doc(ownId)),
      tx.get(ref),
      tx.get(policy()),
    ]);
    if (
      !own.exists ||
      own.get("active") !== true ||
      own.get("role") !== "admin" ||
      own.get("uid") !== actor.uid
    )
      throw new BlogError(403, "FORBIDDEN");
    if (!state.exists) throw new BlogError(503, "ACCESS_NOT_INITIALIZED");
    if (input.id && !current.exists) throw new BlogError(404, "NOT_FOUND");
    if (email && email !== (current.get("email") || email))
      throw new BlogError(400, "MEMBER_EMAIL_IMMUTABLE");
    const at = new Date().toISOString();
    tx.set(
      ref,
      {
        email: current.get("email") || email,
        role,
        active: role !== "reader",
        updatedAt: at,
        updatedBy: actor.uid,
        ...(!current.exists ? { createdAt: at } : {}),
      },
      { merge: true },
    );
    tx.update(policy(), {
      revision: Number(state.get("revision") || 0) + 1,
      updatedAt: at,
    });
    tx.create(blogDb().collection("blogAudit").doc(), {
      action: role === "reader" ? "access_revoke" : "access_update",
      actor: actor.uid,
      accessId: id,
      role,
      at,
    });
  });
  return { ok: true };
}
export async function assignableAccess(actor: Actor) {
  if (!actor.role || actor.role === "author")
    throw new BlogError(403, "FORBIDDEN");
  const snap = await entries().where("active", "==", true).limit(100).get();
  return snap.docs
    .filter((d) => d.get("uid") && roles.includes(d.get("role")))
    .map((d) => ({
      id: String(d.get("uid")),
      name: String(d.get("name") || "Thành viên"),
    }));
}
