const key = "hunpeolabs:blog-view-session:v1";
export function viewSession(storage: Pick<Storage, "getItem" | "setItem">, uuid: () => string): string | null {
  try {
    const previous = storage.getItem(key);
    if (previous && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(previous)) return previous;
    const session = uuid();
    storage.setItem(key, session);
    return session;
  } catch { return null; }
}
