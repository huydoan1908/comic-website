'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Chapter } from '@/types';
import { Button } from './ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  Menu,
  X 
} from 'lucide-react';

interface ComicReaderProps {
  chapters: Chapter[];
  initialChapterIndex?: number;
  initialPageIndex?: number;
  comicTitle: string;
}

export function ComicReader({ 
  chapters, 
  initialChapterIndex = 0, 
  initialPageIndex = 0,
  comicTitle 
}: ComicReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);

  const currentChapter = chapters[currentChapterIndex];
  const currentPage = currentChapter?.pageImageUrls[currentPageIndex];

  // Navigation functions
  const nextPage = useCallback(() => {
    if (!currentChapter) return;

    if (currentPageIndex < currentChapter.pageImageUrls.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentPageIndex(0);
    }
  }, [currentChapter, currentPageIndex, currentChapterIndex, chapters.length]);

  const prevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      const prevChapter = chapters[currentChapterIndex - 1];
      setCurrentPageIndex(prevChapter.pageImageUrls.length - 1);
    }
  }, [currentPageIndex, currentChapterIndex, chapters]);

  const nextChapter = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentPageIndex(0);
    }
  }, [currentChapterIndex, chapters.length]);

  const prevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      setCurrentPageIndex(0);
    }
  }, [currentChapterIndex]);

  const goToChapter = (chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    setCurrentPageIndex(0);
    setShowChapterList(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'Escape':
          setShowControls(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextPage, prevPage]);

  if (!currentChapter || !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Top Controls */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h1 className="text-lg font-semibold">{comicTitle}</h1>
              <p className="text-sm opacity-75">
                Chapter {currentChapter.chapterNumber}
                {currentChapter.title && `: ${currentChapter.title}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChapterList(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Image */}
      <div 
        className="flex items-center justify-center min-h-screen cursor-pointer"
        onClick={() => setShowControls(prev => !prev)}
      >
        <div className="relative max-w-full max-h-screen">
          <Image
            src={currentPage}
            alt={`Page ${currentPageIndex + 1}`}
            width={800}
            height={1200}
            className="max-w-full max-h-screen object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {showControls && (
        <>
          <button
            onClick={prevPage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            disabled={currentChapterIndex === 0 && currentPageIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextPage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            disabled={currentChapterIndex === chapters.length - 1 && currentPageIndex === currentChapter.pageImageUrls.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevChapter}
                disabled={currentChapterIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Prev Chapter
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
              >
                Next Chapter
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="text-sm">
              Page {currentPageIndex + 1} of {currentChapter.pageImageUrls.length}
            </div>
          </div>
        </div>
      )}

      {/* Chapter List Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Chapters</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChapterList(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(index)}
                  className={`w-full text-left p-4 hover:bg-gray-50 border-b transition-colors ${
                    index === currentChapterIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium">Chapter {chapter.chapterNumber}</div>
                  {chapter.title && (
                    <div className="text-sm text-gray-600">{chapter.title}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {chapter.pageImageUrls.length} pages
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
