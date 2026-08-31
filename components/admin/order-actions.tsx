"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  ARTICLE_TITLE_KEY,
  ARTICLE_URL_KEY,
  type OrderRow,
} from "./types";

export function StatusBadge({ status }: { status: string }) {
  const paid = status === "paid";
  const pending = status === "pending";
  return (
    <span
      className={
        paid
          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
          : pending
            ? "inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900"
            : "inline-flex rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]"
      }
    >
      {status}
    </span>
  );
}

export function ExpiryCell({
  order,
  expired,
}: {
  order: OrderRow;
  expired: boolean;
}) {
  if (!order.downloadExpiresAt) {
    return <span className="text-[var(--muted)]">—</span>;
  }
  return (
    <span
      className={expired ? "font-medium text-red-600" : "text-[var(--muted)]"}
    >
      {expired ? "Expired · " : ""}
      {new Date(order.downloadExpiresAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </span>
  );
}

export function OrderActions({
  order,
  renewing,
  sending,
  blogSending,
  copiedId,
  copiedAction,
  onCopy,
  onRenew,
  onWhatsApp,
  onBlog,
}: {
  order: OrderRow;
  renewing: boolean;
  sending: boolean;
  blogSending: boolean;
  copiedId: string | null;
  copiedAction: "copy" | "renew" | null;
  onCopy: () => void;
  onRenew: () => void;
  onWhatsApp: () => void;
  onBlog: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  if (order.status !== "paid") {
    return <span className="text-xs text-[var(--muted)]">—</span>;
  }

  const busy = sending || blogSending || renewing;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={busy}
        onClick={onWhatsApp}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <MessageCircle
          className={`h-3.5 w-3.5 ${sending ? "animate-pulse" : ""}`}
          strokeWidth={1.75}
        />
        {sending ? "Sending…" : "Ebook WA"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onBlog}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--secondary)]/60 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
      >
        <MessageCircle
          className={`h-3.5 w-3.5 ${blogSending ? "animate-pulse" : ""}`}
          strokeWidth={1.75}
        />
        {blogSending ? "Sending…" : "Blog"}
      </button>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
          aria-label="More actions"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-10 mt-1 min-w-[9rem] rounded-xl border border-[var(--border)] bg-[var(--background)] py-1 shadow-md">
            <button
              type="button"
              disabled={!order.downloadUrl}
              onClick={() => {
                setMenuOpen(false);
                onCopy();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-[var(--secondary)] disabled:opacity-40"
            >
              {copiedId === order.orderId && copiedAction === "copy" ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              Copy link
            </button>
            <button
              type="button"
              disabled={renewing}
              onClick={() => {
                setMenuOpen(false);
                onRenew();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${renewing ? "animate-spin" : ""}`}
                strokeWidth={1.75}
              />
              Renew link
            </button>
            {order.downloadUrl ? (
              <a
                href={order.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-[var(--secondary)]"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                Open link
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function readArticleFields(): { title: string; url: string } {
  if (typeof window === "undefined") return { title: "", url: "" };
  return {
    title: localStorage.getItem(ARTICLE_TITLE_KEY) || "",
    url: localStorage.getItem(ARTICLE_URL_KEY) || "",
  };
}
