'use client';

import Link from 'next/link';
import { ArrowUp, CheckCircle2, ChevronRight, Home, List } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChapterEndPanelProps {
  chapterNumber: number;
  chapterTitle?: string;
  nextChapterUrl: string | null;
  comicUrl: string | null;
  onOpenChapterList: () => void;
  onBackToTop: () => void;
}

/**
 * Landing spot at the bottom of a chapter.
 *
 * Finishing a chapter used to leave the reader staring at the last panel with
 * only a small floating arrow to find, so the next step is spelled out here:
 * carry on, pick another chapter, or go back to the comic.
 */
export function ChapterEndPanel({
  chapterNumber,
  chapterTitle,
  nextChapterUrl,
  comicUrl,
  onOpenChapterList,
  onBackToTop,
}: ChapterEndPanelProps) {
  return (
    <section
      aria-label="End of chapter"
      className="mx-auto mt-8 w-full max-w-md rounded-xl border border-border bg-card/60 p-6 text-center backdrop-blur-sm"
    >
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-foreground">
        End of chapter {chapterNumber}
      </h2>
      {chapterTitle && <p className="mt-1 text-sm text-muted-foreground">{chapterTitle}</p>}

      <div className="mt-5 flex flex-col gap-2">
        {nextChapterUrl ? (
          <Link href={nextChapterUrl} className="w-full">
            <Button className="w-full">
              Next chapter
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        ) : (
          <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            This is the latest chapter. Check back for more.
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onOpenChapterList}>
            <List className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Chapters
          </Button>
          {comicUrl && (
            <Link href={comicUrl} className="flex-1">
              <Button variant="secondary" className="w-full">
                <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Comic
              </Button>
            </Link>
          )}
        </div>

        <Button variant="outline" onClick={onBackToTop}>
          <ArrowUp className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back to top
        </Button>
      </div>
    </section>
  );
}
