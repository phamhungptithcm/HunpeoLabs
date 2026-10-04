import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { getBlogClientAuth } from "./firebase-client";
import { createVerifiedGoogleSession } from "./google-login";

/** Google credentials must be exchanged and verified by Firebase; never trust decoded email. */
export async function createOneTapSession(credential: string) {
  if (!credential || credential.length > 10000)
    throw new Error("INVALID_LOGIN");
  const auth = await getBlogClientAuth();
  try {
    const result = await signInWithCredential(
      auth,
      GoogleAuthProvider.credential(credential),
    );
    return await createVerifiedGoogleSession(result.user);
  } finally {
    await signOut(auth).catch(() => {});
  }
}
