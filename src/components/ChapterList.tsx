import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Eye, BookOpen, Plus, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Chapter } from '@/types';

interface ChapterListProps {
  comicId: string;
  chapters: Chapter[];
  onDelete?: (chapterId: string) => void;
  onMove?: (chapterId: string) => void;
  deleting?: string | null;
  moving?: string | null;
  showActions?: boolean;
}

export function ChapterList({ 
  comicId, 
  chapters, 
  onDelete, 
  onMove,
  deleting, 
  moving,
  showActions = true 
}: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h4>
          <p className="text-gray-600 mb-6">Start building your comic by adding the first chapter.</p>
          {showActions && (
            <Link href={`/admin/comics/${comicId}/chapters/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Chapter
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
      {chapters.map((chapter) => (
        <div key={chapter.id} className={showActions ? "hover:shadow-md transition-shadow" : ""}>
          {showActions ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {chapter.pageImageUrls.length > 0 ? (
                        <div className="w-16 h-20 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={chapter.pageImageUrls[0]}
                            alt={`Chapter ${chapter.chapterNumber} preview`}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Chapter {chapter.chapterNumber}
                        {chapter.title && `: ${chapter.title}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {chapter.pageImageUrls.length} pages
                      </p>
                      <p className="text-xs text-gray-500">
                        {chapter.createdAt && typeof chapter.createdAt === 'object' && 'seconds' in chapter.createdAt
                          ? new Date(chapter.createdAt.seconds * 1000).toLocaleDateString()
                          : new Date(chapter.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/read/${comicId}/${chapter.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:block ml-2">Read</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/comics/${comicId}/chapters/${chapter.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                        <span className="hidden md:block ml-2">Edit</span>
                      </Button>
                    </Link>
                    {onMove && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMove(chapter.id)}
                        disabled={moving === chapter.id}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span className="hidden md:block ml-2">{moving === chapter.id ? 'Moving...' : 'Move'}</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(chapter.id)}
                        disabled={deleting === chapter.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden md:block ml-2">{deleting === chapter.id ? 'Deleting...' : 'Delete'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Link
              href={`/read/${comicId}/${chapter.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Chapter {chapter.chapterNumber}
                    {chapter.title && `: ${chapter.title}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {chapter.pageImageUrls.length} pages
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {chapter.createdAt && typeof chapter.createdAt === 'object' && 'seconds' in chapter.createdAt
                    ? new Date(chapter.createdAt.seconds * 1000).toLocaleDateString()
                    : new Date(chapter.createdAt).toLocaleDateString()
                  }
                </div>
              </div>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
