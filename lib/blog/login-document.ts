/** Login-specific CSP and popup policy apply only on a full document request. */
export function needsLoginDocumentReload(documentUrl: string | undefined, currentUrl: string): boolean {
  if (!documentUrl) return false;
  try {
    const current = new URL(currentUrl);
    if (!["/blog-account", "/admin/blog/login"].includes(current.pathname)) return false;
    const loaded = new URL(documentUrl);
    return loaded.origin !== current.origin || loaded.pathname !== current.pathname;
  } catch {
    return false;
  }
}
