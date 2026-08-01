import { loadPodcastChannel } from "@/lib/podcast-rss";
import { PODCAST_CATEGORIES, groupEpisodesByCategory } from "@/lib/podcast-categories";
import { PodcastHubView } from "@/components/podcast/PodcastHubView";

export default async function PodcastPage() {
  const channel = await loadPodcastChannel();
  const grouped = groupEpisodesByCategory(channel.episodes);
  const latest = channel.episodes[0] ?? null;
  const series = PODCAST_CATEGORIES.map((category) => ({
    category,
    episodes: grouped.get(category.slug) ?? [],
  }));

  return <PodcastHubView latest={latest} series={series} />;
}
