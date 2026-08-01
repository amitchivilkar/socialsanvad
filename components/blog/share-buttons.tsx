"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { absoluteUrl } from "@/lib/utils";

export function ShareButtons({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(`/lekha/${slug}`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-[var(--muted)]">शेअर करा</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
      >
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        X
      </a>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <Link2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        {copied ? "कॉपी झाले" : "लिंक"}
      </button>
    </div>
  );
}
