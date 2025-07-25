import { Timestamp } from 'firebase/firestore';

export interface Comic {
  id: string;
  title: string;
  description: string;
  author: string;
  genre: string;
  coverImageUrl: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number };
  updatedAt: Timestamp | { seconds: number; nanoseconds: number };
}

export interface Chapter {
  id: string;
  comicId: string;
  chapterNumber: number;
  title?: string;
  pageImageUrls: string[];
  createdAt: Timestamp | { seconds: number; nanoseconds: number };
  updatedAt: Timestamp | { seconds: number; nanoseconds: number };
}

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  role: 'admin' | 'user';
}

export interface ComicFormData {
  title: string;
  description: string;
  author: string;
  genre: string;
  coverImage?: FileList;
}

export interface ChapterFormData {
  chapterNumber: number;
  title?: string;
  pages?: FileList;
}

export interface ImgbbResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface ComicWithChapters extends Comic {
  chapters?: Chapter[];
}
