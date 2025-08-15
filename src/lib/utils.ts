import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to convert timestamp to Date
export function timestampToDate(timestamp: Timestamp | { seconds: number; nanoseconds: number }): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  // Handle serialized timestamp format
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

// Utility function to format timestamp as string
export function formatTimestamp(timestamp: Timestamp | { seconds: number; nanoseconds: number }): string {
  const date = timestampToDate(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Pagination utils
export function paginate<T>(items: T[], page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = page < totalPages;

  return {
    items: paginatedItems,
    totalCount,
    hasMore,
    currentPage: page,
    totalPages,
  };
}