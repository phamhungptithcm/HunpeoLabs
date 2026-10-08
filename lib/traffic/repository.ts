import { trafficCollectionStatus } from "./config";
import { getPublishedCatalog } from "@/content/product-catalog";
import { services } from "@/content/site";
import "server-only";
import { createHmac } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { blogDb } from "@/lib/firebase-admin";
import { currentActor } from "@/lib/blog/auth";
import { Actor, BlogError } from "@/lib/blog/schema";
import { rateLimit } from "@/lib/blog/rate-limit";
import { emptyCounts, isPublicPath, metrics, trafficInput, validCount, type Counts } from "./schema";
function addCount(a: number, b: number) {
  if (a > Number.MAX_SAFE_INTEGER - b) throw new BlogError(503, "COUNTER_LIMIT");
  return a + b;
}
const dayMs = 86400000;
const shards = 8;
export async function recordTraffic(request: Request, raw: unknown) {
  if (process.env.NEXT_PUBLIC_TRAFFIC_ENABLED !== "true") throw new BlogError(503, "TRAFFIC_DISABLED");
  const input = trafficInput.parse(raw);
  if ((input.path.startsWith("/products/") && !getPublishedCatalog().some(p => input.path === `/products/${p.id}`)) || (input.path.startsWith("/services/") && !services.some(s => input.path === `/services/${s.slug}`))) throw new BlogError(404, "NOT_FOUND");
  if (/^\/resources\/blog\/(?!authors\/)[a-z0-9-]+$/.test(input.path) && !input.postId) throw new BlogError(400, "POST_REQUIRED");
  if (!isPublicPath(input.path)) throw new BlogError(400, "INVALID_PATH");
  try { const actor = await currentActor(); if (actor.verified && actor.role) return { excluded: true }; }
  catch (e) { if (!(e instanceof BlogError && e.status === 401)) throw e; }
  if (/bot|crawler|spider|headless/i.test(request.headers.get("user-agent") ?? "")) return { excluded: true };
  const secret = process.env.BLOG_RATE_LIMIT_SECRET;
  const emulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const globalMode = process.env.TRAFFIC_RATE_LIMIT_MODE === "global";
  const header = process.env.BLOG_TRUSTED_IP_HEADER;
  const address = header ? request.headers.get(header) : emulated ? "emulator" : null;
  if ((!secret && !emulated) || (!globalMode && !address)) throw new BlogError(503, "INGRESS_NOT_CONFIGURED");
  const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
  const hash = (v: string) => createHmac("sha256", secret ?? "emulator-only").update(v).digest("hex");
  if (globalMode) {
    // A fixed site budget cannot be bypassed by spoofing forwarding headers or IDs.
    await rateLimit("traffic:global", 1200, 600000);
    await rateLimit(`traffic:session:${hash(input.session)}`, 120, 600000);
  } else await rateLimit(`traffic:${hash(`${day}:${address}`)}`, 120, 600000);
  const db = blogDb(), expiry = Timestamp.fromMillis(now + dayMs);
  const receipt = (key: string) => db.collection("trafficReceipts").doc(hash(key));
  const eventRef = receipt(`event:${input.nonce}`), visitRef = receipt(`visit:${input.session}`);
  const readRef = receipt(`read:${input.session}:${input.postId ?? "none"}`);
  const shard = parseInt(hash(input.session).slice(0, 2), 16) % shards;
  const daily = db.collection("trafficDaily").doc(day).collection("shards").doc(String(shard));
  const lifetime = db.collection("trafficLifetime").doc(String(shard));
  const start = db.collection("trafficConfig").doc("start");
  const post = input.postId ? db.collection("blogPublished").doc(input.postId) : null;
  const stats = input.postId ? db.collection("blogPostStats").doc(input.postId) : null;
  return db.runTransaction(async tx => {
    const refs = [eventRef, visitRef, readRef, daily, start, ...(post && stats ? [post, stats] : []), lifetime];
    const docs = await tx.getAll(...refs);
    const alive = (i: number) => docs[i].get("expiresAt") instanceof Timestamp && docs[i].get("expiresAt").toMillis() > now;
    if (alive(0) || (input.kind === "read" && alive(2))) return { duplicate: true };
    if (post && (!docs[5].exists || input.path !== `/resources/blog/${docs[5].get("slug")}`)) throw new BlogError(404, "NOT_FOUND");
    const delta = emptyCounts();
    if (!alive(1)) delta.visits = 1;
    if (input.kind === "page") { delta.pageViews = 1; if (post) delta.blogOpens = 1; }
    else delta.reads = 1;
    for (const m of metrics) if (Math.max(validCount(docs[3].get(m)), validCount(docs.at(-1)!.get(m))) > Number.MAX_SAFE_INTEGER - delta[m]) throw new BlogError(503, "COUNTER_LIMIT");
    if (input.kind === "read" && stats && validCount(docs[6].get("engagedReads")) === Number.MAX_SAFE_INTEGER) throw new BlogError(503, "COUNTER_LIMIT");
    tx.set(eventRef, { expiresAt: expiry });
    if (!alive(1)) tx.set(visitRef, { expiresAt: expiry });
    if (input.kind === "read") { tx.set(readRef, { expiresAt: expiry }); if (stats) tx.set(stats, { engagedReads: FieldValue.increment(1), readsStartedAt: docs[6].get("readsStartedAt") ?? Timestamp.fromMillis(now) }, { merge: true }); }
    tx.set(daily, Object.fromEntries(metrics.map(m => [m, FieldValue.increment(delta[m])])), { merge: true });
    tx.set(lifetime, Object.fromEntries(metrics.map(m => [m, FieldValue.increment(delta[m])])), { merge: true });
    if (!docs[4].exists) tx.set(start, { startedAt: Timestamp.fromMillis(now) });
    return { recorded: true };
  });
}
export async function trafficSummary(actor: Actor, days: number) {
  if (!actor.verified || actor.role !== "admin") throw new BlogError(403, "FORBIDDEN");
  if (![1, 7, 30].includes(days)) throw new BlogError(400, "INVALID_RANGE");
  const reportAt = Date.now();
  const db = blogDb(), refs = [], dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) { const date = new Date(reportAt - i * dayMs).toISOString().slice(0, 10); dates.push(date); for (let s = 0; s < shards; s++) refs.push(db.collection("trafficDaily").doc(date).collection("shards").doc(String(s))); }
  for (let s = 0; s < shards; s++) refs.push(db.collection("trafficLifetime").doc(String(s)));
  const [docs, start] = await Promise.all([db.getAll(...refs), db.collection("trafficConfig").doc("start").get()]);
  const trend = dates.map((date, i) => { const counts = emptyCounts(); for (const doc of docs.slice(i * shards, (i + 1) * shards)) for (const m of metrics) counts[m] = addCount(counts[m], validCount(doc.get(m))); return { date, ...counts }; });
  const total: Counts = emptyCounts(); for (const row of trend) for (const m of metrics) total[m] = addCount(total[m], row[m]);
  const allTime = emptyCounts(); for (const doc of docs.slice(days * shards)) for (const m of metrics) allTime[m] = addCount(allTime[m], validCount(doc.get(m)));
  return { collectionStatus: trafficCollectionStatus(), total, allTime, trend, startedAt: start.get("startedAt") instanceof Timestamp ? start.get("startedAt").toDate().toISOString() : null, updatedAt: new Date(reportAt).toISOString() };
}
export async function postStats(ids: string[]) {
  if (!ids.length) return {};
  const docs = await blogDb().getAll(...ids.map(id => blogDb().collection("blogPostStats").doc(id)));
  return Object.fromEntries(docs.map(d => [d.id, { views: d.exists && typeof d.get("views") === "number" ? validCount(d.get("views")) : null, reads: d.exists && typeof d.get("engagedReads") === "number" ? validCount(d.get("engagedReads")) : null }]));
}
