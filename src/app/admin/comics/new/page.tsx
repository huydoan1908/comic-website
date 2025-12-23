'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { comicsService } from '@/services/firebase';
import { uploadToCloudinaryClient } from '@/lib/cloudinary-client';

const comicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  author: z.string().min(1, 'Author is required'),
  genre: z.string().min(1, 'Genre is required'),
});

type ComicFormData = z.infer<typeof comicSchema>;

export default function NewComicPage() {
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComicFormData>({
    resolver: zodResolver(comicSchema),
  });

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

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ComicFormData) => {
    if (!isAdmin) {
      alert('You must be an admin to create comics');
      return;
    }

    if (!coverImage) {
      alert('Please select a cover image');
      return;
    }

    setLoading(true);

    try {
      // Generate custom filename for cover image in format: comicName_date
      const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9]/g, '_');
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const coverImageName = `${sanitizedTitle}_${currentDate}`;

      // Upload cover image directly to Cloudinary with custom name
      const coverImageUrl = await uploadToCloudinaryClient(coverImage, coverImageName);

      // Upload banner image if provided
      let bannerImageUrl = '';
      if (bannerImage) {
        const bannerImageName = `${sanitizedTitle}_banner_${currentDate}`;
        bannerImageUrl = await uploadToCloudinaryClient(bannerImage, bannerImageName);
      }

      // Create comic using direct service call
      const comicId = await comicsService.create({
        title: data.title,
        description: data.description,
        author: data.author,
        genre: data.genre,
        coverImageUrl,
        bannerImageUrl,
      });

      router.push(`/admin/comics/${comicId}`);
    } catch (error) {
      console.error('Error creating comic:', error);
      alert('Failed to create comic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-primary-foreground hover:text-primary-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-primary-foreground">Add New Comic</h1>
        <p className="text-muted-foreground mt-2">Create a new comic series</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover Image Upload */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Cover Image</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Upload cover image</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comic Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Banner Image Upload */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Banner Image (Optional)</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bannerPreview ? (
                      <div className="aspect-[21/9] relative rounded-lg overflow-hidden">
                        <Image
                          src={bannerPreview}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 600px"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[21/9] border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Upload banner image</p>
                        </div>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Comic Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Comic Details</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    label="Title"
                    {...register('title')}
                    error={errors.title?.message}
                    placeholder="Enter comic title"
                  />

                  <Textarea
                    label="Description"
                    {...register('description')}
                    error={errors.description?.message}
                    placeholder="Enter comic description"
                    rows={4}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Author"
                      {...register('author')}
                      error={errors.author?.message}
                      placeholder="Enter author name"
                    />

                    <Input
                      label="Genre"
                      {...register('genre')}
                      error={errors.genre?.message}
                      placeholder="e.g., Action, Romance, Comedy"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Link href="/admin">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Comic'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
