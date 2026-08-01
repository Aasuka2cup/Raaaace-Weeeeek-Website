"use client";

import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import type { BlogFrontmatter } from "@/lib/blog";

import styles from "./BlogArchiveView.module.css";

export function BlogArchiveView({
  kind,
  label,
  posts,
}: {
  kind: "tag" | "series";
  label: string;
  posts: Array<{ slug: string; frontmatter: BlogFrontmatter }>;
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <Link href="/blog" className={styles.backLink}>
        ← {messages.blogBackToList}
      </Link>

      <div className={styles.header}>
        <span className={styles.eyebrow}>{kind === "tag" ? messages.blogTagLabel : messages.blogSeriesLabel}</span>
        <h1 className={styles.title}>{label}</h1>
        {posts.length > 0 ? <p className={styles.count}>{messages.blogPostCount(posts.length)}</p> : null}
      </div>

      {posts.length === 0 ? (
        <p className={styles.emptyState}>{messages.blogEmptyArchive}</p>
      ) : (
        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.postCard}>
              <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                <p className={styles.postMeta}>{post.frontmatter.date}</p>
                <h2 className={styles.postTitle}>{post.frontmatter.title}</h2>
                <p className={styles.postSummary}>{post.frontmatter.summary}</p>
                <span className={styles.postCta}>{messages.blogReadMore} →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
