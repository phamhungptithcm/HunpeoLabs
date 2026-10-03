"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { blogSessionStore, unknownSession } from "@/lib/blog/session-store";

const getUnknownSession = () => unknownSession;
const noSubscription = () => () => {};

export function useBlogSession(enabled = true) {
  const pathname = usePathname();
  const session = useSyncExternalStore(
    enabled ? blogSessionStore.subscribe : noSubscription,
    enabled ? blogSessionStore.getSnapshot : getUnknownSession,
    getUnknownSession,
  );
  useEffect(() => {
    if (enabled) blogSessionStore.refreshForPath(pathname);
  }, [pathname, enabled]);
  return {
    ...session,
    checked: session.status === "authenticated" || session.status === "anonymous",
  };
}
