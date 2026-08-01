import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/articles",
    "/topics",
    "/resources",
    "/about",
    "/contact",
    "/search",
    "/terms",
    "/privacy",
    "/refunds",
    "/ebook/karykartyachi-ai-diary",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/articles" ? "daily" : "weekly",
    priority:
      path === ""
        ? 1
        : path.includes("ebook")
          ? 0.9
          : path === "/terms" ||
              path === "/privacy" ||
              path === "/refunds" ||
              path === "/contact"
            ? 0.4
            : 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/topics/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes];
}
