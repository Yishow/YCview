import { useEffect, useCallback, useMemo } from 'react';
import { useSelectionStore } from '../stores/selection-store';
import { useTabStore } from '../stores/tab-store';

export interface ShortcutDefinition {
  /** 按鍵（不區分大小寫） */
  key: string;
  /** 是否需要有選取項目才能觸發 */
  requiresSelection?: boolean;
  /** 是否需要單一選取（僅選取一個項目） */
  requiresSingleSelection?: boolean;
  /** 是否需要 Shift 鍵 */
  requiresShift?: boolean;
  /** 是否需要 Ctrl 鍵 */
  requiresCtrl?: boolean;
  /** 執行的動作 */
  action: () => void;
  /** 快捷鍵描述 */
  description: string;
}

export interface UseKeyboardShortcutsOptions {
  /** 是否啟用快捷鍵 */
  enabled?: boolean;
  /** 當前面板的檔案清單（路徑陣列），用於標記操作 */
  items?: string[];
  /** 自訂快捷鍵處理函式 */
  handlers?: {
    // 檔案操作
    onCopy?: () => void;
    onMove?: () => void;
    onDelete?: () => void;
    onRename?: () => void;
    onEnter?: () => void;
    onBackspace?: () => void;
    onNewFolder?: () => void;
    onRefresh?: () => void;
    // 標記操作
    onToggleMark?: () => void;
    onMarkAll?: () => void;
    onUnmarkAll?: () => void;
    onInvertMarks?: () => void;
    // 面板操作
    onSwitchPanel?: () => void;
  };
}

export interface UseKeyboardShortcutsResult {
  /** 已註冊的快捷鍵列表 */
  shortcuts: ShortcutDefinition[];
}

function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';

  return isInput || isContentEditable;
}

