"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readAnalyticsConsent, clearAnalyticsConsentOverride, ANALYTICS_CONSENT_STORAGE_KEY } from "@/lib/firebase-analytics";
import { trafficSession } from "@/lib/traffic/session";
import { isPublicPath } from "@/lib/traffic/schema";
const event = "hunpeolabs:analytics-consent-changed";
export const subscribeTrafficConsent = (fn: () => void) => { window.addEventListener(event, fn); const storage = (change: StorageEvent) => { if (change.key !== null && change.key !== ANALYTICS_CONSENT_STORAGE_KEY) return; try { if (change.storageArea !== window.localStorage) return; } catch { return; } clearAnalyticsConsentOverride(); fn(); }; window.addEventListener("storage", storage); return () => { window.removeEventListener(event, fn); window.removeEventListener("storage", storage); }; };
export function SiteTraffic({ postId }: { postId?: string }) {
  const path = usePathname();
  const consent = useSyncExternalStore(subscribeTrafficConsent, readAnalyticsConsent, () => null);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TRAFFIC_ENABLED !== "true" || consent !== "granted" || !isPublicPath(path)) return;
    if (!postId && /^\/resources\/blog\/(?!authors\/)[a-z0-9-]+$/.test(path)) return;
    const controller = new AbortController();
    let session: string | null = null;
    try { session = trafficSession(sessionStorage, Date.now(), () => crypto.randomUUID()); } catch { return; }
    if (!session) return;
    const send = async (kind: "page" | "read", activeMs?: number, progress?: number) => {
      const nonce = crypto.randomUUID();
      const body = JSON.stringify({ kind, path, session, nonce, consent: "granted", ...(postId ? { postId } : {}), ...(kind === "read" ? { activeMs, progress } : {}) });
      for (let attempt = 0; attempt < 2; attempt++) {
        if (readAnalyticsConsent() !== "granted" || controller.signal.aborted) return;
        const attemptController = new AbortController();
        const abort = () => attemptController.abort();
        controller.signal.addEventListener("abort", abort, { once: true });
        const timeout = window.setTimeout(abort, 10000);
        try { const response = await fetch("/api/traffic", { method: "POST", headers: { "Content-Type": "application/json", "x-blog-request": "1" }, body, signal: attemptController.signal }); if (response.ok || response.status < 500) return; }
        catch { if (controller.signal.aborted) return; }
        finally { window.clearTimeout(timeout); controller.signal.removeEventListener("abort", abort); }
      }
    };
    let pageSent = false, readSent = false, activeMs = 0, last = performance.now(), lastActivity = Date.now();
    const activity = () => { lastActivity = Date.now(); try { const nextSession = trafficSession(sessionStorage, lastActivity, () => crypto.randomUUID()); if (nextSession && nextSession !== session) { session = nextSession; pageSent = false; readSent = false; activeMs = 0; } } catch { /* Storage may be revoked. */ } };
    const tick = () => {
      const now = performance.now(), elapsed = Math.min(1000, now - last); last = now;
      if (document.visibilityState !== "visible" || readAnalyticsConsent() !== "granted") return;
      if (!pageSent) { pageSent = true; void send("page"); }
      if (!postId || readSent) return;
      const article = document.querySelector(".article-prose");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight && Date.now() - lastActivity < 60000) activeMs += elapsed;
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / Math.max(1, rect.height)));
      if (activeMs >= 10000 && progress >= .25) { readSent = true; void send("read", Math.round(activeMs), progress); }
    };
    for (const name of ["scroll", "pointerdown", "keydown"]) window.addEventListener(name, activity, { passive: true });
    document.addEventListener("visibilitychange", tick); tick();
    const timer = window.setInterval(tick, 1000);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); for (const name of ["scroll", "pointerdown", "keydown"]) window.removeEventListener(name, activity); };
  }, [path, consent, postId]);
  return null;
}
