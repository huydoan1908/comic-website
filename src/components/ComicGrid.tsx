import { Comic } from '@/types';
import { ComicCard } from './ComicCard';

interface ComicGridProps {
  comics: Comic[];
  loading?: boolean;
}

export function ComicGrid({ comics, loading }: ComicGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No comics found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-6">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
