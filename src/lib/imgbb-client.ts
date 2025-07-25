import { ImgbbResponse } from '@/types';

/**
 * Upload a single file directly to imgbb from the client
 */
export async function uploadToImgbbClient(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error('imgbb API key not configured');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', apiKey);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data: ImgbbResponse = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Failed to upload image to imgbb');
    }
  } catch (error) {
    console.error('Error uploading to imgbb:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple files to imgbb from the client
 */
export async function uploadMultipleToImgbbClient(files: File[]): Promise<string[]> {
  // Upload files in batches to avoid overwhelming the API
  const batchSize = 5;
  const results: string[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchPromises = batch.map(file => uploadToImgbbClient(file));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
