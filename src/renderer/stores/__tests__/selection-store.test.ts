import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore, resetSelectionStore } from '../selection-store';

const testItems = [
  '/path/to/file1.txt',
  '/path/to/file2.txt',
  '/path/to/file3.txt',
  '/path/to/file4.txt',
  '/path/to/file5.txt',
];

describe('SelectionStore', () => {
  beforeEach(() => {
    resetSelectionStore();
  });

  describe('select', () => {
    it('should select a single item and clear previous selection', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);
      store.select(testItems[1]);

      expect(store.selectedItems.has(testItems[0])).toBe(false);
      expect(useSelectionStore.getState().selectedItems.has(testItems[1])).toBe(true);
      expect(useSelectionStore.getState().selectedItems.size).toBe(1);
    });

    it('should set lastSelectedItem and focusedItem', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);

      const state = useSelectionStore.getState();
      expect(state.lastSelectedItem).toBe(testItems[0]);
      expect(state.focusedItem).toBe(testItems[0]);
    });
  });

  describe('deselect', () => {
    it('should remove item from selection', () => {
      const store = useSelectionStore.getState();
      store.selectAll(testItems);
      store.deselect(testItems[0]);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.has(testItems[0])).toBe(false);
      expect(state.selectedItems.size).toBe(4);
    });

    it('should clear lastSelectedItem if deselected item was last selected', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);
      store.deselect(testItems[0]);

      expect(useSelectionStore.getState().lastSelectedItem).toBe(null);
    });
  });

  describe('toggleSelect', () => {
    it('should add item to selection when not selected', () => {
      const store = useSelectionStore.getState();
      store.toggleSelect(testItems[0]);

      expect(useSelectionStore.getState().selectedItems.has(testItems[0])).toBe(true);
    });

    it('should remove item from selection when already selected', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);
      store.toggleSelect(testItems[0]);

      expect(useSelectionStore.getState().selectedItems.has(testItems[0])).toBe(false);
    });

    it('should preserve other selected items', () => {
      const store = useSelectionStore.getState();
      store.selectAll([testItems[0], testItems[1]]);
      store.toggleSelect(testItems[2]);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.has(testItems[0])).toBe(true);
      expect(state.selectedItems.has(testItems[1])).toBe(true);
      expect(state.selectedItems.has(testItems[2])).toBe(true);
    });
  });

  describe('selectRange', () => {
    it('should select range of items between from and to', () => {
      const store = useSelectionStore.getState();
      store.selectRange(testItems[1], testItems[3], testItems);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.has(testItems[0])).toBe(false);
      expect(state.selectedItems.has(testItems[1])).toBe(true);
      expect(state.selectedItems.has(testItems[2])).toBe(true);
      expect(state.selectedItems.has(testItems[3])).toBe(true);
      expect(state.selectedItems.has(testItems[4])).toBe(false);
    });

    it('should work with reversed range (to before from)', () => {
      const store = useSelectionStore.getState();
      store.selectRange(testItems[3], testItems[1], testItems);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.size).toBe(3);
      expect(state.selectedItems.has(testItems[1])).toBe(true);
      expect(state.selectedItems.has(testItems[2])).toBe(true);
      expect(state.selectedItems.has(testItems[3])).toBe(true);
    });

    it('should preserve existing selection', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);
      store.selectRange(testItems[2], testItems[3], testItems);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.has(testItems[0])).toBe(true);
      expect(state.selectedItems.has(testItems[2])).toBe(true);
    });

    it('should not change selection if items not found', () => {
      const store = useSelectionStore.getState();
      store.select(testItems[0]);
      store.selectRange('/nonexistent', testItems[1], testItems);

      expect(useSelectionStore.getState().selectedItems.size).toBe(1);
    });

    it('should set lastSelectedItem to "to" parameter', () => {
      const store = useSelectionStore.getState();
      store.selectRange(testItems[1], testItems[3], testItems);

      expect(useSelectionStore.getState().lastSelectedItem).toBe(testItems[3]);
    });
  });

  describe('selectAll', () => {
    it('should select all provided items', () => {
      const store = useSelectionStore.getState();
      store.selectAll(testItems);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.size).toBe(5);
      testItems.forEach((item) => {
        expect(state.selectedItems.has(item)).toBe(true);
      });
    });

    it('should set lastSelectedItem to last item', () => {
      const store = useSelectionStore.getState();
      store.selectAll(testItems);

      expect(useSelectionStore.getState().lastSelectedItem).toBe(testItems[4]);
    });

    it('should handle empty array', () => {
      const store = useSelectionStore.getState();
      store.selectAll([]);

      const state = useSelectionStore.getState();
      expect(state.selectedItems.size).toBe(0);
      expect(state.lastSelectedItem).toBe(null);
    });
  });

  describe('deselectAll', () => {
    it('should clear all selections', () => {
      const store = useSelectionStore.getState();
      store.selectAll(testItems);
      store.deselectAll();

      const state = useSelectionStore.getState();
      expect(state.selectedItems.size).toBe(0);
      expect(state.lastSelectedItem).toBe(null);
    });
  });

  describe('mark', () => {
    it('should mark an item', () => {
      const store = useSelectionStore.getState();
      store.mark(testItems[0]);

      expect(useSelectionStore.getState().markedItems.has(testItems[0])).toBe(true);
    });

    it('should preserve existing marks', () => {
      const store = useSelectionStore.getState();
      store.mark(testItems[0]);
      store.mark(testItems[1]);

      const state = useSelectionStore.getState();
      expect(state.markedItems.has(testItems[0])).toBe(true);
      expect(state.markedItems.has(testItems[1])).toBe(true);
    });
  });

  describe('unmark', () => {
    it('should remove mark from item', () => {
      const store = useSelectionStore.getState();
      store.mark(testItems[0]);
      store.unmark(testItems[0]);

      expect(useSelectionStore.getState().markedItems.has(testItems[0])).toBe(false);
    });

    it('should preserve other marks', () => {
      const store = useSelectionStore.getState();
      store.markAll([testItems[0], testItems[1]]);
      store.unmark(testItems[0]);

      const state = useSelectionStore.getState();
      expect(state.markedItems.has(testItems[0])).toBe(false);
      expect(state.markedItems.has(testItems[1])).toBe(true);
    });
  });

  describe('toggleMark', () => {
    it('should mark unmarked item', () => {
      const store = useSelectionStore.getState();
      store.toggleMark(testItems[0]);

      expect(useSelectionStore.getState().markedItems.has(testItems[0])).toBe(true);
    });

    it('should unmark marked item', () => {
      const store = useSelectionStore.getState();
      store.mark(testItems[0]);
      store.toggleMark(testItems[0]);

      expect(useSelectionStore.getState().markedItems.has(testItems[0])).toBe(false);
    });
  });

  describe('markAll', () => {
    it('should mark all provided items', () => {
      const store = useSelectionStore.getState();
      store.markAll(testItems);

      const state = useSelectionStore.getState();
      expect(state.markedItems.size).toBe(5);
      testItems.forEach((item) => {
        expect(state.markedItems.has(item)).toBe(true);
      });
    });
  });

  describe('unmarkAll', () => {
    it('should clear all marks', () => {
      const store = useSelectionStore.getState();
      store.markAll(testItems);
      store.unmarkAll();

      expect(useSelectionStore.getState().markedItems.size).toBe(0);
    });
  });

  describe('invertMarks', () => {
    it('should invert marks - unmarked become marked', () => {
      const store = useSelectionStore.getState();
      store.markAll([testItems[0], testItems[1]]);
      store.invertMarks(testItems);

      const state = useSelectionStore.getState();
      expect(state.markedItems.has(testItems[0])).toBe(false);
      expect(state.markedItems.has(testItems[1])).toBe(false);
      expect(state.markedItems.has(testItems[2])).toBe(true);
      expect(state.markedItems.has(testItems[3])).toBe(true);
      expect(state.markedItems.has(testItems[4])).toBe(true);
    });

    it('should mark all when none are marked', () => {
      const store = useSelectionStore.getState();
      store.invertMarks(testItems);

      expect(useSelectionStore.getState().markedItems.size).toBe(5);
    });

    it('should unmark all when all are marked', () => {
      const store = useSelectionStore.getState();
      store.markAll(testItems);
      store.invertMarks(testItems);

      expect(useSelectionStore.getState().markedItems.size).toBe(0);
    });
  });

  describe('setFocus', () => {
    it('should set focused item', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[0]);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[0]);
    });
  });

  describe('moveFocus', () => {
    it('should move focus down', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[1]);
      store.moveFocus('down', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[2]);
    });

    it('should move focus up', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[2]);
      store.moveFocus('up', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[1]);
    });

    it('should not go below first item', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[0]);
      store.moveFocus('up', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[0]);
    });

    it('should not go above last item', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[4]);
      store.moveFocus('down', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[4]);
    });

    it('should focus first item when moving down with no focus', () => {
      const store = useSelectionStore.getState();
      store.moveFocus('down', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[0]);
    });

    it('should focus last item when moving up with no focus', () => {
      const store = useSelectionStore.getState();
      store.moveFocus('up', testItems);

      expect(useSelectionStore.getState().focusedItem).toBe(testItems[4]);
    });

    it('should set focus to null for empty items array', () => {
      const store = useSelectionStore.getState();
      store.setFocus(testItems[0]);
      store.moveFocus('down', []);

      expect(useSelectionStore.getState().focusedItem).toBe(null);
    });
  });

  describe('helper methods', () => {
    describe('getMarkedCount', () => {
      it('should return number of marked items', () => {
        const store = useSelectionStore.getState();
        store.markAll([testItems[0], testItems[1], testItems[2]]);

        expect(store.getMarkedCount()).toBe(3);
      });

      it('should return 0 when no items marked', () => {
        expect(useSelectionStore.getState().getMarkedCount()).toBe(0);
      });
    });

    describe('isSelected', () => {
      it('should return true for selected item', () => {
        const store = useSelectionStore.getState();
        store.select(testItems[0]);

        expect(store.isSelected(testItems[0])).toBe(true);
      });

      it('should return false for unselected item', () => {
        expect(useSelectionStore.getState().isSelected(testItems[0])).toBe(false);
      });
    });

    describe('isMarked', () => {
      it('should return true for marked item', () => {
        const store = useSelectionStore.getState();
        store.mark(testItems[0]);

        expect(store.isMarked(testItems[0])).toBe(true);
      });

      it('should return false for unmarked item', () => {
        expect(useSelectionStore.getState().isMarked(testItems[0])).toBe(false);
      });
    });

    describe('isFocused', () => {
      it('should return true for focused item', () => {
        const store = useSelectionStore.getState();
        store.setFocus(testItems[0]);

        expect(store.isFocused(testItems[0])).toBe(true);
      });

      it('should return false for unfocused item', () => {
        const store = useSelectionStore.getState();
        store.setFocus(testItems[0]);

        expect(store.isFocused(testItems[1])).toBe(false);
      });
    });
  });
});
