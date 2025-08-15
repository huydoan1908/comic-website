'use client'

import { useState, useEffect, useCallback, Suspense } from "react";
import { Comic } from "@/types";
import { ComicGrid } from "@/components/ComicGrid";
import { Pagination } from "@/components/ui/Pagination";
import { comicsService } from "@/services/firebase";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fixed items per page
  const ITEMS_PER_PAGE = 10;

  const fetchComics = useCallback(async () => {
    try {
      setLoading(true);
      
      let result;
      if (query.trim()) {
        // Use search function when there's a search query
        result = await comicsService.search(query.trim(), {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
      } else {
        // Use getAll when no search query (fallback)
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
  }, [currentPage, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results or All Comics */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Result for &quot;{query}&quot;</h2>
          </div>

          <ComicGrid comics={comics} loading={loading} />

          {/* Pagination */}
          {!loading && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={totalItems} />}
        </div>
      </section>

      {/* Call to Action */}
      {!loading && comics.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Comics Available Yet</h2>
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
