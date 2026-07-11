'use client';

// Офлайн оқу үшін IndexedDB қоймасы.
// Кітап пен оның жарияланған тарауларын локалды сақтап, интернетсіз оқуға мүмкіндік береді.

const DB_NAME = 'magyna-offline';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const CHAPTERS_STORE = 'chapters';

export type OfflineBook = {
  id: string;
  title: string;
  cover_url: string | null;
  author_name: string | null;
  downloaded_at: string;
};

export type OfflineChapter = {
  id: string;
  book_id: string;
  title: string;
  content: string;
  order_index: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHAPTERS_STORE)) {
        const store = db.createObjectStore(CHAPTERS_STORE, { keyPath: 'id' });
        store.createIndex('book_id', 'book_id');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBookOffline(book: OfflineBook, chapters: OfflineChapter[]): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE, CHAPTERS_STORE], 'readwrite');
    tx.objectStore(BOOKS_STORE).put(book);
    const chapterStore = tx.objectStore(CHAPTERS_STORE);
    chapters.forEach((c) => chapterStore.put(c));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getOfflineBooks(): Promise<OfflineBook[]> {
  const db = await openDB();
  const result = await new Promise<OfflineBook[]>((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const req = tx.objectStore(BOOKS_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function isBookOffline(bookId: string): Promise<boolean> {
  const db = await openDB();
  const result = await new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction(BOOKS_STORE, 'readonly');
    const req = tx.objectStore(BOOKS_STORE).get(bookId);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function getOfflineChapters(bookId: string): Promise<OfflineChapter[]> {
  const db = await openDB();
  const result = await new Promise<OfflineChapter[]>((resolve, reject) => {
    const tx = db.transaction(CHAPTERS_STORE, 'readonly');
    const index = tx.objectStore(CHAPTERS_STORE).index('book_id');
    const req = index.getAll(bookId);
    req.onsuccess = () => resolve(req.result.sort((a, b) => a.order_index - b.order_index));
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deleteBookOffline(bookId: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE, CHAPTERS_STORE], 'readwrite');
    tx.objectStore(BOOKS_STORE).delete(bookId);
    const chapterStore = tx.objectStore(CHAPTERS_STORE);
    const index = chapterStore.index('book_id');
    const req = index.openCursor(IDBKeyRange.only(bookId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
