'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Comic, Chapter } from '@/types';
import { timestampToDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ChapterList } from '@/components/ChapterList';
import { comicsService, chaptersService } from '@/services/firebase';
import { BookOpen, User, Tag, Clock } from 'lucide-react';

export default function ComicDetailPage() {
  const params = useParams();
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        try {
          // Fetch comic details
          const comicData = await comicsService.getById(params.id as string);
          setComic(comicData);

          // Fetch chapters
          const chaptersData = await chaptersService.getByComicId(params.id as string, { orderBy: 'desc' });
          setChapters(chaptersData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:w-2/3 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Comic Not Found</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Image */}
      {comic.bannerImageUrl && (
        <div className="relative w-full max-w-[1280px] aspect-1280/600 mx-auto overflow-hidden">
          <Image
            src={comic.bannerImageUrl}
            alt={`${comic.title} banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {comic.title}
              </h1>
              <p className="text-white/90 text-lg max-w-2xl">
                {comic.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Comic Details */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Cover Image */}
            <div className="lg:w-1/3">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={comic.coverImageUrl}
                  alt={comic.title}
                  fill
                  className="object-cover"
                  priority={!comic.bannerImageUrl}
                />
              </div>
            </div>

            {/* Comic Info */}
            <div className="lg:w-2/3">
              <div className="space-y-6">
                {/* Only show title and description here if no banner */}
                {!comic.bannerImageUrl && (
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {comic.title}
                    </h1>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      {comic.description}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {comic.author}
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {comic.genre}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {chapters.length} chapters
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {timestampToDate(comic.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Show description here if banner exists */}
                {comic.bannerImageUrl && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">About this Comic</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {comic.description}
                    </p>
                  </div>
                )}

                {/* Start Reading Button */}
                {chapters.length > 0 && (
                  <div>
                    <Link href={`/read/${comic.id}/${chapters[chapters.length - 1].id}`}>
                      <Button size="lg" className="w-full sm:w-auto">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Read First Chapter
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">Chapters</h2>
            </CardHeader>
            <CardContent>
              <ChapterList
                comicId={comic.id}
                chapters={chapters}
                showActions={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
