/**
 * Reader preferences and reading progress, persisted in localStorage.
 *
 * Every entry point is safe to call during SSR and in browsers where storage
 * is unavailable (private mode, blocked cookies): access is guarded and a
 * failure degrades to in-memory defaults rather than throwing into render.
 */

export const READER_PREFERENCES_KEY = 'comic-reader:preferences';
export const READER_PROGRESS_KEY = 'comic-reader:progress';

/** Keeps the stored progress blob small; oldest comics are dropped first. */
export const MAX_TRACKED_COMICS = 60;
/** Per comic, how many chapters keep a remembered page. */
export const MAX_TRACKED_CHAPTERS = 120;

export const VIEW_MODES = ['continuous', 'single'] as const;
export const PAGE_WIDTHS = ['narrow', 'normal', 'wide', 'full'] as const;

export type ReaderViewMode = (typeof VIEW_MODES)[number];
export type ReaderPageWidth = (typeof PAGE_WIDTHS)[number];

export interface ReaderPreferences {
  viewMode: ReaderViewMode;
  pageWidth: ReaderPageWidth;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  viewMode: 'continuous',
  pageWidth: 'normal',
};

export interface ChapterProgress {
  chapterId: string;
  page: number;
  totalPages: number;
  updatedAt: number;
}

interface ComicProgress {
  lastChapterId?: string;
  updatedAt: number;
  chapters: Record<string, { page: number; totalPages: number; updatedAt: number }>;
}

type ProgressStore = Record<string, ComicProgress>;

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    // Storage access can throw outright when cookies are blocked.
    return null;
  }
}

function readJson(key: string): unknown {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failure: preferences simply do not persist.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function loadPreferences(): ReaderPreferences {
  const stored = readJson(READER_PREFERENCES_KEY);
  if (!isRecord(stored)) return { ...DEFAULT_READER_PREFERENCES };

  const viewMode = VIEW_MODES.find((mode) => mode === stored.viewMode);
  const pageWidth = PAGE_WIDTHS.find((width) => width === stored.pageWidth);

  return {
    viewMode: viewMode ?? DEFAULT_READER_PREFERENCES.viewMode,
    pageWidth: pageWidth ?? DEFAULT_READER_PREFERENCES.pageWidth,
  };
}

export function savePreferences(preferences: ReaderPreferences): void {
  writeJson(READER_PREFERENCES_KEY, preferences);
}

/** Cycles through the page widths, wrapping back to the first one. */
export function nextPageWidth(current: ReaderPageWidth): ReaderPageWidth {
  const index = PAGE_WIDTHS.indexOf(current);
  return PAGE_WIDTHS[(index + 1) % PAGE_WIDTHS.length];
}

function loadStore(): ProgressStore {
  const stored = readJson(READER_PROGRESS_KEY);
  if (!isRecord(stored)) return {};

  const store: ProgressStore = {};
  for (const [comicId, value] of Object.entries(stored)) {
    if (!isRecord(value)) continue;
    const chapters: ComicProgress['chapters'] = {};
    if (isRecord(value.chapters)) {
      for (const [chapterId, entry] of Object.entries(value.chapters)) {
        if (!isRecord(entry)) continue;
        const page = Number(entry.page);
        const totalPages = Number(entry.totalPages);
        if (!Number.isFinite(page) || page < 1) continue;
        chapters[chapterId] = {
          page: Math.floor(page),
          totalPages: Number.isFinite(totalPages) && totalPages > 0 ? Math.floor(totalPages) : 0,
          updatedAt: Number.isFinite(Number(entry.updatedAt)) ? Number(entry.updatedAt) : 0,
        };
      }
    }
    store[comicId] = {
      lastChapterId: typeof value.lastChapterId === 'string' ? value.lastChapterId : undefined,
      updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
      chapters,
    };
  }
  return store;
}

function prune(store: ProgressStore): ProgressStore {
  const comicIds = Object.keys(store)
    .sort((a, b) => store[b].updatedAt - store[a].updatedAt)
    .slice(0, MAX_TRACKED_COMICS);

  const pruned: ProgressStore = {};
  for (const comicId of comicIds) {
    const comic = store[comicId];
    const chapterIds = Object.keys(comic.chapters)
      .sort((a, b) => comic.chapters[b].updatedAt - comic.chapters[a].updatedAt)
      .slice(0, MAX_TRACKED_CHAPTERS);

    const chapters: ComicProgress['chapters'] = {};
    for (const chapterId of chapterIds) chapters[chapterId] = comic.chapters[chapterId];
    pruned[comicId] = { ...comic, chapters };
  }
  return pruned;
}

export function saveProgress(
  comicId: string | undefined,
  progress: { chapterId: string; page: number; totalPages: number }
): void {
  if (!comicId || !progress.chapterId || !Number.isFinite(progress.page) || progress.page < 1) return;

  const now = Date.now();
  const store = loadStore();
  const comic = store[comicId] ?? { updatedAt: now, chapters: {} };

  comic.chapters[progress.chapterId] = {
    page: Math.floor(progress.page),
    totalPages: Math.max(0, Math.floor(progress.totalPages) || 0),
    updatedAt: now,
  };
  comic.lastChapterId = progress.chapterId;
  comic.updatedAt = now;
  store[comicId] = comic;

  writeJson(READER_PROGRESS_KEY, prune(store));
}

export function loadProgress(
  comicId: string | undefined,
  chapterId: string | undefined
): ChapterProgress | null {
  if (!comicId || !chapterId) return null;
  const entry = loadStore()[comicId]?.chapters[chapterId];
  return entry ? { chapterId, ...entry } : null;
}

/** The chapter this reader was last in, for a "continue reading" entry point. */
export function loadLastRead(comicId: string | undefined): ChapterProgress | null {
  if (!comicId) return null;
  const comic = loadStore()[comicId];
  if (!comic?.lastChapterId) return null;
  const entry = comic.chapters[comic.lastChapterId];
  return entry ? { chapterId: comic.lastChapterId, ...entry } : null;
}

export function clearProgress(comicId?: string): void {
  if (!comicId) {
    writeJson(READER_PROGRESS_KEY, {});
    return;
  }
  const store = loadStore();
  delete store[comicId];
  writeJson(READER_PROGRESS_KEY, store);
}
