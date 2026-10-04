import "server-only";

export const ASK_MODEL = "gemini-2.5-flash-lite";
export type AskAIConfig = { projectId: string; location: string; appId: string; secret: string; monthlyLimit: number };

export function readAskAIConfig(env: Record<string, string | undefined> = process.env): AskAIConfig | null {
  if (env.ASK_AI_ENABLED !== "true" || env.ASK_GEMINI_MODEL !== ASK_MODEL) return null;
  const projectId = env.ASK_FIREBASE_PROJECT_ID;
  const location = env.ASK_GEMINI_LOCATION;
  const appId = env.ASK_FIREBASE_APP_ID;
  const secret = env.ASK_RATE_LIMIT_SECRET;
  const monthlyLimit = Number(env.ASK_MONTHLY_REQUEST_LIMIT);
  if (!projectId || !/^[a-z][a-z0-9-]{4,60}$/.test(projectId) || !location || !/^[a-z0-9-]{2,40}$/.test(location) || !appId || appId.length > 160 || !secret || secret.length < 32 || !Number.isInteger(monthlyLimit) || monthlyLimit < 1 || monthlyLimit > 1000) return null;
  // No accidental calls through emulators, dev reflection APIs or local tracing.
  if (env.NODE_ENV !== "production" || env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST || env.GENKIT_ENV) return null;
  return { projectId, location, appId, secret, monthlyLimit };
}
