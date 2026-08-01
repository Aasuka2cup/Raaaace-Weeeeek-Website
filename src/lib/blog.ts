import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { slugify } from "@/lib/slugify";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogFrontmatter {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  series?: string;
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

export function getAllTags(): Array<{ tag: string; slug: string }> {
  const bySlug = new Map<string, string>();
  for (const post of getAllPosts()) {
    for (const tag of post.frontmatter.tags ?? []) {
      const slug = slugify(tag);
      if (!bySlug.has(slug)) {
        bySlug.set(slug, tag);
      }
    }
  }
  return [...bySlug.entries()].map(([slug, tag]) => ({ tag, slug }));
}

export function getPostsByTagSlug(slug: string): BlogPost[] {
  return getAllPosts().filter((post) => (post.frontmatter.tags ?? []).some((tag) => slugify(tag) === slug));
}

export function getAllSeries(): Array<{ series: string; slug: string }> {
  const bySlug = new Map<string, string>();
  for (const post of getAllPosts()) {
    const { series } = post.frontmatter;
    if (series && !bySlug.has(slugify(series))) {
      bySlug.set(slugify(series), series);
    }
  }
  return [...bySlug.entries()].map(([slug, series]) => ({ series, slug }));
}

export function getPostsBySeriesSlug(slug: string): BlogPost[] {
  return getAllPosts().filter((post) => post.frontmatter.series && slugify(post.frontmatter.series) === slug);
}
