function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function readLocalStorage<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const saved = storage.getItem(key);
    if (saved === null) return null;

    try {
      return JSON.parse(saved) as T;
    } catch {
      // If the stored item is not valid JSON (e.g. an unquoted raw string like "faster" or "true"),
      // safely fallback to the raw string value so callers/deserializers can handle it
      return saved as unknown as T;
    }
  } catch (error) {
    console.warn(`Failed to read local storage key "${key}":`, error);
    return null;
  }
}

export function writeLocalStorage(key: string, data: unknown): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to write local storage key "${key}":`, error);
  }
}
