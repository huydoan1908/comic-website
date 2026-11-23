'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadProgress, saveProgress } from '@/lib/reader-preferences';

/**
 * Resuming is only worth offering once someone is a few pages in; a prompt to
 * jump to page 2 is noise.
 */
export const MIN_RESUME_PAGE = 3;

interface UseReadingProgressOptions {
  comicId?: string;
  chapterId?: string;
  totalPages: number;
  currentPage: number;
}

/**
 * Remembers how far the reader got in a chapter and offers to resume.
 *
 * The page is never restored automatically — jumping someone mid-chapter on
 * load is disorienting — so `resumePage` is surfaced as a prompt the reader can
 * take or dismiss. Writes are debounced and only happen past page 1, which
 * also keeps a fresh mount from overwriting real progress with "page 1".
 */
export function useReadingProgress({
  comicId,
  chapterId,
  totalPages,
  currentPage,
}: UseReadingProgressOptions) {
  const [resumePage, setResumePage] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadProgress(comicId, chapterId);
    if (!saved || saved.page < MIN_RESUME_PAGE || totalPages < MIN_RESUME_PAGE) {
      setResumePage(null);
      return;
    }
    setResumePage(Math.min(saved.page, totalPages));
  }, [comicId, chapterId, totalPages]);

  useEffect(() => {
    if (!comicId || !chapterId || currentPage <= 1) return;

    const timer = setTimeout(() => {
      saveProgress(comicId, { chapterId, page: currentPage, totalPages });
    }, 600);

    return () => clearTimeout(timer);
  }, [comicId, chapterId, currentPage, totalPages]);

  const dismissResume = useCallback(() => setResumePage(null), []);

  return { resumePage, dismissResume };
}
