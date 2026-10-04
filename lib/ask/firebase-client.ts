"use client";
import type { AppCheck } from "firebase/app-check";

let appCheck: AppCheck | null = null;

export async function askAppCheckToken() {
  const projectId = process.env.NEXT_PUBLIC_ASK_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_ASK_FIREBASE_API_KEY;
  const appId = process.env.NEXT_PUBLIC_ASK_FIREBASE_APP_ID;
  const siteKey = process.env.NEXT_PUBLIC_ASK_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!projectId || !apiKey || !appId || !siteKey) return null;
  try {
    const [{ getApps, initializeApp }, { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken }] = await Promise.all([import("firebase/app"), import("firebase/app-check")]);
    const app = getApps().find(app => app.name === "hunpeolabs-ask-client") ?? initializeApp({ projectId, apiKey, appId }, "hunpeolabs-ask-client");
    if (!appCheck) {
      appCheck = initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey), isTokenAutoRefreshEnabled: false });
    }
    return (await getToken(appCheck)).token;
  } catch { return null; }
}
