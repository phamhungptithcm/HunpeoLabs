'use client';
import styles from './blog-reader-tools.module.css';
import { useEffect, useRef, useState } from 'react';
import { parseReadingState, type ReadingState } from '@/lib/blog/reading-state';

export function BlogReaderTools({ slug }: { slug: string }) {
  const [state,setState] = useState<ReadingState | null>(null);
  const [notice,setNotice] = useState('');
  const current = useRef<ReadingState>({ saved:false,progress:0,updatedAt:0 });
  const key = `hl-reading-v1:${slug}`;
  useEffect(() => {
    try { current.current = parseReadingState(localStorage.getItem(key)); setState(current.current); } catch { setNotice('Reading preferences are unavailable on this device.'); }
    const article = document.querySelector('.article-prose');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const store = () => { if (!article?.isConnected) return; const rect = article.getBoundingClientRect(); const progress = Math.max(0,Math.min(1,-rect.top / Math.max(1,rect.height-innerHeight))); if (progress < .02) return; current.current = {...current.current,progress,updatedAt:Date.now()}; try { localStorage.setItem(key,JSON.stringify(current.current)); } catch {} };
    const scroll = () => { if (!timer) timer = setTimeout(() => { timer=undefined;store(); },1000); };
    window.addEventListener('scroll',scroll,{passive:true}); window.addEventListener('pagehide',store);
    return () => { window.removeEventListener('scroll',scroll);window.removeEventListener('pagehide',store); if(timer) clearTimeout(timer);store(); };
  },[key]);
  function toggle() { const next = {...current.current,saved:!current.current.saved,updatedAt:Date.now()}; try { localStorage.setItem(key,JSON.stringify(next)); current.current=next;setState(next);setNotice(next.saved ? 'Saved on this device.' : 'Removed from saved articles.'); } catch { setNotice('Could not save on this device.'); } }
  function resume() { const article=document.querySelector('.article-prose');if(!article || !state)return; const top=scrollY+article.getBoundingClientRect().top+state.progress*Math.max(1,article.getBoundingClientRect().height-innerHeight);window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
  return <div className={styles.tools}><button className="button small" onClick={toggle} aria-pressed={Boolean(state?.saved)}>{state?.saved ? 'Saved' : 'Save article'}</button>{state && state.progress > .05 && state.progress < .95 && <button className="button small" onClick={resume}>Continue reading · {Math.round(state.progress*100)}%</button>}<span className="small" role="status">{notice || 'Saved articles and reading position stay on this device.'}</span></div>;
}
