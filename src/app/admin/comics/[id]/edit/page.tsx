'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Comic } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { comicsService } from '@/services/firebase';
import { uploadToImgbbClient } from '@/lib/imgbb-client';

const comicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  genre: z.string().min(1, 'Genre is required'),
});

type ComicFormData = z.infer<typeof comicSchema>;

export default function EditComicPage() {
  const params = useParams();
  const router = useRouter();
  const comicId = params.id as string;
  const { user, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comic, setComic] = useState<Comic | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComicFormData>({
    resolver: zodResolver(comicSchema),
  });

  const fetchComic = useCallback(async () => {
    try {
      setLoading(true);
      const comic = await comicsService.getById(comicId);
      if (!comic) {
        throw new Error('Comic not found');
      }
      
      setComic(comic);
      setImagePreview(comic.coverImageUrl);
      
      // Populate form
      reset({
        title: comic.title,
        description: comic.description,
        author: comic.author,
        genre: comic.genre,
      });
    } catch (error) {
      console.error('Error fetching comic:', error);
      alert('Failed to load comic data');
    } finally {
      setLoading(false);
    }
  }, [comicId, reset]);

  useEffect(() => {
    fetchComic();
  }, [fetchComic]);

  // Check admin permissions
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ComicFormData) => {
    if (!isAdmin) {
      alert('You must be an admin to edit comics');
      return;
    }

    setSubmitting(true);

    try {
      let coverImageUrl = comic?.coverImageUrl;

      // Upload new cover image if one was selected
      if (coverImage) {
        coverImageUrl = await uploadToImgbbClient(coverImage);
      }

      // Update comic using direct service call
      await comicsService.update(comicId, {
        title: data.title,
        description: data.description,
        author: data.author,
        genre: data.genre,
        coverImageUrl,
      });

      router.push(`/admin/comics/${comicId}`);
    } catch (error) {
      console.error('Error updating comic:', error);
      alert('Failed to update comic. Please try again.');
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

  if (!comic) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/comics/${comicId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comic
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Comic</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Comic Info */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Comic Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
                placeholder="Enter comic title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                id="description"
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="Enter comic description"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <Input
                  id="author"
                  {...register('author')}
                  className={errors.author ? 'border-red-500' : ''}
                  placeholder="Enter author name"
                />
                {errors.author && (
                  <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <Input
                  id="genre"
                  {...register('genre')}
                  className={errors.genre ? 'border-red-500' : ''}
                  placeholder="Enter genre"
                />
                {errors.genre && (
                  <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Cover Image</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Cover
                </label>
                {imagePreview && (
                  <div className="w-full max-w-xs">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      width={200}
                      height={300}
                      className="rounded-lg object-cover w-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Cover (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <label htmlFor="coverImage" className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">Click to upload</span>
                      <p className="text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </label>
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
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
            {submitting ? 'Updating Comic...' : 'Update Comic'}
          </Button>
        </div>
      </form>
    </div>
  );
}
