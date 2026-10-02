export function shareLinks(url: string, title: string) {
  const u = new URL(url);
  if (!["https:", "http:"].includes(u.protocol))
    throw new Error("Invalid share URL");
  u.search = "";
  u.hash = "";
  const canonical = u.toString();
  const encoded = encodeURIComponent(canonical);
  return {
    canonical,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    x: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encoded}`,
  };
}
