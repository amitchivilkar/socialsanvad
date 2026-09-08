export type CategorySlug =
  | "social-media"
  | "ai"
  | "whatsapp"
  | "election"
  | "digital-tools"
  | "case-study";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
}

export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
}

export interface ArticleFrontmatter {
  title: string;
  description: string;
  slug: string;
  category: CategorySlug;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt?: string;
  /** Social share / Open Graph only — not shown in article body */
  ogImage?: string;
  featured?: boolean;
  popular?: boolean;
  draft?: boolean;
  /** Override auto reading time. Number (12) or range string ("12-15"). */
  readingMinutes?: number | string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: string;
  readingMinutes: number;
  headings: Heading[];
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface SearchResult {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  tags: string[];
  publishedAt: string;
  readingTime: string;
}
