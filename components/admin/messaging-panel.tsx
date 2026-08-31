"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AdminError, AdminSuccess } from "./admin-alerts";
import {
  ARTICLE_TITLE_KEY,
  ARTICLE_URL_KEY,
  type OrderRow,
} from "./types";

type MessagingPanelProps = {
  orders: OrderRow[];
  error: string;
  success: string;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
};

export function MessagingPanel({
  orders,
  error,
  success,
  onError,
  onSuccess,
}: MessagingPanelProps) {
  const [articleTitle, setArticleTitle] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [blogSendingId, setBlogSendingId] = useState<string | null>(null);
  const [blogBulkSending, setBlogBulkSending] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const paidOrders = orders.filter((o) => o.status === "paid");

  useEffect(() => {
    setArticleTitle(localStorage.getItem(ARTICLE_TITLE_KEY) || "");
    setArticleUrl(localStorage.getItem(ARTICLE_URL_KEY) || "");
  }, []);

  useEffect(() => {
    if (articleTitle) {
      localStorage.setItem(ARTICLE_TITLE_KEY, articleTitle);
    }
  }, [articleTitle]);

  useEffect(() => {
    if (articleUrl) {
      localStorage.setItem(ARTICLE_URL_KEY, articleUrl);
    }
  }, [articleUrl]);

  async function onBlogSend(
    o: OrderRow | null,
    options?: {
      sendToAllPaid?: boolean;
      extrasOnly?: boolean;
      extras?: { name: string; phone: string }[];
    }
  ) {
    onError("");
    onSuccess("");
    const title = articleTitle.trim();
    const url = articleUrl.trim();
    if (!title || !url) {
      onError("Article title and URL required.");
      return;
    }

    if (!options?.sendToAllPaid && !options?.extrasOnly && !o) {
      onError("No recipient selected.");
      return;
    }

    if (options?.sendToAllPaid) {
      setBlogBulkSending(true);
      setConfirmBulk(false);
    } else if (options?.extrasOnly) {
      setBlogSendingId("extra");
    } else if (o) {
      setBlogSendingId(o.orderId);
    }

    try {
      const res = await fetch("/api/admin/orders/blog-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          articleTitle: title,
          articleUrl: url,
          orderId:
            options?.sendToAllPaid || options?.extrasOnly
              ? undefined
              : o?.orderId,
          sendToAllPaid: options?.sendToAllPaid ?? false,
          extras: options?.extras ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Blog WhatsApp send failed");
        return;
      }
      if (options?.sendToAllPaid) {
        onSuccess(
          `Blog link sent to ${data.sent} recipient(s)${data.failed ? `, ${data.failed} failed` : ""}.`
        );
      } else if (options?.extrasOnly) {
        onSuccess(
          `Blog link sent to ${options.extras?.[0]?.name || "contact"}.`
        );
      } else if (o) {
        onSuccess(`Blog link sent to ${o.name} via WhatsApp.`);
      }
    } catch {
      onError("Blog WhatsApp send failed");
    } finally {
      setBlogSendingId(null);
      setBlogBulkSending(false);
    }
  }

  async function onBlogSendAllPaid() {
    if (!paidOrders.length) {
      onError("No paid orders to message.");
      return;
    }
    const extras =
      extraName.trim() && extraPhone.trim().length >= 10
        ? [{ name: extraName.trim(), phone: extraPhone.trim() }]
        : [];
    await onBlogSend(paidOrders[0], { sendToAllPaid: true, extras });
  }

  async function onBlogSendExtra() {
    if (!extraName.trim() || extraPhone.trim().length < 10) {
      onError("Extra contact needs name and phone.");
      return;
    }
    await onBlogSend(null, {
      extrasOnly: true,
      extras: [{ name: extraName.trim(), phone: extraPhone.trim() }],
    });
    setExtraName("");
    setExtraPhone("");
  }

  const bulkCount =
    paidOrders.length +
    (extraName.trim() && extraPhone.trim().length >= 10 ? 1 : 0);

  return (
    <div className="space-y-4">
      <AdminError message={error} />
      <AdminSuccess message={success} />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Blog article WhatsApp
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Template{" "}
              <span className="font-english">bloglinksupdate</span> — name,
              article title, and link. Saved in this browser until you change it.
            </p>
          </div>
          <button
            type="button"
            disabled={blogBulkSending || !paidOrders.length}
            onClick={() => setConfirmBulk(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[var(--foreground)] px-4 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <MessageCircle
              className={`h-4 w-4 ${blogBulkSending ? "animate-pulse" : ""}`}
              strokeWidth={1.75}
            />
            {blogBulkSending
              ? "Sending…"
              : `Send to all paid (${paidOrders.length})`}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              Article title
            </span>
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              placeholder="Article headline"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              Article URL
            </span>
            <input
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://www.socialsanvad.com/articles/..."
              className="font-english h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4">
          <p className="text-xs font-medium text-[var(--muted)]">
            Extra contact (non-buyer)
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block flex-1 text-sm">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                Name
              </span>
              <input
                type="text"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                placeholder="Name"
                className="h-10 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
              />
            </label>
            <label className="block flex-1 text-sm">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">
                Phone
              </span>
              <input
                type="tel"
                value={extraPhone}
                onChange={(e) => setExtraPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="font-english h-10 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
              />
            </label>
            <button
              type="button"
              disabled={blogSendingId === "extra"}
              onClick={() => void onBlogSendExtra()}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              {blogSendingId === "extra" ? "Sending…" : "Send to extra"}
            </button>
          </div>
        </div>
      </section>

      {paidOrders.length > 0 ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
          <h2 className="font-heading text-base font-semibold">
            Send to one buyer
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Or use the Blog button on{" "}
            <Link href="/admin/orders" className="underline">
              Orders
            </Link>
            .
          </p>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {paidOrders.map((o) => (
              <li
                key={o.orderId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.name}</p>
                  <p className="font-english text-xs text-[var(--muted)]">
                    {o.phone}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={blogSendingId === o.orderId || blogBulkSending}
                  onClick={() => void onBlogSend(o)}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-medium hover:bg-[var(--secondary)] disabled:opacity-50"
                >
                  {blogSendingId === o.orderId ? "Sending…" : "Send blog"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {confirmBulk ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
            <h2
              id="bulk-confirm-title"
              className="font-heading text-lg font-semibold"
            >
              Send to all paid buyers?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              <span className="font-english font-medium text-[var(--foreground)]">
                {bulkCount}
              </span>{" "}
              recipient(s) will receive the blog link via WhatsApp.
            </p>
            <p className="mt-2 truncate text-sm font-medium">{articleTitle}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmBulk(false)}
                className="inline-flex h-10 items-center rounded-full border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={blogBulkSending}
                onClick={() => void onBlogSendAllPaid()}
                className="inline-flex h-10 items-center rounded-full bg-[var(--foreground)] px-4 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50"
              >
                {blogBulkSending ? "Sending…" : "Confirm send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
