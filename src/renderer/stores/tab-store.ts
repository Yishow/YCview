import { create } from 'zustand';

export interface Tab {
  id: string;
  path: string;
  title: string;
  icon: string;
  isActive: boolean;
  isPinned: boolean;
  isLoading: boolean;
  scrollPosition: number;
  history: string[];
  historyIndex: number;
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  rememberTabs: boolean;
}

export interface TabActions {
  addTab: (path?: string) => string;
  removeTab: (id: string) => void;
  switchTab: (id: string) => void;
  moveTab: (id: string, toIndex: number) => void;
  duplicateTab: (id: string) => string;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setTabPath: (id: string, path: string) => void;
  setTabLoading: (id: string, isLoading: boolean) => void;
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeTabsToTheRight: (id: string) => void;
  getActiveTab: () => Tab | undefined;
  setRememberTabs: (value: boolean) => void;
}

export type TabStore = TabState & TabActions;

const DEFAULT_PATH = '~/';
const STORAGE_KEY = 'wincv-tabs';

interface StoredTabData {
  tabs: Tab[];
  activeTabId: string | null;
  rememberTabs?: boolean;
}

function isValidTab(tab: unknown): tab is Tab {
  if (typeof tab !== 'object' || tab === null) return false;
  const t = tab as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.path === 'string' &&
    typeof t.title === 'string' &&
    typeof t.icon === 'string' &&
    typeof t.isActive === 'boolean' &&
    typeof t.isPinned === 'boolean' &&
    typeof t.isLoading === 'boolean' &&
    typeof t.scrollPosition === 'number' &&
    Array.isArray(t.history) &&
    typeof t.historyIndex === 'number'
  );
}

function loadTabsFromStorage(): Partial<TabState> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as Partial<StoredTabData>;

    const tabs: Tab[] = [];
    if (Array.isArray(parsed.tabs)) {
      for (const tab of parsed.tabs) {
        if (isValidTab(tab)) {
          tabs.push(tab);
        }
      }
    }

    let activeTabId = parsed.activeTabId ?? null;
    if (activeTabId !== null && !tabs.some((t) => t.id === activeTabId)) {
      activeTabId = tabs.length > 0 ? tabs[0].id : null;
    }

    const rememberTabs = typeof parsed.rememberTabs === 'boolean' ? parsed.rememberTabs : true;

    return {
      tabs: setActiveFlags(tabs, activeTabId),
      activeTabId,
      rememberTabs,
    };
  } catch {
    return {};
  }
}

