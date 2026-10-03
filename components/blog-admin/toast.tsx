"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
export function BlogToast({ text, onClose }: { text: string; onClose: () => void }) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHost(document.querySelector("dialog[open]") ?? document.body));
    const timer = window.setTimeout(() => close.current(), 5000);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [text]);
  if (!host || !text) return null;
  return createPortal(<div className="blog-toast" role="status"><span>{text}</span><button type="button" onClick={onClose} aria-label="Ẩn thông báo">×</button></div>, host);
}
