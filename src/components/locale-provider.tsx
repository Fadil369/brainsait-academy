"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type Locale = "en" | "ar";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
};

const STORAGE_KEY = "preferredLocale";

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Module-level listener set. A single LocaleProvider wraps the entire app
// (see layout.tsx), so this singleton is intentional and safe.
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((cb) => cb());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Also listen for cross-tab storage events so tabs stay in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Locale {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "ar" ? "ar" : "en";
}

function getServerSnapshot(): Locale {
  return "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    notifyListeners();
  }, []);

  // Sync DOM attributes for RTL layout and language-specific font selection.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    body.classList.toggle("lang-ar", locale === "ar");
    body.classList.toggle("lang-en", locale !== "ar");
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    toggleLocale: () => setLocale(locale === "ar" ? "en" : "ar"),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
