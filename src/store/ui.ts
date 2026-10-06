"use client";

import { create } from "zustand";

// Ephemeral UI state (never persisted)
interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  quickViewId: string | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  /** bumped whenever something is added to the cart so the badge can animate */
  cartPulse: number;
  pulseCart: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickViewId: null,
  cartPulse: 0,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  openQuickView: (quickViewId) => set({ quickViewId }),
  closeQuickView: () => set({ quickViewId: null }),
  pulseCart: () => set((s) => ({ cartPulse: s.cartPulse + 1 })),
}));
