import { createHash } from "node:crypto";

export const moderationVersion = 1;
export const moderationReasons = {
  duplicate: "Nội dung lặp lại trong 24 giờ",
  links: "Nhiều liên kết trong bình luận",
  promotion: "Có dấu hiệu quảng cáo trực tiếp",
  restricted: "Tài khoản có bình luận đang bị ẩn hoặc từ chối",
  thread: "Bình luận gốc đang chờ duyệt hoặc bị ẩn",
} as const;
export type ModerationReason = keyof typeof moderationReasons;
type Submission = { id: string; hash: string; at: string };
export type CommentReputation = {
  approvedCount: number;
  restrictedCount: number;
  recent: Submission[];
};
export function normalizedComment(text: string) {
  return text.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/gu, " ").trim().toLocaleLowerCase("en");
}
export function commentFingerprint(text: string) {
  return createHash("sha256").update(normalizedComment(text)).digest("hex");
}
// Never treat client-supplied reputation as authoritative. This parser only reads server documents.
export function readReputation(value: Record<string, unknown> = {}): CommentReputation {
  const count = (n: unknown) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : 0;
  const recent = Array.isArray(value.recent) ? value.recent.filter((s): s is Submission =>
    !!s && typeof s.id === "string" && typeof s.hash === "string" && typeof s.at === "string" && !Number.isNaN(Date.parse(s.at))) : [];
  return { approvedCount: count(value.approvedCount), restrictedCount: count(value.restrictedCount), recent: recent.slice(-20) };
}
export function classifyComment(text: string, id: string, reputation: CommentReputation, now: string) {
  const normalized = normalizedComment(text);
  const hash = commentFingerprint(text);
  const recent = reputation.recent.filter((s) => Date.parse(now) - Date.parse(s.at) < 86400000 && s.id !== id);
  const reasons: ModerationReason[] = [];
  if (recent.some((s) => s.hash === hash)) reasons.push("duplicate");
  const links = normalized.match(/(?:https?:\/\/|www\.)[^\s]+/gu) ?? [];
  const trusted = reputation.approvedCount >= 3 && reputation.restrictedCount === 0;
  if (links.length >= (trusted ? 3 : 2)) reasons.push("links");
  // Deliberately narrow phrases: technical discussions about products or AI remain eligible.
  if (/(?:buy now|order now|guaranteed profit|earn money fast|mua ngay|đặt hàng ngay|cam kết lợi nhuận|kiếm tiền nhanh)/u.test(normalized)) reasons.push("promotion");
  if (reputation.restrictedCount > 0) reasons.push("restricted");
  return {
    status: reasons.length ? "pending" as const : "approved" as const,
    reasons,
    recent: [...recent, { id, hash, at: now }].slice(-20),
  };
}
