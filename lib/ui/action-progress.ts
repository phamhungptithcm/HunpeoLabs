const pending = new Set<symbol>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export const progressSnapshot = () => pending.size;
export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function beginProgress() {
  const token = Symbol();
  pending.add(token);
  notify();
  return () => {
    if (pending.delete(token)) notify();
  };
}

export async function withProgress<T>(operation: () => Promise<T>): Promise<T> {
  const finish = beginProgress();
  try { return await operation(); }
  finally { finish(); }
}

export function progressFetch(input: RequestInfo | URL, init?: RequestInit) {
  return withProgress(() => fetch(input, init));
}
