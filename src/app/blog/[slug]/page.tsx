import { compileMDX } from "next-mdx-remote/rsc";

import { getAllPostSlugs, getPost } from "@/lib/blog";
import { BlogPostView } from "@/components/blog/BlogPostView";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const { content } = await compileMDX({
    source: post.content,
    options: { parseFrontmatter: false },
  });

  return <BlogPostView frontmatter={post.frontmatter}>{content}</BlogPostView>;
}
