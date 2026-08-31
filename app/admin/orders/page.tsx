"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import { AdminError, AdminSuccess } from "@/components/admin/admin-alerts";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ExpiryCell,
  OrderActions,
  readArticleFields,
  StatusBadge,
} from "@/components/admin/order-actions";
import { StatusTabs } from "@/components/admin/status-tabs";
import type { OrderRow, OrderStatusFilter } from "@/components/admin/types";

function parseStatusParam(value: string | null): OrderStatusFilter {
  if (value === "paid" || value === "pending" || value === "failed") {
    return value;
  }
  return "all";
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
          Loading orders…
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [blogSendingId, setBlogSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<"copy" | "renew" | null>(
    null
  );
  const [lastLink, setLastLink] = useState<{
    orderId: string;
    url: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setStatusFilter(parseStatusParam(searchParams.get("status")));
  }, [searchParams]);

  const loadOrders = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) {
      setError("Orders load failed. Try Refresh again.");
      return false;
    }
    const data = await res.json();
    setOrders(data.orders || []);
    setMaxDownloads(data.maxDownloads || 5);
    return true;
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      paid: orders.filter((o) => o.status === "paid").length,
      pending: orders.filter((o) => o.status === "pending").length,
      failed: orders.filter((o) => o.status === "failed").length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return orders
      .filter((o) => statusFilter === "all" || o.status === statusFilter)
      .filter((o) => {
        if (!q) return true;
        if (o.name.toLowerCase().includes(q)) return true;
        if (o.orderId.toLowerCase().includes(q)) return true;
        if (o.phone.toLowerCase().includes(q)) return true;
        if (digits && o.phone.replace(/\D/g, "").includes(digits)) return true;
        return false;
      });
  }, [orders, query, statusFilter]);

  async function onRefresh() {
    setRefreshing(true);
    setError("");
    setSuccess("");
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }

  async function copyText(
    orderId: string,
    url: string,
    name: string,
    action: "copy" | "renew"
  ) {
    setLastLink({ orderId, url, name });
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(orderId);
      setCopiedAction(action);
      window.setTimeout(() => {
        setCopiedId(null);
        setCopiedAction(null);
      }, 2000);
    } catch {
      /* banner still shows URL */
    }
  }

  async function onCopyLink(o: OrderRow) {
    setError("");
    setSuccess("");
    if (!o.downloadUrl) {
      setError("No download link — use More → Renew first.");
      return;
    }
    await copyText(o.orderId, o.downloadUrl, o.name, "copy");
  }

  async function onRenew(orderId: string, name: string) {
    setError("");
    setSuccess("");
    setRenewingId(orderId);
    try {
      const res = await fetch("/api/admin/orders/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Renew failed");
        return;
      }
      await copyText(orderId, data.downloadUrl, name, "renew");
      await loadOrders();
    } catch {
      setError("Renew failed");
    } finally {
      setRenewingId(null);
    }
  }

  async function onWhatsAppSend(o: OrderRow) {
    setError("");
    setSuccess("");
    setSendingId(o.orderId);
    try {
      const res = await fetch("/api/admin/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: o.orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "WhatsApp send failed");
        return;
      }
      setSuccess(
        data.renewed
          ? `Ebook WhatsApp sent to ${o.name} (new link issued).`
          : `Ebook WhatsApp sent to ${o.name}.`
      );
      if (data.downloadUrl) {
        setLastLink({
          orderId: o.orderId,
          url: data.downloadUrl,
          name: o.name,
        });
      }
      await loadOrders();
    } catch {
      setError("WhatsApp send failed");
    } finally {
      setSendingId(null);
    }
  }

  async function onBlogSend(o: OrderRow) {
    setError("");
    setSuccess("");
    const { title, url } = readArticleFields();
    if (!title || !url) {
      setError(
        "Set article title and URL on the Messaging page first."
      );
      return;
    }
    setBlogSendingId(o.orderId);
    try {
      const res = await fetch("/api/admin/orders/blog-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          articleTitle: title,
          articleUrl: url,
          orderId: o.orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Blog WhatsApp send failed");
        return;
      }
      setSuccess(`Blog link sent to ${o.name} via WhatsApp.`);
    } catch {
      setError("Blog WhatsApp send failed");
    } finally {
      setBlogSendingId(null);
    }
  }

  function isExpired(o: OrderRow) {
    if (!o.downloadExpiresAt) return false;
    return new Date(o.downloadExpiresAt).getTime() < Date.now();
  }

  function waPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `91${digits}` : digits;
  }

  return (
    <AdminShell
      title="Orders"
      description="Ebook purchases, download links, and WhatsApp actions."
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <StatusTabs
        value={statusFilter}
        onChange={setStatusFilter}
        counts={counts}
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or order ID…"
          className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
          aria-label="Search orders"
        />
        {query.trim() ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Showing {filtered.length} of {orders.length}
          </p>
        ) : null}
      </div>

      <AdminError message={error} />
      <AdminSuccess message={success} />

      {lastLink ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Link for {lastLink.name}
              </p>
              <p className="font-english mt-2 break-all text-sm text-[var(--foreground)]">
                {lastLink.url}
              </p>
            </div>
            <a
              href={`https://wa.me/${waPhone(orders.find((x) => x.orderId === lastLink.orderId)?.phone || "")}?text=${encodeURIComponent(`नमस्कार ${lastLink.name}, तुमची ebook download लिंक:\n${lastLink.url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-xs font-medium hover:bg-[var(--secondary)]"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              Open chat
            </a>
          </div>
        </div>
      ) : null}

      <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--secondary)]/40 text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-14 text-center text-[var(--muted)]"
                >
                  {orders.length === 0
                    ? "No orders yet."
                    : "No matching orders."}
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.orderId}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium">{o.name}</p>
                    <p className="font-english mt-0.5 text-xs text-[var(--muted)]">
                      {o.phone}
                    </p>
                    <p
                      className="font-english mt-1 max-w-[200px] truncate text-[11px] text-[var(--muted)]"
                      title={o.orderId}
                    >
                      {o.orderId}
                    </p>
                    <p className="font-english mt-1 text-[11px] text-[var(--muted)]">
                      {new Date(o.paidAt || o.createdAt).toLocaleString(
                        "en-IN",
                        { dateStyle: "medium", timeStyle: "short" }
                      )}
                    </p>
                    {o.whatsappSentAt ? (
                      <p className="mt-1 text-[11px] text-emerald-700">
                        WA sent{" "}
                        {new Date(o.whatsappSentAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="font-english px-4 py-4 tabular-nums">
                    {o.downloadCount}/{maxDownloads}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <ExpiryCell order={o} expired={isExpired(o)} />
                  </td>
                  <td className="px-4 py-4">
                    <OrderActions
                      order={o}
                      renewing={renewingId === o.orderId}
                      sending={sendingId === o.orderId}
                      blogSending={blogSendingId === o.orderId}
                      copiedId={copiedId}
                      copiedAction={copiedAction}
                      onCopy={() => onCopyLink(o)}
                      onRenew={() => onRenew(o.orderId, o.name)}
                      onWhatsApp={() => onWhatsAppSend(o)}
                      onBlog={() => onBlogSend(o)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-10 text-center text-sm text-[var(--muted)]">
            {orders.length === 0 ? "No orders yet." : "No matching orders."}
          </div>
        ) : (
          filtered.map((o) => (
            <article
              key={o.orderId}
              className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{o.name}</p>
                  <p className="font-english text-sm text-[var(--muted)]">
                    {o.phone}
                  </p>
                  <p className="font-english mt-1 break-all text-[11px] text-[var(--muted)]">
                    {o.orderId}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
                <p>
                  Downloads:{" "}
                  <span className="font-english text-[var(--foreground)]">
                    {o.downloadCount}/{maxDownloads}
                  </span>
                </p>
                <ExpiryCell order={o} expired={isExpired(o)} />
              </div>
              <div className="mt-3">
                <OrderActions
                  order={o}
                  renewing={renewingId === o.orderId}
                  sending={sendingId === o.orderId}
                  blogSending={blogSendingId === o.orderId}
                  copiedId={copiedId}
                  copiedAction={copiedAction}
                  onCopy={() => onCopyLink(o)}
                  onRenew={() => onRenew(o.orderId, o.name)}
                  onWhatsApp={() => onWhatsAppSend(o)}
                  onBlog={() => onBlogSend(o)}
                />
              </div>
            </article>
          ))
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        <strong className="text-[var(--foreground)]">Ebook WA</strong> = download
        template. <strong className="text-[var(--foreground)]">Blog</strong> uses
        article fields from{" "}
        <a href="/admin/messaging" className="underline">
          Messaging
        </a>
        . Use <strong className="text-[var(--foreground)]">⋯</strong> for copy /
        renew / open.
      </p>
    </AdminShell>
  );
}
