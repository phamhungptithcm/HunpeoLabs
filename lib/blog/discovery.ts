import { bodyText, type PublishedPost } from './schema';
export function folded(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d'); }
export function queryWords(value: string): string[] { return [...new Set(folded(value.slice(0,160)).match(/[\p{L}\p{N}]+/gu) ?? [])].slice(0,12); }
export function matchesPublicPost(post: PublishedPost, words: string[]): boolean {
  const searchable = folded(`${post.title} ${post.summary} ${post.category} ${post.tags.join(' ')} ${bodyText(post.body)}`);
  const tokens = searchable.match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.every(word => tokens.some(token => token.startsWith(word)));
}
export async function scanPublicSearch<T>(load: (cursor: string | undefined, limit: number) => Promise<{ items: T[]; next: string | null }>, cursorOf: (item: T) => string, matches: (item: T) => boolean, options: { cursor?: string; limit: number }) {
  const items: T[] = [];
  let cursor = options.cursor;
  let scanned = 0;
  while (scanned < 200) {
    const batch = await load(cursor, Math.min(50, 200 - scanned));
    if (!batch.items.length) return { items, next: null };
    for (let index = 0; index < batch.items.length; index++) {
      const item = batch.items[index]; scanned++; cursor = cursorOf(item);
      if (matches(item)) items.push(item);
      if (items.length >= options.limit) return { items, next: index < batch.items.length - 1 || batch.next ? cursor : null };
    }
    if (!batch.next) return { items, next: null };
    cursor = batch.next;
  }
  return { items, next: cursor ?? null };
}
export function relatedPublicPosts(current: Pick<PublishedPost,'id'|'category'|'tags'>, candidates: PublishedPost[]): PublishedPost[] {
  const tags = new Set(current.tags.map(folded));
  return [...new Map(candidates.map(post => [post.id,post])).values()]
    .filter(post => post.id !== current.id)
    .map(post => ({ post, score: (folded(post.category) === folded(current.category) ? 3 : 0) + post.tags.reduce((score,tag) => score + (tags.has(folded(tag)) ? 2 : 0), 0) }))
    .filter(item => item.score > 0)
    .sort((a,b) => b.score - a.score || b.post.publishedAt.localeCompare(a.post.publishedAt) || a.post.id.localeCompare(b.post.id))
    .slice(0,3).map(item => item.post);
}
export function codeSource(node: { content?: { text?: string }[] }): string { return (node.content ?? []).map(child => child.text ?? '').join(''); }
