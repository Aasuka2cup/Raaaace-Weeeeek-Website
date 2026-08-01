"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  DASHBOARD_MESSAGES,
  STORAGE_KEYS,
  type DashboardMessages,
  type Locale,
  type Theme,
} from "@/lib/messages";

interface SitePreferences {
  locale: Locale;
  setLocale: Dispatch<SetStateAction<Locale>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  messages: DashboardMessages;
}

const SitePreferencesContext = createContext<SitePreferences | null>(null);

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

export function SitePreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    // One-time sync from localStorage after mount, deliberately not during
    // render: reading it during the SSR-matching first render would produce
    // a client/server text mismatch (hydration error).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getStoredPreference(STORAGE_KEYS.theme, ["dark", "light"] as const, "dark"));
    setLocale(getStoredPreference(STORAGE_KEYS.locale, ["en", "zh"] as const, "en"));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
  }, [locale]);

  return (
    <SitePreferencesContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        setTheme,
        messages: DASHBOARD_MESSAGES[locale],
      }}
    >
      {children}
    </SitePreferencesContext.Provider>
  );
}

export function useSitePreferences(): SitePreferences {
  const context = useContext(SitePreferencesContext);

  if (!context) {
    throw new Error("useSitePreferences must be used within a SitePreferencesProvider");
  }

  return context;
}
