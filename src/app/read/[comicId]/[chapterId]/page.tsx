'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Comic, Chapter } from '@/types';
import { ComicReader } from '@/components/ComicReader';

export default function ReadPage() {
  const params = useParams();
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (params.comicId) {
        try {
          // Fetch comic details
          const comicResponse = await fetch(`/api/comics/${params.comicId}`);
          if (comicResponse.ok) {
            const comicData = await comicResponse.json();
            setComic(comicData);
          }

          // Fetch chapters
          const chaptersResponse = await fetch(`/api/comics/${params.comicId}/chapters`);
          if (chaptersResponse.ok) {
            const chaptersData = await chaptersResponse.json();
            setChapters(chaptersData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [params.comicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!comic || chapters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Comic or Chapter Not Found</h1>
          <p>The requested comic or chapter could not be found.</p>
        </div>
      </div>
    );
  }

  // Find the initial chapter index based on the chapterId parameter
  const initialChapterIndex = chapters.findIndex(chapter => chapter.id === params.chapterId);
  const validChapterIndex = initialChapterIndex >= 0 ? initialChapterIndex : 0;

  return (
    <ComicReader
      chapters={chapters}
      initialChapterIndex={validChapterIndex}
      initialPageIndex={0}
      comicTitle={comic.title}
    />
  );
}
