'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Edit, Eye, BookOpen, ArrowUpNarrowWide, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ChapterList } from '@/components/ChapterList';
import { ComicSelectorModal } from '@/components/ComicSelectorModal';
import { Comic, Chapter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { comicsService, chaptersService } from '@/services/firebase';

export default function ComicManagePage() {
  const params = useParams();
  const comicId = params.id as string;
  const { isAdmin } = useAuth();
  
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [chapterToMove, setChapterToMove] = useState<string | null>(null);

  const fetchComicData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch comic details
      const comic = await comicsService.getById(comicId);
      if (!comic) {
        throw new Error('Comic not found');
      }
      setComic(comic);

      // Fetch chapters
      const chapters = await chaptersService.getByComicId(comicId);
      setChapters(chapters);
    } catch (error) {
      console.error('Error fetching comic data:', error);
      alert('Failed to load comic data');
    } finally {
      setLoading(false);
    }
  }, [comicId]);

  useEffect(() => {
    fetchComicData();
  }, [fetchComicData]);

  const handleDeleteChapter = async (chapterId: string) => {
    if (!isAdmin) {
      alert('You must be an admin to delete chapters');
      return;
    }

    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    setDeleting(chapterId);
    try {
      await chaptersService.delete(comicId, chapterId);
      
      // Refresh chapters list
      await fetchComicData();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    } finally {
      setDeleting(null);
    }
  };

  const handleMoveChapter = (chapterId: string) => {
    if (!isAdmin) {
      alert('You must be an admin to move chapters');
      return;
    }

    setChapterToMove(chapterId);
    setShowMoveModal(true);
  };

  const handleMoveToComic = async (targetComic: Comic) => {
    if (!chapterToMove || !isAdmin) {
      return;
    }

    // Find the chapter being moved
    const chapter = chapters.find(ch => ch.id === chapterToMove);
    const chapterName = chapter 
      ? `Chapter ${chapter.chapterNumber}${chapter.title ? `: ${chapter.title}` : ''}`
      : 'this chapter';

    if (!confirm(`Are you sure you want to move ${chapterName} to "${targetComic.title}"?\n\nThis will remove the chapter from the current comic and add it to the target comic.`)) {
      return;
    }

    setMoving(chapterToMove);
    try {
      await chaptersService.moveToComic(comicId, chapterToMove, targetComic.id);
      
      // Refresh chapters list
      await fetchComicData();
      alert(`${chapterName} has been successfully moved to "${targetComic.title}"!`);
    } catch (error) {
      console.error('Error moving chapter:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to move chapter: ${errorMessage}`);
    } finally {
      setMoving(null);
      setChapterToMove(null);
      setShowMoveModal(false);
    }
  };

  const handleRenumberChapters = async () => {
    if (!isAdmin) {
      alert('You must be an admin to renumber chapters');
      return;
    }
    if (!confirm('Are you sure you want to renumber all chapters sequentially starting from 1?')) {
      return;
    }

    setLoading(true);
    try {
      await chaptersService.renumberChapters(comicId);
      alert('Chapters have been renumbered successfully');
      await fetchComicData();
    } catch (error) {
      console.error('Error renumbering chapters:', error);
      alert('Failed to renumber chapters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Comic Not Found</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Manage Comic</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/comics/${comicId}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Comic
            </Button>
          </Link>
          <Link href={`/admin/comics/${comicId}/chapters/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </Link>
        </div>
      </div>

      {/* Comic Info */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="">
              <Image
                src={comic.coverImageUrl}
                alt={comic.title}
                width={200}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{comic.title}</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Author:</span> {comic.author}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Genre:</span> {comic.genre}
              </p>
              <p className="text-gray-700 mb-4">{comic.description}</p>
              <div className="flex gap-2">
                <Link href={`/admin/comics/${comicId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Comic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Chapters ({chapters.length})
          </h3>
          <Button className="flex items-center gap-2" variant="outline" size="sm" onClick={handleRenumberChapters} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpNarrowWide />}
            Renumber
          </Button>
        </div>

        <ChapterList
          comicId={comicId}
          chapters={chapters}
          onDelete={handleDeleteChapter}
          onMove={handleMoveChapter}
          deleting={deleting}
          moving={moving}
          showActions={true}
        />
      </div>

      {/* Move Chapter Modal */}
      <ComicSelectorModal
        isOpen={showMoveModal}
        onClose={() => {
          setShowMoveModal(false);
          setChapterToMove(null);
        }}
        onSelect={handleMoveToComic}
        currentComicId={comicId}
        title="Move Chapter to Comic"
      />
    </div>
  );
}
