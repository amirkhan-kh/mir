"use client";

import { useSyncExternalStore } from "react";

/** Tiny localStorage-backed store shared across components and tabs. */
export function createLocalStore<T>(key: string, fallback: T) {
  let cache: T = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        cache = raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        cache = fallback;
      }
    }
    return cache;
  };

  const emit = () => listeners.forEach((l) => l());

  const set = (updater: (prev: T) => T) => {
    cache = updater(read());
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* storage full or disabled: keep in memory */
    }
    emit();
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      loaded = false;
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);

  return { get: read, set, useValue };
}
