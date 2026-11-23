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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comic, Chapter, User } from '@/types';
import { paginate } from '@/lib/utils';
import { deleteCloudinaryImages } from '@/services/cloudinary-delete';
import { moveChapterImages } from '@/services/cloudinary-rename';
import { comicFolderName } from '@/lib/cloudinary-public-id';

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
    if (!id) {
      throw new Error('Comic ID is required');
    }

    const docRef = doc(db, 'comics', id);
    const chaptersRef = collection(db, 'comics', id, 'chapters');

    const [comicSnap, chaptersSnap] = await Promise.all([
      getDoc(docRef),
      getDocs(chaptersRef),
    ]);

    // Gather the cover, banner and every chapter's pages into a single call so
    // there is no state where the chapters are gone but the cover deletion then
    // fails. Cloudinary is cleared before Firestore: if it throws, the comic
    // survives and the retry can finish the job.
    const comicData = comicSnap.data();
    const imageUrls: (string | undefined)[] = [
      comicData?.coverImageUrl,
      comicData?.bannerImageUrl,
      ...chaptersSnap.docs.flatMap(chapterDoc => chapterDoc.data()?.pageImageUrls ?? []),
    ];

    await deleteCloudinaryImages(imageUrls);

    try {
      await Promise.all(chaptersSnap.docs.map(chapterDoc => deleteDoc(chapterDoc.ref)));
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
      const comicRef = doc(db, 'comics', comicId);
      await updateDoc(comicRef, {
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
      throw new Error('Failed to update chapter');
    }
  },

  async delete(comicId: string, chapterId: string): Promise<void> {
    if (!comicId) {
      throw new Error('Comic ID is required');
    }
    if (!chapterId) {
      throw new Error('Chapter ID is required');
    }

    const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);

    // Clear Cloudinary first: a failure there leaves the chapter intact and
    // retryable, rather than orphaning its pages.
    const snapshot = await getDoc(docRef);
    await deleteCloudinaryImages(snapshot.data()?.pageImageUrls ?? []);

    try {
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      throw new Error('Failed to delete chapter');
    }
  },

  async deleteAllByComicId(comicId: string): Promise<void> {
    if (!comicId) {
      throw new Error('Comic ID is required');
    }

    const chaptersRef = collection(db, 'comics', comicId, 'chapters');
    const snapshot = await getDocs(chaptersRef);

    // One Cloudinary call for every page across every chapter, before any
    // Firestore document is removed.
    await deleteCloudinaryImages(
      snapshot.docs.flatMap(chapterDoc => chapterDoc.data()?.pageImageUrls ?? [])
    );

    try {
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting all chapters:', error);
      throw new Error('Failed to delete all chapters');
    }
  },

  async renumberChapters(comicId: string): Promise<void> {
    const chaptersRef = collection(db, 'comics', comicId, 'chapters');
    const snapshot = await getDocs(query(chaptersRef, orderBy('chapterNumber', 'asc')));

    const changed = snapshot.docs
      .map((docSnap, idx) => ({ docSnap, newNumber: idx + 1 }))
      .filter(({ docSnap, newNumber }) => docSnap.data()?.chapterNumber !== newNumber);

    if (changed.length === 0) {
      return;
    }

    // A chapter's pages live in a folder named after its number, so move them
    // first: a failure there is rolled back and aborts the renumber, rather than
    // leaving the site and the media library disagreeing.
    const { urlMap, rollback } = await moveChapterImages(
      changed.map(({ docSnap, newNumber }) => ({
        urls: docSnap.data()?.pageImageUrls ?? [],
        chapterNumber: newNumber,
      }))
    );

    const batch = writeBatch(db);
    const now = Timestamp.now();

    changed.forEach(({ docSnap, newNumber }) => {
      const pageImageUrls: string[] = (docSnap.data()?.pageImageUrls ?? []).map(
        (url: string) => urlMap.get(url) ?? url
      );

      batch.update(docSnap.ref, { chapterNumber: newNumber, pageImageUrls, updatedAt: now });
    });

    batch.update(doc(db, 'comics', comicId), { updatedAt: now });

    try {
      await batch.commit();
    } catch (error) {
      // The stored URLs still point at the old public IDs, so put the assets back.
      await rollback();
      throw error;
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

      const sourceChapterRef = doc(db, 'comics', sourceComicId, 'chapters', chapterId);

      // Determine the new chapter number if not provided. This read was never part
      // of the transaction's guarantees, and the Cloudinary folder below is named
      // after the result, so it has to be resolved up front.
      let resolvedChapterNumber = newChapterNumber;
      if (!resolvedChapterNumber) {
        // Get the highest chapter number in target comic and add 1
        const targetChaptersRef = collection(db, 'comics', targetComicId, 'chapters');
        const targetChaptersQuery = query(targetChaptersRef, orderBy('chapterNumber', 'desc'));
        const targetChaptersSnap = await getDocs(targetChaptersQuery);

        resolvedChapterNumber = 1;
        if (!targetChaptersSnap.empty) {
          const highestChapter = targetChaptersSnap.docs[0].data();
          resolvedChapterNumber = Number(highestChapter.chapterNumber) + 1;
        }
      }
      const finalChapterNumber = resolvedChapterNumber;

      const sourceChapterSnap = await getDoc(sourceChapterRef);
      if (!sourceChapterSnap.exists()) {
        throw new Error('Chapter not found');
      }

      // The pages follow the chapter: both the comic folder and the chapter number
      // in their public IDs change. A failure here aborts before Firestore moves.
      const { urlMap, rollback } = await moveChapterImages([
        {
          urls: sourceChapterSnap.data()?.pageImageUrls ?? [],
          chapterNumber: finalChapterNumber,
          comicFolder: comicFolderName(targetComic.title),
        },
      ]);

      try {
        // Use transaction to ensure atomicity
        await runTransaction(db, async (transaction) => {
          // Get the chapter data from source comic
          const currentChapterSnap = await transaction.get(sourceChapterRef);

          if (!currentChapterSnap.exists()) {
            throw new Error('Chapter not found');
          }

          const chapterData = currentChapterSnap.data();

          // Create the chapter in target comic
          const targetChapterRef = doc(collection(db, 'comics', targetComicId, 'chapters'));
          const now = Timestamp.now();

          transaction.set(targetChapterRef, {
            ...chapterData,
            comicId: targetComicId,
            chapterNumber: finalChapterNumber,
            pageImageUrls: (chapterData.pageImageUrls ?? []).map(
              (url: string) => urlMap.get(url) ?? url
            ),
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
        await rollback();
        throw error;
      }
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
