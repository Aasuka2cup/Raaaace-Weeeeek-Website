"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  DASHBOARD_MESSAGES,
  STORAGE_KEYS,
  type DashboardMessages,
  type Locale,
  type Theme,
} from "@/lib/messages";

function getStoredPreference<T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback: T,
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  return stored && allowedValues.includes(stored as T) ? (stored as T) : fallback;
}

export function useSitePreferences(): {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  messages: DashboardMessages;
} {
  const [theme, setTheme] = useState<Theme>(() =>
    getStoredPreference(STORAGE_KEYS.theme, ["dark", "light"] as const, "dark"),
  );
  const [locale, setLocale] = useState<Locale>(() =>
    getStoredPreference(STORAGE_KEYS.locale, ["en", "zh"] as const, "en"),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale]);

  return {
    locale,
    setLocale,
    theme,
    setTheme,
    messages: DASHBOARD_MESSAGES[locale],
  };
}
