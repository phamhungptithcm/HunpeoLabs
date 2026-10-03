import { draftSchema, type Draft } from "./schema";
export const recoveryKey = (uid: string, postId: string) => `hl:draft:${uid}:${postId}`;
export function parseRecovery(raw: string | null, uid: string, postId: string, now = Date.now()): { draft: Draft; revision: number; at: number } | null {
  try {
    if (!raw || raw.length > 250000) return null;
    const value = JSON.parse(raw);
    if (value.uid !== uid || value.postId !== postId || !Number.isInteger(value.revision) || value.revision < 1 || !Number.isFinite(value.at) || value.at > now || now - value.at > 7 * 86400000) return null;
    return { draft: draftSchema.parse(value.draft), revision: value.revision, at: value.at };
  } catch { return null; }
}
