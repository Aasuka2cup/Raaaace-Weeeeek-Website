import { getAllPosts } from "@/lib/blog";
import { BlogListView } from "@/components/blog/BlogListView";

export default function BlogPage() {
  const posts = getAllPosts().map(({ slug, frontmatter }) => ({ slug, frontmatter }));

  return <BlogListView posts={posts} />;
}
