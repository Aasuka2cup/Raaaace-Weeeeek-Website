import { notFound } from "next/navigation";

import { getAllSeries, getPostsBySeriesSlug } from "@/lib/blog";
import { BlogArchiveView } from "@/components/blog/BlogArchiveView";

export function generateStaticParams() {
  const series = getAllSeries();
  // `output: "export"` requires at least one static param per dynamic route,
  // so fall back to an unreachable placeholder until a post actually uses
  // `series` in its frontmatter — once one does, this list is non-empty and
  // the placeholder stops being generated, no code changes needed.
  return series.length > 0 ? series.map(({ slug }) => ({ slug })) : [{ slug: "_none" }];
}

export default async function BlogSeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = getAllSeries().find((entry) => entry.slug === slug);
  if (!series) {
    notFound();
  }

  const posts = getPostsBySeriesSlug(slug).map(({ slug, frontmatter }) => ({ slug, frontmatter }));

  return <BlogArchiveView kind="series" label={series.series} posts={posts} />;
}
