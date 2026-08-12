import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Article, ArticleFrontmatter, Heading } from "@/types";
import { readingTimeLabel, slugify } from "@/lib/utils";
import { isValidCategorySlug } from "@/lib/categories";

const articlesDirectory = path.join(process.cwd(), "content/articles");

/**
 * Unique heading ids matching rehype-slug / github-slugger:
 * first "foo", then "foo-1", "foo-2", …
 */
function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[#*`]/g, "").trim();
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;

    headings.push({ id, text, level });
  }

  return headings;
}

function parseArticle(fileName: string): Article | null {
  const fullPath = path.join(articlesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as ArticleFrontmatter;

  if (frontmatter.draft) return null;
  if (!isValidCategorySlug(frontmatter.category)) return null;

  const stats = readingTime(content);
  const minutes = Math.max(1, Math.ceil(stats.minutes));

  return {
    ...frontmatter,
    content,
    readingTime: readingTimeLabel(minutes),
    readingMinutes: minutes,
    headings: extractHeadings(content),
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) return [];

  const files = fs
    .readdirSync(articlesDirectory)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const articles = files
    .map(parseArticle)
    .filter((a): a is Article => a !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null;
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getFeaturedArticles(limit = 3): Article[] {
  const featured = getAllArticles().filter((a) => a.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return getAllArticles().slice(0, limit);
}

export function getPopularArticles(limit = 4): Article[] {
  const popular = getAllArticles().filter((a) => a.popular);
  if (popular.length >= limit) return popular.slice(0, limit);
  return getAllArticles().slice(0, limit);
}

export function getRelatedArticles(
  article: Article,
  limit = 3
): Article[] {
  return getAllArticles()
    .filter(
      (a) =>
        a.slug !== article.slug &&
        (a.category === article.category ||
          a.tags.some((t) => article.tags.includes(t)))
    )
    .slice(0, limit);
}

export function getAdjacentArticles(slug: string): {
  prev: Article | null;
  next: Article | null;
} {
  const articles = getAllArticles();
  const index = articles.findIndex((a) => a.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: articles[index + 1] ?? null,
    next: articles[index - 1] ?? null,
  };
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllArticles().forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function searchArticles(query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getAllArticles().filter((a) => {
    const haystack = [
      a.title,
      a.description,
      a.category,
      a.tags.join(" "),
      a.content,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getArticleSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}
