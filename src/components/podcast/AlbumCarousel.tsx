"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useSitePreferences } from "@/lib/site-preferences";
import { SITE_MESSAGES } from "@/lib/site-messages";
import { formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-rss";
import type { PodcastCategory } from "@/lib/podcast-categories";
import { AlbumCover } from "@/components/ui/AlbumCover";
import { Waveform } from "@/components/podcast/Waveform";

import styles from "./AlbumCarousel.module.css";

interface SeriesEntry {
  category: PodcastCategory;
  episodes: PodcastEpisode[];
}

const MIN_SCALE = 1;
const MAX_SCALE = 1.2;

export function AlbumCarousel({ series }: { series: SeriesEntry[] }) {
  const { locale } = useSitePreferences();
  const messages = SITE_MESSAGES[locale];

  // Rendered twice back-to-back so auto-scroll can wrap from the end of the
  // first copy to the start of the second one invisibly (both look
  // identical at that boundary).
  const loopedSeries = [...series, ...series];
  const setLength = series.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Center-proximity scaling, applied via direct DOM writes (not React
  // state) so it can update every scroll frame without re-rendering the
  // whole list — that per-frame re-render was what made the scaling look
  // stuttery.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId = 0;

    function measure() {
      const track = trackRef.current;
      if (!track) return;
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      for (const card of cardRefs.current) {
        if (!card) continue;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        // Tight falloff (a fraction of one card's width) so only the card
        // actually at center noticeably enlarges, not a broad spread of
        // neighbors.
        const falloff = rect.width * 0.65;
        const proximity = Math.max(0, 1 - distance / falloff);
        const eased = proximity * proximity;
        const scale = MIN_SCALE + eased * (MAX_SCALE - MIN_SCALE);
        card.style.transform = `scale(${scale})`;
      }
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    }

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [loopedSeries.length]);

  // Slow ambient auto-scroll: one direction only (right to left, i.e.
  // scrollLeft always increasing), wrapping seamlessly from the end of the
  // first copy back to the same position in the second copy. Paused only
  // for actual interaction (press/drag/wheel), not mere hover.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPEED = 0.35;
    const RESUME_DELAY_MS = 450;

    let rafId = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    function pause() {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    }

    function scheduleResume() {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, RESUME_DELAY_MS);
    }

    function setWidth(): number {
      const first = cardRefs.current[0];
      const firstOfSecondCopy = cardRefs.current[setLength];
      if (!first || !firstOfSecondCopy) return 0;
      return firstOfSecondCopy.offsetLeft - first.offsetLeft;
    }

    function tick() {
      const el = trackRef.current;
      if (el && !paused) {
        el.scrollLeft += SPEED;
        const width = setWidth();
        if (width > 0 && el.scrollLeft >= width) {
          el.scrollLeft -= width;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // Wheel scrolling (e.g. a trackpad) doesn't reliably pair with
    // pointerup, so it pauses AND self-schedules its own resume —
    // otherwise a wheel-only interaction could leave it paused forever.
    function onWheel() {
      pause();
      scheduleResume();
    }

    // Only real interaction pauses it — not hovering the row, which made
    // the "pause zone" feel oversized before.
    track.addEventListener("pointerdown", pause);
    track.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerup", scheduleResume);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerup", scheduleResume);
    };
  }, [setLength]);

  return (
    <div className={styles.track} ref={trackRef}>
      {loopedSeries.map(({ category, episodes }, index) => {
        const cardKey = `${category.slug}-${index < setLength ? "a" : "b"}`;
        return (
          <div
            key={cardKey}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={styles.card}
          >
            <Link
              href={`/podcast/category/${category.slug}`}
              className={styles.coverLink}
              onMouseEnter={() => setHoveredKey(cardKey)}
              onMouseLeave={() => setHoveredKey((current) => (current === cardKey ? null : current))}
              onFocus={() => setHoveredKey(cardKey)}
              onBlur={() => setHoveredKey((current) => (current === cardKey ? null : current))}
            >
              <AlbumCover code={category.code} label={category.name[locale]} imageUrl={episodes[0]?.coverImage} />
              <Waveform active={hoveredKey === cardKey} />
            </Link>
            <h3 className={styles.name}>
              <Link href={`/podcast/category/${category.slug}`}>{category.name[locale]}</Link>
            </h3>
            <p className={styles.description}>{category.description[locale]}</p>

            {episodes.length > 0 ? (
              <ul className={styles.episodeList}>
                {episodes.slice(0, 2).map((episode) => (
                  <li key={episode.guid}>
                    <Link href={`/podcast/episode/${episode.slug}`} className={styles.episodeLink}>
                      <span className={styles.episodeTitle}>{episode.title}</span>
                      <span className={styles.episodeDate}>{formatEpisodeDate(episode.pubDate)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{messages.podcastNoEpisodesInCategory}</p>
            )}

            {episodes.length > 0 ? (
              <Link href={`/podcast/category/${category.slug}`} className={styles.viewAll}>
                {messages.podcastViewAll} ({messages.podcastEpisodeCount(episodes.length)}) →
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
