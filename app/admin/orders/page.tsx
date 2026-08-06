"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
} from "lucide-react";

type OrderRow = {
  orderId: string;
  ebookSlug: string;
  name: string;
  phone: string;
  status: string;
  downloadCount: number;
  downloadToken?: string;
  downloadUrl?: string | null;
  downloadExpiresAt?: string;
  whatsappSentAt?: string;
  createdAt: string;
  paidAt?: string;
};

export default function AdminOrdersPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [paidCount, setPaidCount] = useState(0);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [query, setQuery] = useState("");
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<"copy" | "renew" | null>(
    null
  );
  const [lastLink, setLastLink] = useState<{
    orderId: string;
    url: string;
    name: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setAuthed(false);
      setOrders([]);
      setPaidCount(0);
      return false;
    }
    if (!res.ok) {
      setError("Orders load failed. Try Refresh again.");
      return false;
    }
    const data = await res.json();
    setAuthed(true);
    setOrders(data.orders || []);
    setPaidCount(data.paid || 0);
    setMaxDownloads(data.maxDownloads || 5);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBooting(true);
      await loadOrders();
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    const digits = q.replace(/\D/g, "");
    return orders.filter((o) => {
      if (o.name.toLowerCase().includes(q)) return true;
      if (o.orderId.toLowerCase().includes(q)) return true;
      if (o.phone.toLowerCase().includes(q)) return true;
      if (digits && o.phone.replace(/\D/g, "").includes(digits)) return true;
      return false;
    });
  }, [orders, query]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Wrong password");
      return;
    }
    setPassword("");
    setBooting(true);
    await loadOrders();
    setBooting(false);
  }

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

  async function onLogout() {
    setLoggingOut(true);
    setError("");
    try {
      await fetch("/api/admin/login", {
        method: "DELETE",
        credentials: "same-origin",
      });
      setAuthed(false);
      setOrders([]);
      setPaidCount(0);
      setLastLink(null);
      setPassword("");
      setQuery("");
    } catch {
      setError("Logout failed — try again.");
    } finally {
      setLoggingOut(false);
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
      setError("No download link — click Renew first.");
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
          ? `WhatsApp sent to ${o.name} (new link issued).`
          : `WhatsApp sent to ${o.name}.`
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

  function isExpired(o: OrderRow) {
    if (!o.downloadExpiresAt) return false;
    return new Date(o.downloadExpiresAt).getTime() < Date.now();
  }

  function waPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `91${digits}` : digits;
  }

  if (booting) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          Loading admin…
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm">
          <div className="mb-6 h-1.5 w-12 rounded-full bg-[var(--primary)]" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Admin
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Ebook orders — password required
          </p>
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <label className="block text-sm font-medium" htmlFor="admin-pass">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
            />
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            >
              Login
            </button>
          </form>
        </div>
        <Link
          href="/"
          className="mt-6 text-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        >
          ← Site home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Social Sanvad
          </p>
          <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Ebook orders
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4">
          <p className="text-xs font-medium text-[var(--muted)]">Total orders</p>
          <p className="font-heading mt-1 text-2xl font-semibold tabular-nums">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4">
          <p className="text-xs font-medium text-[var(--muted)]">Paid</p>
          <p className="font-heading mt-1 text-2xl font-semibold tabular-nums text-emerald-700">
            {paidCount}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 sm:col-span-1">
          <p className="text-xs font-medium text-[var(--muted)]">
            Download limit
          </p>
          <p className="font-heading mt-1 text-2xl font-semibold tabular-nums">
            {maxDownloads}
            <span className="text-base font-normal text-[var(--muted)]">
              {" "}
              / link
            </span>
          </p>
        </div>
      </div>

      <div className="relative mt-6">
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

      {error ? (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          {success}
        </div>
      ) : null}

      {lastLink ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4">
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

      <div className="mt-8 hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--secondary)]/40 text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                  <td className="max-w-[180px] px-4 py-4">
                    {o.downloadUrl ? (
                      <p
                        className="font-english truncate text-xs text-[var(--muted)]"
                        title={o.downloadUrl}
                      >
                        …/{o.downloadToken?.slice(-8)}
                      </p>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ActionButtons
                      order={o}
                      renewing={renewingId === o.orderId}
                      sending={sendingId === o.orderId}
                      copiedId={copiedId}
                      copiedAction={copiedAction}
                      onCopy={() => onCopyLink(o)}
                      onRenew={() => onRenew(o.orderId, o.name)}
                      onWhatsApp={() => onWhatsAppSend(o)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 lg:hidden">
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
              {o.downloadUrl ? (
                <p className="font-english mt-2 truncate text-[11px] text-[var(--muted)]">
                  {o.downloadUrl}
                </p>
              ) : null}
              <div className="mt-3">
                <ActionButtons
                  order={o}
                  renewing={renewingId === o.orderId}
                  sending={sendingId === o.orderId}
                  copiedId={copiedId}
                  copiedAction={copiedAction}
                  onCopy={() => onCopyLink(o)}
                  onRenew={() => onRenew(o.orderId, o.name)}
                  onWhatsApp={() => onWhatsAppSend(o)}
                />
              </div>
            </article>
          ))
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
        <strong className="text-[var(--foreground)]">WhatsApp</strong> = MSG91
        template (renews link if expired).{" "}
        <strong className="text-[var(--foreground)]">Copy</strong> /{" "}
        <strong className="text-[var(--foreground)]">Renew</strong> as before.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={
        paid
          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
          : "inline-flex rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]"
      }
    >
      {status}
    </span>
  );
}

function ExpiryCell({
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

function ActionButtons({
  order,
  renewing,
  sending,
  copiedId,
  copiedAction,
  onCopy,
  onRenew,
  onWhatsApp,
}: {
  order: OrderRow;
  renewing: boolean;
  sending: boolean;
  copiedId: string | null;
  copiedAction: "copy" | "renew" | null;
  onCopy: () => void;
  onRenew: () => void;
  onWhatsApp: () => void;
}) {
  if (order.status !== "paid") {
    return <span className="text-xs text-[var(--muted)]">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={sending || renewing}
        onClick={onWhatsApp}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <MessageCircle
          className={`h-3.5 w-3.5 ${sending ? "animate-pulse" : ""}`}
          strokeWidth={1.75}
        />
        {sending ? "Sending…" : "WhatsApp"}
      </button>
      <button
        type="button"
        disabled={!order.downloadUrl}
        onClick={onCopy}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-40"
      >
        {copiedId === order.orderId && copiedAction === "copy" ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            Copy
          </>
        )}
      </button>
      <button
        type="button"
        disabled={renewing || sending}
        onClick={onRenew}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
      >
        {copiedId === order.orderId && copiedAction === "renew" ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
            Copied
          </>
        ) : (
          <>
            <RefreshCw
              className={`h-3.5 w-3.5 ${renewing ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
            Renew
          </>
        )}
      </button>
      {order.downloadUrl ? (
        <a
          href={order.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)]"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          Open
        </a>
      ) : null}
    </div>
  );
}
