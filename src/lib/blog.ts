import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogFrontmatter {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

function readPostFile(slug: string): BlogPost {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as BlogFrontmatter,
    content,
  };
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllPosts(): BlogPost[] {
  return getAllPostSlugs()
    .map(readPostFile)
    .sort((left, right) => right.frontmatter.date.localeCompare(left.frontmatter.date));
}

export function getPost(slug: string): BlogPost {
  return readPostFile(slug);
}
