import { products } from "@/content/site";

export type CatalogAction =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }
  | { kind: "summary"; description: string };

export type ProductChannelKind = "website" | "npm" | "app-store" | "google-play" | "chrome-store";
export type ProductChannel = { kind: ProductChannelKind } & (
  | { state: "pending"; href?: never }
  | { state: "verified"; href: string }
);

export type CatalogVisual =
  | { kind: "workflow"; label: string; caption: string; steps: readonly string[] }
  | { kind: "audit"; label: string; caption: string; steps: readonly { title: string; detail: string }[] }
  | { kind: "letter"; letter: string; tone: "blue" | "warm" };

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  summary: string;
  badge?: string;
  featured: boolean;
  sortOrder: number;
  publicationState: "draft" | "published" | "archived";
  action: CatalogAction;
  channels?: readonly ProductChannel[];
  /** Reviewed evidence that a repository destination is public and open source. */
  openSourceEvidence?: string;
  visual?: CatalogVisual;
};

// Publication is editorial visibility, not product release readiness.
// Product positioning: respective repository READMEs and owner-confirmed names.
export const productCatalog: readonly CatalogProduct[] = [
  {
    id: "ai-agent-kit",
    name: "AI-Agent-Kit",
    category: "AI engineering",
    summary: "Build repository-aware AI agents with explicit approvals and reviewable evidence.",
    badge: "Open-source platform",
    featured: true,
    sortOrder: 10,
    publicationState: "published",
    action: { kind: "internal", href: "/products/ai-agent-kit" },
    channels: [{ kind: "npm", state: "verified", href: "https://www.npmjs.com/package/@hunpeolabs/ai-agent-kit" }],
    visual: {
      kind: "workflow",
      label: "AI-Agent-Kit / Workflow",
      caption: "Repository-aware agents. Explicit decisions at every step.",
      steps: ["Understand", "Authorize", "Verify"],
    },
  },
  {
    id: "satsunic-seo",
    name: "SatsunicSEO",
    category: "Search & website tools",
    summary: "Find website issues, review the evidence, and share clear SEO reports from Chrome.",
    badge: "Chrome extension",
    featured: true,
    sortOrder: 20,
    publicationState: "published",
    action: {
      kind: "summary",
      description: "Review titles, descriptions, headings, images, and links. Crawl across a website, inspect findings, and export reports to share.",
    },
    channels: [
      { kind: "chrome-store", state: "verified", href: "https://chromewebstore.google.com/detail/satsunic-seo-crawler/kmgkplopobgekpfgchliolgkgfhkeknh" },
    ],
    visual: {
      kind: "audit",
      label: "SatsunicSEO / Website clarity",
      caption: "From a single page to the bigger picture.",
      steps: [
        { title: "Check the page", detail: "Titles · Links · Images" },
        { title: "Explore the site", detail: "Crawl · Find patterns" },
        { title: "Share your findings", detail: "Reports · Exports" },
      ],
    },
  },
  {
    id: "satsunic-mec",
    name: "SatsunicMec",
    category: "Interactive anatomy",
    summary: "Explore anatomy, physiology, and medical knowledge through interactive models.",
    featured: false,
    sortOrder: 30,
    publicationState: "published",
    action: {
      kind: "summary",
      description: "An interactive learning experience for exploring the human body, how it works, and how its systems connect.",
    },
    channels: [{ kind: "website", state: "pending" }],
    visual: { kind: "letter", letter: "M", tone: "blue" },
  },
  {
    id: "befam",
    name: "BeFam",
    category: "Family & genealogy",
    summary: "Keep your family story connected, with genealogy, shared events, and tools for clan life.",
    featured: false,
    sortOrder: 40,
    publicationState: "published",
    action: {
      kind: "summary",
      description: "A mobile-first family and genealogy product, bringing relationships, shared calendars, and clan activities together.",
    },
    channels: [
      { kind: "website", state: "pending" },
      { kind: "app-store", state: "pending" },
      { kind: "google-play", state: "pending" },
    ],
    visual: { kind: "letter", letter: "B", tone: "warm" },
  },
];

export const catalogDescription =
  `Explore ${getPublishedCatalog().map(({ name }) => name).join(", ")} — products from Hunpeo Labs.`;

export function getPublishedCatalog(entries: readonly CatalogProduct[] = productCatalog) {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || ids.has(entry.id)) {
      throw new Error(`Invalid or duplicate catalog ID: ${entry.id}`);
    }
    ids.add(entry.id);
    if (entry.publicationState !== "published") continue;
    if (!entry.name.trim() || !entry.summary.trim() || !entry.category.trim() || !Number.isFinite(entry.sortOrder)) {
      throw new Error(`Incomplete published catalog entry: ${entry.id}`);
    }
    const kinds = new Set<ProductChannelKind>();
    for (const channel of entry.channels ?? []) {
      if (kinds.has(channel.kind)) throw new Error(`Duplicate product channel: ${entry.id}`);
      kinds.add(channel.kind);
      if (channel.state === "verified") validateProductUrl(channel.href, entry, channel.kind);
    }
    const action = entry.action;
    if (action.kind === "internal" && !products.some(({ slug }) => action.href === `/products/${slug}`)) {
      throw new Error(`Unimplemented product destination: ${entry.id}`);
    }
    if (action.kind === "external") {
      validateProductUrl(action.href, entry);
    }
    if (action.kind === "summary" && !action.description.trim()) {
      throw new Error(`Missing product summary: ${entry.id}`);
    }
  }
  return entries
    .filter(({ publicationState }) => publicationState === "published")
    .toSorted((a, b) => a.sortOrder - b.sortOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function getCatalogGroups(entries: readonly CatalogProduct[] = productCatalog) {
  const published = getPublishedCatalog(entries);
  return {
    featured: published.filter((product) => product.featured),
    other: published.filter((product) => !product.featured),
  };
}

export function getCatalogDestination(product: CatalogProduct) {
  return product.action.kind === "summary" ? `/products#${product.id}` : product.action.href;
}

/** Pending channels never become placeholder links or availability claims. */
export function getProductChannels(product: CatalogProduct) {
  return (product.channels ?? []).filter((channel): channel is ProductChannel & { state: "verified"; href: string } => channel.state === "verified");
}

function validateProductUrl(href: string, product: CatalogProduct, kind?: ProductChannelKind) {
  const url = new URL(href);
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error(`Unsafe product destination: ${product.id}`);
  }
  const host = url.hostname.replace(/\.$/, "");
  const repository = ["github.com", "gitlab.com", "bitbucket.org"].some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (repository && !product.openSourceEvidence?.trim()) {
    throw new Error(`Repository destination requires public open-source evidence: ${product.id}`);
  }
  const valid = kind === "npm" ? host === "www.npmjs.com" && /^\/package\/[^/]+(?:\/[^/]+)?\/?$/.test(url.pathname)
    : kind === "app-store" ? host === "apps.apple.com" && /\/app\/(?:[^/]+\/)?id[0-9]+$/.test(url.pathname)
    : kind === "google-play" ? host === "play.google.com" && url.pathname === "/store/apps/details" && /^[a-zA-Z][\w]*(?:\.[a-zA-Z][\w]*)+$/.test(url.searchParams.get("id") ?? "")
    : kind === "chrome-store" ? host === "chromewebstore.google.com" && /^\/detail\/[^/]+\/[a-p]{32}$/.test(url.pathname)
    : true;
  if (!valid) throw new Error(`Invalid ${kind} destination: ${product.id}`);
}
