"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Article } from "@/types";
import { getCategoryName } from "@/lib/categories";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { toMarathiDigits } from "@/lib/utils";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState<string | null>(null);
  const query = draft ?? urlQuery;
  const [articles, setArticles] = useState<
    Pick<
      Article,
      | "slug"
      | "title"
      | "description"
      | "category"
      | "tags"
      | "readingTime"
      | "content"
    >[]
  >([]);

  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return articles.filter((a) => {
      const hay = [
        a.title,
        a.description,
        a.category,
        a.tags.join(" "),
        a.content ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [articles, query]);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs
          items={[{ label: "होमपेज", href: "/" }, { label: "शोध" }]}
        />
        <header className="mb-10 max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            शोध
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            लेख, विषय किंवा शब्द शोधा
          </p>
        </header>

        <div className="relative mx-auto mb-10 max-w-xl">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="काय शोधायचे आहे?"
            className="h-14 w-full rounded-full border border-[var(--border)] bg-[var(--background)] pl-12 pr-5 text-base outline-none focus:border-[var(--foreground)]"
            aria-label="शोध"
          />
        </div>

        {query.trim() ? (
          <p className="mb-6 text-sm text-[var(--muted)]">
            {toMarathiDigits(results.length)} मिळाले
          </p>
        ) : null}

        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {results.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/lekha/${article.slug}`}
                className="block py-5 transition-colors hover:bg-[var(--secondary)]/50"
              >
                <p className="text-xs text-[var(--muted)]">
                  {getCategoryName(article.category)} · {article.readingTime}
                </p>
                <h2 className="font-heading mt-1 text-xl font-semibold">
                  {article.title}
                </h2>
                <p className="mt-1 text-[15px] text-[var(--muted)]">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {query.trim() && results.length === 0 ? (
          <p className="py-12 text-center text-[var(--muted)]">
            काही सापडलं नाही. दुसरा शब्द टाकून बघा.
          </p>
        ) : null}
      </Container>
    </div>
  );
}
