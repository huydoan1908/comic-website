'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ImageOff, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReaderPageProps {
  url: string;
  pageNumber: number;
  totalPages: number;
  chapterNumber: number;
  /** Width/height of pages already seen in this chapter, if any. */
  aspectRatio?: number | null;
  priority?: boolean;
  showPageBadge?: boolean;
  registerPage: (page: number, node: HTMLElement | null) => void;
  onNaturalSize?: (width: number, height: number) => void;
}

/** Portrait fallback used until a page of this chapter has actually loaded. */
const FALLBACK_ASPECT_RATIO = 2 / 3;
const PLACEHOLDER_WIDTH = 1080;

/**
 * One page of the continuous view, with its own loading and failure states.
 *
 * A comic page can be a megabyte of artwork on a phone connection: an empty
 * gap gives no sign whether it is coming, and a page that fails is a dead end
 * unless it can be retried. The retry remounts the image via `key` so the
 * browser re-requests a URL it has already failed.
 *
 * The space held for a page that has not loaded comes from `aspectRatio`, the
 * shape of the pages already seen in this chapter. Guessing a fixed portrait
 * ratio instead made a 48-page chapter reserve far more room than the art
 * needed, so the scroll position drifted and the progress bar lied as pages
 * came in.
 */
export function ReaderPage({
  url,
  pageNumber,
  totalPages,
  chapterNumber,
  aspectRatio,
  priority = false,
  showPageBadge = true,
  registerPage,
  onNaturalSize,
}: ReaderPageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  const ref = useCallback(
    (node: HTMLDivElement | null) => registerPage(pageNumber, node),
    [registerPage, pageNumber]
  );

  // The pages column doubles as the tap target that hides the reader chrome,
  // so a retry must not also count as a tap on the page.
  const retry = (event: React.MouseEvent) => {
    event.stopPropagation();
    setStatus('loading');
    setAttempt((value) => value + 1);
  };

  return (
    <div ref={ref} data-page={pageNumber} className="relative w-full">
      {status === 'error' ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 border-y border-border/40 bg-card/40 p-8 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Page {pageNumber} could not be loaded.
          </p>
          <Button variant="secondary" size="sm" onClick={retry}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {status === 'loading' && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-card/30"
              aria-hidden="true"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {pageNumber} / {totalPages}
                </span>
              </div>
            </div>
          )}
          <Image
            key={attempt}
            src={url}
            alt={`Chapter ${chapterNumber}, page ${pageNumber} of ${totalPages}`}
            width={PLACEHOLDER_WIDTH}
            height={Math.round(PLACEHOLDER_WIDTH / (aspectRatio || FALLBACK_ASPECT_RATIO))}
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 90vw, 1280px"
            className="h-auto w-full object-contain"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            onLoad={(event) => {
              setStatus('loaded');
              const image = event.currentTarget;
              if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                onNaturalSize?.(image.naturalWidth, image.naturalHeight);
              }
            }}
            onError={() => setStatus('error')}
          />
        </>
      )}

      {showPageBadge && status === 'loaded' && (
        <span className="pointer-events-none absolute right-2 top-2 hidden rounded-full bg-black/60 px-2 py-0.5 text-xs tabular-nums text-white/80 backdrop-blur-sm sm:block">
          {pageNumber} / {totalPages}
        </span>
      )}
    </div>
  );
}
