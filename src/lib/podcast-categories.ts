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
      zh: "每站赛后回顾，以及F1赛季评论 。",
    },
  },
  {
    code: "S",
    slug: "other-sports",
    name: { en: "Other Sports", zh: "体育" },
    description: {
      en: "Whatever else is happening in sports that's worth talking about.",
      zh: "F1 之外，值得一聊的体育话题。",
    },
  },
  {
    code: "L",
    slug: "personal-life",
    name: { en: "Personal Life", zh: "我的生活" },
    description: {
      en: "Life abroad, observations, and whatever's on my mind.",
      zh: "异乡生活的碎碎念与人间观察。",
    },
  },
  {
    code: "I",
    slug: "intellectual-pleasure",
    name: { en: "Intellectual Pleasure", zh: "智力游戏" },
    description: {
      en: "Ideas, technology, and things I find genuinely interesting.",
      zh: "技术浪潮，以及一切智力性愉悦。",
    },
  },
  {
    code: "P",
    slug: "pulp-fiction",
    name: { en: "Pulp Fiction", zh: "低俗小说" },
    description: {
      en: "My guilty pleasure.",
      zh: "下里巴人的爱好。",
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
