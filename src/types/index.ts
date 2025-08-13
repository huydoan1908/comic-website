import { Timestamp } from 'firebase/firestore';

export interface Comic {
  id: string;
  title: string;
  description: string;
  author: string;
  genre: string;
  coverImageUrl: string;
  bannerImageUrl?: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number };
  updatedAt: Timestamp | { seconds: number; nanoseconds: number };
  latestChapter?: {
    number: number;
    title?: string;
    id: string;
    createdAt: Timestamp | { seconds: number; nanoseconds: number };
  };
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
  bannerImage?: FileList;
}

export interface ChapterFormData {
  chapterNumber: number;
  title?: string;
  pages?: FileList;
}

export interface CloudinaryResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export interface ComicWithChapters extends Comic {
  chapters?: Chapter[];
}
