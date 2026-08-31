"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { MessagingPanel } from "@/components/admin/messaging-panel";
import type { OrderRow } from "@/components/admin/types";

export default function AdminMessagingPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data.orders || []);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AdminShell
      title="Messaging"
      description="Send blog article links via WhatsApp (MSG91 bloglinksupdate)."
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <MessagingPanel
        orders={orders}
        error={error}
        success={success}
        onError={setError}
        onSuccess={setSuccess}
      />
    </AdminShell>
  );
}
