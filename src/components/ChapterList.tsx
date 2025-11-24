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
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No chapters yet</h4>
          <p className="text-muted-foreground mb-6">Start building your comic by adding the first chapter.</p>
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
    <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {chapters.map((chapter) => (
        <div key={chapter.id} className={showActions ? "hover:shadow-md transition-shadow" : ""}>
          {showActions ? (
            <Card className="hover:shadow-md transition-shadow bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {chapter.pageImageUrls.length > 0 ? (
                        <div className="w-16 h-20 rounded overflow-hidden bg-muted">
                          <Image
                            src={chapter.pageImageUrls[0]}
                            alt={`Chapter ${chapter.chapterNumber} preview`}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        Chapter {chapter.chapterNumber}
                        {chapter.title && `: ${chapter.title}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {chapter.pageImageUrls.length} pages
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 border-blue-500/20"
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
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
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
              className="block group"
            >
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200">
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Chapter {chapter.chapterNumber}
                    {chapter.title && `: ${chapter.title}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {chapter.pageImageUrls.length} pages
                  </p>
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
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
