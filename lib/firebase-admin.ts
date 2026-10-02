import "server-only";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { BlogError } from "./blog/schema";

export function blogEnabled() {
  return process.env.BLOG_ENABLED === "true";
}
export function blogApp() {
  if (!blogEnabled()) throw new BlogError(503, "BLOG_NOT_CONFIGURED");
  const projectId = process.env.BLOG_FIREBASE_PROJECT_ID;
  if (!projectId) throw new BlogError(503, "BLOG_NOT_CONFIGURED");
  const emulated = Boolean(
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST,
  );
  if (
    emulated &&
    (!projectId.startsWith("demo-") ||
      (process.env.NODE_ENV === "production" &&
        process.env.BLOG_ALLOW_EMULATORS !== "true"))
  )
    throw new BlogError(503, "INVALID_EMULATOR_CONFIG");
  if (
    emulated &&
    (!process.env.FIRESTORE_EMULATOR_HOST ||
      !process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      !process.env.FIREBASE_STORAGE_EMULATOR_HOST)
  )
    throw new BlogError(503, "INCOMPLETE_EMULATORS");
  return (
    getApps().find((a) => a.name === "hunpeolabs-blog") ??
    initializeApp(
      {
        projectId,
        storageBucket: process.env.BLOG_STORAGE_BUCKET,
        ...(emulated ? {} : { credential: applicationDefault() }),
      },
      "hunpeolabs-blog",
    )
  );
}
export const blogDb = () => getFirestore(blogApp());
export const blogAuth = () => getAuth(blogApp());
export const blogBucket = () => getStorage(blogApp()).bucket();
