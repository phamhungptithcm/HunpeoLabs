import Link from 'next/link';
import { listPublished } from '@/lib/blog/repository';
import { seriesPart, seriesPosts, articleOffer } from '@/lib/blog/growth';
import type { PublishedPost } from '@/lib/blog/schema';

export function BlogOffer({ post }: { post: PublishedPost }) {
  const offer=articleOffer(post);
  return offer ? <section className="container related-stories" aria-label="A next step for your business"><h2>{offer.title}</h2><p>{offer.description}</p><Link className="button button--secondary" href={offer.href}>Discuss your project ↗</Link></section> : null;
}
export async function BlogSeries({ current }: { current: PublishedPost }) {
  const part=seriesPart(current); if(!part)return null;
  const candidates: PublishedPost[]=[];
  try { let cursor: string | undefined; for(let n=0;n<4;n++){const page=await listPublished({...(!current.tags.includes(part.key) ? {category:current.category} : {tag:part.key}),cursor,limit:50});candidates.push(...page.items);if(!page.next)break;cursor=page.next;} } catch { return <section className="container related-stories"><h2>Article series</h2><p>The series list is unavailable right now. <Link href="/resources/blog">Browse the blog</Link></p></section>; }
  const posts=seriesPosts(current,candidates);const index=posts.findIndex(p=>p.id===current.id);
  return <nav className="container related-stories" aria-label="Article series"><h2>{part.key==='series-dsa' ? 'Data Structures & Algorithms' : part.key.slice(7).replaceAll('-',' ')}</h2><p>Part {part.number} · Published articles in this series</p><ol>{posts.map(p=><li key={p.id}><Link aria-current={p.id===current.id ? 'page':undefined} href={`/resources/blog/${p.slug}`}>Part {seriesPart(p)!.number}: {p.title}</Link></li>)}</ol><div className="flex">{posts[index-1] && <Link rel="prev" href={`/resources/blog/${posts[index-1].slug}`}>← Previous article</Link>}{posts[index+1] && <Link rel="next" href={`/resources/blog/${posts[index+1].slug}`}>Next article →</Link>}</div></nav>;
}
