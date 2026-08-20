import Link from "next/link";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/blog/article-card";
import { Container, SectionHeading } from "@/components/ui/container";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section className="border-t border-[var(--border)] py-14 sm:py-16">
      <Container>
        <SectionHeading title="अजून हे वाचा" />
        <div className="mx-auto max-w-3xl space-y-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export function PrevNextNav({
  prev,
  next,
}: {
  prev: Article | null;
  next: Article | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      className="grid gap-4 border-t border-[var(--border)] pt-10 sm:grid-cols-2"
      aria-label="मागील आणि पुढील लेख"
    >
      {prev ? (
        <Link
          href={`/articles/${prev.slug}`}
          className="group rounded-2xl border border-[var(--border)] p-5 transition-colors hover:bg-[var(--secondary)]"
        >
          <p className="text-xs text-[var(--muted)]">← मागचा</p>
          <p className="mt-2 font-heading wrap-break-word text-base font-semibold text-[var(--foreground)] group-hover:underline">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/articles/${next.slug}`}
          className="group rounded-2xl border border-[var(--border)] p-5 text-right transition-colors hover:bg-[var(--secondary)]"
        >
          <p className="text-xs text-[var(--muted)]">पुढील →</p>
          <p className="mt-2 font-heading wrap-break-word text-base font-semibold text-[var(--foreground)] group-hover:underline">
            {next.title}
          </p>
        </Link>
      ) : null}
    </nav>
  );
}
