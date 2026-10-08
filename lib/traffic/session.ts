const key = "hunpeolabs:traffic-session:v1";
export function trafficSession(storage: Pick<Storage, "getItem" | "setItem">, now: number, uuid: () => string): string | null {
  try {
    const raw = storage.getItem(key);
    let previous: { id?: unknown; at?: unknown } = {};
    try { previous = JSON.parse(raw ?? "{}"); } catch { /* Reset corrupt session. */ }
    const id = typeof previous.id === "string" && /^[a-f\d-]{36}$/i.test(previous.id) && typeof previous.at === "number" && previous.at <= now && now - previous.at < 1800000 ? previous.id : uuid();
    storage.setItem(key, JSON.stringify({ id, at: now })); return id;
  } catch { return null; }
}
