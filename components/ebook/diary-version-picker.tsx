"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { BuyEbookButton } from "@/components/ebook/buy-ebook-button";
import {
  AI_DIARY_VERSION_SLUGS,
  formatInr,
  parseAiDiaryVersion,
  type AiDiaryVersionKey,
  type Ebook,
} from "@/lib/ebooks";

const URGENCY_TEXT = "मर्यादित सवलत";

const VERSION_META: Record<
  AiDiaryVersionKey,
  { short: string; hint: string }
> = {
  "1": { short: "1.0", hint: "कार्यकर्त्याची AI डायरी 1.0" },
  "2": { short: "2.0", hint: "कार्यकर्त्याची AI डायरी २.०" },
  bundle: { short: "Bundle", hint: "दोन्ही" },
};

type Props = {
  versions: Ebook[];
  initialVersion?: AiDiaryVersionKey;
  align?: "start" | "center";
  showHighlights?: boolean;
  showDeliveryHints?: boolean;
  /** Tighter layout for above-the-fold hero (Buy right after price). */
  compact?: boolean;
};

function versionKeyForSlug(slug: string): AiDiaryVersionKey {
  if (slug === AI_DIARY_VERSION_SLUGS["2"]) return "2";
  if (slug === AI_DIARY_VERSION_SLUGS.bundle) return "bundle";
  return "1";
}

export function DiaryVersionPicker({
  versions,
  initialVersion = "1",
  align = "start",
  showHighlights = true,
  showDeliveryHints = true,
  compact = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = parseAiDiaryVersion(searchParams.get("v"));
  const [selected, setSelected] = useState<AiDiaryVersionKey>(
    fromUrl || initialVersion
  );

  useEffect(() => {
    setSelected(parseAiDiaryVersion(searchParams.get("v")));
  }, [searchParams]);

  const byKey = useMemo(() => {
    const map = new Map<AiDiaryVersionKey, Ebook>();
    for (const e of versions) {
      map.set(versionKeyForSlug(e.slug), e);
    }
    return map;
  }, [versions]);

  const ebook = byKey.get(selected) ?? versions[0];
  const price = formatInr(ebook.priceInr);
  const compareAt = ebook.compareAtInr
    ? formatInr(ebook.compareAtInr)
    : null;
  const centered = align === "center";

  const select = useCallback(
    (key: AiDiaryVersionKey) => {
      setSelected(key);
      const params = new URLSearchParams(searchParams.toString());
      if (key === "1") params.delete("v");
      else params.set("v", key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className={centered ? "mx-auto w-full max-w-lg" : "w-full max-w-lg"}>
      <p
        className={`font-medium text-[var(--muted)] ${compact ? "text-xs" : "text-sm"} ${centered ? "text-center" : ""}`}
      >
        आवृत्ती निवडा
      </p>
      <div
        className={`grid grid-cols-3 gap-2 ${compact ? "mt-2" : "mt-3"}`}
        role="radiogroup"
        aria-label="ई-बुक आवृत्ती"
      >
        {(["1", "2", "bundle"] as AiDiaryVersionKey[]).map((key) => {
          const item = byKey.get(key);
          if (!item) return null;
          const active = selected === key;
          const meta = VERSION_META[key];
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(key)}
              className={
                active
                  ? `rounded-2xl border-2 border-[var(--foreground)] bg-[var(--background)] text-center shadow-sm ${compact ? "px-1.5 py-2" : "px-2 py-3"}`
                  : `rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/60 text-center transition-colors hover:border-[var(--foreground)]/30 ${compact ? "px-1.5 py-2" : "px-2 py-3"}`
              }
            >
              <span className="font-english block text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-xs">
                {meta.short}
              </span>
              <span
                className={`mt-0.5 block font-semibold tabular-nums text-[var(--foreground)] ${compact ? "text-sm sm:text-base" : "text-base"}`}
              >
                {formatInr(item.priceInr)}
              </span>
              <span className="mt-0.5 block text-[9px] leading-snug text-[var(--muted)] sm:text-[10px]">
                {meta.hint}
              </span>
            </button>
          );
        })}
      </div>

      {!compact ? (
        <p
          className={`mt-4 text-sm leading-relaxed text-[var(--muted)] ${centered ? "text-center" : ""}`}
        >
          {ebook.blurb}
        </p>
      ) : null}

      <div
        className={`flex flex-col gap-1.5 ${compact ? "mt-3" : "mt-5"} ${centered ? "items-center" : ""}`}
      >
        <div
          className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}
        >
          <span className="inline-flex w-fit rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
            विशेष किंमत
          </span>
          <span className="inline-flex w-fit rounded-full border border-red-600/30 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300">
            {URGENCY_TEXT}
          </span>
        </div>
        {/* Only the amount row is yellow-highlighted */}
        <div
          className={`inline-flex w-fit max-w-full flex-wrap items-baseline gap-2.5 rounded-2xl border border-[var(--primary)] bg-[var(--primary-soft)] px-3.5 py-2 ${centered ? "mx-auto" : ""}`}
        >
          <p
            className={`font-heading font-semibold tabular-nums text-[var(--foreground)] ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-[2.75rem]"}`}
          >
            {price}
          </p>
          {compareAt ? (
            <p
              className={`font-heading tabular-nums text-[var(--muted)] line-through decoration-2 ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}
            >
              {compareAt}
            </p>
          ) : null}
          <p className="pb-0.5 text-sm text-[var(--muted)]">
            {ebook.pdfFiles.length > 1
              ? `${ebook.pdfFiles.length} PDFs`
              : "PDF"}
          </p>
        </div>
      </div>

      {/* Buy immediately after price in compact (above-the-fold) mode */}
      <div className={`mt-4 ${centered ? "flex justify-center" : ""}`}>
        <BuyEbookButton
          ebookSlug={ebook.slug}
          ebookTitle={ebook.title}
          coverImage={ebook.cover}
          ctaLabel={ebook.ctaLabel}
          priceLabel={price}
          variant="primary"
        />
      </div>

      {compact ? (
        <p
          className={`mt-2 line-clamp-2 text-xs leading-snug text-[var(--muted)] ${centered ? "text-center" : ""}`}
        >
          {ebook.blurb}
        </p>
      ) : null}

      {showHighlights ? (
        <ul
          className={`mt-5 space-y-2 ${centered ? "mx-auto max-w-sm text-left" : ""}`}
        >
          {ebook.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 text-sm text-[var(--foreground)]"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
                strokeWidth={2.5}
              />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {showDeliveryHints ? (
        <p
          className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)] ${centered ? "justify-center" : ""}`}
        >
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cashfree · ५ डाउनलोड · ७२ तास
          </span>
        </p>
      ) : null}
    </div>
  );
}
