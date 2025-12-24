"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chapter } from "@/types";
import { Button } from "./ui/Button";
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Scroll, Home, ChevronUp } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Keyboard, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import "@/assets/css/ComicReader.css";

interface ComicReaderProps {
  chapters: Chapter[];
  chapterNumber?: number;
  comicTitle: string;
  comicId?: string;
}

export function ComicReader({ chapters, chapterNumber = 1, comicTitle, comicId }: ComicReaderProps) {
  const [showChapterList, setShowChapterList] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "continuous">("continuous");

  const currentChapter = chapters[chapterNumber - 1];

  const getChapterUrl = (chapterIndex: number) => {
    if (!comicId) return "#";
    const chapter = chapters[chapterIndex];
    return `/read/${comicId}/${chapter.id}`;
  };

  const nextChapterUrl = chapterNumber < chapters.length ? getChapterUrl(chapterNumber) : null;
  const prevChapterUrl = chapterNumber > 1 ? getChapterUrl(chapterNumber - 2) : null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Top Controls - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
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
      {viewMode === "single" ? (
        /* Single Page View */
        <div className="flex items-center justify-center min-h-svh">
          <div className="relative max-w-full max-h-screen">
            <Swiper
              className="comic-reader-swiper"
              slidesPerView={1}
              spaceBetween={10}
              modules={[Navigation, Mousewheel, Keyboard]}
              navigation
              mousewheel
              keyboard
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                  centeredSlides: true,
                },
              }}
            >
              {currentChapter.pageImageUrls.map((pageUrl, pageIndex) => (
                <SwiperSlide key={pageIndex}>
                  <div className="flex items-center justify-center h-full">
                    <Image src={pageUrl} alt={` Page ${pageIndex + 1}`} width={800} height={1200} className="max-w-full max-h-screen object-contain" priority />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : (
        /* Continuous View */
        <div className="px-4 mt-20 mb-16">
          <div className="flex flex-col items-center w-full">
            {/* Chapter Pages */}
            {currentChapter.pageImageUrls.map((pageUrl, pageIndex) => (
              <div key={`${currentChapter.id}-${pageIndex}`} className="relative w-full max-w-4xl">
                <Image src={pageUrl} alt={`Chapter ${currentChapter.chapterNumber}, Page ${pageIndex + 1}`} quality={100} width={1080} height={1620} className="w-full h-auto object-contain" priority={pageIndex === 0} loading={pageIndex < 3 ? "eager" : "lazy"}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 lg:bottom-5 lg:left-5 lg:w-fit z-30 bg-gradient-to-t from-black/90 to-black/70 p-2 px-3 rounded-lg">
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
            <div className="text-center">
              <div className="text-xs md:text-lg">Chapter {currentChapter.chapterNumber}</div>
              <div className="text-xs opacity-75">{currentChapter.pageImageUrls.length} Pages</div>
            </div>
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
      </div>

      {/* Chapter List Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-sm absolute inset-0" onClick={() => setShowChapterList(false)} />
          <div className="relative z-10 bg-card border border-border rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h2 className="text-lg font-semibold text-foreground">Chapters</h2>
              <Button variant="outline" size="sm" onClick={() => setShowChapterList(false)} className="h-8 w-8 p-0 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-96 custom-scrollbar">
              {chapters.map((chapter, index) =>
                index === chapterNumber - 1 ? (
                  <div key={chapter.id} className="block w-full text-left p-4 border-b border-border transition-colors bg-primary/10">
                    <div className="font-medium text-primary">Chapter {chapter.chapterNumber}</div>
                    {chapter.title && <div className="text-sm text-primary/80">{chapter.title}</div>}
                    <div className="text-xs text-primary/60 mt-1">{chapter.pageImageUrls.length} pages</div>
                  </div>
                ) : (
                  <Link key={chapter.id} href={getChapterUrl(index)} className="block w-full text-left p-4 hover:bg-muted/50 border-b border-border transition-colors group">
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">Chapter {chapter.chapterNumber}</div>
                    {chapter.title && <div className="text-sm text-muted-foreground">{chapter.title}</div>}
                    <div className="text-xs text-muted-foreground/60 mt-1">{chapter.pageImageUrls.length} pages</div>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
