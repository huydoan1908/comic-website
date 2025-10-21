"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { chaptersService, comicsService } from "@/services/firebase";
import { uploadMultipleToCloudinaryClient } from "@/lib/cloudinary-client";
import { convertPDFToImages, convertPDFImagesToFiles, isPDFFile } from "@/lib/pdf-utils";
import { Comic } from "@/types";

const chapterSchema = z.object({
  chapterNumber: z.number().min(1, "Chapter number must be at least 1"),
  title: z.string().optional(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const comicId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [comic, setComic] = useState<Comic | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  // Fetch comic data
  useEffect(() => {
    const fetchComic = async () => {
      try {
        const comicData = await comicsService.getById(comicId);
        setComic(comicData);
        setValue("chapterNumber", (comicData?.latestChapter?.number || 0) + 1);
      } catch (error) {
        console.error("Error fetching comic:", error);
      }
    };

    if (comicId) {
      fetchComic();
    }
  }, [comicId, setValue]);

  // Check admin permissions
  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handlePageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Separate PDF files from image files
    const imageFiles = files.filter((file) => !isPDFFile(file));
    const pdfFiles = files.filter((file) => isPDFFile(file));

    // Handle image files (existing functionality)
    if (imageFiles.length > 0) {
      const sortedFiles = imageFiles.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
      setPageFiles((prev) => [...prev, ...sortedFiles]);

      // Create previews for images in correct order
      const imagePromises = sortedFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      // Wait for all image previews to complete and add them in order
      try {
        const imagePreviews = await Promise.all(imagePromises);
        setPagePreviews((prev) => [...prev, ...imagePreviews]);
      } catch (error) {
        console.error("Error generating image previews:", error);
      }
    }

    // Handle PDF files
    if (pdfFiles.length > 0) {
      setPdfProcessing(true);
      try {
        for (const pdfFile of pdfFiles) {
          console.log("Processing PDF:", pdfFile.name);

          // Convert PDF to images
          const pdfImages = await convertPDFToImages(pdfFile, 0.9, 2);

          // Convert to File objects
          const baseName = pdfFile.name.replace(/\.pdf$/i, "");
          const imageFiles = convertPDFImagesToFiles(pdfImages, baseName);

          // Add to page files
          setPageFiles((prev) => [...prev, ...imageFiles]);

          // Add previews (these are already in order from PDF processing)
          const previews = pdfImages.map((img) => img.dataUrl);
          setPagePreviews((prev) => [...prev, ...previews]);
        }
      } catch (error) {
        console.error("Error processing PDF:", error);
        alert("Failed to process PDF file. Please make sure it's a valid PDF and try again.");
      } finally {
        setPdfProcessing(false);
      }
    }

    // Clear the input
    e.target.value = "";
  };

  const removePage = (index: number) => {
    setPageFiles((prev) => prev.filter((_, i) => i !== index));
    setPagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ChapterFormData) => {
    if (pageFiles.length === 0) {
      alert("Please add at least one page");
      return;
    }

    if (!comic) {
      alert("Comic data not loaded. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Generate custom filenames in format: comicName_page_index
      const sanitizedComicName = comic.title.replace(/[^a-zA-Z0-9]/g, "_");
      const sanitizedChapterName = data.title ? data.title.replace(/[^a-zA-Z0-9]/g, "_") : "Untitled";
      const customFilenames = pageFiles.map((_, index) => `${sanitizedComicName}_chap${data.chapterNumber}_${sanitizedChapterName}_page_${index + 1}`);

      // Upload all page images directly to Cloudinary with custom names
      const pageImageUrls = await uploadMultipleToCloudinaryClient(pageFiles, customFilenames);

      // Create chapter
      await chaptersService.create(comicId, {
        chapterNumber: data.chapterNumber,
        title: data.title || "Untitled",
        pageImageUrls,
      });

      router.push(`/admin/comics/${comicId}`);
    } catch (error) {
      console.error("Error creating chapter:", error);
      alert("Failed to create chapter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Chapter</h1>
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
              <Input id="chapterNumber" type="number" min="1" {...register("chapterNumber", { valueAsNumber: true })} readOnly className={errors.chapterNumber ? "border-red-500" : ""} placeholder="Enter chapter number" />
              {errors.chapterNumber && <p className="text-red-500 text-sm mt-1">{errors.chapterNumber.message}</p>}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title (Optional)
              </label>
              <Input id="title" {...register("title")} placeholder="Enter chapter title" />
            </div>
          </CardContent>
        </Card>

        {/* Page Upload */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Chapter Pages</h2>
            <p className="text-gray-600">Upload images or PDF files for this chapter. Pages will be displayed in the order you upload them.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Individual Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label htmlFor="imageFiles" className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">Upload Images</span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                    </label>
                    <input id="imageFiles" type="file" multiple accept="image/*" onChange={handlePageFilesChange} className="hidden" />
                  </div>
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label htmlFor="pdfFiles" className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">Upload PDF</span>
                      <p className="text-xs text-gray-500 mt-1">PDF files will be split into pages</p>
                    </label>
                    <input id="pdfFiles" type="file" multiple accept=".pdf,application/pdf" onChange={handlePageFilesChange} className="hidden" />
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Processing Status */}
            {pdfProcessing && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-3"></div>
                  <span className="text-sm text-gray-800">Processing PDF file(s)...</span>
                </div>
              </div>
            )}

            {/* Page Previews */}
            {pageFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pages ({pageFiles.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                        {preview ? (
                          <Image src={preview} alt={`Page ${index + 1}`} width={300} height={400} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removePage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 text-center">Page {index + 1}</p>
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
          <Button type="submit" disabled={loading || pdfProcessing || pageFiles.length === 0}>
            {loading ? "Creating Chapter..." : pdfProcessing ? "Processing PDF..." : "Create Chapter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
