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
          const comicData = await comicsService.getById(params.id as string);
          setComic(comicData);

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
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="aspect-[3/4] bg-muted rounded-xl"></div>
              </div>
              <div className="lg:w-2/3 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Comic Not Found</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      {comic.bannerImageUrl && (
        <div className="relative w-full max-w-[1400px] aspect-1280/600 mx-auto overflow-hidden">
          <Image
            src={comic.bannerImageUrl}
            alt={`${comic.title} banner`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 drop-shadow-lg">
                {comic.title}
              </h1>
              <p className="text-foreground/90 text-lg md:text-xl max-w-2xl drop-shadow-md line-clamp-2">
                {comic.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Comic Details */}
          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            {/* Cover Image */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className={`aspect-[3/4] relative rounded-xl overflow-hidden shadow-2xl border-4 border-card ${comic.bannerImageUrl ? '-mt-24 lg:-mt-32 z-10' : ''}`}>
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
              <div className="space-y-8">
                {/* Only show title and description here if no banner */}
                {!comic.bannerImageUrl && (
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                      {comic.title}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                      {comic.description}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center px-4 py-2 bg-muted/50 rounded-full">
                    <User className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium text-foreground">{comic.author}</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-muted/50 rounded-full">
                    <Tag className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium text-foreground">{comic.genre}</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-muted/50 rounded-full">
                    <BookOpen className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium text-foreground">{chapters.length} chapters</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-muted/50 rounded-full">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium text-foreground">{timestampToDate(comic.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Show description here if banner exists */}
                {comic.bannerImageUrl && (
                  <div className="bg-card/50 p-6 rounded-xl border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center">
                      <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                      About this Comic
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {comic.description}
                    </p>
                  </div>
                )}

                {/* Start Reading Button */}
                {chapters.length > 0 && (
                  <div className="flex gap-4">
                    <Link href={`/read/${comic.id}/${chapters[chapters.length - 1].id}`} className="flex-1 sm:flex-none">
                      <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                        <BookOpen className="w-6 h-6 mr-2" />
                        Read First Chapter
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <span className="w-8 h-1 bg-primary rounded-full mr-3"></span>
              Chapters
            </h2>
            <ChapterList
              comicId={comic.id}
              chapters={chapters}
              showActions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
