"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Comic } from "@/types";
import { timestampToDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ItemsPerPageSelector } from "@/components/ui/ItemsPerPageSelector";
import { comicsService } from "@/services/firebase";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { BookOpen, Plus, Edit, Trash2, BarChart3, Eye, Search } from "lucide-react";

export default function AdminDashboard() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalComics: 0,
    totalChapters: 0,
    recentComics: 0,
  });
  const { isAdmin } = useAuth();

  // Filter comics based on search term
  const filteredComics = useMemo(() => {
    if (!searchTerm.trim()) return comics;
    
    const term = searchTerm.toLowerCase().trim();
    return comics.filter((comic) => 
      comic.title.toLowerCase().includes(term) ||
      comic.author.toLowerCase().includes(term) ||
      comic.genre.toLowerCase().includes(term) ||
      comic.description?.toLowerCase().includes(term)
    );
  }, [comics, searchTerm]);

  // Pagination hook
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
    itemsPerPage: 10
  });

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      const data = await comicsService.getAll();
      setComics(data);
      setStats({
        totalComics: data.length,
        totalChapters: 0, // Will be calculated from chapters
        recentComics: data.filter((comic: Comic) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return timestampToDate(comic.createdAt) > weekAgo;
        }).length,
      });
    } catch (error) {
      console.error("Error fetching comics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComic = async (comicId: string) => {
    if (!isAdmin) {
      alert("You must be an admin to delete comics");
      return;
    }

    if (confirm("Are you sure you want to delete this comic? This action cannot be undone.")) {
      try {
        await comicsService.delete(comicId);
        setComics(comics.filter((comic) => comic.id !== comicId));
      } catch (error) {
        console.error("Error deleting comic:", error);
        alert("Failed to delete comic");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start md:flex-row flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your comics and chapters</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-gray-700" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comics</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Comics</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentComics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search comics by title, author, genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ItemsPerPageSelector
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                options={[5, 10, 15, 20, 25]}
              />
            </div>
            
            {searchTerm && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {totalItems} of {comics.length} comics
                {totalItems !== comics.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-xs"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comics List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center md:flex-row flex-col">
            <h2 className="text-xl font-semibold text-gray-900">Comics</h2>
            <div className="text-sm text-gray-600">Click &ldquo;Manage&rdquo; to add and edit chapters</div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-16 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredComics.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comics found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No comics match your search for &quot;{searchTerm}&quot;
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comics</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new comic.</p>
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
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedComics.map((comic) => (
                      <tr key={comic.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-12 relative">
                              <Image className="h-16 w-12 object-cover rounded" src={comic.coverImageUrl} alt={comic.title} fill sizes="48px" />
                            </div>
                            <div className="ml-4 min-w-0 flex-1 max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate">{comic.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
