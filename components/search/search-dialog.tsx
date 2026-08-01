"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Article } from "@/types";
import { getCategoryName } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<
    Pick<
      Article,
      "slug" | "title" | "description" | "category" | "tags" | "readingTime"
    >[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setQuery("");
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    fetch("/api/search")
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => setArticles([]));
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        onOpenChange(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles.slice(0, 8);
    return articles
      .filter((a) => {
        const hay = [a.title, a.description, a.category, a.tags.join(" ")]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }, [articles, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] sm:pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="शोध"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search
            className="h-5 w-5 shrink-0 text-[var(--muted)]"
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="लेख, विषय किंवा शब्द शोधा…"
            className="h-14 w-full bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            aria-label="शोध इनपुट"
          />
          <button
            type="button"
            onClick={close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
            aria-label="बंद करा"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
              काही सापडलं नाही
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/lekha/${article.slug}`}
                    onClick={close}
                    className={cn(
                      "block rounded-xl px-3 py-3 transition-colors hover:bg-[var(--secondary)]"
                    )}
                  >
                    <p className="font-heading text-[15px] font-medium text-[var(--foreground)]">
                      {article.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {getCategoryName(article.category)} · {article.readingTime}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-4 py-2.5 text-xs text-[var(--muted)]">
          <kbd className="font-english rounded border border-[var(--border)] px-1.5 py-0.5">
            Esc
          </kbd>{" "}
          बंद ·{" "}
          <kbd className="font-english rounded border border-[var(--border)] px-1.5 py-0.5">
            ⌘K
          </kbd>{" "}
          शोध
        </div>
      </div>
    </div>
  );
}
