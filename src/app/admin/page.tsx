'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Comic } from '@/types';
import { timestampToDate, formatTimestamp } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  Users,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalComics: 0,
    totalChapters: 0,
    recentComics: 0,
  });

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      const response = await fetch('/api/comics');
      if (response.ok) {
        const data = await response.json();
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
      }
    } catch (error) {
      console.error('Error fetching comics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComic = async (comicId: string) => {
    if (confirm('Are you sure you want to delete this comic? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/comics/${comicId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setComics(comics.filter(comic => comic.id !== comicId));
        }
      } catch (error) {
        console.error('Error deleting comic:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your comics and chapters</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/comics/new">
              <Button>
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
              <BookOpen className="h-8 w-8 text-blue-600" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comics List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Comics</h2>
            <div className="text-sm text-gray-600">
              Click &ldquo;Manage&rdquo; to add and edit chapters
            </div>
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
          ) : comics.length === 0 ? (
            <div className="text-center py-8">
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                      Comic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="relative px-6 py-3 w-48">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comics.map((comic) => (
                    <tr key={comic.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-12 relative">
                            <Image
                              className="h-16 w-12 object-cover rounded"
                              src={comic.coverImageUrl}
                              alt={comic.title}
                              fill
                              sizes="48px"
                            />
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {comic.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {comic.description}
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                              {comic.author} • {comic.genre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {comic.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {comic.genre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {formatTimestamp(comic.createdAt)}
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
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteComic(comic.id)}
                            title="Delete Comic"
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
