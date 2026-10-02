import { getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from "firebase/auth";

export async function getBlogClientAuth() {
  const projectId = process.env.NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_BLOG_FIREBASE_API_KEY;
  if (!projectId || !apiKey) throw new Error("BLOG_NOT_CONFIGURED");
  const app =
    getApps().find((a) => a.name === "blog-reader") ??
    initializeApp(
      {
        projectId,
        apiKey,
        authDomain:
          process.env.NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN ||
          `${projectId}.firebaseapp.com`,
      },
      "blog-reader",
    );
  const auth = getAuth(app);
  const emulator = process.env.NEXT_PUBLIC_BLOG_AUTH_EMULATOR_URL;
  if (emulator && projectId.startsWith("demo-") && !auth.emulatorConfig)
    connectAuthEmulator(auth, emulator, { disableWarnings: true });
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}
