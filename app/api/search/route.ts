import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-static";

export function GET() {
  const articles = getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    category: a.category,
    tags: a.tags,
    readingTime: a.readingTime,
    content: a.content.slice(0, 2000),
  }));

  return NextResponse.json(articles);
}
