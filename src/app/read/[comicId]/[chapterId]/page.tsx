'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Comic, Chapter } from '@/types';
import { ComicReader } from '@/components/ComicReader';
import { Button } from '@/components/ui/Button';
import { comicsService, chaptersService } from '@/services/firebase';
import { createReaderCache } from '@/lib/reader-cache';
import { Home, RotateCcw } from 'lucide-react';

interface ComicBundle {
  comic: Comic | null;
  chapters: Chapter[];
}

/**
 * Every chapter is its own route, so moving through a comic remounts this page
 * and used to refetch the comic and its entire chapter list each time behind a
 * full-screen spinner. The cache makes chapter-to-chapter reading instant.
 */
const bundleCache = createReaderCache<ComicBundle>();

export default function ReadPage() {
  const params = useParams();
  const comicId = typeof params.comicId === 'string' ? params.comicId : undefined;
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : undefined;

  const cached = comicId ? bundleCache.get(comicId) : null;
  const [bundle, setBundle] = useState<ComicBundle | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [failed, setFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!comicId) {
      setLoading(false);
      return;
    }

    const fromCache = bundleCache.get(comicId);
    if (fromCache && reloadToken === 0) {
      setBundle(fromCache);
      setLoading(false);
      return;
    }

    let active = true;
    setFailed(false);
    setLoading(true);

    const fetchData = async () => {
      try {
        const [comic, chapters] = await Promise.all([
          comicsService.getById(comicId),
          chaptersService.getByComicId(comicId),
        ]);
        if (!active) return;
        const next = { comic, chapters };
        bundleCache.set(comicId, next);
        setBundle(next);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [comicId, reloadToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black" role="status" aria-label="Loading chapter">
        <div className="fixed left-0 right-0 top-0 h-0.5 overflow-hidden bg-white/10">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 pt-20">
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
          <div className="mt-4 aspect-[2/3] w-full animate-pulse rounded bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <h1 className="text-2xl font-bold">This chapter could not be loaded</h1>
        <p className="max-w-sm text-sm text-white/70">
          The connection dropped or the comic is unavailable. Try again, or head back to the library.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setReloadToken((token) => token + 1)}>
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="secondary">
              <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const comic = bundle?.comic ?? null;
  const chapters = bundle?.chapters ?? [];

  if (!comic || chapters.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <h1 className="text-2xl font-bold">Comic or chapter not found</h1>
        <p className="max-w-sm text-sm text-white/70">
          {comic
            ? 'This comic has no chapters published yet.'
            : 'The requested comic could not be found.'}
        </p>
        <div className="flex gap-2">
          {comic && comicId && (
            <Link href={`/comics/${comicId}`}>
              <Button variant="secondary">Back to the comic</Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="secondary">
              <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fall back to the first chapter when the URL points at one that is gone.
  const initialChapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
  const validChapterIndex = initialChapterIndex >= 0 ? initialChapterIndex : 0;

  return (
    <ComicReader
      chapters={chapters}
      comicId={comicId}
      chapterNumber={validChapterIndex + 1}
      comicTitle={comic.title}
    />
  );
}
