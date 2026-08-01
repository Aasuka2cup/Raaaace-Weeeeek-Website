"use client";

import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { formatDuration, formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-rss";
import type { PodcastCategory } from "@/lib/podcast-categories";
import { AlbumCover } from "@/components/ui/AlbumCover";

import styles from "./CategoryPageView.module.css";

export function CategoryPageView({
  category,
  episodes,
}: {
  category: PodcastCategory;
  episodes: PodcastEpisode[];
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <Link href="/podcast" className={styles.backLink}>
        ← {messages.podcastBackToPodcast}
      </Link>

      <div className={styles.header}>
        <div className={styles.coverWrap}>
          <AlbumCover code={category.code} label={category.name[locale]} imageUrl={episodes[0]?.coverImage} />
        </div>
        <div>
          <span className={styles.eyebrow}>{messages.podcastSeriesLabel}</span>
          <h1 className={styles.title}>{category.name[locale]}</h1>
          <p className={styles.description}>{category.description[locale]}</p>
          {episodes.length > 0 ? (
            <p className={styles.count}>{messages.podcastEpisodeCount(episodes.length)}</p>
          ) : null}
        </div>
      </div>

      {episodes.length > 0 ? (
        <ul className={styles.episodeList}>
          {episodes.map((episode) => (
            <li key={episode.guid}>
              <Link href={`/podcast/episode/${episode.slug}`} className={styles.episodeCard}>
                <div className={styles.episodeCoverWrap}>
                  <AlbumCover
                    code={category.code}
                    label={episode.title}
                    imageUrl={episode.coverImage}
                    size="sm"
                  />
                </div>
                <div>
                  <h2 className={styles.episodeTitle}>{episode.title}</h2>
                  <p className={styles.episodeMeta}>
                    {formatEpisodeDate(episode.pubDate)}
                    {episode.durationSeconds ? ` · ${formatDuration(episode.durationSeconds)}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{messages.podcastNoEpisodesInCategory}</p>
      )}
    </main>
  );
}
