"use client";

import { useState, useEffect } from "react";
import { Comic } from "@/types";
import { ComicGrid } from "@/components/ComicGrid";
import { ComicCarousel } from "@/components/ComicCarousel";
import { Button } from "@/components/ui/Button";
import { comicsService } from "@/services/firebase";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Fixed items per page
const ITEMS_PER_PAGE = 12;

export default function HomePage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [carouselComics, setCarouselComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);
        const result = await comicsService.getAll({
          limit: ITEMS_PER_PAGE,
        });

        setComics(result.comics);
        setCarouselComics(result.comics.slice(0, 6));
      } catch (error) {
        console.error("Error fetching comics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComics();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Carousel Hero Section */}
      <ComicCarousel comics={carouselComics} />

      {/* Comics list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Recently Updated</h2>
            <Link href="/latest" className="text-muted-foreground hover:text-primary flex items-center">
              See More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {/* {genres.length > 0 && (
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
          )} */}

          <ComicGrid comics={comics} loading={loading} />
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
