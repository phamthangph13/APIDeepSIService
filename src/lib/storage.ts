export const STORAGE_KEYS = {
  users: "deepsi.users.v1",
  session: "deepsi.session.v1",
  keys: "deepsi.keys.v1",
  resets: "deepsi.resets.v1",
  seeded: "deepsi.seeded.v1",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode. The UI still works in-memory
    // for the current page; persistence is a progressive enhancement.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
