import Link from 'next/link';
import Image from 'next/image';
import { Comic } from '@/types';

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
      <div className="group cursor-pointer transition-transform shadow-none border-none">
        <Link href={`/comics/${comic.id}`}>
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={comic.coverImageUrl}
              alt={comic.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="flex items-center justify-center absolute bottom-0 left-0 right-0">
              <div className="flex flex-wrap gap-1">
                {comic.genre?.split(',').map((genre, index) => index < 2 && (
                  <span
                    key={index}
                    className="inline-block bg-gray-800/60 text-white text-xs font-medium px-2.5 py-1.5 rounded-t-lg"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/comics/${comic.id}`} prefetch>
            <h3 className="font-semibold text-md text-gray-900 mb-1 line-clamp-2">
              {comic.title}
            </h3>
          </Link>
          {comic.latestChapter && (
            <Link href={`/read/${comic.id}/${comic.latestChapter.id}`} prefetch>
              <p className="text-sm text-gray-900 transition-colors mb-2 cursor-pointer">
                Chap {comic.latestChapter.number}
                {comic.latestChapter.title ? ` - ${comic.latestChapter.title}` : ''}
              </p>
            </Link>
          )}
        </div>
      </div>
  );
}
