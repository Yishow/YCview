import { useCallback } from 'react';
import { useSelectionStore } from '../stores/selection-store';

/**
 * useSelection Hook 配置選項
 */
export interface UseSelectionOptions {
  /** 當前面板的檔案清單（路徑陣列） */
  items: string[];
  /** 每頁顯示的項目數量（用於 PageUp/PageDown），預設 20 */
  pageSize?: number;
}

/**
 * useSelection Hook 返回值
 */
export interface UseSelectionResult {
  // ===== 狀態 =====
  /** 已選取的項目集合 */
  selectedItems: Set<string>;
  /** 已標記的項目集合 */
  markedItems: Set<string>;
  /** 當前焦點項目 */
  focusedItem: string | null;
  /** 上次選取的項目（用於範圍選取的起點） */
  lastSelectedItem: string | null;

  // ===== 滑鼠事件處理 =====
  /**
   * 處理點擊選取邏輯
   * - 單擊：選取單一項目
   * - Ctrl+點擊：切換選取（多選）
   * - Shift+點擊：範圍選取
   */
  handleClick: (path: string, event: React.MouseEvent) => void;

  // ===== 鍵盤事件處理 =====
  /**
   * 處理鍵盤導航
   * - ↑↓：移動焦點並選取
   * - Ctrl+↑↓：只移動焦點不選取
   * - Shift+↑↓：擴展選取範圍
   * - Home/End：跳至頂部/底部
   * - PageUp/PageDown：翻頁
   * - Insert：切換標記
   * - Ctrl+A：全選
   * - Escape：取消選取
   */
  handleKeyDown: (event: React.KeyboardEvent) => void;

  // ===== 選取操作 =====
  /** 選取單一項目 */
  select: (path: string) => void;
  /** 取消選取單一項目 */
  deselect: (path: string) => void;
  /** 切換選取狀態 */
  toggleSelect: (path: string) => void;
  /** 範圍選取 */
  selectRange: (from: string, to: string) => void;
  /** 全選 */
  selectAll: () => void;
  /** 取消全部選取 */
  deselectAll: () => void;

  // ===== 標記操作 =====
  /** 標記項目 */
  mark: (path: string) => void;
  /** 取消標記項目 */
  unmark: (path: string) => void;
  /** 切換標記狀態 */
  toggleMark: (path: string) => void;
  /** 標記所有項目 */
  markAll: () => void;
  /** 取消所有標記 */
  unmarkAll: () => void;
  /** 反轉標記 */
  invertMarks: () => void;
  /** 標記已選取項目並下移焦點 */
  markSelected: () => void;

  // ===== 焦點操作 =====
  /** 設定焦點項目 */
  setFocus: (path: string) => void;
  /** 移動焦點 */
  moveFocus: (direction: 'up' | 'down') => void;
  /** 跳至第一個項目 */
  jumpToFirst: () => void;
  /** 跳至最後一個項目 */
  jumpToLast: () => void;

  // ===== 查詢方法 =====
  /** 檢查項目是否被選取 */
  isSelected: (path: string) => boolean;
  /** 檢查項目是否被標記 */
  isMarked: (path: string) => boolean;
  /** 檢查項目是否為焦點 */
  isFocused: (path: string) => boolean;
  /** 取得標記項目數量 */
  getMarkedCount: () => number;
}

