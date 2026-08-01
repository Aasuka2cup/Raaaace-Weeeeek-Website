import type { PodcastEpisode } from "@/lib/podcast-rss";

export interface PlatformLink {
  id: string;
  label: string;
  url: string;
}

type ShowPlatform = "apple" | "spotify" | "xiaoyuzhou" | "bilibili" | "youtube";

/**
 * Same URL for every episode (the show's page/channel/playlist on that
 * platform). Fill in as they become available — a platform is only shown
 * once it has a URL here.
 */
const SHOW_LEVEL_LINKS: Partial<Record<ShowPlatform, string>> = {
  apple: "https://podcasts.apple.com/podcast/id1877450522",
  spotify: "https://open.spotify.com/show/7r62jHqSX2BTBu9yknsAQX",
  xiaoyuzhou: "https://www.xiaoyuzhoufm.com/podcast/699d6566da9df69c8fedebc8",
  bilibili: "https://space.bilibili.com/3632314047269460",
  youtube: "https://youtube.com/playlist?list=PLfIVwdTtQISzya3r7p1X4lijB0EtXTNus",
};

/**
 * Optional per-episode overrides for platforms without a reliable per-episode
 * URL from the feed, keyed by episode slug (e.g. "f-5"). Falls back to the
 * show-level link (channel / playlist) when no specific video is set.
 */
const EPISODE_LEVEL_LINKS: Record<string, Partial<Record<"bilibili" | "youtube", string>>> = {};

const PLATFORM_LABELS: Record<"rss" | ShowPlatform, string> = {
  rss: "RSS.com",
  apple: "Apple Podcasts",
  spotify: "Spotify",
  xiaoyuzhou: "小宇宙",
  bilibili: "Bilibili",
  youtube: "YouTube",
};

export function getEpisodePlatformLinks(episode: PodcastEpisode): PlatformLink[] {
  const links: PlatformLink[] = [];

  if (episode.rssLink) {
    links.push({ id: "rss", label: PLATFORM_LABELS.rss, url: episode.rssLink });
  }

  for (const id of ["apple", "spotify", "xiaoyuzhou"] as const) {
    const url = SHOW_LEVEL_LINKS[id];
    if (url) links.push({ id, label: PLATFORM_LABELS[id], url });
  }

  const episodeOverrides = EPISODE_LEVEL_LINKS[episode.slug];
  for (const id of ["bilibili", "youtube"] as const) {
    const url = episodeOverrides?.[id] || SHOW_LEVEL_LINKS[id];
    if (url) links.push({ id, label: PLATFORM_LABELS[id], url });
  }

  return links;
}
