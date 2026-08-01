import { notFound } from "next/navigation";

import { getAllTags, getPostsByTagSlug } from "@/lib/blog";
import { BlogArchiveView } from "@/components/blog/BlogArchiveView";

export function generateStaticParams() {
  const tags = getAllTags();
  // See the analogous comment in blog/series/[slug]/page.tsx — `output:
  // "export"` needs at least one static param per dynamic route.
  return tags.length > 0 ? tags.map(({ slug }) => ({ slug })) : [{ slug: "_none" }];
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = getAllTags().find((entry) => entry.slug === slug);
  if (!tag) {
    notFound();
  }

  const posts = getPostsByTagSlug(slug).map(({ slug, frontmatter }) => ({ slug, frontmatter }));

  return <BlogArchiveView kind="tag" label={tag.tag} posts={posts} />;
}
