"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { slugify } from "@/lib/slugify";
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
          {frontmatter.series ? (
            <Link href={`/blog/series/${slugify(frontmatter.series)}`} className={styles.seriesBadge}>
              {messages.blogSeriesLabel}: {frontmatter.series}
            </Link>
          ) : null}
          <h1 className={styles.title}>{frontmatter.title}</h1>
          {frontmatter.tags && frontmatter.tags.length > 0 ? (
            <div className={styles.tags}>
              {frontmatter.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${slugify(tag)}`} className={styles.tag}>
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </header>

        <div className={styles.content}>{children}</div>
      </article>
    </main>
  );
}
