import { Feed } from "feed";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";

export async function GET() {
  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "mr",
    image: absoluteUrl("/images/logo.png"),
    favicon: absoluteUrl("/images/logo.png"),
    copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
    feedLinks: {
      rss: absoluteUrl("/rss.xml"),
    },
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: absoluteUrl("/majhyabadal"),
    },
  });

  getAllArticles().forEach((article) => {
    feed.addItem({
      title: article.title,
      id: absoluteUrl(`/lekha/${article.slug}`),
      link: absoluteUrl(`/lekha/${article.slug}`),
      description: article.description,
      date: new Date(article.publishedAt),
      author: [{ name: article.author }],
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
