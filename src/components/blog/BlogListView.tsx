"use client";

import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { SectionHero } from "@/components/ui/SectionHero";
import { slugify } from "@/lib/slugify";
import type { BlogFrontmatter } from "@/lib/blog";

import styles from "./BlogListView.module.css";

export function BlogListView({
  posts,
}: {
  posts: Array<{ slug: string; frontmatter: BlogFrontmatter }>;
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <SectionHero
        eyebrow={messages.blogEyebrow}
        title={messages.blogTitle}
        subtitle={messages.blogDescription}
      />

      {posts.length === 0 ? (
        <p className={styles.emptyState}>{messages.blogEmptyState}</p>
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
              {post.frontmatter.series || (post.frontmatter.tags && post.frontmatter.tags.length > 0) ? (
                <div className={styles.pillRow}>
                  {post.frontmatter.series ? (
                    <Link href={`/blog/series/${slugify(post.frontmatter.series)}`} className={styles.seriesPill}>
                      {messages.blogSeriesLabel}: {post.frontmatter.series}
                    </Link>
                  ) : null}
                  {post.frontmatter.tags?.map((tag) => (
                    <Link key={tag} href={`/blog/tag/${slugify(tag)}`} className={styles.tagPill}>
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
