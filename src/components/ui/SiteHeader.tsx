"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";

import styles from "./SiteHeader.module.css";

const NAV_ITEMS = [
  { href: "/f1-fantasy", key: "navF1Fantasy" as const },
  { href: "/podcast", key: "navPodcast" as const },
  { href: "/blog", key: "navBlog" as const },
];

export function SiteHeader() {
  const { locale, setLocale, theme, setTheme } = useSitePreferences();
  const pathname = usePathname();
  const messages = SITE_MESSAGES[locale];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {messages.siteName}
        </Link>

        <nav className={styles.nav} aria-label={messages.navHome}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href) ?? false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
              >
                {messages[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? messages.themeLight : messages.themeDark}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => setLocale((current) => (current === "en" ? "zh" : "en"))}
          >
            {locale === "en" ? messages.langChinese : messages.langEnglish}
          </button>
        </div>
      </div>
    </header>
  );
}
