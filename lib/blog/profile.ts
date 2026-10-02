/** Only accept Google-hosted profile images from verified identity claims. */
export function googleAvatar(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
        !url.hostname.endsWith(".googleusercontent.com")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
