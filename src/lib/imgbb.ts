import axios from 'axios';
import { ImgbbResponse } from '@/types';

export async function uploadToImgbb(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', process.env.IMGBB_API_KEY || '');

  try {
    const response = await axios.post<ImgbbResponse>(
      'https://api.imgbb.com/1/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error('Failed to upload image to imgbb');
    }
  } catch (error) {
    console.error('Error uploading to imgbb:', error);
    throw new Error('Failed to upload image');
  }
}

export async function uploadMultipleToImgbb(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToImgbb(file));
  return Promise.all(uploadPromises);
}
