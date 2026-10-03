import "server-only";
import { blogAuth } from "@/lib/firebase-admin";
import { googleAvatar } from "./profile";
import { BlogError } from "./schema";
import type { UserRecord } from "firebase-admin/auth";

export function verifiedGooglePhoto(user: UserRecord) {
  if (user.disabled || !user.emailVerified || !user.providerData.some(p => p.providerId === "google.com")) return undefined;
  return googleAvatar(user.providerData.find(p => p.providerId === "google.com")?.photoURL ?? user.photoURL);
}
export async function authorGoogleProfile(email: string) {
  let user: UserRecord;
  try { user = await blogAuth().getUserByEmail(email); }
  catch (error) {
    if ((error as { code?: string }).code === "auth/user-not-found") throw new BlogError(400, "GOOGLE_ACCOUNT_REQUIRED");
    throw new BlogError(503, "AUTH_UNAVAILABLE");
  }
  if (user.disabled || !user.emailVerified || !user.providerData.some(p => p.providerId === "google.com")) throw new BlogError(400, "GOOGLE_ACCOUNT_REQUIRED");
  return { googleUid: user.uid, googleEmail: user.email ?? email, googleAvatar: verifiedGooglePhoto(user) ?? "" };
}
/** One bounded lookup for older comments; auth failure must not hide discussion. */
export async function legacyGooglePhotos(uids: string[]) {
  const photos = new Map<string, string>();
  const unique = [...new Set(uids)].filter(Boolean).slice(0, 100);
  if (!unique.length) return photos;
  try {
    const { users } = await blogAuth().getUsers(unique.map(uid => ({ uid })));
    for (const user of users) { const photo = verifiedGooglePhoto(user); if (photo) photos.set(user.uid, photo); }
  } catch { /* Initials remain usable when the identity provider is unavailable. */ }
  return photos;
}
