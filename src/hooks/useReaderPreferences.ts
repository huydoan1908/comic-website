'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_READER_PREFERENCES,
  loadPreferences,
  nextPageWidth,
  savePreferences,
  type ReaderPageWidth,
  type ReaderPreferences,
  type ReaderViewMode,
} from '@/lib/reader-preferences';

/**
 * Reader preferences that survive reloads and chapter navigation.
 *
 * Starts from the defaults so the server and the first client render agree,
 * then adopts the stored values after mount. `hydrated` tells the UI when the
 * values are the user's own rather than the defaults.
 */
export function useReaderPreferences() {
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_READER_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<ReaderPreferences>) => {
    setPreferences((previous) => {
      const next = { ...previous, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  const setViewMode = useCallback((viewMode: ReaderViewMode) => update({ viewMode }), [update]);
  const setPageWidth = useCallback((pageWidth: ReaderPageWidth) => update({ pageWidth }), [update]);

  const toggleViewMode = useCallback(() => {
    setPreferences((previous) => {
      const next: ReaderPreferences = {
        ...previous,
        viewMode: previous.viewMode === 'single' ? 'continuous' : 'single',
      };
      savePreferences(next);
      return next;
    });
  }, []);

  const cyclePageWidth = useCallback(() => {
    setPreferences((previous) => {
      const next: ReaderPreferences = { ...previous, pageWidth: nextPageWidth(previous.pageWidth) };
      savePreferences(next);
      return next;
    });
  }, []);

  return { preferences, hydrated, setViewMode, setPageWidth, toggleViewMode, cyclePageWidth };
}
