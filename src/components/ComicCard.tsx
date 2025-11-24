import Link from 'next/link';
import Image from 'next/image';
import { Comic } from '@/types';

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
      <div className="group cursor-pointer transition-all duration-300 hover:-translate-y-1">
        <Link href={`/comics/${comic.id}`}>
          <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-card border border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all">
            <Image
              src={comic.coverImageUrl}
              alt={comic.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex flex-wrap gap-1 mb-1">
                {comic.genre?.split(',').map((genre, index) => index < 2 && (
                  <span
                    key={index}
                    className="inline-block bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>

        <div className="py-3">
          <Link href={`/comics/${comic.id}`}>
            <h3 className="font-bold text-sm md:text-base text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {comic.title}
            </h3>
          </Link>
          {comic.latestChapter && (
            <Link href={`/read/${comic.id}/${comic.latestChapter.id}`}>
              <p className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Chap {comic.latestChapter.number}
                <span className="hidden md:inline opacity-70">
                  {comic.latestChapter.title ? ` - ${comic.latestChapter.title}` : ''}
                </span>
              </p>
            </Link>
          )}
        </div>
      </div>
  );
}
