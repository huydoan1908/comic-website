"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Comic } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { comicsService } from "@/services/firebase";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

export default function AdminDashboard() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { isAdmin } = useAuth();

  // Debounce search term by 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fixed items per page
  const ITEMS_PER_PAGE = 10;

  const fetchComics = useCallback(async () => {
    try {
      setLoading(true);

      let result;
      if (debouncedSearchTerm.trim()) {
        result = await comicsService.search(debouncedSearchTerm.trim(), {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
      } else {
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
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteComic = async (comicId: string) => {
    if (!isAdmin) {
      alert("You must be an admin to delete comics");
      return;
    }

    if (confirm("Are you sure you want to delete this comic? This action cannot be undone.")) {
      try {
        await comicsService.delete(comicId);
        fetchComics();
      } catch (error) {
        console.error("Error deleting comic:", error);
        alert("Failed to delete comic");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start md:flex-row flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your comics and chapters</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/comics/new">
              <Button className="text-xs">
                <Plus className="w-4 h-4 mr-2" />
                New Comic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input type="text" placeholder="Search comics by title, author, genre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {debouncedSearchTerm && (
              <div className="mt-4 text-sm text-muted-foreground">
                Found {totalItems} comics matching &quot;{debouncedSearchTerm}&quot;
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="ml-2 text-xs">
                  Clear search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comics List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center md:flex-row flex-col">
            <h2 className="text-xl font-semibold text-primary-foreground">Comics</h2>
            <div className="text-sm text-muted-foreground">Click &ldquo;Manage&rdquo; to add and edit chapters</div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-16 h-20 bg-background rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-background rounded w-1/3"></div>
                    <div className="h-3 bg-background rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comics.length === 0 ? (
            <div className="text-center py-8">
              {debouncedSearchTerm ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-primary-foreground">No comics found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">No comics match your search for &quot;{debouncedSearchTerm}&quot;</p>
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-primary-foreground">No comics</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new comic.</p>
                  <div className="mt-6">
                    <Link href="/admin/comics/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Comic
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-background divide-y divide-border">
                    {comics.map((comic: Comic) => (
                      <tr key={comic.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-12 relative">
                              <Image className="h-16 w-12 object-cover rounded" src={comic.coverImageUrl} alt={comic.title} fill sizes="48px" />
                            </div>
                            <div className="ml-4 min-w-0 flex-1 max-w-xs">
                              <div className="text-sm font-medium text-primary-foreground truncate">{comic.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {comic.author} • {comic.genre}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <Link href={`/comics/${comic.id}`}>
                              <Button variant="outline" size="sm" title="View Comic">
                                <Eye className="w-4 h-4" />
                                <span className="hidden md:inline ml-1">View</span>
                              </Button>
                            </Link>
                            <Link href={`/admin/comics/${comic.id}`}>
                              <Button variant="outline" size="sm" title="Manage Chapters">
                                <Edit className="w-4 h-4" />
                                <span className="hidden md:inline ml-1">Manage</span>
                              </Button>
                            </Link>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteComic(comic.id)} title="Delete Comic">
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden md:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={totalItems} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
