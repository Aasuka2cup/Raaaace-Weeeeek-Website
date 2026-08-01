import { XMLParser } from "fast-xml-parser";

const FEED_URL = "https://media.rss.com/aasuka/feed.xml";

export interface PodcastEpisode {
  guid: string;
  slug: string;
  rawTitle: string;
  title: string;
  categoryCode: string | null;
  episodeNumber: number | null;
  pubDate: string;
  descriptionHtml: string;
  descriptionText: string;
  audioUrl: string;
  audioBytes: number;
  durationSeconds: number;
  coverImage: string;
  rssLink: string;
}

export interface PodcastChannel {
  title: string;
  description: string;
  coverImage: string;
  episodes: PodcastEpisode[];
}

const TITLE_PATTERN = /^EP\s+([A-Za-z]+)\.(\d+)\s+(.*)$/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseEpisode(item: Record<string, unknown>, guid: string): PodcastEpisode {
  const rawTitle = String(item.title ?? "").trim();
  const match = rawTitle.match(TITLE_PATTERN);
  const categoryCode = match ? match[1].toUpperCase() : null;
  const episodeNumber = match ? Number(match[2]) : null;
  const title = match ? match[3] : rawTitle;

  const enclosure = item.enclosure as Record<string, string> | undefined;
  const itunesImage = item["itunes:image"] as Record<string, string> | undefined;
  const descriptionHtml = String(item.description ?? "");

  const slug =
    categoryCode !== null && episodeNumber !== null
      ? `${categoryCode.toLowerCase()}-${episodeNumber}`
      : `${slugify(rawTitle)}-${guid.slice(0, 8)}`;

  return {
    guid,
    slug,
    rawTitle,
    title,
    categoryCode,
    episodeNumber,
    pubDate: String(item.pubDate ?? ""),
    descriptionHtml,
    descriptionText: stripHtml(descriptionHtml),
    audioUrl: enclosure?.url ?? "",
    audioBytes: Number(enclosure?.length ?? 0),
    durationSeconds: Number(item["itunes:duration"] ?? 0),
    coverImage: itunesImage?.href ?? "",
    rssLink: String(item.link ?? ""),
  };
}

let cachedChannel: PodcastChannel | null = null;

export async function loadPodcastChannel(): Promise<PodcastChannel> {
  if (cachedChannel) return cachedChannel;

  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch podcast feed: ${response.status}`);
  }
  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
  });
  const parsed = parser.parse(xml);

  const channel = parsed.rss.channel;
  const items: Array<Record<string, unknown>> = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];

  const episodes = items.map((item) => {
    const guidField = item.guid as { text?: string } | string | undefined;
    const guid = typeof guidField === "string" ? guidField : (guidField?.text ?? "");
    return parseEpisode(item, guid);
  });

  episodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  cachedChannel = {
    title: String(channel.title ?? ""),
    description: stripHtml(String(channel.description ?? "")),
    coverImage: (channel["itunes:image"] as Record<string, string> | undefined)?.href ?? "",
    episodes,
  };

  return cachedChannel;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatEpisodeDate(pubDate: string): string {
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
