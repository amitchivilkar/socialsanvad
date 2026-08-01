import Link from "next/link";
import type { Article } from "@/types";
import { getCategoryName } from "@/lib/categories";
import { toMarathiDigits } from "@/lib/utils";
import { Container, SectionHeading } from "@/components/ui/container";

export function PopularArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="लोकप्रिय लेख"
          description="लोकांनी जास्त वाचलेले"
        />

        <ol className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {articles.map((article, index) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group flex items-baseline gap-5 py-5 transition-colors sm:gap-8 sm:py-6"
              >
                <span className="font-heading w-8 shrink-0 text-2xl font-semibold tabular-nums text-[var(--muted)] sm:text-3xl">
                  {toMarathiDigits(index + 1)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted)] sm:text-sm">
                    {getCategoryName(article.category)} · {article.readingTime}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight text-[var(--foreground)] group-hover:underline sm:text-xl">
                    {article.title}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
