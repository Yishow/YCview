import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';
export type EffectiveTheme = 'dark' | 'light';
export type SortBy = 'name' | 'size' | 'date' | 'extension';
export type SortOrder = 'asc' | 'desc';

export interface SettingsState {
  theme: ThemeMode;
  showHiddenFiles: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
  showFileSize: boolean;
  showFileDate: boolean;
  useTrashBin: boolean;
  confirmDelete: boolean;
  foldersFirst: boolean;
}

export interface SettingsActions {
  setTheme: (theme: ThemeMode) => void;
  getEffectiveTheme: () => EffectiveTheme;
  cycleTheme: () => void;
  setShowHiddenFiles: (show: boolean) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setShowFileSize: (show: boolean) => void;
  setShowFileDate: (show: boolean) => void;
  setUseTrashBin: (use: boolean) => void;
  setConfirmDelete: (confirm: boolean) => void;
  setFoldersFirst: (first: boolean) => void;
  toggleShowHiddenFiles: () => void;
  toggleFoldersFirst: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const STORAGE_KEY = 'ycview-settings';

const defaultSettings: SettingsState = {
  theme: 'system',
  showHiddenFiles: false,
  sortBy: 'name',
  sortOrder: 'asc',
  showFileSize: true,
  showFileDate: true,
  useTrashBin: true,
  confirmDelete: true,
  foldersFirst: true,
};

function loadSettingsFromStorage(): SettingsState {
  if (typeof localStorage === 'undefined') {
    return { ...defaultSettings };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...defaultSettings };
    }

    const parsed = JSON.parse(stored) as Partial<SettingsState>;
    return {
      theme: isValidTheme(parsed.theme) ? parsed.theme : defaultSettings.theme,
      showHiddenFiles:
        typeof parsed.showHiddenFiles === 'boolean'
          ? parsed.showHiddenFiles
          : defaultSettings.showHiddenFiles,
      sortBy: isValidSortBy(parsed.sortBy) ? parsed.sortBy : defaultSettings.sortBy,
      sortOrder: isValidSortOrder(parsed.sortOrder) ? parsed.sortOrder : defaultSettings.sortOrder,
      showFileSize:
        typeof parsed.showFileSize === 'boolean'
          ? parsed.showFileSize
          : defaultSettings.showFileSize,
      showFileDate:
        typeof parsed.showFileDate === 'boolean'
          ? parsed.showFileDate
          : defaultSettings.showFileDate,
      useTrashBin:
        typeof parsed.useTrashBin === 'boolean' ? parsed.useTrashBin : defaultSettings.useTrashBin,
      confirmDelete:
        typeof parsed.confirmDelete === 'boolean'
          ? parsed.confirmDelete
          : defaultSettings.confirmDelete,
      foldersFirst:
        typeof parsed.foldersFirst === 'boolean'
          ? parsed.foldersFirst
          : defaultSettings.foldersFirst,
    };
  } catch {
    return { ...defaultSettings };
  }
}

function isValidTheme(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light' || value === 'system';
}

function isValidSortBy(value: unknown): value is SortBy {
  return value === 'name' || value === 'size' || value === 'date' || value === 'extension';
}

function isValidSortOrder(value: unknown): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

function saveSettingsToStorage(settings: SettingsState): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

const initialState: SettingsState = loadSettingsFromStorage();

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(theme: ThemeMode): EffectiveTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(effectiveTheme: EffectiveTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }
}

const THEME_CYCLE: ThemeMode[] = ['system', 'light', 'dark'];

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialState,

  setTheme: (theme: ThemeMode) => {
    set({ theme });
    saveSettingsToStorage(get());
    const effectiveTheme = resolveEffectiveTheme(theme);
    applyTheme(effectiveTheme);
  },

  getEffectiveTheme: () => {
    const { theme } = get();
    return resolveEffectiveTheme(theme);
  },

  cycleTheme: () => {
    const { theme, setTheme } = get();
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  },

  setShowHiddenFiles: (show: boolean) => {
    set({ showHiddenFiles: show });
    saveSettingsToStorage(get());
  },

  setSortBy: (sortBy: SortBy) => {
    set({ sortBy });
    saveSettingsToStorage(get());
  },

  setSortOrder: (sortOrder: SortOrder) => {
    set({ sortOrder });
    saveSettingsToStorage(get());
  },

  setShowFileSize: (show: boolean) => {
    set({ showFileSize: show });
    saveSettingsToStorage(get());
  },

  setShowFileDate: (show: boolean) => {
    set({ showFileDate: show });
    saveSettingsToStorage(get());
  },

  setUseTrashBin: (use: boolean) => {
    set({ useTrashBin: use });
    saveSettingsToStorage(get());
  },

  setConfirmDelete: (confirm: boolean) => {
    set({ confirmDelete: confirm });
    saveSettingsToStorage(get());
  },

  setFoldersFirst: (first: boolean) => {
    set({ foldersFirst: first });
    saveSettingsToStorage(get());
  },

  toggleShowHiddenFiles: () => {
    const { showHiddenFiles, setShowHiddenFiles } = get();
    setShowHiddenFiles(!showHiddenFiles);
  },

  toggleFoldersFirst: () => {
    const { foldersFirst, setFoldersFirst } = get();
    setFoldersFirst(!foldersFirst);
  },
}));

export function initializeThemeSystem(): () => void {
  const store = useSettingsStore.getState();
  const effectiveTheme = resolveEffectiveTheme(store.theme);
  applyTheme(effectiveTheme);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystemThemeChange = (): void => {
    const currentTheme = useSettingsStore.getState().theme;
    if (currentTheme === 'system') {
      const newEffectiveTheme = getSystemTheme();
      applyTheme(newEffectiveTheme);
    }
  };

  mediaQuery.addEventListener('change', handleSystemThemeChange);

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
}

export const resetSettingsStore = (): void => {
  useSettingsStore.setState({ ...defaultSettings });
  const effectiveTheme = resolveEffectiveTheme(defaultSettings.theme);
  applyTheme(effectiveTheme);
};

export { defaultSettings };
