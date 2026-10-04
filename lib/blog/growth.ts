import { bodyText, safeUrl, type Draft, type PublishedPost, type RichNode } from './schema';

export const authorPath = '/resources/blog/authors/hung-pham';
export function knownAuthor(name: string) { return name.trim().toLowerCase() === 'hung pham'; }
export function articleOffer(post: Pick<Draft, 'tags' | 'category'>) {
  const tags = post.tags.map(t => t.toLowerCase());
  if (tags.some(t => ['e-commerce', 'ecommerce', 'local-shop', 'website-cost'].includes(t))) return { title: 'Build a website for your shop', href: '/contact?audience=local-shops', description: 'Tell us what you sell and how customers should order or contact you. We agree on features, price, and ongoing costs before work begins.' };
  if (tags.some(t => ['portfolio', 'photography', 'creator'].includes(t))) return { title: 'Give your work a place of its own', href: '/contact?audience=creators', description: 'Share the work you want to show and the enquiries you want to receive.' };
  if (post.category === 'AI & Automation') return { title: 'Explore an AI workflow for your business', href: '/services/ai-agent-development', description: 'Start with one task, clear review steps, and an agreed scope.' };
  return null;
}
export function seriesPart(post: Pick<Draft, 'tags' | 'category' | 'body'>) {
  const series = post.tags.find(t => /^series-[a-z0-9-]+$/.test(t));
  const tagged = post.tags.find(t => /^part-\d{1,3}$/.test(t));
  const number = tagged ? Number(tagged.slice(5)) : Number(bodyText(post.body).slice(0,1200).match(/\bpart\s*0*(\d{1,3})\b/i)?.[1]);
  const key = series ?? (post.category === 'Data Structures & Algorithms' ? 'series-dsa' : undefined);
  return key && Number.isInteger(number) && number > 0 ? { key, number } : null;
}
export function seriesPosts(current: PublishedPost, candidates: PublishedPost[]) {
  const part = seriesPart(current);
  if (!part) return [];
  return [...new Map([current, ...candidates].map(p => [p.id,p])).values()]
    .filter(p => seriesPart(p)?.key === part.key)
    .sort((a,b) => seriesPart(a)!.number - seriesPart(b)!.number || a.id.localeCompare(b.id));
}
function nodes(node: RichNode): RichNode[] { return [node, ...(node.content ?? []).flatMap(nodes)]; }
export function publicationChecks(post: Draft) {
  const all = nodes(post.body);
  return [
    { ok: Boolean(post.title.trim() && post.summary.trim()), label: 'Có tiêu đề và tóm tắt' },
    { ok: Boolean(post.authorId), label: 'Đã chọn tác giả' },
    { ok: Boolean(post.seoDescription.trim() || post.summary.trim()), label: 'Có mô tả SEO' },
    { ok: Boolean(post.coverId), label: 'Có ảnh bìa' },
    { ok: all.filter(n => n.type === 'image').every(n => Boolean(String(n.attrs?.alt ?? '').trim())), label: 'Ảnh trong bài có alt mô tả' },
    { ok: Boolean(post.answer.trim()), label: 'Có ý chính cho người đọc' },
    { ok: post.sources.length > 0, label: 'Có nguồn tham khảo (khi bài cần)' },
    { ok: all.every(n => (n.marks ?? []).every(m => m.type !== 'link' || safeUrl(String(m.attrs?.href ?? '')))), label: 'Link dùng địa chỉ hợp lệ' },
    { ok: all.some(n => n.type === 'heading' && /checklist|kiem tra|kiểm tra/i.test(bodyText(n))), label: 'Có checklist áp dụng (nếu phù hợp)' },
  ];
}
