import type { Locale } from "@/lib/messages";
import type { PodcastEpisode } from "@/lib/podcast-rss";

export interface PodcastCategory {
  code: string;
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const PODCAST_CATEGORIES: PodcastCategory[] = [
  {
    code: "F",
    slug: "f1",
    name: { en: "F1", zh: "F1" },
    description: {
      en: "Race weekend reviews and season-long F1 commentary.",
      zh: "每站赛后回顾，以及贯穿整个赛季的 F1 吐槽。",
    },
  },
  {
    code: "S",
    slug: "other-sports",
    name: { en: "Other Sports", zh: "其他体育" },
    description: {
      en: "Whatever else is happening in sports that's worth talking about.",
      zh: "F1 之外，值得聊两句的体育话题。",
    },
  },
  {
    code: "L",
    slug: "personal-life",
    name: { en: "Personal Life", zh: "个人生活" },
    description: {
      en: "Life abroad, observations, and whatever's on my mind.",
      zh: "异乡生活的碎碎念与人间观察。",
    },
  },
  {
    code: "I",
    slug: "intellectual-pleasure",
    name: { en: "Intellectual Pleasure", zh: "智识愉悦" },
    description: {
      en: "Ideas, technology, and things I find genuinely interesting.",
      zh: "技术、想法，以及一切让我觉得有意思的事。",
    },
  },
  {
    code: "P",
    slug: "pulp-fiction",
    name: { en: "Pulp Fiction", zh: "低俗小说" },
    description: {
      en: "Stories, media, and the occasional guilty pleasure.",
      zh: "故事、影视，以及偶尔的罪恶快感。",
    },
  },
];

export function getCategoryBySlug(slug: string): PodcastCategory | undefined {
  return PODCAST_CATEGORIES.find((category) => category.slug === slug);
}

export function getCategoryByCode(code: string | null): PodcastCategory | undefined {
  if (!code) return undefined;
  return PODCAST_CATEGORIES.find((category) => category.code === code);
}

export function groupEpisodesByCategory(
  episodes: PodcastEpisode[],
): Map<string, PodcastEpisode[]> {
  const grouped = new Map<string, PodcastEpisode[]>();
  for (const category of PODCAST_CATEGORIES) {
    grouped.set(
      category.slug,
      episodes.filter((episode) => episode.categoryCode === category.code),
    );
  }
  return grouped;
}
