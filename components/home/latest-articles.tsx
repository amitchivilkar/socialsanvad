import type { Article } from "@/types";
import { ArticleCard } from "@/components/blog/article-card";
import { Container, SectionHeading } from "@/components/ui/container";

export function LatestArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const [first, ...rest] = articles;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--secondary)]/50 py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="नवीन लेख"
          description="नवं काय लिहिलं आहे"
          href="/articles"
          linkLabel="सगळे लेख"
        />

        <div className="mx-auto max-w-3xl space-y-8">
          <ArticleCard article={first} featured />
          {rest.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}
