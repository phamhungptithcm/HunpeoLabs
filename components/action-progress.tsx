"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { beginProgress, progressSnapshot, subscribeProgress } from "@/lib/ui/action-progress";

export function PendingNavigation() {
  useEffect(() => beginProgress(), []);
  return null;
}

export function ActionProgress() {
  const count = useSyncExternalStore(subscribeProgress, progressSnapshot, () => 0);
  const [visible, setVisible] = useState(false);
  const active = count > 0;
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(active), active ? 300 : 180);
    return () => window.clearTimeout(timer);
  }, [active]);
  useEffect(() => {
    if (visible) document.documentElement.dataset.actionLoading = "true";
    else delete document.documentElement.dataset.actionLoading;
    return () => { delete document.documentElement.dataset.actionLoading; };
  }, [visible]);
  return visible ? (
    <div className="action-progress" role="progressbar" aria-label="Đang xử lý" aria-busy="true">
      <span />
    </div>
  ) : null;
}
