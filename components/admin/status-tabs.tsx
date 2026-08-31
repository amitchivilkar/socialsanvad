"use client";

import type { OrderStatusFilter } from "./types";

const TABS: { id: OrderStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

type StatusTabsProps = {
  value: OrderStatusFilter;
  onChange: (value: OrderStatusFilter) => void;
  counts: Record<OrderStatusFilter, number>;
};

export function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Order status filter"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={
              active
                ? "inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3.5 py-2 text-xs font-medium text-[var(--background)]"
                : "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--secondary)]"
            }
          >
            {tab.label}
            <span
              className={
                active
                  ? "font-english rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] tabular-nums"
                  : "font-english rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] tabular-nums"
              }
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
