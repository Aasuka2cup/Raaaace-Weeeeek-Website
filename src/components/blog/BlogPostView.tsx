"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import type { BlogFrontmatter } from "@/lib/blog";

import styles from "./BlogPostView.module.css";

export function BlogPostView({
  frontmatter,
  children,
}: {
  frontmatter: BlogFrontmatter;
  children: ReactNode;
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <Link href="/blog" className={styles.backLink}>
        ← {messages.blogBackToList}
      </Link>

      <article>
        <header className={styles.header}>
          <p className={styles.meta}>{frontmatter.date}</p>
          <h1 className={styles.title}>{frontmatter.title}</h1>
          {frontmatter.tags && frontmatter.tags.length > 0 ? (
            <div className={styles.tags}>
              {frontmatter.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className={styles.content}>{children}</div>
      </article>
    </main>
  );
}
