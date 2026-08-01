"use client";

import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { formatDuration, formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-rss";
import type { PodcastCategory } from "@/lib/podcast-categories";
import { rasterForge, notoSansTCHeadline } from "@/lib/fonts";
import { AlbumCover } from "@/components/ui/AlbumCover";
import { FlyingParrot } from "@/components/ui/FlyingParrot";
import { AlbumCarousel } from "@/components/podcast/AlbumCarousel";

import styles from "./PodcastHubView.module.css";

interface SeriesEntry {
  category: PodcastCategory;
  episodes: PodcastEpisode[];
}

export function PodcastHubView({
  latest,
  series,
}: {
  latest: PodcastEpisode | null;
  series: SeriesEntry[];
}) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  return (
    <main className={styles.page}>
      <section className={`${styles.intro} ${rasterForge.variable} ${notoSansTCHeadline.variable}`}>
        <FlyingParrot />
        <span className={styles.eyebrow}>{messages.podcastEyebrow}</span>
        <h1 className={`${styles.title} ${locale === "zh" ? styles.titleZh : ""}`}>{messages.podcastName}</h1>
        <p className={styles.subtitle}>{messages.podcastIntro}</p>
      </section>

      {latest ? (
        <section className={styles.latest}>
          <p className={styles.sectionLabel}>{messages.podcastLatestLabel}</p>
          <Link href={`/podcast/episode/${latest.slug}`} className={styles.latestCard}>
            <div className={styles.latestCoverWrap}>
              <AlbumCover
                code={latest.categoryCode ?? "?"}
                label={latest.title}
                imageUrl={latest.coverImage}
                size="sm"
              />
            </div>
            <div className={styles.latestInfo}>
              <h2 className={styles.latestTitle}>{latest.title}</h2>
              <p className={styles.latestMeta}>
                {formatEpisodeDate(latest.pubDate)}
                {latest.durationSeconds ? ` · ${formatDuration(latest.durationSeconds)}` : ""}
              </p>
            </div>
          </Link>
        </section>
      ) : null}

      <section>
        <p className={styles.sectionLabel}>{messages.podcastSeriesLabel}</p>
        <AlbumCarousel series={series} />
      </section>
    </main>
  );
}
