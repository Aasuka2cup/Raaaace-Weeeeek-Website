import { notFound } from "next/navigation";

import { loadPodcastChannel } from "@/lib/podcast-rss";
import { PODCAST_CATEGORIES, getCategoryBySlug, groupEpisodesByCategory } from "@/lib/podcast-categories";
import { CategoryPageView } from "@/components/podcast/CategoryPageView";

export function generateStaticParams() {
  return PODCAST_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export default async function PodcastCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const channel = await loadPodcastChannel();
  const grouped = groupEpisodesByCategory(channel.episodes);
  const episodes = grouped.get(slug) ?? [];

  return <CategoryPageView category={category} episodes={episodes} />;
}
