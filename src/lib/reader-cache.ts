/**
 * Short-lived in-memory cache for the reader route.
 *
 * Moving between chapters remounts the route, which previously refetched the
 * comic and its whole chapter list from Firestore every time and showed a
 * full-screen spinner. Within one browsing session those documents barely
 * change, so caching them makes chapter-to-chapter navigation instant and
 * saves a pile of Firestore reads.
 */

export const READER_CACHE_TTL_MS = 2 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface ReaderCache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
}

export function createReaderCache<T>(
  ttlMs: number = READER_CACHE_TTL_MS,
  now: () => number = Date.now
): ReaderCache<T> {
  const entries = new Map<string, CacheEntry<T>>();

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= now()) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key, value) {
      entries.set(key, { value, expiresAt: now() + ttlMs });
    },
    delete(key) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  };
}
