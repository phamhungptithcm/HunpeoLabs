/** Bound caller latency even when an SDK operation does not expose cancellation. */
export function withinSignal<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const interrupted = () => { signal.removeEventListener("abort", interrupted); reject(new Error("INTERRUPTED")); };
    if (signal.aborted) { operation.catch(() => {}); interrupted(); return; }
    signal.addEventListener("abort", interrupted, { once: true });
    operation.then(value => { signal.removeEventListener("abort", interrupted); resolve(value); }, error => { signal.removeEventListener("abort", interrupted); reject(error); });
  });
}
