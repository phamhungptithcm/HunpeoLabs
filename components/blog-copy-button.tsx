'use client';
import { useEffect, useRef, useState } from 'react';
import { BlogIcon } from './blog-admin/ui';
export function BlogCopyButton({ text, fragment, vi = false }: { text?: string; fragment?: string; vi?: boolean }) {
  const [status, setStatus] = useState<'idle'|'copying'|'done'|'error'>('idle');
  const copying = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);
  const label = fragment ? (vi ? 'Sao chép link mục này' : 'Copy section link') : (vi ? 'Sao chép code' : 'Copy code');
  const feedback = status === 'done' ? (vi ? 'Đã sao chép' : 'Copied') : status === 'error' ? (vi ? 'Chưa sao chép được. Bạn có thể chọn và sao chép thủ công.' : 'Could not copy. Select and copy manually.') : label;
  return <span className="blog-copy-control">
    <button type="button" disabled={status === 'copying'} aria-label={feedback} title={feedback} onClick={async () => {
      if (copying.current) return;
      copying.current = true;
      if (timer.current) clearTimeout(timer.current);
      setStatus('copying');
      try {
        if (!navigator.clipboard?.writeText) throw new Error('CLIPBOARD_UNAVAILABLE');
        let value = text ?? '';
        if (fragment) { const url = new URL(window.location.href); url.search = ''; url.hash = fragment; value = url.toString(); }
        await navigator.clipboard.writeText(value);
        if (alive.current) setStatus('done');
      } catch { if (alive.current) setStatus('error'); }
      finally { copying.current = false; if (alive.current) timer.current = setTimeout(() => { if (alive.current) setStatus('idle'); }, 4000); }
    }}><BlogIcon name={status === 'done' ? 'check' : fragment ? 'link' : 'copy'} size={15} /></button>
    <span className="blog-copy-feedback" role="status">{status === 'done' || status === 'error' ? feedback : ''}</span>
  </span>;
}
