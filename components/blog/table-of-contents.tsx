"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/types";
import { cn } from "@/lib/utils";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="अनुक्रमणिका" className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        या लेखात
      </p>
      <ul className="space-y-2 border-l border-[var(--border)]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 -ml-px py-0.5 text-sm transition-colors",
                heading.level === 3 ? "pl-6" : "pl-4",
                activeId === heading.id
                  ? "border-[var(--foreground)] font-medium text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
