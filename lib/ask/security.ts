import "server-only";
import { createHash, createHmac } from "node:crypto";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { AskAIConfig } from "./config";

const publicBuckets = new Map<string, { count: number; until: number }>();
// Only the free published-content path uses per-process limits; paid model calls
// also require atomic shared Firestore counters below.
export function allowPublishedRequest(sessionId: string, now = Date.now()) {
  for (const [key, bucket] of publicBuckets) if (bucket.until <= now) publicBuckets.delete(key);
  const key = createHash("sha256").update(sessionId).digest("hex");
  const shared = publicBuckets.get("global") ?? { count: 0, until: now + 60_000 };
  const session = publicBuckets.get(key) ?? { count: 0, until: now + 60_000 };
  if (shared.count >= 200 || session.count >= 12 || publicBuckets.size > 2000) return false;
  publicBuckets.set("global", { ...shared, count: shared.count + 1 });
  publicBuckets.set(key, { ...session, count: session.count + 1 });
  return true;
}

export function askAdminApp(config: AskAIConfig) {
  return getApps().find(app => app.name === "hunpeolabs-ask") ?? initializeApp({ projectId: config.projectId, credential: applicationDefault() }, "hunpeolabs-ask");
}

export async function authorizeAskAI(request: Request, sessionId: string, config: AskAIConfig): Promise<boolean> {
  const token = request.headers.get("x-firebase-appcheck");
  if (!token || token.length > 4096) return false;
  try {
    const app = askAdminApp(config);
    const verified = await getAppCheck(app).verifyToken(token);
    if (verified.appId !== config.appId) return false;
    const now = new Date();
    const budgets = [
      { key: `month:${now.toISOString().slice(0, 7)}`, limit: config.monthlyLimit },
      { key: `day:${now.toISOString().slice(0, 10)}`, limit: Math.min(50, config.monthlyLimit) },
      { key: `minute:${Math.floor(now.getTime() / 60_000)}`, limit: 5 },
      { key: `session:${sessionId}:${Math.floor(now.getTime() / 3_600_000)}`, limit: 6 },
    ];
    const db = getFirestore(app);
    const refs = budgets.map(budget => db.collection("askRateLimits").doc(
      (budget.key.startsWith("session:") ? createHmac("sha256", config.secret) : createHash("sha256")).update(budget.key).digest("hex"),
    ));
    return await db.runTransaction(async tx => {
      const snapshots = await tx.getAll(...refs);
      const counts = snapshots.map(snapshot => snapshot.get("count") ?? 0);
      if (counts.some((count, index) => !Number.isSafeInteger(count) || count < 0 || count >= budgets[index].limit)) return false;
      // Keep failed/cancelled calls reserved too. No retries/refunds can bypass the cap.
      refs.forEach((ref, index) => tx.set(ref, { count: counts[index] + 1, expiresAt: Timestamp.fromDate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1))) }));
      return true;
    }, { maxAttempts: 3 });
  } catch {
    // Never log tokens, prompts, identifiers, provider errors or credentials.
    return false;
  }
}
