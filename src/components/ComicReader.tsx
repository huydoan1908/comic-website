"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chapter } from "@/types";
import { Button } from "./ui/Button";
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Scroll, Home, ChevronUp } from "lucide-react";

interface ComicReaderProps {
  chapters: Chapter[];
  initialChapterIndex?: number;
  initialPageIndex?: number;
  comicTitle: string;
  comicId?: string;
}

export function ComicReader({ chapters, initialChapterIndex = 0, initialPageIndex = 0, comicTitle, comicId }: ComicReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  const [showChapterList, setShowChapterList] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "continuous">("continuous");

  const currentChapter = chapters[currentChapterIndex];
  const currentPage = currentChapter?.pageImageUrls[currentPageIndex];

  // Navigation functions
  const nextPage = useCallback(() => {
    if (!currentChapter) return;

    if (currentPageIndex < currentChapter.pageImageUrls.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      setCurrentPageIndex(0);
    }
  }, [currentChapter, currentPageIndex, currentChapterIndex, chapters.length]);

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
      const prevChapter = chapters[currentChapterIndex - 1];
      setCurrentPageIndex(prevChapter.pageImageUrls.length - 1);
    }
  }, [currentPageIndex, currentChapterIndex, chapters]);

  const getChapterUrl = (chapterIndex: number) => {
    if (!comicId) return '#';
    const chapter = chapters[chapterIndex];
    return `/read/${comicId}/${chapter.id}`;
  };

  const nextChapterUrl = currentChapterIndex < chapters.length - 1 ? getChapterUrl(currentChapterIndex + 1) : null;
  const prevChapterUrl = currentChapterIndex > 0 ? getChapterUrl(currentChapterIndex - 1) : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (viewMode === "continuous") {
        // In continuous mode, only handle view switching
        switch (e.key) {
          case "v":
          case "V":
            setViewMode("single");
            break;
        }
      } else {
        // Single page mode navigation
        switch (e.key) {
          case "ArrowRight":
          case " ":
            e.preventDefault();
            nextPage();
            break;
          case "ArrowLeft":
            e.preventDefault();
            prevPage();
            break;
          case "v":
          case "V":
            setViewMode("continuous");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nextPage, prevPage, viewMode]);

  if (!currentChapter || !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Top Controls - Always visible */}
      <div className="bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-lg font-semibold">{comicTitle}</h1>
            <p className="text-sm opacity-75">
              Chapter {currentChapter.chapterNumber}
              {currentChapter.title && `: ${currentChapter.title}`}
            </p>
          </div>
          <div>
            {comicId && (
              <Link href={`/comics/${comicId}`}>
                <Button variant="secondary" size="sm">
                  <Home className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-32">
        {viewMode === "single" ? (
          /* Single Page View */
          <div className="flex items-center justify-center min-h-screen">
            <div className="relative max-w-full max-h-screen">
              <Image src={currentPage} alt={`Page ${currentPageIndex + 1}`} width={800} height={1200} className="max-w-full max-h-screen object-contain" priority />
            </div>
          </div>
        ) : (
          /* Continuous View */
          <div className="flex flex-col items-center space-y-6 px-4">
            <div className="flex flex-col items-center space-y-6 w-full">
              {/* Chapter Pages */}
              {currentChapter.pageImageUrls.map((pageUrl, pageIndex) => (
                <div key={`${currentChapter.id}-${pageIndex}`} className="relative w-full max-w-6xl">
                  <Image src={pageUrl} alt={`Chapter ${currentChapter.chapterNumber}, Page ${pageIndex + 1}`} width={1200} height={1800} className="w-full h-auto object-contain max-h-screen" loading={pageIndex < 3 ? "eager" : "lazy"} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows - Only in single page mode */}
      {viewMode === "single" && (
        <>
          <button onClick={prevPage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-20" disabled={currentChapterIndex === 0 && currentPageIndex === 0}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextPage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-20" disabled={currentChapterIndex === chapters.length - 1 && currentPageIndex === currentChapter.pageImageUrls.length - 1}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Controls - Fixed with all features */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 to-black/70 p-2 md:p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-center text-white">
          <div className="flex items-center space-x-3">
            {prevChapterUrl ? (
              <Link href={prevChapterUrl}>
                <Button variant="secondary" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setViewMode(viewMode === "single" ? "continuous" : "single")} title={`Switch to ${viewMode === "single" ? "continuous" : "single"} view`}>
              {viewMode === "single" ? <Scroll className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            </Button>
            {viewMode === "single" ? (
              <div className="text-center">
                <div>
                  Page {currentPageIndex + 1} of {currentChapter.pageImageUrls.length}
                </div>
                <div className="text-xs opacity-75">Chapter {currentChapter.chapterNumber}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs md:text-lg">Chapter {currentChapter.chapterNumber}</div>
                <div className="text-xs opacity-75">{currentChapter.pageImageUrls.length} Pages</div>
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowChapterList(true)}>
              <Menu className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={scrollToTop} title="Back to top">
              <ChevronUp className="w-4 h-4" />
            </Button>
            {nextChapterUrl ? (
              <Link href={nextChapterUrl}>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" disabled>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Page navigation for single mode */}
        {viewMode === "single" && (
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentChapterIndex === 0 && currentPageIndex === 0} className="text-white border-gray-600 hover:bg-gray-800">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev Page
            </Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentChapterIndex === chapters.length - 1 && currentPageIndex === currentChapter.pageImageUrls.length - 1} className="text-white border-gray-600 hover:bg-gray-800">
              Next Page
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Chapter List Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Chapters</h2>
              <Button variant="outline" size="sm" onClick={() => setShowChapterList(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {chapters.map((chapter, index) => (
                <Link key={chapter.id} href={getChapterUrl(index)} className={`block w-full text-left p-4 hover:bg-gray-50 border-b transition-colors ${index === currentChapterIndex ? "bg-blue-50 border-blue-200" : ""}`}>
                  <div className="font-medium">Chapter {chapter.chapterNumber}</div>
                  {chapter.title && <div className="text-sm text-gray-600">{chapter.title}</div>}
                  <div className="text-xs text-gray-500">{chapter.pageImageUrls.length} pages</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
