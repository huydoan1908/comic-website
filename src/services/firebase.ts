import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comic, Chapter, User } from '@/types';
import { paginate } from '@/lib/utils';

export const comicsService = {
  // Helper method to enrich comics with latest chapter
  async enrichComicsWithLatestChapter(comics: Comic[]): Promise<Comic[]> {
    const latestChapterPromises = comics.map(comic => 
      this.getLatestChapter(comic.id).catch(error => {
        console.error(`Error fetching latest chapter for comic ${comic.id}:`, error);
        return undefined;
      })
    );
    
    const latestChapters = await Promise.all(latestChapterPromises);
    
    return comics.map((comic, index) => ({
      ...comic,
      latestChapter: latestChapters[index]
    }));
  },
  async getAll(options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    comics: Comic[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit: pageLimit = 10 } = options;
      
      const comicsRef = collection(db, 'comics');
      const baseQuery = query(comicsRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(baseQuery);
      
      const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comic[];
      
      // Apply pagination
      const { items: paginatedComics, totalCount, hasMore, totalPages } = paginate(comics, page, pageLimit);
      const comicsWithLatestChapter = await this.enrichComicsWithLatestChapter(paginatedComics);
      
      return {
        comics: comicsWithLatestChapter,
        totalCount,
        hasMore,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching comics:', error);
      throw new Error('Failed to fetch comics');
    }
  },

  async getAllGenres(): Promise<string[]> {
    try {
      const comicsRef = collection(db, 'comics');
      const snapshot = await getDocs(comicsRef);
      
      const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comic[];

      const allGenres = comics.flatMap((comic: Comic) => 
        comic.genre ? comic.genre.split(',').map(g => g.trim()) : []
      );
      const uniqueGenres = [...new Set(allGenres)].filter(genre => genre.length > 0);
      
      return uniqueGenres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw new Error('Failed to fetch genres');
    }
  },

  async getLatestChapter(comicId: string): Promise<Comic['latestChapter']> {
    try {
      const chaptersRef = collection(db, 'comics', comicId, 'chapters');
      const q = query(chaptersRef, orderBy('chapterNumber', 'desc'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const latestDoc = snapshot.docs[0];
        const chapterData = latestDoc.data();
        return {
          id: latestDoc.id,
          number: chapterData.chapterNumber,
          title: chapterData.title,
          createdAt: chapterData.createdAt,
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching latest chapter:', error);
      return undefined;
    }
  },

  async getById(id: string): Promise<Comic | null> {
    try {
      if (!id) {
        throw new Error('Comic ID is required');
      }

      const docRef = doc(db, 'comics', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const comic = { id: docSnap.id, ...docSnap.data() } as Comic;
        const latestChapter = await this.getLatestChapter(id);
        return {
          ...comic,
          latestChapter,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching comic:', error);
      throw new Error('Failed to fetch comic');
    }
  },

  // Search comics by title, author, or genre with latest chapter info and pagination
  async search(searchTerm: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    comics: Comic[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      // Early return for empty search terms
      if (!searchTerm.trim()) {
        return this.getAll(options);
      }

      const { page = 1, limit: pageLimit = 10 } = options;
      
      const comicsRef = collection(db, 'comics');
      const snapshot = await getDocs(comicsRef);
      
      const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comic[];

      const filteredComics = comics.filter(comic =>
        comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comic.author.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply pagination
      const { items: paginatedComics, totalCount, hasMore, totalPages } = paginate(filteredComics, page, pageLimit);
      const comicsWithLatestChapter = await this.enrichComicsWithLatestChapter(paginatedComics);
      
      return {
        comics: comicsWithLatestChapter,
        totalCount,
        hasMore,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching comics:', error);
      throw new Error('Failed to search comics');
    }
  },

  async getByGenre(genre: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    comics: Comic[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      if (!genre.trim()) {
        throw new Error('Genre is required');
      }

      const { page = 1, limit: pageLimit = 10 } = options;
      
      const comicsRef = collection(db, 'comics');
      const snapshot = await getDocs(comicsRef);
      
      const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comic[];

      // Filter by genre - handling comma-separated genres like in getAll
      const filteredComics = comics.filter(comic => {
        if (!comic.genre) return false;
        const comicGenres = comic.genre.split(',').map(g => g.trim());
        return comicGenres.includes(genre);
      });

      // Apply pagination
      const { items: paginatedComics, totalCount, hasMore, totalPages } = paginate(filteredComics, page, pageLimit);
      const comicsWithLatestChapter = await this.enrichComicsWithLatestChapter(paginatedComics);
      
      return {
        comics: comicsWithLatestChapter,
        totalCount,
        hasMore,
        currentPage: page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching comics by genre:', error);
      throw new Error('Failed to fetch comics by genre');
    }
  },

  async create(comicData: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!comicData.title?.trim()) {
        throw new Error('Comic title is required');
      }
      if (!comicData.author?.trim()) {
        throw new Error('Comic author is required');
      }

      const comicsRef = collection(db, 'comics');
      const now = Timestamp.now();
      
      const docRef = await addDoc(comicsRef, {
        ...comicData,
        createdAt: now,
        updatedAt: now,
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating comic:', error);
      throw new Error('Failed to create comic');
    }
  },

  async update(id: string, updates: Partial<Omit<Comic, 'id' | 'createdAt'>>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Comic ID is required');
      }

      const docRef = doc(db, 'comics', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating comic:', error);
      throw new Error('Failed to update comic');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Comic ID is required');
      }

      // First delete all chapters
      await chaptersService.deleteAllByComicId(id);
      
      // Then delete the comic
      const docRef = doc(db, 'comics', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting comic:', error);
      throw new Error('Failed to delete comic');
    }
  },
};

export const chaptersService = {
  async getByComicId(comicId: string, options?: { orderBy?: 'asc' | 'desc' }): Promise<Chapter[]> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }

      const chaptersRef = collection(db, 'comics', comicId, 'chapters');
      const q = query(chaptersRef, orderBy('chapterNumber', options?.orderBy || 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chapter[];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw new Error('Failed to fetch chapters');
    }
  },

  async getById(comicId: string, chapterId: string): Promise<Chapter | null> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }
      if (!chapterId) {
        throw new Error('Chapter ID is required');
      }

      const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Chapter;
      }
      return null;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw new Error('Failed to fetch chapter');
    }
  },

  async create(comicId: string, chapterData: Omit<Chapter, 'id' | 'comicId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }
      if (!chapterData.chapterNumber) {
        throw new Error('Chapter number is required');
      }

      const chaptersRef = collection(db, 'comics', comicId, 'chapters');
      const comicRef = doc(db, 'comics', comicId);
      const now = Timestamp.now();

      // Use transaction to ensure atomicity
      return await runTransaction(db, async (transaction) => {
        const newChapterRef = doc(chaptersRef);
        
        transaction.set(newChapterRef, {
          ...chapterData,
          comicId,
          createdAt: now,
          updatedAt: now,
        });

        transaction.update(comicRef, {
          updatedAt: now,
        });

        return newChapterRef.id;
      });
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw new Error('Failed to create chapter');
    }
  },

  async update(comicId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id' | 'comicId' | 'createdAt'>>): Promise<void> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }
      if (!chapterId) {
        throw new Error('Chapter ID is required');
      }

      const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
      throw new Error('Failed to update chapter');
    }
  },

  async delete(comicId: string, chapterId: string): Promise<void> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }
      if (!chapterId) {
        throw new Error('Chapter ID is required');
      }

      const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      throw new Error('Failed to delete chapter');
    }
  },

  async deleteAllByComicId(comicId: string): Promise<void> {
    try {
      if (!comicId) {
        throw new Error('Comic ID is required');
      }

      const chaptersRef = collection(db, 'comics', comicId, 'chapters');
      const snapshot = await getDocs(chaptersRef);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting all chapters:', error);
      throw new Error('Failed to delete all chapters');
    }
  },

  async moveToComic(
    sourceComicId: string, 
    chapterId: string, 
    targetComicId: string, 
    newChapterNumber?: number
  ): Promise<void> {
    try {
      if (!sourceComicId) {
        throw new Error('Source comic ID is required');
      }
      if (!chapterId) {
        throw new Error('Chapter ID is required');
      }
      if (!targetComicId) {
        throw new Error('Target comic ID is required');
      }
      if (sourceComicId === targetComicId) {
        throw new Error('Source and target comics cannot be the same');
      }

      // Verify that both comics exist
      const [sourceComic, targetComic] = await Promise.all([
        comicsService.getById(sourceComicId),
        comicsService.getById(targetComicId)
      ]);

      if (!sourceComic) {
        throw new Error('Source comic not found');
      }
      if (!targetComic) {
        throw new Error('Target comic not found');
      }

      // Use transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        // Get the chapter data from source comic
        const sourceChapterRef = doc(db, 'comics', sourceComicId, 'chapters', chapterId);
        const sourceChapterSnap = await transaction.get(sourceChapterRef);
        
        if (!sourceChapterSnap.exists()) {
          throw new Error('Chapter not found');
        }
        
        const chapterData = sourceChapterSnap.data();
        
        // Determine the new chapter number if not provided
        let finalChapterNumber = newChapterNumber;
        if (!finalChapterNumber) {
          // Get the highest chapter number in target comic and add 1
          const targetChaptersRef = collection(db, 'comics', targetComicId, 'chapters');
          const targetChaptersQuery = query(targetChaptersRef, orderBy('chapterNumber', 'desc'));
          const targetChaptersSnap = await getDocs(targetChaptersQuery);
          
          finalChapterNumber = 1;
          if (!targetChaptersSnap.empty) {
            const highestChapter = targetChaptersSnap.docs[0].data();
            finalChapterNumber = highestChapter.chapterNumber + 1;
          }
        }
        
        // Create the chapter in target comic
        const targetChapterRef = doc(collection(db, 'comics', targetComicId, 'chapters'));
        const now = Timestamp.now();
        
        transaction.set(targetChapterRef, {
          ...chapterData,
          comicId: targetComicId,
          chapterNumber: finalChapterNumber,
          updatedAt: now,
        });
        
        // Delete the chapter from source comic
        transaction.delete(sourceChapterRef);
        
        // Update both comics' updatedAt timestamps
        const sourceComicRef = doc(db, 'comics', sourceComicId);
        const targetComicRef = doc(db, 'comics', targetComicId);
        
        transaction.update(sourceComicRef, { updatedAt: now });
        transaction.update(targetComicRef, { updatedAt: now });
      });
    } catch (error) {
      console.error('Error moving chapter:', error);
      throw new Error(`Failed to move chapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export const usersService = {
  async getById(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('User ID is required');
      }

      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },

  async createOrUpdate(userData: User): Promise<void> {
    try {
      if (!userData.id) {
        throw new Error('User ID is required');
      }

      const docRef = doc(db, 'users', userData.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...userDataWithoutId } = userData;
      
      try {
        await updateDoc(docRef, userDataWithoutId);
      } catch {
        // Document doesn't exist, create it using setDoc
        await setDoc(docRef, userDataWithoutId);
      }
    } catch (error) {
      console.error('Error creating or updating user:', error);
      throw new Error('Failed to create or update user');
    }
  },

  async isAdmin(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        return false;
      }
      
      const user = await this.getById(userId);
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
};
