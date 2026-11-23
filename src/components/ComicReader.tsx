"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chapter } from "@/types";
import { Button } from "./ui/Button";
import { ChapterEndPanel } from "./reader/ChapterEndPanel";
import { ChapterListModal } from "./reader/ChapterListModal";
import { ReaderPage } from "./reader/ReaderPage";
import { ShortcutsOverlay } from "./reader/ShortcutsOverlay";
import { useReaderPreferences } from "@/hooks/useReaderPreferences";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useVisiblePage } from "@/hooks/useVisiblePage";
import type { ReaderPageWidth } from "@/lib/reader-preferences";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Keyboard as KeyboardIcon,
  List,
  Maximize2,
  Scroll,
  X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Mousewheel, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import "@/assets/css/ComicReader.css";

interface ComicReaderProps {
  chapters: Chapter[];
  chapterNumber?: number;
  comicTitle: string;
  comicId?: string;
}

const WIDTH_CLASSES: Record<ReaderPageWidth, string> = {
  narrow: "max-w-2xl",
  normal: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

const WIDTH_LABELS: Record<ReaderPageWidth, string> = {
  narrow: "Narrow",
  normal: "Normal",
  wide: "Wide",
  full: "Full width",
};

/** Pages loaded eagerly at the top of a chapter; the rest come in lazily. */
const EAGER_PAGES = 2;

export function ComicReader({ chapters, chapterNumber = 1, comicTitle, comicId }: ComicReaderProps) {
  const router = useRouter();
  const [showChapterList, setShowChapterList] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [slidePage, setSlidePage] = useState(1);
  const [pageAspectRatio, setPageAspectRatio] = useState<number | null>(null);

  const { preferences, toggleViewMode, cyclePageWidth } = useReaderPreferences();
  const { viewMode, pageWidth } = preferences;

  const swiperRef = useRef<SwiperClass | null>(null);
  const lastScrollY = useRef(0);

  const currentChapter = chapters[chapterNumber - 1];
  const pages = useMemo(() => currentChapter?.pageImageUrls ?? [], [currentChapter]);
  const totalPages = pages.length;

  const { currentPage: visiblePage, registerPage, scrollToPage } = useVisiblePage(totalPages);
  const currentPage = viewMode === "single" ? slidePage : visiblePage;

  const getChapterUrl = useCallback(
    (chapterIndex: number) => {
      const chapter = chapters[chapterIndex];
      if (!comicId || !chapter) return "#";
      return `/read/${comicId}/${chapter.id}`;
    },
    [chapters, comicId]
  );

  const nextChapterUrl = chapterNumber < chapters.length ? getChapterUrl(chapterNumber) : null;
  const prevChapterUrl = chapterNumber > 1 ? getChapterUrl(chapterNumber - 2) : null;
  const comicUrl = comicId ? `/comics/${comicId}` : null;

  const { resumePage, dismissResume } = useReadingProgress({
    comicId,
    chapterId: currentChapter?.id,
    totalPages,
    currentPage,
  });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setChromeVisible(true);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (viewMode === "single") swiperRef.current?.slideTo(page - 1);
      else scrollToPage(page);
    },
    [viewMode, scrollToPage]
  );

  // Pages of one chapter are near enough the same shape, so the first one to
  // load sets the space held for the rest instead of a guessed portrait ratio.
  const reportNaturalSize = useCallback((width: number, height: number) => {
    setPageAspectRatio((known) => known ?? width / height);
  }, []);

  // Reset per-chapter view state when the route moves to another chapter.
  useEffect(() => {
    setSlidePage(1);
    setChromeVisible(true);
    setScrollProgress(0);
    setPageAspectRatio(null);
    lastScrollY.current = 0;
  }, [currentChapter?.id]);

  // Next chapter is the overwhelmingly likely next click, so have it ready.
  useEffect(() => {
    if (nextChapterUrl) router.prefetch(nextChapterUrl);
  }, [nextChapterUrl, router]);

  // In the scrolling view the controls get out of the way while reading down
  // and come back on any upward scroll or near the top of the chapter.
  useEffect(() => {
    if (viewMode !== "continuous") {
      setChromeVisible(true);
      return;
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);

        const delta = y - lastScrollY.current;
        if (y < 80) setChromeVisible(true);
        else if (delta > 24) setChromeVisible(false);
        else if (delta < -24) setChromeVisible(true);
        if (Math.abs(delta) > 24 || y < 80) lastScrollY.current = y;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [viewMode, currentChapter?.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      const goToChapter = (url: string | null) => {
        if (!url) return;
        event.preventDefault();
        router.push(url);
      };

      if (event.key === "Escape") {
        if (showShortcuts) setShowShortcuts(false);
        else if (showChapterList) setShowChapterList(false);
        return;
      }

      // An open overlay owns the keyboard; chapter keys would navigate out
      // from under it.
      if (showShortcuts || showChapterList) return;

      switch (event.key) {
        case "ArrowRight":
          if (viewMode === "single" && !event.shiftKey) {
            event.preventDefault();
            if (swiperRef.current && !swiperRef.current.isEnd) swiperRef.current.slideNext();
            else goToChapter(nextChapterUrl);
            return;
          }
          goToChapter(nextChapterUrl);
          return;
        case "ArrowLeft":
          if (viewMode === "single" && !event.shiftKey) {
            event.preventDefault();
            if (swiperRef.current && !swiperRef.current.isBeginning) swiperRef.current.slidePrev();
            else goToChapter(prevChapterUrl);
            return;
          }
          goToChapter(prevChapterUrl);
          return;
      }

      switch (event.key.toLowerCase()) {
        case "v":
          toggleViewMode();
          break;
        case "w":
          cyclePageWidth();
          break;
        case "c":
        case "m":
          setShowChapterList(true);
          break;
        case "h":
          setChromeVisible((visible) => !visible);
          break;
        case "t":
          scrollToTop();
          break;
        case "?":
          setShowShortcuts(true);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    viewMode,
    nextChapterUrl,
    prevChapterUrl,
    showChapterList,
    showShortcuts,
    router,
    toggleViewMode,
    cyclePageWidth,
    scrollToTop,
  ]);

  if (!currentChapter || totalPages === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-lg text-white">This chapter has no pages yet.</p>
        {comicUrl && (
          <Link href={comicUrl}>
            <Button variant="secondary">
              <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to the comic
            </Button>
          </Link>
        )}
      </div>
    );
  }

  const progress = viewMode === "single" ? (totalPages > 1 ? (slidePage - 1) / (totalPages - 1) : 1) : scrollProgress;
  const chapterLabel = `Chapter ${currentChapter.chapterNumber}${currentChapter.title ? `: ${currentChapter.title}` : ""}`;

  return (
    <div className="relative min-h-screen bg-black">
      {/* Chapter progress - stays put even when the controls are hidden. */}
      <div className="fixed left-0 right-0 top-0 z-40 h-0.5 bg-white/10" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* Top bar */}
      <div
        aria-hidden={!chromeVisible}
        inert={!chromeVisible}
        className={`reader-chrome fixed left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 pt-5 transition-all duration-300 ${
          chromeVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3 text-white">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">{comicTitle}</h1>
            <p className="truncate text-sm opacity-75">{chapterLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="hidden sm:inline-flex"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <KeyboardIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
            {comicUrl && (
              <Link href={comicUrl}>
                <Button variant="secondary" size="sm">
                  <Home className="mr-1 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pages */}
      {viewMode === "single" ? (
        <div className="flex min-h-svh items-center justify-center">
          <div className="relative max-h-screen max-w-full">
            <Swiper
              className="comic-reader-swiper"
              slidesPerView={1}
              spaceBetween={10}
              modules={[Navigation, Mousewheel]}
              navigation
              mousewheel
              lazyPreloadPrevNext={1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onActiveIndexChange={(swiper) => setSlidePage(swiper.activeIndex + 1)}
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                  centeredSlides: true,
                },
              }}
            >
              {pages.map((pageUrl, pageIndex) => (
                <SwiperSlide key={`${currentChapter.id}-${pageIndex}`}>
                  <div className="flex h-full items-center justify-center">
                    <Image
                      src={pageUrl}
                      alt={`Chapter ${currentChapter.chapterNumber}, page ${pageIndex + 1} of ${totalPages}`}
                      width={800}
                      height={1200}
                      quality={90}
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="max-h-screen max-w-full object-contain"
                      priority={pageIndex === 0}
                      loading={pageIndex === 0 ? undefined : "lazy"}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : (
        <div className={`mb-16 mt-16 ${pageWidth === "full" ? "px-0" : "px-2 sm:px-4"}`}>
          <div
            className={`mx-auto flex w-full flex-col items-center ${WIDTH_CLASSES[pageWidth]}`}
            onClick={() => setChromeVisible((visible) => !visible)}
          >
            {pages.map((pageUrl, pageIndex) => (
              <ReaderPage
                key={`${currentChapter.id}-${pageIndex}`}
                url={pageUrl}
                pageNumber={pageIndex + 1}
                totalPages={totalPages}
                chapterNumber={currentChapter.chapterNumber}
                aspectRatio={pageAspectRatio}
                priority={pageIndex < EAGER_PAGES}
                showPageBadge={chromeVisible}
                registerPage={registerPage}
                onNaturalSize={reportNaturalSize}
              />
            ))}
          </div>

          <ChapterEndPanel
            chapterNumber={currentChapter.chapterNumber}
            chapterTitle={currentChapter.title}
            nextChapterUrl={nextChapterUrl}
            comicUrl={comicUrl}
            onOpenChapterList={() => setShowChapterList(true)}
            onBackToTop={scrollToTop}
          />
        </div>
      )}

      {/* Resume prompt */}
      {resumePage !== null && resumePage > currentPage && (
        <div className="fixed bottom-24 left-1/2 z-40 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-sm lg:bottom-24 lg:left-5 lg:translate-x-0">
          <div className="flex items-center gap-3">
            <p className="flex-1 text-sm text-foreground">
              You stopped on page {resumePage}.
            </p>
            <Button
              size="sm"
              onClick={() => {
                goToPage(resumePage);
                dismissResume();
              }}
            >
              Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={dismissResume}
              className="h-8 w-8 p-0"
              aria-label="Dismiss resume prompt"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div
        aria-hidden={!chromeVisible}
        inert={!chromeVisible}
        className={`reader-chrome fixed bottom-0 left-0 right-0 z-30 rounded-lg bg-gradient-to-t from-black/90 to-black/70 p-2 px-3 transition-all duration-300 lg:bottom-5 lg:left-5 lg:right-auto lg:w-fit ${
          chromeVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 lg:translate-y-[150%]"
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-white sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => prevChapterUrl && router.push(prevChapterUrl)}
            disabled={!prevChapterUrl}
            aria-label="Previous chapter"
            title="Previous chapter"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={toggleViewMode}
            aria-label={`Switch to ${viewMode === "single" ? "scrolling" : "single page"} view`}
            title={`Switch to ${viewMode === "single" ? "scrolling" : "single page"} view`}
          >
            {viewMode === "single" ? (
              <Scroll className="h-4 w-4" aria-hidden="true" />
            ) : (
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          {viewMode === "continuous" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={cyclePageWidth}
              className="hidden sm:inline-flex"
              aria-label={`Page width: ${WIDTH_LABELS[pageWidth]}. Change page width`}
              title={`Page width: ${WIDTH_LABELS[pageWidth]}`}
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}

          <div className="px-1 text-center" aria-live="polite">
            <div className="text-xs font-medium sm:text-sm">
              Chapter {currentChapter.chapterNumber}
            </div>
            <div className="text-xs tabular-nums opacity-75">
              Page {Math.min(currentPage, totalPages)} / {totalPages}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowChapterList(true)}
            aria-label="Chapter list"
            title="Chapter list"
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => nextChapterUrl && router.push(nextChapterUrl)}
            disabled={!nextChapterUrl}
            aria-label="Next chapter"
            title="Next chapter"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Compact handle while the controls are hidden */}
      {!chromeVisible && (
        <button
          type="button"
          onClick={() => setChromeVisible(true)}
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs tabular-nums text-white/70 backdrop-blur-sm transition-opacity hover:text-white lg:bottom-5 lg:left-5 lg:translate-x-0"
          aria-label="Show reader controls"
        >
          {Math.min(currentPage, totalPages)} / {totalPages}
        </button>
      )}

      {showChapterList && (
        <ChapterListModal
          chapters={chapters}
          currentIndex={chapterNumber - 1}
          getChapterUrl={getChapterUrl}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {showShortcuts && (
        <ShortcutsOverlay viewMode={viewMode} onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
