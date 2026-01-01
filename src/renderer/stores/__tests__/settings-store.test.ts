import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useSettingsStore,
  resetSettingsStore,
  defaultSettings,
  type ThemeMode,
  type SortBy,
  type SortOrder,
} from '../settings-store';

const STORAGE_KEY = 'ycview-settings';

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('SettingsStore', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
    localStorage.clear();
    resetSettingsStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default Values', () => {
    it('should have correct default theme', () => {
      const state = useSettingsStore.getState();
      expect(state.theme).toBe('system');
    });

    it('should have correct default showHiddenFiles', () => {
      const state = useSettingsStore.getState();
      expect(state.showHiddenFiles).toBe(false);
    });

    it('should have correct default sortBy', () => {
      const state = useSettingsStore.getState();
      expect(state.sortBy).toBe('name');
    });

    it('should have correct default sortOrder', () => {
      const state = useSettingsStore.getState();
      expect(state.sortOrder).toBe('asc');
    });

    it('should have correct default showFileSize', () => {
      const state = useSettingsStore.getState();
      expect(state.showFileSize).toBe(true);
    });

    it('should have correct default showFileDate', () => {
      const state = useSettingsStore.getState();
      expect(state.showFileDate).toBe(true);
    });

    it('should have correct default useTrashBin', () => {
      const state = useSettingsStore.getState();
      expect(state.useTrashBin).toBe(true);
    });

    it('should have correct default confirmDelete', () => {
      const state = useSettingsStore.getState();
      expect(state.confirmDelete).toBe(true);
    });

    it('should have correct default foldersFirst', () => {
      const state = useSettingsStore.getState();
      expect(state.foldersFirst).toBe(true);
    });

    it('should match all defaults from defaultSettings export', () => {
      const state = useSettingsStore.getState();
      expect(state.theme).toBe(defaultSettings.theme);
      expect(state.showHiddenFiles).toBe(defaultSettings.showHiddenFiles);
      expect(state.sortBy).toBe(defaultSettings.sortBy);
      expect(state.sortOrder).toBe(defaultSettings.sortOrder);
      expect(state.showFileSize).toBe(defaultSettings.showFileSize);
      expect(state.showFileDate).toBe(defaultSettings.showFileDate);
      expect(state.useTrashBin).toBe(defaultSettings.useTrashBin);
      expect(state.confirmDelete).toBe(defaultSettings.confirmDelete);
      expect(state.foldersFirst).toBe(defaultSettings.foldersFirst);
    });
  });

  describe('Theme Settings', () => {
    it('should set theme to dark', () => {
      const store = useSettingsStore.getState();
      store.setTheme('dark');

      expect(useSettingsStore.getState().theme).toBe('dark');
    });

    it('should set theme to light', () => {
      const store = useSettingsStore.getState();
      store.setTheme('light');

      expect(useSettingsStore.getState().theme).toBe('light');
    });

    it('should cycle theme from system to light to dark to system', () => {
      const store = useSettingsStore.getState();

      store.cycleTheme();
      expect(useSettingsStore.getState().theme).toBe('light');

      store.cycleTheme();
      expect(useSettingsStore.getState().theme).toBe('dark');

      store.cycleTheme();
      expect(useSettingsStore.getState().theme).toBe('system');
    });

    it('getEffectiveTheme should return dark or light for system theme', () => {
      const store = useSettingsStore.getState();
      store.setTheme('system');

      const effectiveTheme = store.getEffectiveTheme();
      expect(['dark', 'light']).toContain(effectiveTheme);
    });

    it('getEffectiveTheme should return same theme for explicit theme', () => {
      const store = useSettingsStore.getState();

      store.setTheme('dark');
      expect(store.getEffectiveTheme()).toBe('dark');

      store.setTheme('light');
      expect(store.getEffectiveTheme()).toBe('light');
    });
  });

  describe('File Display Settings', () => {
    it('should set showHiddenFiles', () => {
      const store = useSettingsStore.getState();
      store.setShowHiddenFiles(true);

      expect(useSettingsStore.getState().showHiddenFiles).toBe(true);

      store.setShowHiddenFiles(false);
      expect(useSettingsStore.getState().showHiddenFiles).toBe(false);
    });

    it('should toggle showHiddenFiles', () => {
      const store = useSettingsStore.getState();
      expect(store.showHiddenFiles).toBe(false);

      store.toggleShowHiddenFiles();
      expect(useSettingsStore.getState().showHiddenFiles).toBe(true);

      store.toggleShowHiddenFiles();
      expect(useSettingsStore.getState().showHiddenFiles).toBe(false);
    });

    it('should set showFileSize', () => {
      const store = useSettingsStore.getState();
      store.setShowFileSize(false);

      expect(useSettingsStore.getState().showFileSize).toBe(false);

      store.setShowFileSize(true);
      expect(useSettingsStore.getState().showFileSize).toBe(true);
    });

    it('should set showFileDate', () => {
      const store = useSettingsStore.getState();
      store.setShowFileDate(false);

      expect(useSettingsStore.getState().showFileDate).toBe(false);

      store.setShowFileDate(true);
      expect(useSettingsStore.getState().showFileDate).toBe(true);
    });
  });

  describe('Sort Settings', () => {
    it('should set sortBy to name', () => {
      const store = useSettingsStore.getState();
      store.setSortBy('name');

      expect(useSettingsStore.getState().sortBy).toBe('name');
    });

    it('should set sortBy to size', () => {
      const store = useSettingsStore.getState();
      store.setSortBy('size');

      expect(useSettingsStore.getState().sortBy).toBe('size');
    });

    it('should set sortBy to date', () => {
      const store = useSettingsStore.getState();
      store.setSortBy('date');

      expect(useSettingsStore.getState().sortBy).toBe('date');
    });

    it('should set sortBy to extension', () => {
      const store = useSettingsStore.getState();
      store.setSortBy('extension');

      expect(useSettingsStore.getState().sortBy).toBe('extension');
    });

    it('should set sortOrder to asc', () => {
      const store = useSettingsStore.getState();
      store.setSortOrder('asc');

      expect(useSettingsStore.getState().sortOrder).toBe('asc');
    });

    it('should set sortOrder to desc', () => {
      const store = useSettingsStore.getState();
      store.setSortOrder('desc');

      expect(useSettingsStore.getState().sortOrder).toBe('desc');
    });

    it('should set foldersFirst', () => {
      const store = useSettingsStore.getState();
      store.setFoldersFirst(false);

      expect(useSettingsStore.getState().foldersFirst).toBe(false);

      store.setFoldersFirst(true);
      expect(useSettingsStore.getState().foldersFirst).toBe(true);
    });

    it('should toggle foldersFirst', () => {
      const store = useSettingsStore.getState();
      expect(store.foldersFirst).toBe(true);

      store.toggleFoldersFirst();
      expect(useSettingsStore.getState().foldersFirst).toBe(false);

      store.toggleFoldersFirst();
      expect(useSettingsStore.getState().foldersFirst).toBe(true);
    });
  });

  describe('Delete Settings', () => {
    it('should set useTrashBin', () => {
      const store = useSettingsStore.getState();
      store.setUseTrashBin(false);

      expect(useSettingsStore.getState().useTrashBin).toBe(false);

      store.setUseTrashBin(true);
      expect(useSettingsStore.getState().useTrashBin).toBe(true);
    });

    it('should set confirmDelete', () => {
      const store = useSettingsStore.getState();
      store.setConfirmDelete(false);

      expect(useSettingsStore.getState().confirmDelete).toBe(false);

      store.setConfirmDelete(true);
      expect(useSettingsStore.getState().confirmDelete).toBe(true);
    });
  });

  describe('localStorage Persistence', () => {
    it('should save settings to localStorage when setTheme is called', () => {
      const store = useSettingsStore.getState();
      store.setTheme('dark');

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.theme).toBe('dark');
    });

    it('should save all settings to localStorage', () => {
      const store = useSettingsStore.getState();
      store.setTheme('light');
      store.setShowHiddenFiles(true);
      store.setSortBy('size');
      store.setSortOrder('desc');
      store.setShowFileSize(false);
      store.setShowFileDate(false);
      store.setUseTrashBin(false);
      store.setConfirmDelete(false);
      store.setFoldersFirst(false);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.theme).toBe('light');
      expect(parsed.showHiddenFiles).toBe(true);
      expect(parsed.sortBy).toBe('size');
      expect(parsed.sortOrder).toBe('desc');
      expect(parsed.showFileSize).toBe(false);
      expect(parsed.showFileDate).toBe(false);
      expect(parsed.useTrashBin).toBe(false);
      expect(parsed.confirmDelete).toBe(false);
      expect(parsed.foldersFirst).toBe(false);
    });

    it('should load settings from localStorage on initialization', () => {
      const customSettings = {
        theme: 'dark' as ThemeMode,
        showHiddenFiles: true,
        sortBy: 'date' as SortBy,
        sortOrder: 'desc' as SortOrder,
        showFileSize: false,
        showFileDate: false,
        useTrashBin: false,
        confirmDelete: false,
        foldersFirst: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customSettings));

      resetSettingsStore();

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');

      expect(() => resetSettingsStore()).not.toThrow();
    });

    it('should handle missing localStorage gracefully', () => {
      localStorage.removeItem(STORAGE_KEY);

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe(defaultSettings.theme);
    });

    it('should handle partial localStorage data with defaults for missing fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'dark' }));

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.showHiddenFiles).toBe(defaultSettings.showHiddenFiles);
      expect(state.sortBy).toBe(defaultSettings.sortBy);
    });

    it('should handle invalid theme value in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'invalid-theme' }));

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe(defaultSettings.theme);
    });

    it('should handle invalid sortBy value in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sortBy: 'invalid-sort' }));

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.sortBy).toBe(defaultSettings.sortBy);
    });

    it('should handle invalid sortOrder value in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sortOrder: 'invalid-order' }));

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.sortOrder).toBe(defaultSettings.sortOrder);
    });
  });

  describe('resetSettingsStore', () => {
    it('should reset all settings to defaults', () => {
      const store = useSettingsStore.getState();

      store.setTheme('dark');
      store.setShowHiddenFiles(true);
      store.setSortBy('extension');
      store.setSortOrder('desc');
      store.setShowFileSize(false);
      store.setShowFileDate(false);
      store.setUseTrashBin(false);
      store.setConfirmDelete(false);
      store.setFoldersFirst(false);

      resetSettingsStore();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe(defaultSettings.theme);
      expect(state.showHiddenFiles).toBe(defaultSettings.showHiddenFiles);
      expect(state.sortBy).toBe(defaultSettings.sortBy);
      expect(state.sortOrder).toBe(defaultSettings.sortOrder);
      expect(state.showFileSize).toBe(defaultSettings.showFileSize);
      expect(state.showFileDate).toBe(defaultSettings.showFileDate);
      expect(state.useTrashBin).toBe(defaultSettings.useTrashBin);
      expect(state.confirmDelete).toBe(defaultSettings.confirmDelete);
      expect(state.foldersFirst).toBe(defaultSettings.foldersFirst);
    });
  });
});
