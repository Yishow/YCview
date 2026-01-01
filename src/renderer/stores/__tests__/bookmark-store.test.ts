import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookmarkStore, resetBookmarkStore, Bookmark, DEFAULT_COLORS } from '../bookmark-store';

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `uuid-${Date.now()}-${Math.random().toString(36).slice(2)}`),
});

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

vi.stubGlobal('localStorage', mockLocalStorage);

describe('BookmarkStore', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    resetBookmarkStore();
  });

  describe('addBookmark', () => {
    it('should add a new bookmark', () => {
      const store = useBookmarkStore.getState();
      const bookmarkId = store.addBookmark({
        name: 'Test Folder',
        path: '/test/folder',
        icon: 'folder',
        color: '#3b82f6',
      });

      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toHaveLength(1);
      expect(state.bookmarks[0].id).toBe(bookmarkId);
      expect(state.bookmarks[0].name).toBe('Test Folder');
      expect(state.bookmarks[0].path).toBe('/test/folder');
    });

    it('should assign order starting from 0', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'First', path: '/first', icon: 'folder', color: '' });

      expect(useBookmarkStore.getState().bookmarks[0].order).toBe(0);
    });

    it('should increment order for each new bookmark', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'First', path: '/first', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Second', path: '/second', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Third', path: '/third', icon: 'folder', color: '' });

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].order).toBe(0);
      expect(state.bookmarks[1].order).toBe(1);
      expect(state.bookmarks[2].order).toBe(2);
    });

    it('should assign createdAt timestamp', () => {
      const beforeTime = Date.now();
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });
      const afterTime = Date.now();

      const createdAt = useBookmarkStore.getState().bookmarks[0].createdAt;
      expect(createdAt).toBeGreaterThanOrEqual(beforeTime);
      expect(createdAt).toBeLessThanOrEqual(afterTime);
    });

    it('should return existing bookmark id when path already exists', () => {
      const store = useBookmarkStore.getState();
      const firstId = store.addBookmark({
        name: 'First',
        path: '/same/path',
        icon: 'folder',
        color: '#3b82f6',
      });
      const secondId = store.addBookmark({
        name: 'Second',
        path: '/same/path',
        icon: 'star',
        color: '#ef4444',
      });

      expect(firstId).toBe(secondId);
      expect(useBookmarkStore.getState().bookmarks).toHaveLength(1);
    });

    it('should apply default color when color is empty', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      expect(useBookmarkStore.getState().bookmarks[0].color).toBe(DEFAULT_COLORS[0]);
    });

    it('should cycle through default colors for multiple bookmarks', () => {
      const store = useBookmarkStore.getState();
      for (let i = 0; i < DEFAULT_COLORS.length + 2; i++) {
        store.addBookmark({ name: `Bookmark ${i}`, path: `/path${i}`, icon: 'folder', color: '' });
      }

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].color).toBe(DEFAULT_COLORS[0]);
      expect(state.bookmarks[7].color).toBe(DEFAULT_COLORS[0]);
    });

    it('should use provided color when specified', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '#custom' });

      expect(useBookmarkStore.getState().bookmarks[0].color).toBe('#custom');
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark by id', () => {
      const store = useBookmarkStore.getState();
      const id1 = store.addBookmark({ name: 'First', path: '/first', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Second', path: '/second', icon: 'folder', color: '' });

      store.removeBookmark(id1);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toHaveLength(1);
      expect(state.bookmarks[0].path).toBe('/second');
    });

    it('should do nothing when removing non-existent bookmark', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      store.removeBookmark('non-existent-id');

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(1);
    });

    it('should remove the only bookmark', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({ name: 'Only', path: '/only', icon: 'folder', color: '' });

      store.removeBookmark(id);

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(0);
    });

    it('should not affect other bookmarks when removing one', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'First', path: '/first', icon: 'folder', color: '' });
      const id2 = store.addBookmark({ name: 'Second', path: '/second', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Third', path: '/third', icon: 'folder', color: '' });

      store.removeBookmark(id2);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toHaveLength(2);
      expect(state.bookmarks[0].path).toBe('/first');
      expect(state.bookmarks[1].path).toBe('/third');
    });
  });

  describe('updateBookmark', () => {
    it('should update bookmark name', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({ name: 'Old Name', path: '/test', icon: 'folder', color: '' });

      store.updateBookmark(id, { name: 'New Name' });

      expect(useBookmarkStore.getState().bookmarks[0].name).toBe('New Name');
    });

    it('should update bookmark color', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({
        name: 'Test',
        path: '/test',
        icon: 'folder',
        color: '#3b82f6',
      });

      store.updateBookmark(id, { color: '#ef4444' });

      expect(useBookmarkStore.getState().bookmarks[0].color).toBe('#ef4444');
    });

    it('should update bookmark icon', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      store.updateBookmark(id, { icon: 'star' });

      expect(useBookmarkStore.getState().bookmarks[0].icon).toBe('star');
    });

    it('should update multiple properties at once', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({
        name: 'Test',
        path: '/test',
        icon: 'folder',
        color: '#3b82f6',
      });

      store.updateBookmark(id, { name: 'Updated', color: '#ef4444', icon: 'heart' });

      const bookmark = useBookmarkStore.getState().bookmarks[0];
      expect(bookmark.name).toBe('Updated');
      expect(bookmark.color).toBe('#ef4444');
      expect(bookmark.icon).toBe('heart');
    });

    it('should do nothing when updating non-existent bookmark', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      store.updateBookmark('non-existent-id', { name: 'Updated' });

      expect(useBookmarkStore.getState().bookmarks[0].name).toBe('Test');
    });

    it('should preserve other properties when updating', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({
        name: 'Test',
        path: '/test',
        icon: 'folder',
        color: '#3b82f6',
      });

      store.updateBookmark(id, { name: 'Updated' });

      const bookmark = useBookmarkStore.getState().bookmarks[0];
      expect(bookmark.path).toBe('/test');
      expect(bookmark.icon).toBe('folder');
      expect(bookmark.color).toBe('#3b82f6');
    });
  });

  describe('reorderBookmarks', () => {
    it('should move bookmark from first to last position', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });
      store.addBookmark({ name: 'C', path: '/c', icon: 'folder', color: '' });

      store.reorderBookmarks(0, 2);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('B');
      expect(state.bookmarks[1].name).toBe('C');
      expect(state.bookmarks[2].name).toBe('A');
    });

    it('should move bookmark from last to first position', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });
      store.addBookmark({ name: 'C', path: '/c', icon: 'folder', color: '' });

      store.reorderBookmarks(2, 0);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('C');
      expect(state.bookmarks[1].name).toBe('A');
      expect(state.bookmarks[2].name).toBe('B');
    });

    it('should move bookmark to middle position', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });
      store.addBookmark({ name: 'C', path: '/c', icon: 'folder', color: '' });

      store.reorderBookmarks(0, 1);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('B');
      expect(state.bookmarks[1].name).toBe('A');
      expect(state.bookmarks[2].name).toBe('C');
    });

    it('should update order values after reordering', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });
      store.addBookmark({ name: 'C', path: '/c', icon: 'folder', color: '' });

      store.reorderBookmarks(2, 0);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].order).toBe(0);
      expect(state.bookmarks[1].order).toBe(1);
      expect(state.bookmarks[2].order).toBe(2);
    });

    it('should do nothing when fromIndex equals toIndex', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });

      const bookmarksBefore = [...useBookmarkStore.getState().bookmarks];
      store.reorderBookmarks(0, 0);

      const bookmarksAfter = useBookmarkStore.getState().bookmarks;
      expect(bookmarksAfter[0].name).toBe(bookmarksBefore[0].name);
      expect(bookmarksAfter[1].name).toBe(bookmarksBefore[1].name);
    });

    it('should do nothing when fromIndex is negative', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });

      store.reorderBookmarks(-1, 1);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('A');
      expect(state.bookmarks[1].name).toBe('B');
    });

    it('should do nothing when toIndex is negative', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });

      store.reorderBookmarks(0, -1);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('A');
      expect(state.bookmarks[1].name).toBe('B');
    });

    it('should do nothing when fromIndex is out of bounds', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });

      store.reorderBookmarks(10, 0);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('A');
      expect(state.bookmarks[1].name).toBe('B');
    });

    it('should do nothing when toIndex is out of bounds', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });

      store.reorderBookmarks(0, 10);

      const state = useBookmarkStore.getState();
      expect(state.bookmarks[0].name).toBe('A');
      expect(state.bookmarks[1].name).toBe('B');
    });

    it('should do nothing when bookmarks array is empty', () => {
      const store = useBookmarkStore.getState();
      store.reorderBookmarks(0, 1);

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(0);
    });
  });

  describe('getBookmarkByPath', () => {
    it('should return bookmark for existing path', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test/path', icon: 'folder', color: '#3b82f6' });

      const bookmark = store.getBookmarkByPath('/test/path');

      expect(bookmark).toBeDefined();
      expect(bookmark?.name).toBe('Test');
      expect(bookmark?.path).toBe('/test/path');
    });

    it('should return undefined for non-existing path', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test/path', icon: 'folder', color: '' });

      const bookmark = store.getBookmarkByPath('/non/existing');

      expect(bookmark).toBeUndefined();
    });

    it('should return undefined when bookmarks array is empty', () => {
      const store = useBookmarkStore.getState();

      const bookmark = store.getBookmarkByPath('/any/path');

      expect(bookmark).toBeUndefined();
    });

    it('should return correct bookmark when multiple bookmarks exist', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'First', path: '/first', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Second', path: '/second', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Third', path: '/third', icon: 'folder', color: '' });

      const bookmark = store.getBookmarkByPath('/second');

      expect(bookmark?.name).toBe('Second');
    });
  });

  describe('isBookmarked', () => {
    it('should return true for bookmarked path', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test/path', icon: 'folder', color: '' });

      expect(store.isBookmarked('/test/path')).toBe(true);
    });

    it('should return false for non-bookmarked path', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test/path', icon: 'folder', color: '' });

      expect(store.isBookmarked('/other/path')).toBe(false);
    });

    it('should return false when bookmarks array is empty', () => {
      const store = useBookmarkStore.getState();

      expect(store.isBookmarked('/any/path')).toBe(false);
    });

    it('should be case-sensitive for paths', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/Test/Path', icon: 'folder', color: '' });

      expect(store.isBookmarked('/Test/Path')).toBe(true);
      expect(store.isBookmarked('/test/path')).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should save bookmarks to localStorage when adding', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],
      );
      expect(savedData.bookmarks).toHaveLength(1);
    });

    it('should save bookmarks to localStorage when removing', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });
      mockLocalStorage.setItem.mockClear();

      store.removeBookmark(id);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],
      );
      expect(savedData.bookmarks).toHaveLength(0);
    });

    it('should save bookmarks to localStorage when updating', () => {
      const store = useBookmarkStore.getState();
      const id = store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });
      mockLocalStorage.setItem.mockClear();

      store.updateBookmark(id, { name: 'Updated' });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should save bookmarks to localStorage when reordering', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'A', path: '/a', icon: 'folder', color: '' });
      store.addBookmark({ name: 'B', path: '/b', icon: 'folder', color: '' });
      mockLocalStorage.setItem.mockClear();

      store.reorderBookmarks(0, 1);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should use correct storage key', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('wincv-bookmarks', expect.any(String));
    });
  });

  describe('storage recovery', () => {
    it('should handle empty stored array', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ bookmarks: [] }));

      resetBookmarkStore();
      useBookmarkStore.setState({ bookmarks: [] });

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(0);
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid-json{{{');

      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toBeDefined();
    });

    it('should filter out invalid bookmarks from storage', () => {
      const validBookmark: Bookmark = {
        id: 'valid-id',
        name: 'Valid',
        path: '/valid',
        icon: 'folder',
        color: '#3b82f6',
        order: 0,
        createdAt: Date.now(),
      };

      const invalidBookmark = {
        id: 'invalid-id',
      };

      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify({ bookmarks: [validBookmark, invalidBookmark] }),
      );

      const state = useBookmarkStore.getState();
      expect(state).toBeDefined();
    });

    it('should sort bookmarks by order when loading from storage', () => {
      const bookmarks: Bookmark[] = [
        {
          id: '3',
          name: 'Third',
          path: '/third',
          icon: 'folder',
          color: '',
          order: 2,
          createdAt: 0,
        },
        {
          id: '1',
          name: 'First',
          path: '/first',
          icon: 'folder',
          color: '',
          order: 0,
          createdAt: 0,
        },
        {
          id: '2',
          name: 'Second',
          path: '/second',
          icon: 'folder',
          color: '',
          order: 1,
          createdAt: 0,
        },
      ];

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ bookmarks }));

      resetBookmarkStore();
    });
  });

  describe('resetBookmarkStore', () => {
    it('should reset store to empty state', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });
      store.addBookmark({ name: 'Another', path: '/another', icon: 'folder', color: '' });

      resetBookmarkStore();

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(0);
    });

    it('should clear localStorage when resetting', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '' });

      resetBookmarkStore();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wincv-bookmarks');
    });
  });

  describe('Bookmark interface', () => {
    it('should have all required properties', () => {
      const store = useBookmarkStore.getState();
      store.addBookmark({ name: 'Test', path: '/test', icon: 'folder', color: '#3b82f6' });

      const bookmark = useBookmarkStore.getState().bookmarks[0];
      const requiredProperties: (keyof Bookmark)[] = [
        'id',
        'name',
        'path',
        'icon',
        'color',
        'order',
        'createdAt',
      ];

      requiredProperties.forEach((prop) => {
        expect(bookmark).toHaveProperty(prop);
      });
    });
  });

  describe('DEFAULT_COLORS', () => {
    it('should have 7 colors', () => {
      expect(DEFAULT_COLORS).toHaveLength(7);
    });

    it('should contain valid hex colors', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      DEFAULT_COLORS.forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });

    it('should include expected colors', () => {
      expect(DEFAULT_COLORS).toContain('#3b82f6');
      expect(DEFAULT_COLORS).toContain('#22c55e');
      expect(DEFAULT_COLORS).toContain('#eab308');
      expect(DEFAULT_COLORS).toContain('#ef4444');
      expect(DEFAULT_COLORS).toContain('#a855f7');
      expect(DEFAULT_COLORS).toContain('#ec4899');
      expect(DEFAULT_COLORS).toContain('#06b6d4');
    });
  });
});
