"use client";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>{messages.footerTagline}</span>
        <span>
          © {year} {messages.siteName}. {messages.footerRights}
        </span>
      </div>
    </footer>
  );
}
