"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, LogOut, RefreshCw } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [paidCount, setPaidCount] = useState(0);
  const [maxDownloads, setMaxDownloads] = useState(5);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<"copy" | "renew" | null>(
    null
  );
  const [lastLink, setLastLink] = useState<{
    orderId: string;
    url: string;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.status === 401) {
      setAuthed(false);
      setOrders([]);
      return;
    }
    if (!res.ok) {
      setError("Orders load failed");
      return;
    }
    const data = await res.json();
    setAuthed(true);
    setOrders(data.orders || []);
    setPaidCount(data.paid || 0);
    setMaxDownloads(data.maxDownloads || 5);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    })();
  }, [loadOrders]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      return;
    }
    setPassword("");
    setLoading(true);
    await loadOrders();
    setLoading(false);
  }

  async function onLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setOrders([]);
    setLastLink(null);
  }

  async function copyText(orderId: string, url: string, action: "copy" | "renew") {
    setLastLink({ orderId, url });
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(orderId);
      setCopiedAction(action);
      window.setTimeout(() => {
        setCopiedId(null);
        setCopiedAction(null);
      }, 2000);
    } catch {
      /* link still shown in banner */
    }
  }

  async function onCopyLink(o: OrderRow) {
    setError("");
    if (!o.downloadUrl) {
      setError("No download link yet — use Renew link first.");
      return;
    }
    await copyText(o.orderId, o.downloadUrl, "copy");
  }

  async function onRenew(orderId: string) {
    setError("");
    setRenewingId(orderId);
    try {
      const res = await fetch("/api/admin/orders/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Renew failed");
        return;
      }
      await copyText(orderId, data.downloadUrl, "renew");
      await loadOrders();
    } catch {
      setError("Renew failed");
    } finally {
      setRenewingId(null);
    }
  }

  function isExpired(o: OrderRow) {
    if (!o.downloadExpiresAt) return false;
    return new Date(o.downloadExpiresAt).getTime() < Date.now();
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
        <h1 className="font-heading text-2xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ebook orders — password required
        </p>
        <form onSubmit={onLogin} className="mt-8 space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none focus:border-[var(--foreground)]"
          />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-medium text-[var(--background)]"
          >
            Login
          </button>
        </form>
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
    <div className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Ebook orders
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {orders.length} total · {paidCount} paid
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadOrders()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {lastLink ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--foreground)]">
            Link ready (copied if clipboard allowed)
          </p>
          <p className="font-english mt-1 break-all text-[var(--muted)]">
            {lastLink.url}
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            WhatsApp वर customer ला paste करा. Renew केल्यास जुनी लिंक बंद होते.
          </p>
        </div>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--secondary)]/50 text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Download link</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-[var(--muted)]"
                >
                  No orders yet. New checkouts will appear here.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.orderId}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="font-english whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                    {new Date(o.paidAt || o.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="font-english px-4 py-3">
                    <a
                      href={`https://wa.me/91${o.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:underline"
                    >
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        o.status === "paid"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]"
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="font-english px-4 py-3 tabular-nums">
                    {o.downloadCount}/{maxDownloads}
                  </td>
                  <td className="font-english whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                    {o.downloadExpiresAt ? (
                      <span
                        className={
                          isExpired(o) ? "font-medium text-red-600" : undefined
                        }
                      >
                        {isExpired(o) ? "Expired · " : ""}
                        {new Date(o.downloadExpiresAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="font-english max-w-[140px] truncate px-4 py-3 text-xs text-[var(--muted)]">
                    {o.orderId}
                  </td>
                  <td className="max-w-[200px] px-4 py-3">
                    {o.downloadUrl ? (
                      <p
                        className="font-english truncate text-xs text-[var(--muted)]"
                        title={o.downloadUrl}
                      >
                        {o.downloadUrl.replace(/^https?:\/\//, "")}
                      </p>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "paid" ? (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={!o.downloadUrl}
                          onClick={() => onCopyLink(o)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-40"
                        >
                          {copiedId === o.orderId && copiedAction === "copy" ? (
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
                          disabled={renewingId === o.orderId}
                          onClick={() => onRenew(o.orderId)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
                        >
                          {copiedId === o.orderId &&
                          copiedAction === "renew" ? (
                            <>
                              <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                              Copied
                            </>
                          ) : renewingId === o.orderId ? (
                            <RefreshCw
                              className="h-3.5 w-3.5 animate-spin"
                              strokeWidth={1.75}
                            />
                          ) : (
                            <RefreshCw
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />
                          )}
                          Renew
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        <strong>Copy</strong> = current link. <strong>Renew</strong> = new link,
        72h expiry, downloads 0/5; old link stops working.
      </p>
    </div>
  );
}
