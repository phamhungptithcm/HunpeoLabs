export const SHARE_COUNT_EVENT = "hunpeolabs:blog-shares-updated";
export type ShareChannel = "facebook" | "linkedin" | "x" | "email" | "copy" | "device";
export function validShareCount(value: unknown): value is { shares: number } {
  return Boolean(value && typeof value === "object" && "shares" in value &&
    typeof value.shares === "number" && Number.isSafeInteger(value.shares) && value.shares >= 0);
}

// Best-effort telemetry must never prevent the user's original sharing action.
export async function countShare(postId: string, channel: ShareChannel): Promise<void> {
  try {
    const response = await fetch("/api/blog/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-blog-request": "1" },
      body: JSON.stringify({ postId, channel, eventId: crypto.randomUUID() }),
      cache: "no-store",
      keepalive: true,
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return;
    const data: unknown = await response.json();
    if (validShareCount(data))
      window.dispatchEvent(new CustomEvent(SHARE_COUNT_EVENT, { detail: { postId, shares: data.shares } }));
  } catch {
    // Network failure, navigation or unsupported browser APIs leave sharing intact.
  }
}
