'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, X, Move } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Chapter, Comic } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { chaptersService, comicsService } from '@/services/firebase';
import { uploadMultipleToCloudinaryClient } from '@/lib/cloudinary-client';
import { da } from 'zod/locales';

const chapterSchema = z.object({
  chapterNumber: z.number().min(1, 'Chapter number must be at least 1'),
  title: z.string().optional(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

export default function EditChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const comicId = params.id as string;
  const chapterId = params.chapterId as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [comic, setComic] = useState<Comic | null>(null);
  const [existingPages, setExistingPages] = useState<string[]>([]);
  const [newPageFiles, setNewPageFiles] = useState<File[]>([]);
  const [newPagePreviews, setNewPagePreviews] = useState<string[]>([]);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  const fetchChapter = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both chapter and comic data in parallel
      const [chapterData, comicData] = await Promise.all([
        chaptersService.getById(comicId, chapterId),
        comicsService.getById(comicId)
      ]);
      
      if (chapterData) {
        setChapter(chapterData);
        setExistingPages(chapterData.pageImageUrls);
        
        // Populate form
        reset({
          chapterNumber: chapterData.chapterNumber,
          title: chapterData.title || '',
        });
      } else {
        throw new Error('Chapter not found');
      }

      if (comicData) {
        setComic(comicData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [comicId, chapterId, reset]);

  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

  // Check admin permissions
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleNewPageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewPageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setNewPagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewPage = (index: number) => {
    setNewPageFiles(prev => prev.filter((_, i) => i !== index));
    setNewPagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDeleteExistingPage = (index: number) => {
    setPagesToDelete(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const moveExistingPage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= existingPages.length) return;
    
    const newPages = [...existingPages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    setExistingPages(newPages);
  };

  const onSubmit = async (data: ChapterFormData) => {
    if (!comic) {
      alert('Comic data not loaded. Please try again.');
      return;
    }

    setSubmitting(true);

    try {
      // First, upload new page images if any
      let newPageImageUrls: string[] = [];
      if (newPageFiles.length > 0) {
        // Generate custom filenames for new pages
        const sanitizedComicName = comic.title.replace(/[^a-zA-Z0-9]/g, '_');
        const existingPageCount = existingPages.length - pagesToDelete.length;
        const customFilenames = newPageFiles.map((_, index) => 
          `${sanitizedComicName}_chap${data.chapterNumber}_page_${existingPageCount + index + 1}`
        );
        
        newPageImageUrls = await uploadMultipleToCloudinaryClient(newPageFiles, customFilenames);
      }

      // Build final page URLs array
      const finalPageUrls = [
        ...existingPages.filter((_, index) => !pagesToDelete.includes(index)),
        ...newPageImageUrls,
      ];

      // Update chapter
      await chaptersService.update(comicId, chapterId, {
        chapterNumber: data.chapterNumber,
        title: data.title || undefined,
        pageImageUrls: finalPageUrls,
      });

      router.push(`/admin/comics/${comicId}`);
    } catch (error) {
      console.error('Error updating chapter:', error);
      alert('Failed to update chapter. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chapter Not Found</h1>
          <Link href={`/admin/comics/${comicId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Comic
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/comics/${comicId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comic
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Chapter {chapter.chapterNumber}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Chapter Info */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Chapter Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Number *
              </label>
              <Input
                id="chapterNumber"
                type="number"
                min="1"
                {...register('chapterNumber', { valueAsNumber: true })}
                className={errors.chapterNumber ? 'border-red-500' : ''}
              />
              {errors.chapterNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.chapterNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title (Optional)
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter chapter title"
              />
            </div>
          </CardContent>
        </Card>

        {/* Existing Pages */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Current Pages</h2>
            <p className="text-gray-600">Manage existing pages. You can reorder, delete, or add new pages.</p>
          </CardHeader>
          <CardContent>
            {existingPages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingPages.map((pageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className={`aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      pagesToDelete.includes(index) ? 'border-red-500 opacity-50' : 'border-gray-200'
                    }`}>
                      <Image
                        src={pageUrl}
                        alt={`Page ${index + 1}`}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveExistingPage(index, index - 1)}
                        disabled={index === 0}
                        className="bg-blue-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                        title="Move up"
                      >
                        <Move className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExistingPage(index, index + 1)}
                        disabled={index === existingPages.length - 1}
                        className="bg-blue-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                        title="Move down"
                      >
                        <Move className="w-3 h-3 rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDeleteExistingPage(index)}
                        className={`rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          pagesToDelete.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                        title={pagesToDelete.includes(index) ? 'Restore' : 'Delete'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Page {index + 1}
                      {pagesToDelete.includes(index) && (
                        <span className="text-red-500 ml-1">(Will be deleted)</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pages in this chapter</p>
            )}
          </CardContent>
        </Card>

        {/* Add New Pages */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Add New Pages</h2>
            <p className="text-gray-600">Upload additional pages to add to this chapter.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="newPageFiles" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900">Click to upload new pages</span>
                    <p className="text-gray-600 mt-1">or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                  <input
                    id="newPageFiles"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewPageFilesChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* New Page Previews */}
            {newPageFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  New Pages to Add ({newPageFiles.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newPagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                        <Image
                          src={preview}
                          alt={`New Page ${index + 1}`}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewPage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        New Page {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href={`/admin/comics/${comicId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Updating Chapter...' : 'Update Chapter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
