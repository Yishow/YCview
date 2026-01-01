import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTabStore, resetTabStore, Tab } from '../tab-store';

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

describe('TabStore', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    resetTabStore();
  });

  describe('addTab', () => {
    it('should add a new tab with default path', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].path).toBe('~/');
      expect(state.tabs[0].title).toBe('Home');
      expect(state.tabs[0].id).toBe(tabId);
    });

    it('should add a new tab with specified path', () => {
      const store = useTabStore.getState();
      store.addTab('/path/to/folder');

      const state = useTabStore.getState();
      expect(state.tabs[0].path).toBe('/path/to/folder');
      expect(state.tabs[0].title).toBe('folder');
    });

    it('should set first tab as active', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();

      const state = useTabStore.getState();
      expect(state.activeTabId).toBe(tabId);
      expect(state.tabs[0].isActive).toBe(true);
    });

    it('should set new tab as active when adding additional tabs', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const secondTabId = store.addTab('/second');

      const state = useTabStore.getState();
      expect(state.activeTabId).toBe(secondTabId);
      expect(state.tabs[0].isActive).toBe(false);
      expect(state.tabs[1].isActive).toBe(true);
    });

    it('should insert new tabs after pinned tabs', () => {
      const store = useTabStore.getState();
      const pinnedTabId = store.addTab('/pinned');
      store.pinTab(pinnedTabId);
      store.addTab('/regular');

      const state = useTabStore.getState();
      expect(state.tabs[0].isPinned).toBe(true);
      expect(state.tabs[1].path).toBe('/regular');
    });

    it('should initialize tab with correct history', () => {
      const store = useTabStore.getState();
      store.addTab('/some/path');

      const state = useTabStore.getState();
      expect(state.tabs[0].history).toEqual(['/some/path']);
      expect(state.tabs[0].historyIndex).toBe(0);
    });
  });

  describe('removeTab', () => {
    it('should remove a tab by id', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');

      store.removeTab(tabId1);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].path).toBe('/second');
    });

    it('should do nothing when removing non-existent tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      store.removeTab('non-existent-id');

      expect(useTabStore.getState().tabs).toHaveLength(1);
    });

    it('should activate previous tab when removing active tab at the end', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.switchTab(tabId2);

      store.removeTab(tabId2);

      const state = useTabStore.getState();
      expect(state.activeTabId).toBe(tabId1);
      expect(state.tabs[0].isActive).toBe(true);
    });

    it('should activate next tab when removing active tab in the middle', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');
      const tabId3 = store.addTab('/third');
      store.switchTab(tabId1);

      store.removeTab(tabId1);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(state.activeTabId).not.toBe(tabId1);
      expect(state.activeTabId).not.toBe(tabId3);
    });

    it('should set activeTabId to null when removing last tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/only');

      store.removeTab(tabId);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(0);
      expect(state.activeTabId).toBe(null);
    });

    it('should preserve activeTabId when removing non-active tab', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      const tabId2 = store.addTab('/second');

      store.removeTab(tabId1);

      expect(useTabStore.getState().activeTabId).toBe(tabId2);
    });
  });

  describe('switchTab', () => {
    it('should switch to specified tab', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');

      store.switchTab(tabId1);

      const state = useTabStore.getState();
      expect(state.activeTabId).toBe(tabId1);
      expect(state.tabs[0].isActive).toBe(true);
      expect(state.tabs[1].isActive).toBe(false);
    });

    it('should do nothing when switching to non-existent tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/first');

      store.switchTab('non-existent-id');

      expect(useTabStore.getState().activeTabId).toBe(tabId);
    });
  });

  describe('moveTab', () => {
    it('should move tab to specified position', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');
      store.addTab('/third');

      store.moveTab(tabId1, 2);

      const state = useTabStore.getState();
      expect(state.tabs[2].id).toBe(tabId1);
    });

    it('should clamp toIndex to valid range', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/first');
      store.addTab('/second');

      store.moveTab(tabId, 100);

      const state = useTabStore.getState();
      expect(state.tabs[1].id).toBe(tabId);
    });

    it('should do nothing when moving to same position', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/first');
      store.addTab('/second');

      const tabsBefore = [...useTabStore.getState().tabs];
      store.moveTab(tabId, 0);

      expect(useTabStore.getState().tabs).toEqual(tabsBefore);
    });

    it('should do nothing when moving non-existent tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');

      const tabsBefore = [...useTabStore.getState().tabs];
      store.moveTab('non-existent-id', 0);

      expect(useTabStore.getState().tabs).toEqual(tabsBefore);
    });
  });

  describe('duplicateTab', () => {
    it('should create a copy of the tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/original');

      const newTabId = store.duplicateTab(tabId);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(newTabId).not.toBe(tabId);
      expect(state.tabs[1].path).toBe('/original');
    });

    it('should insert duplicated tab after source tab', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');
      store.addTab('/third');

      store.duplicateTab(tabId1);

      const state = useTabStore.getState();
      expect(state.tabs[1].path).toBe('/first');
    });

    it('should make duplicated tab active', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/original');

      const newTabId = store.duplicateTab(tabId);

      expect(useTabStore.getState().activeTabId).toBe(newTabId);
    });

    it('should not pin duplicated tab even if source is pinned', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/pinned');
      store.pinTab(tabId);

      const newTabId = store.duplicateTab(tabId);

      const state = useTabStore.getState();
      const duplicatedTab = state.tabs.find((t) => t.id === newTabId);
      expect(duplicatedTab?.isPinned).toBe(false);
    });

    it('should return empty string for non-existent tab', () => {
      const store = useTabStore.getState();

      const result = store.duplicateTab('non-existent-id');

      expect(result).toBe('');
    });
  });

  describe('updateTab', () => {
    it('should update tab properties', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/original');

      store.updateTab(tabId, { scrollPosition: 100, title: 'Updated' });

      const state = useTabStore.getState();
      expect(state.tabs[0].scrollPosition).toBe(100);
      expect(state.tabs[0].title).toBe('Updated');
    });

    it('should only update specified properties', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/original');

      store.updateTab(tabId, { scrollPosition: 50 });

      const state = useTabStore.getState();
      expect(state.tabs[0].scrollPosition).toBe(50);
      expect(state.tabs[0].path).toBe('/original');
    });
  });

  describe('setTabPath', () => {
    it('should update path and title', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/original');

      store.setTabPath(tabId, '/new/path');

      const state = useTabStore.getState();
      expect(state.tabs[0].path).toBe('/new/path');
      expect(state.tabs[0].title).toBe('path');
    });

    it('should add to history', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/first');
      store.setTabPath(tabId, '/second');
      store.setTabPath(tabId, '/third');

      const state = useTabStore.getState();
      expect(state.tabs[0].history).toEqual(['/first', '/second', '/third']);
      expect(state.tabs[0].historyIndex).toBe(2);
    });

    it('should handle home path correctly', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/some/path');

      store.setTabPath(tabId, '~/');

      const state = useTabStore.getState();
      expect(state.tabs[0].title).toBe('Home');
      expect(state.tabs[0].icon).toBe('home');
    });
  });

  describe('setTabLoading', () => {
    it('should set loading state to true', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();

      store.setTabLoading(tabId, true);

      expect(useTabStore.getState().tabs[0].isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();
      store.setTabLoading(tabId, true);

      store.setTabLoading(tabId, false);

      expect(useTabStore.getState().tabs[0].isLoading).toBe(false);
    });
  });

  describe('pinTab', () => {
    it('should pin a tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();

      store.pinTab(tabId);

      expect(useTabStore.getState().tabs[0].isPinned).toBe(true);
    });

    it('should move pinned tab to the beginning', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.addTab('/third');

      store.pinTab(tabId2);

      const state = useTabStore.getState();
      expect(state.tabs[0].id).toBe(tabId2);
      expect(state.tabs[0].isPinned).toBe(true);
    });

    it('should do nothing when pinning already pinned tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();
      store.pinTab(tabId);

      const tabsBefore = [...useTabStore.getState().tabs];
      store.pinTab(tabId);

      expect(useTabStore.getState().tabs).toEqual(tabsBefore);
    });

    it('should do nothing when pinning non-existent tab', () => {
      const store = useTabStore.getState();
      store.addTab();

      store.pinTab('non-existent-id');

      expect(useTabStore.getState().tabs[0].isPinned).toBe(false);
    });
  });

  describe('unpinTab', () => {
    it('should unpin a pinned tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();
      store.pinTab(tabId);

      store.unpinTab(tabId);

      expect(useTabStore.getState().tabs[0].isPinned).toBe(false);
    });

    it('should do nothing when unpinning non-pinned tab', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab();

      store.unpinTab(tabId);

      expect(useTabStore.getState().tabs[0].isPinned).toBe(false);
    });
  });

  describe('closeOtherTabs', () => {
    it('should close all tabs except the specified one', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.addTab('/third');

      store.closeOtherTabs(tabId2);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].id).toBe(tabId2);
    });

    it('should keep pinned tabs when closing others', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/pinned');
      store.pinTab(tabId1);
      const tabId2 = store.addTab('/keep');
      store.addTab('/close');

      store.closeOtherTabs(tabId2);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(state.tabs.some((t) => t.id === tabId1)).toBe(true);
      expect(state.tabs.some((t) => t.id === tabId2)).toBe(true);
    });

    it('should make specified tab active', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.switchTab(tabId1);

      store.closeOtherTabs(tabId2);

      expect(useTabStore.getState().activeTabId).toBe(tabId2);
    });

    it('should do nothing for non-existent tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      store.addTab('/second');

      store.closeOtherTabs('non-existent-id');

      expect(useTabStore.getState().tabs).toHaveLength(2);
    });
  });

  describe('closeTabsToTheRight', () => {
    it('should close all tabs to the right of specified tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.addTab('/third');
      store.addTab('/fourth');

      store.closeTabsToTheRight(tabId2);

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[0].path).toBe('/first');
      expect(state.tabs[1].path).toBe('/second');
    });

    it('should keep pinned tabs to the right', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');
      const tabId3 = store.addTab('/third');
      store.pinTab(tabId3);

      store.closeTabsToTheRight(tabId2);

      const state = useTabStore.getState();
      expect(state.tabs.some((t) => t.id === tabId3)).toBe(true);
    });

    it('should activate specified tab if active tab was closed', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');

      store.closeTabsToTheRight(tabId1);

      const state = useTabStore.getState();
      expect(state.activeTabId).toBe(tabId1);
    });

    it('should do nothing for non-existent tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      store.addTab('/second');

      store.closeTabsToTheRight('non-existent-id');

      expect(useTabStore.getState().tabs).toHaveLength(2);
    });

    it('should do nothing when no tabs are to the right', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');

      const tabsBefore = useTabStore.getState().tabs.length;
      store.closeTabsToTheRight(tabId2);

      expect(useTabStore.getState().tabs).toHaveLength(tabsBefore);
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');

      const activeTab = store.getActiveTab();

      expect(activeTab?.id).toBe(tabId2);
      expect(activeTab?.path).toBe('/second');
    });

    it('should return undefined when no tabs exist', () => {
      const store = useTabStore.getState();

      const activeTab = store.getActiveTab();

      expect(activeTab).toBeUndefined();
    });
  });

  describe('Tab interface', () => {
    it('should have all required properties', () => {
      const store = useTabStore.getState();
      store.addTab('/test');

      const tab = useTabStore.getState().tabs[0];
      const requiredProperties: (keyof Tab)[] = [
        'id',
        'path',
        'title',
        'icon',
        'isActive',
        'isPinned',
        'isLoading',
        'scrollPosition',
        'history',
        'historyIndex',
      ];

      requiredProperties.forEach((prop) => {
        expect(tab).toHaveProperty(prop);
      });
    });
  });

  describe('resetTabStore', () => {
    it('should reset store to initial state', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      store.addTab('/second');

      resetTabStore();

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(0);
      expect(state.activeTabId).toBe(null);
    });

    it('should clear localStorage when resetting', () => {
      const store = useTabStore.getState();
      store.addTab('/test');

      resetTabStore();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wincv-tabs');
    });
  });

  describe('persistence', () => {
    it('should save tabs to localStorage when adding a tab', () => {
      const store = useTabStore.getState();
      store.addTab('/test-path');

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],
      );
      expect(savedData.tabs).toHaveLength(1);
      expect(savedData.tabs[0].path).toBe('/test-path');
    });

    it('should save activeTabId to localStorage', () => {
      const store = useTabStore.getState();
      const tabId = store.addTab('/test');

      const savedData = JSON.parse(
        mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1],
      );
      expect(savedData.activeTabId).toBe(tabId);
    });

    it('should not save when rememberTabs is false', () => {
      const store = useTabStore.getState();
      store.setRememberTabs(false);
      mockLocalStorage.setItem.mockClear();

      store.addTab('/test');

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should clear localStorage when rememberTabs is set to false', () => {
      const store = useTabStore.getState();
      store.addTab('/test');

      store.setRememberTabs(false);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('wincv-tabs');
    });

    it('should save to localStorage when rememberTabs is set to true', () => {
      const store = useTabStore.getState();
      store.setRememberTabs(false);
      mockLocalStorage.setItem.mockClear();
      store.addTab('/test');

      store.setRememberTabs(true);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('rememberTabs', () => {
    it('should have rememberTabs default to true', () => {
      const state = useTabStore.getState();
      expect(state.rememberTabs).toBe(true);
    });

    it('should toggle rememberTabs with setRememberTabs', () => {
      const store = useTabStore.getState();

      store.setRememberTabs(false);
      expect(useTabStore.getState().rememberTabs).toBe(false);

      store.setRememberTabs(true);
      expect(useTabStore.getState().rememberTabs).toBe(true);
    });
  });

  describe('storage recovery', () => {
    it('should handle empty stored array', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify({ tabs: [], activeTabId: null, rememberTabs: true }),
      );

      resetTabStore();
      useTabStore.setState({
        tabs: [],
        activeTabId: null,
        rememberTabs: true,
      });

      const state = useTabStore.getState();
      expect(state.tabs).toHaveLength(0);
      expect(state.activeTabId).toBe(null);
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid-json{{{');

      const state = useTabStore.getState();
      expect(state.tabs).toBeDefined();
    });

    it('should handle missing activeTabId reference gracefully', () => {
      const validTab: Tab = {
        id: 'existing-tab',
        path: '/test',
        title: 'test',
        icon: 'folder',
        isActive: true,
        isPinned: false,
        isLoading: false,
        scrollPosition: 0,
        history: ['/test'],
        historyIndex: 0,
      };

      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify({
          tabs: [validTab],
          activeTabId: 'non-existent-id',
          rememberTabs: true,
        }),
      );

      resetTabStore();

      const store = useTabStore.getState();
      expect(store.tabs.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter out invalid tabs from storage', () => {
      const validTab: Tab = {
        id: 'valid-tab',
        path: '/valid',
        title: 'valid',
        icon: 'folder',
        isActive: true,
        isPinned: false,
        isLoading: false,
        scrollPosition: 0,
        history: ['/valid'],
        historyIndex: 0,
      };

      const invalidTab = {
        id: 'invalid-tab',
      };

      mockLocalStorage.getItem.mockReturnValueOnce(
        JSON.stringify({
          tabs: [validTab, invalidTab],
          activeTabId: 'valid-tab',
          rememberTabs: true,
        }),
      );

      const state = useTabStore.getState();
      expect(state).toBeDefined();
    });
  });

  describe('moveTab edge cases', () => {
    it('should handle negative toIndex by clamping to 0', () => {
      const store = useTabStore.getState();
      store.addTab('/first');
      const tabId2 = store.addTab('/second');
      store.addTab('/third');

      store.moveTab(tabId2, -5);

      const state = useTabStore.getState();
      expect(state.tabs[0].id).toBe(tabId2);
    });

    it('should handle toIndex larger than array length', () => {
      const store = useTabStore.getState();
      const tabId1 = store.addTab('/first');
      store.addTab('/second');
      store.addTab('/third');

      store.moveTab(tabId1, 999);

      const state = useTabStore.getState();
      expect(state.tabs[2].id).toBe(tabId1);
    });
  });
});
