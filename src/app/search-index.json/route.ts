import { NextResponse } from "next/server";

import { getAllPosts } from "@/lib/blog";
import { loadPodcastChannel } from "@/lib/podcast-rss";
import { PODCAST_CATEGORIES } from "@/lib/podcast-categories";

export const dynamic = "force-static";

export interface SearchRecord {
  id: string;
  type: "blog" | "podcast";
  title: string;
  description: string;
  url: string;
  date: string;
  tags: string[];
}

export async function GET() {
  const posts = getAllPosts().map((post) => ({
    id: `blog-${post.slug}`,
    type: "blog" as const,
    title: post.frontmatter.title,
    description: post.frontmatter.summary,
    url: `/blog/${post.slug}`,
    date: post.frontmatter.date,
    tags: [...(post.frontmatter.tags ?? []), ...(post.frontmatter.series ? [post.frontmatter.series] : [])],
  }));

  const channel = await loadPodcastChannel();
  const episodes = channel.episodes.map((episode) => {
    const category = PODCAST_CATEGORIES.find((entry) => entry.code === episode.categoryCode);
    return {
      id: `podcast-${episode.guid}`,
      type: "podcast" as const,
      title: episode.title,
      description: episode.descriptionText.slice(0, 240),
      url: `/podcast/episode/${episode.slug}`,
      date: episode.pubDate,
      tags: category ? [...new Set([category.name.zh, category.name.en])] : [],
    };
  });

  const records: SearchRecord[] = [...posts, ...episodes];

  return NextResponse.json(records);
}
