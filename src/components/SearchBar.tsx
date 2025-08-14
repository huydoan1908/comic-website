import React, { useCallback, useState } from "react";
import { debounce } from "lodash";
import { Input } from "./ui/Input";
import { Comic } from "@/types";
import { comicsService } from "@/services/firebase";
import Link from "next/link";
import Image from "next/image";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [isLoading, setLoading] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [results, setResults] = useState<Comic[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const debouncedFetchSearch = useCallback(
    debounce(async (query: string) => {
      setLoading(true);
      if (!query.trim() || query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const result = await comicsService.search(query, {
          limit: 5,
        });

        setResults(result.comics);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error fetching comics:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [setLoading, setResults, setHasMore]
  );

  const handleSearch = (value: string) => {
    setSearchString(value);
    debouncedFetchSearch(value);
  };

  const handleClose = () => {
    setSearchString("");
    setResults([]);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-20 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-screen" : "max-h-0"}`}>
      {/* Search overlay */}
      <div className="absolute inset-0 bg-black/30 shadow-md" onClick={handleClose}></div>
      {/* Search bar container */}
      <div className="relative z-20">
        {/* Search bar */}
        <div className="flex justify-center bg-white p-4 z-10">
          <div className="w-full max-w-4xl">
            <Input type="text" value={searchString} onChange={(e) => handleSearch(e.target.value)} placeholder="Search comics..." />
          </div>
        </div>

        {/* Search Results */}
        {searchString.length > 1 && (
          <div className="bg-white p-4 z-10">
            {results.length > 0 ? (
              <div className="max-w-4xl mx-auto">
                {results.map((comic) => (
                  <Link key={comic.id} href={`/comics/${comic.id}`} onClick={handleClose} prefetch>
                    <div className="flex gap-2 p-2 border-b border-gray-200 hover:bg-gray-100">
                      <Image src={comic.coverImageUrl} alt={comic.title} width={50} height={100} />
                      <div className="flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-900">{comic.title}</span>
                        <span className="text-xs font-medium text-gray-600">{comic.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {hasMore && (
                  <Link href={`/search?query=${searchString}`} onClick={handleClose} className="p-2 block text-sm font-medium text-gray-900 hover:bg-gray-100" prefetch>
                    See all results for {searchString}
                  </Link>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">{isLoading ? <div className="text-gray-500">Loading...</div> : <div className="text-gray-500">No results found</div>}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
