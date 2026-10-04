export type ReadingState = { saved: boolean; progress: number; updatedAt: number };
export function parseReadingState(raw: string | null): ReadingState {
  try { const v = JSON.parse(raw ?? 'null'); if (v && typeof v.saved === 'boolean' && typeof v.progress === 'number' && Number.isFinite(v.progress) && typeof v.updatedAt === 'number' && Number.isFinite(v.updatedAt)) return { saved: v.saved, progress: Math.max(0,Math.min(1,v.progress)), updatedAt: v.updatedAt }; } catch {}
  return { saved: false, progress: 0, updatedAt: 0 };
}
