import { getPublishedCatalog, getCatalogDestination } from "@/content/product-catalog";
import { z } from "zod";

// Capture interpreter mode for Ask schemas without weakening production CSP.
function withoutJit<T>(build: () => T): T {
  const previous = z.config().jitless;
  z.config({ jitless: true });
  try { return build(); } finally { z.config({ jitless: previous }); }
}

export const MAX_ASK_BYTES = 12_000;
export const askTopics = ["company", "founder", "services", "pricing", "process", "handover", "timeline", "work", "ai-agent-kit", "satsunic-seo", "satsunic-mec", "befam", "contact", "outside"] as const;
export const serviceSlugs = ["web-development", "mobile-app-development", "ai-agent-development", "ai-product-engineering", "platform-modernization", "architecture-governance"] as const;
export const selectionSchema = withoutJit(() => z.object({
  topic: z.enum(askTopics),
  service: z.enum(serviceSlugs).nullable(),
  detail: z.enum(["overview", "deliverables", "boundary", "process"]),
}).strict());
export type AskSelection = z.infer<typeof selectionSchema>;
export type AskLanguage = "en" | "vi";

export const askRequestSchema = withoutJit(() => z.object({
  question: z.string().trim().min(1).max(1000),
  history: z.array(z.string().trim().min(1).max(1000)).max(6).default([]),
  sessionId: z.string().uuid(),
  language: z.enum(["en", "vi"]).default("en"),
}).strict());
export type AskRequest = z.infer<typeof askRequestSchema>;

export const sourceIds = ["about", "services", "contact", "work", "ai-agent-kit", "satsunic-seo", "satsunic-mec", "befam", ...serviceSlugs] as const;
export const askAnswerSchema = withoutJit(() => z.object({
  title: z.string().max(160),
  paragraphs: z.array(z.string().max(1500)).max(5),
  bullets: z.array(z.string().max(500)).max(6),
  sourceIds: z.array(z.enum(sourceIds)).max(4),
  founder: z.boolean(),
  action: z.enum(["services", "contact", ...serviceSlugs]),
  followUp: z.string().max(240).nullable(),
  language: z.enum(["en", "vi"]),
  mode: z.enum(["published", "gemini"]),
}).strict());
export type AskAnswer = z.infer<typeof askAnswerSchema>;
export const askEventSchema = withoutJit(() => z.discriminatedUnion("type", [
  z.object({ type: z.literal("status"), phase: z.enum(["retrieving", "selecting"]) }).strict(),
  z.object({ type: z.literal("answer"), answer: askAnswerSchema }).strict(),
  z.object({ type: z.literal("error"), code: z.enum(["UNAVAILABLE", "RATE_LIMITED"]) }).strict(),
]));
export type AskEvent = z.infer<typeof askEventSchema>;

export function sourceLink(id: typeof sourceIds[number]) {
  if (id === "about") return { label: "About HunpeoLabs", href: "/about" };
  if (id === "services") return { label: "Services", href: "/services" };
  if (id === "work") return { label: "Products", href: "/products" };
  const product = getPublishedCatalog().find(product => product.id === id);
  if (product) return { label: product.name, href: getCatalogDestination(product) };
  if (id === "contact") return { label: "Contact", href: "/contact" };
  return { label: id.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" "), href: `/services/${id}` };
}
