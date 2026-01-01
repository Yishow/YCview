// Minimal store scaffold (no external deps) for early UI integration.
export const STORE_SCAFFOLD_VERSION = 1 as const;

export type PanelId = 'left' | 'right';

type Listener<T> = (state: T) => void;

export function createSimpleStore<T extends object>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
      listeners.forEach((l) => l(state));
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export interface UiState {
  activePanel: PanelId;
}

export const uiStore = createSimpleStore<UiState>({
  activePanel: 'left',
});

export * from './tab-store';
