import Link from 'next/link';
import Image from 'next/image';
import { Comic } from '@/types';
import { Card, CardContent } from './ui/Card';

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
    <Link href={`/comics/${comic.id}`}>
      <Card className="group cursor-pointer transition-transform hover:scale-105 hover:shadow-lg">
        <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
          <Image
            src={comic.coverImageUrl}
            alt={comic.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
            {comic.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {comic.author}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {comic.genre?.split(',').map((genre, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {comic.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
