"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SEED_VERSION } from "@/data/seed-config";

/**
 * Persisted stores start from deterministic seed data on the server and on the
 * first client render (so markup matches), then rehydrate from localStorage
 * after mount. Writes are blocked until that rehydration completes so the seed
 * can never clobber a returning visitor's saved data.
 */

const PREFIX = "aadyam:";
let writesEnabled = false;

const guardedStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (!writesEnabled) return;
    try {
      localStorage.setItem(name, value);
    } catch {
      /* quota exceeded or private mode: the demo keeps working in memory */
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}));

type Rehydratable = { name: string; rehydrate: () => Promise<void> | void };
const registry: Rehydratable[] = [];

export function createPersisted<T>(
  name: string,
  initializer: StateCreator<T, [], []>,
  options?: { partialize?: (state: T) => Partial<T> },
) {
  const store = create<T>()(
    persist(initializer, {
      name: PREFIX + name,
      version: SEED_VERSION,
      storage: guardedStorage,
      skipHydration: true,
      // spread only when provided: an explicit `undefined` would override zustand's default and throw on every write
      ...(options?.partialize ? { partialize: options.partialize as (s: T) => T } : {}),
    }),
  );
  registry.push({ name: PREFIX + name, rehydrate: () => store.persist.rehydrate() });
  return store;
}

// ---- hydration lifecycle ----

type HydrationState = { hydrated: boolean };
export const useHydrationStore = create<HydrationState>(() => ({ hydrated: false }));

let started = false;
export async function hydrateAllStores() {
  if (started || typeof window === "undefined") return;
  started = true;
  await Promise.all(registry.map((r) => r.rehydrate()));
  writesEnabled = true;
  useHydrationStore.setState({ hydrated: true });
}

/** Cross-tab sync: another tab wrote a store, so pull its fresh state. */
export function startCrossTabSync() {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (!e.key || !e.key.startsWith(PREFIX)) return;
    const target = registry.find((r) => r.name === e.key);
    if (target) void target.rehydrate();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function clearAllPersistedData() {
  if (typeof window === "undefined") return;
  for (const r of registry) localStorage.removeItem(r.name);
  sessionStorage.removeItem(PREFIX + "alive");
}

export function useHydrated() {
  return useHydrationStore((s) => s.hydrated);
}

export { PREFIX };
