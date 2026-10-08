/** Public route selection shared with the browser collector; no server validators. */
export function isPublicPath(path: string) {
  return ["/", "/about", "/contact", "/careers", "/privacy", "/products", "/services", "/company/principles", "/resources/blog"].includes(path) ||
    /^\/(products|services)\/[a-z0-9-]+$/.test(path) || /^\/resources\/blog\/(?:authors\/)?[a-z0-9-]+$/.test(path);
}
