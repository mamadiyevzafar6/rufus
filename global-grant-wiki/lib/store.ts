'use client';

/**
 * Zustand-store состояния ленты: живой поиск (debounce 300ms), мульти-фильтры,
 * сортировка. Хранит и «сырое» значение поля поиска (inputValue — обновляется
 * мгновенно для UI), и отложенный query (обновляется через 300ms без ререндеров
 * всей ленты на каждый символ).
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { FundingType, OpportunityType, SortOption } from '@/types';
import { DEFAULT_FILTER_STATE } from '@/types';

const DEBOUNCE_MS = 300;

interface FilterStoreState {
  /* raw value input'а (мгновенно) */
  inputValue: string;
  /* debounced запрос, по которому фильтруется лента */
  query: string;
  types: OpportunityType[];
  fundingTypes: FundingType[];
  locations: string[];
  showExpired: boolean;
  sort: SortOption;

  setInputValue: (v: string) => void;
  toggleType: (t: OpportunityType) => void;
  toggleFundingType: (f: FundingType) => void;
  toggleLocation: (l: string) => void;
  setShowExpired: (v: boolean) => void;
  setSort: (s: SortOption) => void;
  resetFilters: () => void;
  /** число активных фильтров — для бейджа «Сбросить (N)» */
  activeFilterCount: () => number;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useFilterStore = create<FilterStoreState>()(
  subscribeWithSelector((set, get) => ({
    inputValue: DEFAULT_FILTER_STATE.query,
    query: DEFAULT_FILTER_STATE.query,
    types: [],
    fundingTypes: [],
    locations: [],
    showExpired: false,
    sort: DEFAULT_FILTER_STATE.sort,

    setInputValue: (v) => {
      set({ inputValue: v });
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => set({ query: v }), DEBOUNCE_MS);
    },

    toggleType: (t) =>
      set((s) => ({
        types: s.types.includes(t) ? s.types.filter((x) => x !== t) : [...s.types, t],
      })),

    toggleFundingType: (f) =>
      set((s) => ({
        fundingTypes: s.fundingTypes.includes(f)
          ? s.fundingTypes.filter((x) => x !== f)
          : [...s.fundingTypes, f],
      })),

    toggleLocation: (l) =>
      set((s) => ({
        locations: s.locations.includes(l)
          ? s.locations.filter((x) => x !== l)
          : [...s.locations, l],
      })),

    setShowExpired: (v) => set({ showExpired: v }),
    setSort: (s) => set({ sort: s }),

    resetFilters: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      set({ ...DEFAULT_FILTER_STATE, inputValue: '' });
    },

    activeFilterCount: () => {
      const s = get();
      return s.types.length + s.fundingTypes.length + s.locations.length + (s.query ? 1 : 0);
    },
  })),
);

/** Селектор для ленты: все поля фильтра одним объектом (стабильная ссылка через useShallow в компоненте) */
export function selectFilterParts(s: FilterStoreState) {
  return {
    query: s.query,
    types: s.types,
    fundingTypes: s.fundingTypes,
    locations: s.locations,
    showExpired: s.showExpired,
    sort: s.sort,
  };
}
