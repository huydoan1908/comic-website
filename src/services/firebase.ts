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
  where,
  setDoc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comic, Chapter, User } from '@/types';

// Comics CRUD operations
export const comicsService = {
  // Get all comics with latest chapter info
  async getAll(): Promise<Comic[]> {
    const comicsRef = collection(db, 'comics');
    const q = query(comicsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comic[];

    // Fetch latest chapter for each comic
    const comicsWithLatestChapter = await Promise.all(
      comics.map(async (comic) => {
        const latestChapter = await this.getLatestChapter(comic.id);
        return {
          ...comic,
          latestChapter,
        };
      })
    );
    
    return comicsWithLatestChapter;
  },

  // Get latest chapter for a comic
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

  // Get comic by ID with latest chapter info
  async getById(id: string): Promise<Comic | null> {
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
  },

  // Search comics by title, author, or genre with latest chapter info
  async search(searchTerm: string): Promise<Comic[]> {
    const comicsRef = collection(db, 'comics');
    const snapshot = await getDocs(comicsRef);
    
    const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comic[];

    // Client-side filtering (for better search experience, consider implementing server-side search)
    const filteredComics = comics.filter(comic =>
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch latest chapter for each filtered comic
    const comicsWithLatestChapter = await Promise.all(
      filteredComics.map(async (comic) => {
        const latestChapter = await this.getLatestChapter(comic.id);
        return {
          ...comic,
          latestChapter,
        };
      })
    );
    
    return comicsWithLatestChapter;
  },

  // Filter comics by genre with latest chapter info
  async getByGenre(genre: string): Promise<Comic[]> {
    const comicsRef = collection(db, 'comics');
    const q = query(comicsRef, where('genre', '==', genre), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const comics = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comic[];

    // Fetch latest chapter for each comic
    const comicsWithLatestChapter = await Promise.all(
      comics.map(async (comic) => {
        const latestChapter = await this.getLatestChapter(comic.id);
        return {
          ...comic,
          latestChapter,
        };
      })
    );
    
    return comicsWithLatestChapter;
  },

  // Create new comic
  async create(comicData: Omit<Comic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const comicsRef = collection(db, 'comics');
    const now = Timestamp.now();
    
    const docRef = await addDoc(comicsRef, {
      ...comicData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  },

  // Update comic
  async update(id: string, updates: Partial<Omit<Comic, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'comics', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete comic (and all its chapters)
  async delete(id: string): Promise<void> {
    // First delete all chapters
    await chaptersService.deleteAllByComicId(id);
    
    // Then delete the comic
    const docRef = doc(db, 'comics', id);
    await deleteDoc(docRef);
  },
};

// Chapters CRUD operations
export const chaptersService = {
  // Get all chapters for a comic
  async getByComicId(comicId: string): Promise<Chapter[]> {
    const chaptersRef = collection(db, 'comics', comicId, 'chapters');
    const q = query(chaptersRef, orderBy('chapterNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chapter[];
  },

  // Get chapter by ID
  async getById(comicId: string, chapterId: string): Promise<Chapter | null> {
    const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Chapter;
    }
    return null;
  },

  // Create new chapter
  async create(comicId: string, chapterData: Omit<Chapter, 'id' | 'comicId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const chaptersRef = collection(db, 'comics', comicId, 'chapters');
    const now = Timestamp.now();
    
    const docRef = await addDoc(chaptersRef, {
      ...chapterData,
      comicId,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  },

  // Update chapter
  async update(comicId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id' | 'comicId' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete chapter
  async delete(comicId: string, chapterId: string): Promise<void> {
    const docRef = doc(db, 'comics', comicId, 'chapters', chapterId);
    await deleteDoc(docRef);
  },

  // Delete all chapters for a comic
  async deleteAllByComicId(comicId: string): Promise<void> {
    const chaptersRef = collection(db, 'comics', comicId, 'chapters');
    const snapshot = await getDocs(chaptersRef);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },
};

// Users service
export const usersService = {
  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  // Create or update user
  async createOrUpdate(userData: User): Promise<void> {
    const docRef = doc(db, 'users', userData.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...userDataWithoutId } = userData;
    
    try {
      await updateDoc(docRef, userDataWithoutId);
    } catch {
      // Document doesn't exist, create it using setDoc
      await setDoc(docRef, userDataWithoutId);
    }
  },

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getById(userId);
    return user?.role === 'admin';
  },
};