function saveTabsToStorage(state: TabState): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (!state.rememberTabs) {
    return;
  }

  const data: StoredTabData = {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    rememberTabs: state.rememberTabs,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearTabsFromStorage(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function generateTabId(): string {
  return crypto.randomUUID();
}

function getTitleFromPath(path: string): string {
  if (path === '~/' || path === '~') {
    return 'Home';
  }
  const segments = path.replace(/\/+$/, '').split('/');
  return segments[segments.length - 1] || 'Home';
}

function getIconFromPath(path: string): string {
  if (path === '~/' || path === '~') {
    return 'home';
  }
  return 'folder';
}

function createTab(path: string = DEFAULT_PATH): Tab {
  return {
    id: generateTabId(),
    path,
    title: getTitleFromPath(path),
    icon: getIconFromPath(path),
    isActive: false,
    isPinned: false,
    isLoading: false,
    scrollPosition: 0,
    history: [path],
    historyIndex: 0,
  };
}

function findLastPinnedIndex(tabs: Tab[]): number {
  return tabs.reduce((lastIdx, tab, idx) => (tab.isPinned ? idx : lastIdx), -1);
}

function setActiveFlags(tabs: Tab[], activeId: string | null): Tab[] {
  return tabs.map((tab) => ({
    ...tab,
    isActive: tab.id === activeId,
  }));
}

const defaultState: TabState = {
  tabs: [],
  activeTabId: null,
  rememberTabs: true,
};

const storedData = loadTabsFromStorage();
const initialState: TabState = {
  ...defaultState,
  ...storedData,
};

export const useTabStore = create<TabStore>((set, get) => ({
  ...initialState,

  addTab: (path: string = DEFAULT_PATH): string => {
    const newTab = createTab(path);

    set((state) => {
      const updatedTabs = setActiveFlags(state.tabs, newTab.id);
      updatedTabs.push({ ...newTab, isActive: true });

      return {
        tabs: updatedTabs,
        activeTabId: newTab.id,
      };
    });

    return newTab.id;
  },

  removeTab: (id: string): void => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex((tab) => tab.id === id);

    if (tabIndex === -1) {
      return;
    }

    const isRemovingActiveTab = activeTabId === id;
    const newTabs = tabs.filter((tab) => tab.id !== id);

    let newActiveTabId: string | null = activeTabId;

    if (isRemovingActiveTab) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1].id;
      } else {
        newActiveTabId = newTabs[tabIndex].id;
      }
    }

    set({
      tabs: setActiveFlags(newTabs, newActiveTabId),
      activeTabId: newActiveTabId,
    });
  },

  switchTab: (id: string): void => {
    const { tabs } = get();
    const tabExists = tabs.some((tab) => tab.id === id);

    if (!tabExists) {
      return;
    }

    set((state) => ({
      tabs: setActiveFlags(state.tabs, id),
      activeTabId: id,
    }));
  },

  moveTab: (id: string, toIndex: number): void => {
    const { tabs } = get();
    const fromIndex = tabs.findIndex((tab) => tab.id === id);

    if (fromIndex === -1) {
      return;
    }

    const clampedToIndex = Math.max(0, Math.min(toIndex, tabs.length - 1));

    if (fromIndex === clampedToIndex) {
      return;
    }

    const newTabs = [...tabs];
    const [movedTab] = newTabs.splice(fromIndex, 1);
    newTabs.splice(clampedToIndex, 0, movedTab);

    set({ tabs: newTabs });
  },

  duplicateTab: (id: string): string => {
    const { tabs } = get();
    const sourceTab = tabs.find((tab) => tab.id === id);

    if (!sourceTab) {
      return '';
    }

    const newTab: Tab = {
      ...sourceTab,
      id: generateTabId(),
      isPinned: false,
      isActive: true,
    };

    const sourceIndex = tabs.findIndex((tab) => tab.id === id);

    set((state) => {
      const updatedTabs = setActiveFlags(state.tabs, null);
      updatedTabs.splice(sourceIndex + 1, 0, newTab);

      return {
        tabs: updatedTabs,
        activeTabId: newTab.id,
      };
    });

    return newTab.id;
  },

  updateTab: (id: string, updates: Partial<Tab>): void => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
    }));
  },

  setTabPath: (id: string, path: string): void => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== id) {
          return tab;
        }

        const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), path];
        const newHistoryIndex = newHistory.length - 1;

        return {
          ...tab,
          path,
          title: getTitleFromPath(path),
          icon: getIconFromPath(path),
          history: newHistory,
          historyIndex: newHistoryIndex,
        };
      }),
    }));
  },

  setTabLoading: (id: string, isLoading: boolean): void => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, isLoading } : tab)),
    }));
  },

  pinTab: (id: string): void => {
    const { tabs } = get();
    const tabIndex = tabs.findIndex((tab) => tab.id === id);

    if (tabIndex === -1 || tabs[tabIndex].isPinned) {
      return;
    }

    set((state) => {
      const lastPinnedIndex = findLastPinnedIndex(state.tabs);
      const newTabs = [...state.tabs];
      const [pinnedTab] = newTabs.splice(tabIndex, 1);
      pinnedTab.isPinned = true;

      const insertIndex = lastPinnedIndex + 1;
      newTabs.splice(insertIndex, 0, pinnedTab);

      return { tabs: newTabs };
    });
  },

  unpinTab: (id: string): void => {
    const { tabs } = get();
    const tabIndex = tabs.findIndex((tab) => tab.id === id);

    if (tabIndex === -1 || !tabs[tabIndex].isPinned) {
      return;
    }

    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, isPinned: false } : tab)),
    }));
  },

  closeOtherTabs: (id: string): void => {
    const { tabs } = get();
    const tabToKeep = tabs.find((tab) => tab.id === id);

    if (!tabToKeep) {
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id === id || tab.isPinned);

    set({
      tabs: setActiveFlags(newTabs, id),
      activeTabId: id,
    });
  },

  closeTabsToTheRight: (id: string): void => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex((tab) => tab.id === id);

    if (tabIndex === -1) {
      return;
    }

    const newTabs = tabs.filter((tab, index) => index <= tabIndex || tab.isPinned);

    const activeTabRemoved = !newTabs.some((tab) => tab.id === activeTabId);
    const newActiveTabId = activeTabRemoved ? id : activeTabId;

    set({
      tabs: setActiveFlags(newTabs, newActiveTabId),
      activeTabId: newActiveTabId,
    });
  },

  getActiveTab: (): Tab | undefined => {
    const { tabs, activeTabId } = get();
    return tabs.find((tab) => tab.id === activeTabId);
  },

  setRememberTabs: (value: boolean): void => {
    set({ rememberTabs: value });
    if (value) {
      saveTabsToStorage(get());
    } else {
      clearTabsFromStorage();
    }
  },
}));

useTabStore.subscribe((state) => {
  saveTabsToStorage(state);
});

export const resetTabStore = (): void => {
  clearTabsFromStorage();
  useTabStore.setState(defaultState);
};
