"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersPanel } from "@/components/admin/orders-panel";
import type { OrderStatusFilter } from "@/components/admin/types";

function parseStatusParam(value: string | null): OrderStatusFilter {
  if (value === "paid" || value === "pending" || value === "failed") {
    return value;
  }
  return "all";
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <AdminHomeContent />
    </Suspense>
  );
}

function AdminHomeContent() {
  const searchParams = useSearchParams();
  const statusFilter = parseStatusParam(searchParams.get("status"));
  const [reloadToken, setReloadToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setReloadToken((t) => t + 1);
    window.setTimeout(() => setRefreshing(false), 400);
  }, []);

  return (
    <AdminShell
      title="Ebook orders"
      description="All purchases — resend WhatsApp, renew links, copy download URL."
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <OrdersPanel
        initialStatusFilter={statusFilter}
        reloadToken={reloadToken}
      />
    </AdminShell>
  );
}
