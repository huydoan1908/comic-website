'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comic } from '@/types';
import { timestampToDate } from '@/lib/utils';
import { ComicGrid } from '@/components/ComicGrid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ItemsPerPageSelector } from '@/components/ui/ItemsPerPageSelector';
import { comicsService } from '@/services/firebase';
import { usePagination } from '@/hooks/usePagination';
import { Search, Filter, Clock } from 'lucide-react';

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  // Pagination configuration
  const ITEMS_PER_PAGE = 10;
  
  // Use pagination hook for main comics list
  const {
    currentPage,
    totalPages,
    currentItems: paginatedComics,
    totalItems,
    goToPage,
    itemsPerPage,
    setItemsPerPage
  } = usePagination({
    items: filteredComics,
    itemsPerPage: ITEMS_PER_PAGE,
    initialPage: 1
  });

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      setLoading(true);
      const data = await comicsService.getAll();
      setComics(data);
      
      // Extract unique genres - split comma-separated genres and flatten
      const allGenres = data.flatMap((comic: Comic) => 
        comic.genre ? comic.genre.split(',').map(g => g.trim()) : []
      );
      const uniqueGenres = [...new Set(allGenres)].filter(genre => genre.length > 0);
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Error fetching comics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComics = useCallback(() => {
    let filtered = comics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(comic =>
        comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(comic => {
        if (!comic.genre) return false;
        const comicGenres = comic.genre.split(',').map(g => g.trim());
        return comicGenres.includes(selectedGenre);
      });
    }

    setFilteredComics(filtered);
    // Reset to first page when filters change
  }, [comics, searchTerm, selectedGenre]);

  useEffect(() => {
    filterComics();
  }, [filterComics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering happens automatically via useEffect
  };

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
  };

  const getRecentComics = () => {
    return comics
      .sort((a, b) => timestampToDate(b.createdAt).getTime() - timestampToDate(a.createdAt).getTime())
      .slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ComicHub
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover amazing comics and immerse yourself in incredible stories. 
              Read your favorites anytime, anywhere.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search comics, authors, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full bg-white text-gray-900"
                  />
                </div>
                <Button type="submit" size="md" variant="secondary">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{comics.length}</div>
                <div className="text-sm opacity-75">Comics Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{genres.length}</div>
                <div className="text-sm opacity-75">Genres</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-75">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Filters and Search Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Genre Filters */}
        {genres.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-700">Filter by Genre:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGenre === '' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre('')}
              >
                All
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleGenreFilter(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results or All Comics */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? (
                <>Search Results for &ldquo;{searchTerm}&rdquo; ({totalItems})</>
              ) : selectedGenre ? (
                <>{selectedGenre} Comics ({totalItems})</>
              ) : (
                <>All Comics ({totalItems})</>
              )}
            </h2>
            
            {totalItems > 0 && (
              <ItemsPerPageSelector
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </div>
          
          <ComicGrid comics={paginatedComics} loading={loading} />
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </div>
      </section>

      {/* Recent Comics */}
      {!loading && !searchTerm && !selectedGenre && comics.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="flex items-center mb-8">
            <Clock className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Recently Added</h2>
          </div>
          <ComicGrid comics={getRecentComics()} />
        </section>
      )}

      {/* Call to Action */}
      {!loading && comics.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Comics Available Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              It looks like there aren&apos;t any comics published yet. 
              Check back soon for amazing content!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Contact Support
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
