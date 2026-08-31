"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import { AdminError } from "@/components/admin/admin-alerts";
import { AdminShell } from "@/components/admin/admin-shell";
import type { OrderRow } from "@/components/admin/types";

type Stats = {
  total: number;
  paid: number;
  pending: number;
  failed: number;
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) {
      setError("Could not load dashboard data.");
      return;
    }
    const data = await res.json();
    const list: OrderRow[] = data.orders || [];
    setOrders(list);
    setStats({
      total: list.length,
      paid: list.filter((o) => o.status === "paid").length,
      pending: list.filter((o) => o.status === "pending").length,
      failed: list.filter((o) => o.status === "failed").length,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  const recent = [...orders]
    .sort(
      (a, b) =>
        new Date(b.paidAt || b.createdAt).getTime() -
        new Date(a.paidAt || a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <AdminShell
      title="Dashboard"
      description="Overview of ebook orders and quick actions."
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <AdminError message={error} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total orders" value={stats.total} href="/admin/orders" />
        <StatCard
          label="Paid"
          value={stats.paid}
          href="/admin/orders?status=paid"
          accent="emerald"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          href="/admin/orders?status=pending"
          accent="amber"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          href="/admin/orders?status=failed"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/messaging"
          className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 transition-colors hover:border-[var(--foreground)]/30"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)]">
              <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-medium">Send blog update</p>
              <p className="text-xs text-[var(--muted)]">
                WhatsApp article link to buyers
              </p>
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 text-[var(--muted)] transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 transition-colors hover:border-[var(--foreground)]/30"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)]">
              <Users className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-medium">Checkout leads</p>
              <p className="text-xs text-[var(--muted)]">
                {stats.pending} started, not paid
              </p>
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 text-[var(--muted)] transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </Link>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-heading text-base font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">
            No orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((o) => (
              <li
                key={o.orderId}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium">{o.name}</p>
                  <p className="font-english text-xs text-[var(--muted)]">
                    {o.phone}
                  </p>
                </div>
                <span
                  className={
                    o.status === "paid"
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : o.status === "pending"
                        ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
                        : "rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]"
                  }
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: "emerald" | "amber";
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 transition-colors hover:border-[var(--foreground)]/25 sm:px-5"
    >
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p
        className={
          accent === "emerald"
            ? "font-heading mt-1 text-2xl font-semibold tabular-nums text-emerald-700"
            : accent === "amber"
              ? "font-heading mt-1 text-2xl font-semibold tabular-nums text-amber-800"
              : "font-heading mt-1 text-2xl font-semibold tabular-nums"
        }
      >
        {value}
      </p>
    </Link>
  );
}
