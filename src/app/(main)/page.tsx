"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Comic } from "@/types";
import { ComicGrid } from "@/components/ComicGrid";
import { ComicCarousel } from "@/components/ComicCarousel";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { comicsService } from "@/services/firebase";
import { Filter } from "lucide-react";

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [carouselComics, setCarouselComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const comicGridRef = useRef<HTMLDivElement>(null);

  // Fixed items per page
  const ITEMS_PER_PAGE = 12;

  const fetchComics = useCallback(async () => {
    try {
      setLoading(true);

      let result;
      if (selectedGenre) {
        // Use getByGenre when a specific genre is selected
        result = await comicsService.getByGenre(selectedGenre, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
      } else {
        // Use getAll when no genre filter is applied
        result = await comicsService.getAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
      }

      setComics(result.comics);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalCount);
    } catch (error) {
      console.error("Error fetching comics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedGenre]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  const fetchGenres = useCallback(async () => {
    try {
      const genreList = await comicsService.getAllGenres();
      setGenres(genreList);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    const fetchCarouselComics = async () => {
      try {
        const latestComics = await comicsService.getAll({ limit: 6 });
        setCarouselComics(latestComics.comics);
      } catch (error) {
        console.error("Error fetching carousel comics:", error);
      }
    };

    fetchCarouselComics();
  }, []);

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? "" : genre);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    comicGridRef.current?.scrollIntoView({ behavior: "smooth" });
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Carousel Hero Section */}
      <ComicCarousel comics={carouselComics} />

      {/* Comics list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={comicGridRef}>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {selectedGenre ? (
                <>
                  {selectedGenre} Comics <span className="text-muted-foreground text-lg font-normal">({totalItems})</span>
                </>
              ) : (
                <>Latest Updates <span className="text-muted-foreground text-lg font-normal">({totalItems})</span></>
              )}
            </h2>
          </div>

          {genres.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Filter by Genre:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedGenre === "" ? "primary" : "outline"} size="sm" onClick={() => setSelectedGenre("")}>
                  All
                </Button>
                {genres.map((genre) => (
                  <Button key={genre} variant={selectedGenre === genre ? "primary" : "outline"} size="sm" onClick={() => handleGenreFilter(genre)}>
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <ComicGrid comics={comics} loading={loading} />

          {!loading && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={totalItems} />}
        </div>
      </section>

      {/* Call to Action */}
      {!loading && comics.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-card border border-border rounded-xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">No Comics Available Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">It looks like there aren&apos;t any comics published yet. Check back soon for amazing content!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">Contact Support</Button>
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
