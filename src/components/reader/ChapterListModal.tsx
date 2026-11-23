'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDownAZ, ArrowUpAZ, Check, Search, X } from 'lucide-react';
import { Chapter } from '@/types';
import { Button } from '../ui/Button';

interface ChapterListModalProps {
  chapters: Chapter[];
  currentIndex: number;
  getChapterUrl: (index: number) => string;
  onClose: () => void;
}

/**
 * Chapter picker for the reader.
 *
 * Comics here run to dozens of chapters and some run to hundreds, so the list
 * is searchable and can be flipped newest-first; it also scrolls straight to
 * the chapter being read instead of opening at chapter 1. Dialog semantics,
 * Escape and a scroll lock come with it - the previous overlay let the page
 * behind it keep scrolling and trapped nothing.
 */
export function ChapterListModal({
  chapters,
  currentIndex,
  getChapterUrl,
  onClose,
}: ChapterListModalProps) {
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Lock the page behind the dialog and restore focus on the way out.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const entries = useMemo(() => {
    const term = query.trim().toLowerCase();
    const indexed = chapters.map((chapter, index) => ({ chapter, index }));
    const filtered = term
      ? indexed.filter(({ chapter }) => {
          const title = chapter.title?.toLowerCase() ?? '';
          return (
            title.includes(term) ||
            String(chapter.chapterNumber).includes(term) ||
            `chapter ${chapter.chapterNumber}`.includes(term)
          );
        })
      : indexed;
    return newestFirst ? [...filtered].reverse() : filtered;
  }, [chapters, query, newestFirst]);

  // Open on the chapter being read, but only while the full list is shown.
  useEffect(() => {
    if (query.trim()) return;
    const node = currentRef.current;
    const list = listRef.current;
    if (!node || !list) return;
    list.scrollTop = node.offsetTop - list.clientHeight / 2 + node.clientHeight / 2;
  }, [query, newestFirst]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-list-heading"
        tabIndex={-1}
        className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/20 p-4">
          <div>
            <h2 id="chapter-list-heading" className="text-lg font-semibold text-foreground">
              Chapters
            </h2>
            <p className="text-xs text-muted-foreground">
              {entries.length === chapters.length
                ? `${chapters.length} total`
                : `${entries.length} of ${chapters.length}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewestFirst((value) => !value)}
              className="h-8 w-8 rounded-full p-0"
              aria-label={newestFirst ? 'Sort oldest first' : 'Sort newest first'}
              title={newestFirst ? 'Oldest first' : 'Newest first'}
            >
              {newestFirst ? (
                <ArrowUpAZ className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 rounded-full p-0"
              aria-label="Close chapter list"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {chapters.length > 8 && (
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') return;
                  event.stopPropagation();
                  if (query) setQuery('');
                  else onClose();
                }}
                placeholder="Find a chapter"
                aria-label="Find a chapter"
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        <div ref={listRef} className="custom-scrollbar flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No chapter matches that search.
            </p>
          ) : (
            entries.map(({ chapter, index }) =>
              index === currentIndex ? (
                <div
                  key={chapter.id}
                  ref={currentRef}
                  aria-current="true"
                  className="flex items-start justify-between gap-2 border-b border-border bg-primary/10 p-4 text-left"
                >
                  <div>
                    <div className="font-medium text-primary">Chapter {chapter.chapterNumber}</div>
                    {chapter.title && <div className="text-sm text-primary/80">{chapter.title}</div>}
                    <div className="mt-1 text-xs text-primary/60">
                      {chapter.pageImageUrls.length} pages &middot; reading now
                    </div>
                  </div>
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                </div>
              ) : (
                <Link
                  key={chapter.id}
                  href={getChapterUrl(index)}
                  onClick={onClose}
                  className="group block w-full border-b border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  <div className="font-medium text-foreground transition-colors group-hover:text-primary">
                    Chapter {chapter.chapterNumber}
                  </div>
                  {chapter.title && (
                    <div className="text-sm text-muted-foreground">{chapter.title}</div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground/60">
                    {chapter.pageImageUrls.length} pages
                  </div>
                </Link>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