/**
 * useSelection Hook
 *
 * 整合 SelectionStore 提供便捷的選取/標記操作，
 * 處理滑鼠點擊與鍵盤導航的邏輯。
 *
 * @example
 * ```tsx
 * const {
 *   selectedItems,
 *   markedItems,
 *   focusedItem,
 *   handleClick,
 *   handleKeyDown,
 * } = useSelection({ items: filePaths });
 *
 * return (
 *   <div onKeyDown={handleKeyDown}>
 *     {items.map(item => (
 *       <div
 *         key={item}
 *         onClick={(e) => handleClick(item, e)}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSelection(options: UseSelectionOptions): UseSelectionResult {
  const { items, pageSize = 20 } = options;

  // 從 store 取得狀態和 actions
  const selectedItems = useSelectionStore((state) => state.selectedItems);
  const markedItems = useSelectionStore((state) => state.markedItems);
  const focusedItem = useSelectionStore((state) => state.focusedItem);
  const lastSelectedItem = useSelectionStore((state) => state.lastSelectedItem);

  const storeSelect = useSelectionStore((state) => state.select);
  const storeDeselect = useSelectionStore((state) => state.deselect);
  const storeToggleSelect = useSelectionStore((state) => state.toggleSelect);
  const storeSelectRange = useSelectionStore((state) => state.selectRange);
  const storeSelectAll = useSelectionStore((state) => state.selectAll);
  const storeDeselectAll = useSelectionStore((state) => state.deselectAll);

  const storeMark = useSelectionStore((state) => state.mark);
  const storeUnmark = useSelectionStore((state) => state.unmark);
  const storeToggleMark = useSelectionStore((state) => state.toggleMark);
  const storeMarkAll = useSelectionStore((state) => state.markAll);
  const storeUnmarkAll = useSelectionStore((state) => state.unmarkAll);
  const storeInvertMarks = useSelectionStore((state) => state.invertMarks);

  const storeSetFocus = useSelectionStore((state) => state.setFocus);
  const storeMoveFocus = useSelectionStore((state) => state.moveFocus);

  const storeIsSelected = useSelectionStore((state) => state.isSelected);
  const storeIsMarked = useSelectionStore((state) => state.isMarked);
  const storeIsFocused = useSelectionStore((state) => state.isFocused);
  const storeGetMarkedCount = useSelectionStore((state) => state.getMarkedCount);

  // ===== 封裝選取操作 =====
  const select = useCallback((path: string) => storeSelect(path), [storeSelect]);
  const deselect = useCallback((path: string) => storeDeselect(path), [storeDeselect]);
  const toggleSelect = useCallback((path: string) => storeToggleSelect(path), [storeToggleSelect]);
  const selectRange = useCallback(
    (from: string, to: string) => storeSelectRange(from, to, items),
    [storeSelectRange, items],
  );
  const selectAll = useCallback(() => storeSelectAll(items), [storeSelectAll, items]);
  const deselectAll = useCallback(() => storeDeselectAll(), [storeDeselectAll]);

  // ===== 封裝標記操作 =====
  const mark = useCallback((path: string) => storeMark(path), [storeMark]);
  const unmark = useCallback((path: string) => storeUnmark(path), [storeUnmark]);
  const toggleMark = useCallback((path: string) => storeToggleMark(path), [storeToggleMark]);
  const markAll = useCallback(() => storeMarkAll(items), [storeMarkAll, items]);
  const unmarkAll = useCallback(() => storeUnmarkAll(), [storeUnmarkAll]);
  const invertMarks = useCallback(() => storeInvertMarks(items), [storeInvertMarks, items]);

  /**
   * 標記所有已選取的項目，並將焦點移至下一個項目
   */
  const markSelected = useCallback(() => {
    // 標記所有選取的項目
    selectedItems.forEach((path) => {
      if (!markedItems.has(path)) {
        storeMark(path);
      }
    });

    // 若有焦點項目，移動到下一個
    if (focusedItem && items.length > 0) {
      const currentIndex = items.indexOf(focusedItem);
      if (currentIndex !== -1 && currentIndex < items.length - 1) {
        const nextItem = items[currentIndex + 1];
        storeSelect(nextItem);
      }
    }
  }, [selectedItems, markedItems, focusedItem, items, storeMark, storeSelect]);

  // ===== 封裝焦點操作 =====
  const setFocus = useCallback((path: string) => storeSetFocus(path), [storeSetFocus]);
  const moveFocus = useCallback(
    (direction: 'up' | 'down') => storeMoveFocus(direction, items),
    [storeMoveFocus, items],
  );

  const jumpToFirst = useCallback(() => {
    if (items.length > 0) {
      storeSelect(items[0]);
    }
  }, [items, storeSelect]);

  const jumpToLast = useCallback(() => {
    if (items.length > 0) {
      storeSelect(items[items.length - 1]);
    }
  }, [items, storeSelect]);

  // ===== 查詢方法 =====
  const isSelected = useCallback((path: string) => storeIsSelected(path), [storeIsSelected]);
  const isMarked = useCallback((path: string) => storeIsMarked(path), [storeIsMarked]);
  const isFocused = useCallback((path: string) => storeIsFocused(path), [storeIsFocused]);
  const getMarkedCount = useCallback(() => storeGetMarkedCount(), [storeGetMarkedCount]);

  // ===== 滑鼠點擊處理 =====
  const handleClick = useCallback(
    (path: string, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Ctrl+點擊（macOS 用 metaKey）：切換選取
        storeToggleSelect(path);
      } else if (event.shiftKey) {
        // Shift+點擊：範圍選取
        const anchor = lastSelectedItem ?? (items.length > 0 ? items[0] : null);
        if (anchor) {
          storeSelectRange(anchor, path, items);
        } else {
          storeSelect(path);
        }
      } else {
        // 單純點擊：選取單一項目
        storeSelect(path);
      }
    },
    [items, lastSelectedItem, storeSelect, storeSelectRange, storeToggleSelect],
  );

  // ===== 鍵盤導航處理 =====
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (items.length === 0) return;

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isCtrlPressed = ctrlKey || metaKey; // 支援 macOS

      // 取得當前焦點項目的索引
      const currentIndex = focusedItem ? items.indexOf(focusedItem) : -1;

      // 計算目標索引的輔助函數
      const getTargetIndex = (direction: 'up' | 'down', step = 1): number => {
        if (currentIndex === -1) {
          return direction === 'down' ? 0 : items.length - 1;
        }
        if (direction === 'up') {
          return Math.max(0, currentIndex - step);
        }
        return Math.min(items.length - 1, currentIndex + step);
      };

      switch (key) {
        case 'ArrowUp': {
          event.preventDefault();
          const targetIndex = getTargetIndex('up');
          const targetItem = items[targetIndex];

          if (shiftKey) {
            // Shift+↑：擴展選取範圍
            const anchor = lastSelectedItem ?? focusedItem ?? items[0];
            storeSelectRange(anchor, targetItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+↑：只移動焦點
            storeSetFocus(targetItem);
          } else {
            // ↑：移動焦點並選取
            storeSelect(targetItem);
          }
          break;
        }

        case 'ArrowDown': {
          event.preventDefault();
          const targetIndex = getTargetIndex('down');
          const targetItem = items[targetIndex];

          if (shiftKey) {
            // Shift+↓：擴展選取範圍
            const anchor = lastSelectedItem ?? focusedItem ?? items[0];
            storeSelectRange(anchor, targetItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+↓：只移動焦點
            storeSetFocus(targetItem);
          } else {
            // ↓：移動焦點並選取
            storeSelect(targetItem);
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          const firstItem = items[0];

          if (shiftKey) {
            // Shift+Home：從當前位置選取到頂部
            const anchor = lastSelectedItem ?? focusedItem ?? firstItem;
            storeSelectRange(anchor, firstItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+Home：只移動焦點到頂部
            storeSetFocus(firstItem);
          } else {
            // Home：跳至頂部並選取
            storeSelect(firstItem);
          }
          break;
        }

        case 'End': {
          event.preventDefault();
          const lastItem = items[items.length - 1];

          if (shiftKey) {
            // Shift+End：從當前位置選取到底部
            const anchor = lastSelectedItem ?? focusedItem ?? items[0];
            storeSelectRange(anchor, lastItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+End：只移動焦點到底部
            storeSetFocus(lastItem);
          } else {
            // End：跳至底部並選取
            storeSelect(lastItem);
          }
          break;
        }

        case 'PageUp': {
          event.preventDefault();
          const targetIndex = getTargetIndex('up', pageSize);
          const targetItem = items[targetIndex];

          if (shiftKey) {
            // Shift+PageUp：向上擴展選取範圍一頁
            const anchor = lastSelectedItem ?? focusedItem ?? items[0];
            storeSelectRange(anchor, targetItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+PageUp：只移動焦點
            storeSetFocus(targetItem);
          } else {
            // PageUp：向上翻頁並選取
            storeSelect(targetItem);
          }
          break;
        }

        case 'PageDown': {
          event.preventDefault();
          const targetIndex = getTargetIndex('down', pageSize);
          const targetItem = items[targetIndex];

          if (shiftKey) {
            // Shift+PageDown：向下擴展選取範圍一頁
            const anchor = lastSelectedItem ?? focusedItem ?? items[0];
            storeSelectRange(anchor, targetItem, items);
          } else if (isCtrlPressed) {
            // Ctrl+PageDown：只移動焦點
            storeSetFocus(targetItem);
          } else {
            // PageDown：向下翻頁並選取
            storeSelect(targetItem);
          }
          break;
        }

        case 'Insert': {
          // Insert：切換焦點項目的標記，並移動焦點到下一個
          event.preventDefault();
          if (focusedItem) {
            storeToggleMark(focusedItem);
            // 自動移動到下一個項目
            const nextIndex = getTargetIndex('down');
            if (nextIndex !== currentIndex) {
              storeSetFocus(items[nextIndex]);
            }
          }
          break;
        }

        case ' ': {
          // 空白鍵：切換焦點項目的選取狀態（在 Ctrl 模式下）
          if (isCtrlPressed && focusedItem) {
            event.preventDefault();
            storeToggleSelect(focusedItem);
          }
          break;
        }

        case 'a':
        case 'A': {
          // Ctrl+A：全選
          if (isCtrlPressed) {
            event.preventDefault();
            storeSelectAll(items);
          }
          break;
        }

        case 'Escape': {
          // Escape：取消所有選取
          event.preventDefault();
          storeDeselectAll();
          break;
        }

        default:
          // 其他按鍵不處理
          break;
      }
    },
    [
      items,
      pageSize,
      focusedItem,
      lastSelectedItem,
      storeSelect,
      storeSelectRange,
      storeSelectAll,
      storeDeselectAll,
      storeSetFocus,
      storeToggleSelect,
      storeToggleMark,
    ],
  );

  return {
    // 狀態
    selectedItems,
    markedItems,
    focusedItem,
    lastSelectedItem,

    // 事件處理
    handleClick,
    handleKeyDown,

    // 選取操作
    select,
    deselect,
    toggleSelect,
    selectRange,
    selectAll,
    deselectAll,

    // 標記操作
    mark,
    unmark,
    toggleMark,
    markAll,
    unmarkAll,
    invertMarks,
    markSelected,

    // 焦點操作
    setFocus,
    moveFocus,
    jumpToFirst,
    jumpToLast,

    // 查詢方法
    isSelected,
    isMarked,
    isFocused,
    getMarkedCount,
  };
}
