import Link from "next/link";
import type { Article } from "@/types";
import { getCategoryName } from "@/lib/categories";
import { formatMarathiDate, cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  featured = false,
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group relative border-b border-[var(--border)] py-8 pl-4 first:pt-0 last:border-b-0 last:pb-0",
        className
      )}
    >
      <span
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full bg-[var(--primary)] first:top-0 group-first:top-0"
        aria-hidden
      />
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)] sm:text-sm">
          <span className="rounded-sm bg-[var(--primary-soft)] px-1.5 py-0.5 font-medium text-[var(--foreground)]">
            {getCategoryName(article.category)}
          </span>
          <span aria-hidden>·</span>
          <span>{article.readingTime}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.publishedAt}>
            {formatMarathiDate(article.publishedAt)}
          </time>
        </div>

        <h3
          className={cn(
            "mt-2.5 font-heading font-semibold tracking-tight text-[var(--foreground)] transition-colors group-hover:underline group-hover:underline-offset-4",
            featured
              ? "text-2xl leading-snug sm:text-3xl"
              : "text-xl leading-snug sm:text-[1.35rem]"
          )}
        >
          {article.title}
        </h3>

        <p
          className={cn(
            "mt-2 leading-relaxed text-[var(--muted)]",
            featured
              ? "line-clamp-3 text-base sm:text-lg"
              : "line-clamp-2 text-[15px]"
          )}
        >
          {article.description}
        </p>
      </Link>
    </article>
  );
}
