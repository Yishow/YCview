import { useBookmarkStore, type Bookmark, DEFAULT_COLORS } from '../stores/bookmark-store';

export function useBookmarks() {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const addBookmarkToStore = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark);
  const reorderBookmarks = useBookmarkStore((state) => state.reorderBookmarks);
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked);

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_COLORS.length);
    return DEFAULT_COLORS[randomIndex];
  };

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'order' | 'createdAt'>) => {
    return addBookmarkToStore(bookmark);
  };

  const addCurrentPath = (path: string, name?: string) => {
    return addBookmark({
      name: name || path.split('/').pop() || 'Bookmark',
      path,
      icon: '📁',
      color: getRandomColor(),
    });
  };

  const handleDrop = (e: DragEvent, fromPath: string) => {
    e.preventDefault();
    if (fromPath && !isBookmarked(fromPath)) {
      addCurrentPath(fromPath);
    }
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    reorderBookmarks,
    isBookmarked,
    addCurrentPath,
    handleDrop,
  };
}
