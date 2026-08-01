import { notFound } from "next/navigation";

import { loadPodcastChannel } from "@/lib/podcast-rss";
import { getCategoryByCode } from "@/lib/podcast-categories";
import { EpisodePageView } from "@/components/podcast/EpisodePageView";

export async function generateStaticParams() {
  const channel = await loadPodcastChannel();
  return channel.episodes.map((episode) => ({ slug: episode.slug }));
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const channel = await loadPodcastChannel();
  const episode = channel.episodes.find((item) => item.slug === slug);
  if (!episode) {
    notFound();
  }

  const category = getCategoryByCode(episode.categoryCode);

  return <EpisodePageView episode={episode} category={category} />;
}
