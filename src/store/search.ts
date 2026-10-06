"use client";

import { createPersisted } from "./persist";

interface SearchState {
  recent: string[];
  add: (q: string) => void;
  remove: (q: string) => void;
  clear: () => void;
}

export const useSearchStore = createPersisted<SearchState>("search", (set) => ({
  recent: [],
  add: (q) => {
    const term = q.trim();
    if (term.length < 2) return;
    set((s) => ({ recent: [term, ...s.recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6) }));
  },
  remove: (q) => set((s) => ({ recent: s.recent.filter((r) => r !== q) })),
  clear: () => set({ recent: [] }),
}));
