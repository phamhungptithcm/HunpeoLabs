import type { Actor } from "./schema";

type SessionSnapshot = {
  actor: Actor | null;
  status: "unknown" | "authenticated" | "anonymous" | "unavailable";
  refreshing: boolean;
};

export const unknownSession: SessionSnapshot = {
  actor: null, status: "unknown", refreshing: false,
};

function verifiedActor(value: unknown): Actor {
  if (!value || typeof value !== "object") throw new Error("Invalid session");
  const actor = value as Record<string, unknown>;
  if (
    actor.verified !== true || typeof actor.uid !== "string" || typeof actor.name !== "string" ||
    (actor.role !== undefined && !["admin", "publisher", "author"].includes(String(actor.role))) ||
    (actor.email !== undefined && typeof actor.email !== "string") ||
    (actor.avatar !== undefined && typeof actor.avatar !== "string")
  ) throw new Error("Invalid session");
  return {
    uid: actor.uid, name: actor.name, verified: true,
    ...(actor.role ? { role: actor.role as Actor["role"] } : {}),
    ...(typeof actor.email === "string" ? { email: actor.email } : {}),
    ...(typeof actor.avatar === "string" ? { avatar: actor.avatar } : {}),
  };
}

// In-memory presentation state only. APIs continue to authorize every request.
export function createBlogSessionStore(
  request: (signal: AbortSignal) => Promise<Response> = (signal) =>
    fetch("/api/blog/session", { cache: "no-store", credentials: "same-origin", signal }),
  timeoutMs = 10000,
) {
  let snapshot = unknownSession;
  let generation = 0;
  let pathname: string | null = null;
  let pending: { controller: AbortController; timer: ReturnType<typeof setTimeout> } | null = null;
  const listeners = new Set<() => void>();

  function publish(next: SessionSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function cancel() {
    generation++;
    if (pending) {
      clearTimeout(pending.timer);
      pending.controller.abort();
      pending = null;
    }
  }

  function refresh() {
    if (pending || listeners.size === 0) return;
    const version = ++generation;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      cancel();
      publish({ actor: null, status: "unavailable", refreshing: false });
    }, timeoutMs);
    pending = { controller, timer };
    publish({ ...snapshot, refreshing: true });
    void (async () => {
      try {
        const response = await request(controller.signal);
        const next: SessionSnapshot = response.status === 401
          ? { actor: null, status: "anonymous", refreshing: false }
          : response.ok
            ? { actor: verifiedActor(await response.json()), status: "authenticated", refreshing: false }
            : { actor: null, status: "unavailable", refreshing: false };
        if (version === generation) publish(next);
      } catch {
        if (version === generation)
          publish({ actor: null, status: "unavailable", refreshing: false });
      } finally {
        if (version === generation) {
          clearTimeout(timer);
          pending = null;
        }
      }
    })();
  }

  function invalidate() {
    cancel();
    publish(unknownSession);
    refresh();
  }

  function onVisible() {
    if (document.visibilityState === "visible") refresh();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
      if (typeof window !== "undefined") {
        window.addEventListener("focus", onVisible);
        window.addEventListener("hl:session-changed", invalidate);
        document.addEventListener("visibilitychange", onVisible);
      }
      refresh();
    }
    return () => {
      if (!listeners.delete(listener)) return;
      if (listeners.size === 0) {
        if (typeof window !== "undefined") {
          window.removeEventListener("focus", onVisible);
          window.removeEventListener("hl:session-changed", invalidate);
          document.removeEventListener("visibilitychange", onVisible);
        }
        cancel();
        snapshot = unknownSession;
        pathname = null;
      }
    };
  }

  function refreshForPath(nextPathname: string) {
    if (pathname === nextPathname) return;
    pathname = nextPathname;
    refresh();
  }

  return { subscribe, getSnapshot: () => snapshot, refresh, refreshForPath, invalidate };
}

export const blogSessionStore = createBlogSessionStore();
