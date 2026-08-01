"use client";

import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { formatDuration, formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-rss";
import type { PodcastCategory } from "@/lib/podcast-categories";
import { getEpisodePlatformLinks } from "@/lib/podcast-platforms";
import { AlbumCover } from "@/components/ui/AlbumCover";
import { PlatformIcon } from "@/components/podcast/PlatformIcon";

import styles from "./EpisodePageView.module.css";

export function EpisodePageView({
  episode,
  category,
}: {
  episode: PodcastEpisode;
  category: PodcastCategory | undefined;
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];
  const platformLinks = getEpisodePlatformLinks(episode);

  return (
    <main className={styles.page}>
      {category ? (
        <Link href={`/podcast/category/${category.slug}`} className={styles.backLink}>
          ← {messages.podcastBackToCategory} {category.name[locale]}
        </Link>
      ) : (
        <Link href="/podcast" className={styles.backLink}>
          ← {messages.podcastBackToPodcast}
        </Link>
      )}

      <div className={styles.header}>
        <div className={styles.coverWrap}>
          <AlbumCover code={episode.categoryCode ?? "?"} label={episode.title} imageUrl={episode.coverImage} />
        </div>
        <div>
          {category ? <span className={styles.eyebrow}>{category.name[locale]}</span> : null}
          <h1 className={styles.title}>{episode.title}</h1>
          <p className={styles.meta}>
            {formatEpisodeDate(episode.pubDate)}
            {episode.durationSeconds ? ` · ${formatDuration(episode.durationSeconds)}` : ""}
          </p>
        </div>
      </div>

      {platformLinks.length > 0 ? (
        <div className={styles.platforms}>
          <span className={styles.platformsLabel}>{messages.podcastListenOn}</span>
          {platformLinks.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.platformLink}
              title={platform.label}
            >
              <PlatformIcon id={platform.id} label={platform.label} />
            </a>
          ))}
        </div>
      ) : null}

      {episode.descriptionText ? (
        <p className={styles.description}>{episode.descriptionText}</p>
      ) : null}
    </main>
  );
}
