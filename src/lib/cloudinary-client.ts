import { CloudinaryResponse } from '@/types';

/**
 * Upload a single file directly to Cloudinary from the client
 */
export async function uploadToCloudinaryClient(file: File, customName?: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration not found');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  // Add custom public_id if provided
  if (customName) {
    formData.append('public_id', customName);
  }

  // Add folder organization for comics
  formData.append('folder', 'comics');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data: CloudinaryResponse = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Failed to upload image to Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple files to Cloudinary from the client
 */
export async function uploadMultipleToCloudinaryClient(files: File[], fileNames?: string[]): Promise<string[]> {
  // Upload files in batches to avoid overwhelming the API
  const batchSize = 5;
  const results: string[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchPromises = batch.map((file, index) => {
      const customName = fileNames ? fileNames[i + index] : undefined;
      return uploadToCloudinaryClient(file, customName);
    });
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