export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {},
): UseKeyboardShortcutsResult {
  const { enabled = true, items = [], handlers = {} } = options;

  const selectedItems = useSelectionStore((state) => state.selectedItems);
  const focusedItem = useSelectionStore((state) => state.focusedItem);
  const storeToggleMark = useSelectionStore((state) => state.toggleMark);
  const storeMarkAll = useSelectionStore((state) => state.markAll);
  const storeUnmarkAll = useSelectionStore((state) => state.unmarkAll);
  const storeInvertMarks = useSelectionStore((state) => state.invertMarks);
  const storeSetFocus = useSelectionStore((state) => state.setFocus);

  const { addTab, removeTab, switchTab, tabs, activeTabId } = useTabStore();

  const hasSelection = selectedItems.size > 0;
  const hasSingleSelection = selectedItems.size === 1;

  const defaultHandlers = useMemo(
    () => ({
      onCopy: () => console.log('[快捷鍵] C - 複製 (需要實作)'),
      onMove: () => console.log('[快捷鍵] M - 移動 (需要實作)'),
      onDelete: () => console.log('[快捷鍵] D - 刪除 (需要實作)'),
      onRename: () => console.log('[快捷鍵] R - 重新命名 (需要實作)'),
      onEnter: () => console.log('[快捷鍵] Enter - 開啟/進入 (需要實作)'),
      onBackspace: () => console.log('[快捷鍵] Backspace - 返回上層 (需要實作)'),
      onNewFolder: () => console.log('[快捷鍵] F3 - 新增資料夾 (需要實作)'),
      onRefresh: () => console.log('[快捷鍵] F5 - 重新整理 (需要實作)'),
      onToggleMark: () => {
        if (focusedItem) {
          storeToggleMark(focusedItem);
          const currentIndex = items.indexOf(focusedItem);
          if (currentIndex !== -1 && currentIndex < items.length - 1) {
            storeSetFocus(items[currentIndex + 1]);
          }
        }
      },
      onMarkAll: () => {
        if (items.length > 0) {
          storeMarkAll(items);
        }
      },
      onUnmarkAll: () => {
        storeUnmarkAll();
      },
      onInvertMarks: () => {
        if (items.length > 0) {
          storeInvertMarks(items);
        }
      },
      onSwitchPanel: () => console.log('[快捷鍵] Tab - 切換面板焦點 (需要實作)'),
    }),
    [
      focusedItem,
      items,
      storeToggleMark,
      storeMarkAll,
      storeUnmarkAll,
      storeInvertMarks,
      storeSetFocus,
    ],
  );

  const mergedHandlers = useMemo(
    () => ({
      ...defaultHandlers,
      ...handlers,
    }),
    [defaultHandlers, handlers],
  );

  const shortcuts: ShortcutDefinition[] = useMemo(
    () => [
      {
        key: 'c',
        requiresSelection: true,
        action: mergedHandlers.onCopy,
        description: '複製選取的檔案',
      },
      {
        key: 'm',
        requiresSelection: true,
        action: mergedHandlers.onMove,
        description: '移動選取的檔案',
      },
      {
        key: 'd',
        requiresSelection: true,
        action: mergedHandlers.onDelete,
        description: '刪除選取的檔案',
      },
      {
        key: 'r',
        requiresSingleSelection: true,
        action: mergedHandlers.onRename,
        description: '重新命名檔案（僅單選）',
      },
      {
        key: 'Enter',
        requiresSelection: false,
        action: mergedHandlers.onEnter,
        description: '開啟檔案或進入目錄',
      },
      {
        key: 'Backspace',
        requiresSelection: false,
        action: mergedHandlers.onBackspace,
        description: '返回上層目錄',
      },
      {
        key: 'F3',
        requiresSelection: false,
        action: mergedHandlers.onNewFolder,
        description: '新增資料夾',
      },
      {
        key: 'F5',
        requiresSelection: false,
        action: mergedHandlers.onRefresh,
        description: '重新整理檔案列表',
      },
      {
        key: ' ',
        requiresSelection: false,
        action: mergedHandlers.onToggleMark,
        description: '標記/取消標記當前焦點項目',
      },
      {
        key: 't',
        requiresSelection: false,
        action: mergedHandlers.onMarkAll,
        description: '標記全部檔案',
      },
      {
        key: 'u',
        requiresSelection: false,
        action: mergedHandlers.onUnmarkAll,
        description: '取消所有標記',
      },
      {
        key: '*',
        requiresSelection: false,
        requiresShift: true,
        action: mergedHandlers.onInvertMarks,
        description: '反轉標記',
      },
      {
        key: 'Tab',
        requiresSelection: false,
        action: mergedHandlers.onSwitchPanel,
        description: '切換左右面板焦點',
      },
      {
        key: 't',
        requiresCtrl: true,
        action: () => addTab(),
        description: '新增分頁',
      },
      {
        key: 'w',
        requiresCtrl: true,
        action: () => {
          if (activeTabId) removeTab(activeTabId);
        },
        description: '關閉當前分頁',
      },
      {
        key: 'Tab',
        requiresCtrl: true,
        action: () => {
          if (tabs.length === 0) return;
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          switchTab(tabs[nextIndex].id);
        },
        description: '下一個分頁',
      },
      {
        key: 'Tab',
        requiresCtrl: true,
        requiresShift: true,
        action: () => {
          if (tabs.length === 0) return;
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
          switchTab(tabs[prevIndex].id);
        },
        description: '上一個分頁',
      },
      {
        key: '1',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 1) switchTab(tabs[0].id);
        },
        description: '跳至第 1 個分頁',
      },
      {
        key: '2',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 2) switchTab(tabs[1].id);
        },
        description: '跳至第 2 個分頁',
      },
      {
        key: '3',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 3) switchTab(tabs[2].id);
        },
        description: '跳至第 3 個分頁',
      },
      {
        key: '4',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 4) switchTab(tabs[3].id);
        },
        description: '跳至第 4 個分頁',
      },
      {
        key: '5',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 5) switchTab(tabs[4].id);
        },
        description: '跳至第 5 個分頁',
      },
      {
        key: '6',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 6) switchTab(tabs[5].id);
        },
        description: '跳至第 6 個分頁',
      },
      {
        key: '7',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 7) switchTab(tabs[6].id);
        },
        description: '跳至第 7 個分頁',
      },
      {
        key: '8',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 8) switchTab(tabs[7].id);
        },
        description: '跳至第 8 個分頁',
      },
      {
        key: '9',
        requiresCtrl: true,
        action: () => {
          if (tabs.length >= 1) switchTab(tabs[tabs.length - 1].id);
        },
        description: '跳至最後一個分頁',
      },
    ],
    [mergedHandlers, addTab, removeTab, switchTab, tabs, activeTabId],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (isInputFocused()) return;

      const key = event.key;
      const hasCtrl = event.ctrlKey || event.metaKey;
      const hasAlt = event.altKey;
      const hasShift = event.shiftKey;

      if (hasAlt) return;

      const specialKeys = ['Enter', 'Backspace', 'F3', 'F5', 'Tab', ' '];

      const matchedShortcut = shortcuts.find((shortcut) => {
        const isSpecialKey = specialKeys.includes(shortcut.key);
        const isShiftRequired = shortcut.requiresShift;
        const isCtrlRequired = shortcut.requiresCtrl;

        if (isCtrlRequired) {
          if (!hasCtrl) return false;
          if (isShiftRequired && !hasShift) return false;
          if (!isShiftRequired && hasShift && shortcut.key === 'Tab') return false;
          return key === shortcut.key;
        }

        if (hasCtrl) return false;

        if (isShiftRequired) {
          return hasShift && key === shortcut.key;
        }

        if (key === ' ' && hasShift) {
          return false;
        }

        if (isSpecialKey) {
          return key === shortcut.key;
        }
        return key.toLowerCase() === shortcut.key.toLowerCase();
      });

      if (!matchedShortcut) return;

      if (matchedShortcut.requiresSingleSelection && !hasSingleSelection) {
        console.log(`[快捷鍵] ${matchedShortcut.key.toUpperCase()} - 需要選取單一項目`);
        return;
      }

      if (matchedShortcut.requiresSelection && !hasSelection) {
        console.log(`[快捷鍵] ${matchedShortcut.key.toUpperCase()} - 需要選取項目`);
        return;
      }

      event.preventDefault();
      matchedShortcut.action();
    },
    [enabled, shortcuts, hasSelection, hasSingleSelection],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, handleKeyDown]);

  return {
    shortcuts,
  };
}
