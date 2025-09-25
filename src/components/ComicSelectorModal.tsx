import { useState, useEffect } from 'react';
import { Comic } from '@/types';
import { comicsService } from '@/services/firebase';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { Search, BookOpen } from 'lucide-react';
import Image from 'next/image';

interface ComicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (comic: Comic) => void;
  currentComicId: string;
  title?: string;
}

export function ComicSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentComicId,
  title = "Select Target Comic"
}: ComicSelectorModalProps) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchComics();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter comics based on search term and exclude current comic
    const filtered = comics.filter(comic => 
      comic.id !== currentComicId &&
      (comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       comic.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredComics(filtered);
  }, [comics, searchTerm, currentComicId]);

  const fetchComics = async () => {
    try {
      setLoading(true);
      const result = await comicsService.getAll({ limit: 100 }); // Get a large number for selection
      setComics(result.comics);
    } catch (error) {
      console.error('Error fetching comics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (comic: Comic) => {
    onSelect(comic);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="lg">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search comics by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Comics List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading comics...</p>
            </div>
          ) : filteredComics.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No comics found matching your search.' : 'No other comics available.'}
              </p>
            </div>
          ) : (
            filteredComics.map((comic) => (
              <Card key={comic.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <div onClick={() => handleSelect(comic)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={comic.coverImageUrl}
                          alt={comic.title}
                          width={48}
                          height={64}
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{comic.title}</h4>
                        <p className="text-sm text-gray-600 truncate">by {comic.author}</p>
                        <p className="text-xs text-gray-500">{comic.genre}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
