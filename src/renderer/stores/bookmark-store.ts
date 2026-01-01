import { create } from 'zustand';

export interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
}

export interface BookmarkActions {
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'order' | 'createdAt'>) => string;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  reorderBookmarks: (fromIndex: number, toIndex: number) => void;
  getBookmarkByPath: (path: string) => Bookmark | undefined;
  isBookmarked: (path: string) => boolean;
}

export type BookmarkStore = BookmarkState & BookmarkActions;

const STORAGE_KEY = 'wincv-bookmarks';

export const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#ef4444', // red
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
] as const;

interface StoredBookmarkData {
  bookmarks: Bookmark[];
}

function isValidBookmark(bookmark: unknown): bookmark is Bookmark {
  if (typeof bookmark !== 'object' || bookmark === null) return false;
  const b = bookmark as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    typeof b.name === 'string' &&
    typeof b.path === 'string' &&
    typeof b.icon === 'string' &&
    typeof b.color === 'string' &&
    typeof b.order === 'number' &&
    typeof b.createdAt === 'number'
  );
}

function loadBookmarksFromStorage(): BookmarkState {
  if (typeof localStorage === 'undefined') {
    return { bookmarks: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { bookmarks: [] };
    }

    const parsed = JSON.parse(stored) as Partial<StoredBookmarkData>;

    const bookmarks: Bookmark[] = [];
    if (Array.isArray(parsed.bookmarks)) {
      for (const bookmark of parsed.bookmarks) {
        if (isValidBookmark(bookmark)) {
          bookmarks.push(bookmark);
        }
      }
    }

    bookmarks.sort((a, b) => a.order - b.order);

    return { bookmarks };
  } catch {
    return { bookmarks: [] };
  }
}

function saveBookmarksToStorage(state: BookmarkState): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const data: StoredBookmarkData = {
    bookmarks: state.bookmarks,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearBookmarksFromStorage(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function generateBookmarkId(): string {
  return crypto.randomUUID();
}

function getNextOrder(bookmarks: Bookmark[]): number {
  if (bookmarks.length === 0) {
    return 0;
  }
  return Math.max(...bookmarks.map((b) => b.order)) + 1;
}

function getDefaultColor(index: number): string {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

const defaultState: BookmarkState = {
  bookmarks: [],
};

const initialState: BookmarkState = loadBookmarksFromStorage();

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  ...initialState,

  addBookmark: (bookmarkData: Omit<Bookmark, 'id' | 'order' | 'createdAt'>): string => {
    const { bookmarks } = get();

    const existingBookmark = bookmarks.find((b) => b.path === bookmarkData.path);
    if (existingBookmark) {
      return existingBookmark.id;
    }

    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: generateBookmarkId(),
      order: getNextOrder(bookmarks),
      createdAt: Date.now(),
      color: bookmarkData.color || getDefaultColor(bookmarks.length),
    };

    set((state) => ({
      bookmarks: [...state.bookmarks, newBookmark],
    }));

    return newBookmark.id;
  },

  removeBookmark: (id: string): void => {
    const { bookmarks } = get();
    const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);

    if (bookmarkIndex === -1) {
      return;
    }

    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));
  },

  updateBookmark: (id: string, updates: Partial<Bookmark>): void => {
    const { bookmarks } = get();
    const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);

    if (bookmarkIndex === -1) {
      return;
    }

    set((state) => ({
      bookmarks: state.bookmarks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  reorderBookmarks: (fromIndex: number, toIndex: number): void => {
    const { bookmarks } = get();

    if (
      fromIndex < 0 ||
      fromIndex >= bookmarks.length ||
      toIndex < 0 ||
      toIndex >= bookmarks.length
    ) {
      return;
    }

    if (fromIndex === toIndex) {
      return;
    }

    const newBookmarks = [...bookmarks];
    const [movedBookmark] = newBookmarks.splice(fromIndex, 1);
    newBookmarks.splice(toIndex, 0, movedBookmark);

    const reorderedBookmarks = newBookmarks.map((b, index) => ({
      ...b,
      order: index,
    }));

    set({ bookmarks: reorderedBookmarks });
  },

  getBookmarkByPath: (path: string): Bookmark | undefined => {
    const { bookmarks } = get();
    return bookmarks.find((b) => b.path === path);
  },

  isBookmarked: (path: string): boolean => {
    const { bookmarks } = get();
    return bookmarks.some((b) => b.path === path);
  },
}));

useBookmarkStore.subscribe((state) => {
  saveBookmarksToStorage(state);
});

export const resetBookmarkStore = (): void => {
  clearBookmarksFromStorage();
  useBookmarkStore.setState(defaultState);
};

export { defaultState };
