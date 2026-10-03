"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createToastCountdown, type ToastCountdown } from "@/lib/ui/toast-countdown";
import { BlogIcon } from "./ui";
const duration = 5000;
export type ToastKind = "info" | "success" | "error" | "warning";
const icons: Record<ToastKind, string> = { info: "comment", success: "check", error: "close", warning: "warning" };
export function useToastNotice() {
  const [notice, update] = useState({ text: "", kind: "info" as ToastKind });
  const setNotice = useCallback((text: string, kind: ToastKind = "info") => update({ text, kind }), []);
  return { notice: notice.text, noticeKind: notice.kind, setNotice };
}
export function BlogToast({ text, kind = "info", onClose }: { text: string; kind?: ToastKind; onClose: () => void }) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  const [host, setHost] = useState<Element | null>(null);
  const timer = useRef<ToastCountdown | null>(null);
  const element = useRef<HTMLDivElement | null>(null);
  const hovered = useRef(false);
  const [clock, setClock] = useState({ remaining: duration, paused: false });
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHost(document.querySelector("dialog[open]") ?? document.body));
    return () => cancelAnimationFrame(frame);
  }, [text]);
  useEffect(() => {
    if (!host || !text) return;
    const countdown = createToastCountdown(duration, (remaining, paused) => setClock({ remaining, paused }), () => close.current());
    timer.current = countdown;
    countdown.hold("hover", hovered.current);
    countdown.hold("focus", !!element.current?.contains(document.activeElement));
    const visibility = () => countdown.hold("hidden", document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      countdown.dispose();
      timer.current = null;
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [host, text, kind]);
  if (!host || !text) return null;
  return createPortal(
    <div ref={element} className="blog-toast" data-kind={kind} data-paused={clock.paused}
      onMouseEnter={() => { hovered.current = true; timer.current?.hold("hover", true); }}
      onMouseLeave={() => { hovered.current = false; timer.current?.hold("hover", false); }}
      onFocusCapture={() => timer.current?.hold("focus", true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) timer.current?.hold("focus", false); }}>
      <span className="blog-toast-icon" aria-hidden="true"><BlogIcon name={icons[kind]} size={19} /></span>
      <div className="blog-toast-content">
        <p role={kind === "error" ? "alert" : "status"} aria-atomic="true">{text}</p>
      </div>
      <div className="blog-toast-controls">
      <span className="blog-toast-time" aria-hidden="true" title={clock.paused ? "Đếm ngược đang tạm dừng" : "Tự ẩn thông báo"}>{Math.ceil(clock.remaining / 1000)}s</span>
      <button className="blog-toast-close" type="button" onClick={onClose} aria-label="Ẩn thông báo" title="Ẩn thông báo"><BlogIcon name="close" size={15} /></button>
      </div>
      <span className="blog-toast-track" aria-hidden="true"><span style={{ transform: `scaleX(${clock.remaining / duration})` }} /></span>
    </div>, host,
  );
}
