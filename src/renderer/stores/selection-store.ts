import { create } from 'zustand';

export interface SelectionState {
  selectedItems: Set<string>;
  markedItems: Set<string>;
  focusedItem: string | null;
  lastSelectedItem: string | null;
}

export interface SelectionActions {
  select: (path: string) => void;
  deselect: (path: string) => void;
  toggleSelect: (path: string) => void;
  selectRange: (from: string, to: string, items: string[]) => void;
  selectAll: (items: string[]) => void;
  deselectAll: () => void;

  mark: (path: string) => void;
  unmark: (path: string) => void;
  toggleMark: (path: string) => void;
  markAll: (items: string[]) => void;
  unmarkAll: () => void;
  invertMarks: (items: string[]) => void;

  setFocus: (path: string) => void;
  moveFocus: (direction: 'up' | 'down', items: string[]) => void;

  getMarkedCount: () => number;
  isSelected: (path: string) => boolean;
  isMarked: (path: string) => boolean;
  isFocused: (path: string) => boolean;
}

export type SelectionStore = SelectionState & SelectionActions;

const initialState: SelectionState = {
  selectedItems: new Set<string>(),
  markedItems: new Set<string>(),
  focusedItem: null,
  lastSelectedItem: null,
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  ...initialState,

  select: (path: string) => {
    set({
      selectedItems: new Set([path]),
      lastSelectedItem: path,
      focusedItem: path,
    });
  },

  deselect: (path: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedItems);
      newSelected.delete(path);
      return {
        selectedItems: newSelected,
        lastSelectedItem: state.lastSelectedItem === path ? null : state.lastSelectedItem,
      };
    });
  },

  toggleSelect: (path: string) => {
    set((state) => {
      const newSelected = new Set(state.selectedItems);
      if (newSelected.has(path)) {
        newSelected.delete(path);
        return {
          selectedItems: newSelected,
          lastSelectedItem: state.lastSelectedItem === path ? null : state.lastSelectedItem,
        };
      } else {
        newSelected.add(path);
        return {
          selectedItems: newSelected,
          lastSelectedItem: path,
          focusedItem: path,
        };
      }
    });
  },

  selectRange: (from: string, to: string, items: string[]) => {
    const fromIndex = items.indexOf(from);
    const toIndex = items.indexOf(to);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeItems = items.slice(start, end + 1);

    set((state) => ({
      selectedItems: new Set([...state.selectedItems, ...rangeItems]),
      lastSelectedItem: to,
      focusedItem: to,
    }));
  },

  selectAll: (items: string[]) => {
    set({
      selectedItems: new Set(items),
      lastSelectedItem: items.length > 0 ? items[items.length - 1] : null,
    });
  },

  deselectAll: () => {
    set({
      selectedItems: new Set(),
      lastSelectedItem: null,
    });
  },

  mark: (path: string) => {
    set((state) => {
      const newMarked = new Set(state.markedItems);
      newMarked.add(path);
      return { markedItems: newMarked };
    });
  },

  unmark: (path: string) => {
    set((state) => {
      const newMarked = new Set(state.markedItems);
      newMarked.delete(path);
      return { markedItems: newMarked };
    });
  },

  toggleMark: (path: string) => {
    set((state) => {
      const newMarked = new Set(state.markedItems);
      if (newMarked.has(path)) {
        newMarked.delete(path);
      } else {
        newMarked.add(path);
      }
      return { markedItems: newMarked };
    });
  },

  markAll: (items: string[]) => {
    set({
      markedItems: new Set(items),
    });
  },

  unmarkAll: () => {
    set({
      markedItems: new Set(),
    });
  },

  invertMarks: (items: string[]) => {
    set((state) => {
      const newMarked = new Set<string>();
      for (const item of items) {
        if (!state.markedItems.has(item)) {
          newMarked.add(item);
        }
      }
      return { markedItems: newMarked };
    });
  },

  setFocus: (path: string) => {
    set({ focusedItem: path });
  },

  moveFocus: (direction: 'up' | 'down', items: string[]) => {
    set((state) => {
      if (items.length === 0) {
        return { focusedItem: null };
      }

      const currentIndex = state.focusedItem ? items.indexOf(state.focusedItem) : -1;

      let newIndex: number;

      if (currentIndex === -1) {
        newIndex = direction === 'down' ? 0 : items.length - 1;
      } else if (direction === 'up') {
        newIndex = Math.max(0, currentIndex - 1);
      } else {
        newIndex = Math.min(items.length - 1, currentIndex + 1);
      }

      return { focusedItem: items[newIndex] };
    });
  },

  getMarkedCount: () => {
    return get().markedItems.size;
  },

  isSelected: (path: string) => {
    return get().selectedItems.has(path);
  },

  isMarked: (path: string) => {
    return get().markedItems.has(path);
  },

  isFocused: (path: string) => {
    return get().focusedItem === path;
  },
}));

export const resetSelectionStore = () => {
  useSelectionStore.setState(initialState);
};
