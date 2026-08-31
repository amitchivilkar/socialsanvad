"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminError } from "@/components/admin/admin-alerts";
import { AdminShell } from "@/components/admin/admin-shell";
import type { CalendarOccasion } from "@/lib/karyakarta/types";
import { CATEGORY_LABELS } from "@/lib/karyakarta/types";

export default function AdminKaryakartaCalendarPage() {
  const [occasions, setOccasions] = useState<CalendarOccasion[]>([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "political",
    defaultGreeting: "",
    description: "",
  });

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/karyakarta/calendar", {
      credentials: "same-origin",
    });
    if (!res.ok) {
      setError("Could not load calendar.");
      return;
    }
    const data = await res.json();
    setOccasions(data.occasions || []);
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

  async function addOccasion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/karyakarta/calendar", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError("Could not add occasion.");
      return;
    }
    setForm({
      title: "",
      date: "",
      category: "political",
      defaultGreeting: "",
      description: "",
    });
    await load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/karyakarta/calendar", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    await load();
  }

  return (
    <AdminShell
      title="Calendar"
      description="Manage Karyakarta AI Tool occasions and dates."
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <AdminError message={error} />

      <form
        onSubmit={addOccasion}
        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:grid-cols-2"
      >
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title"
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
        />
        <input
          required
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          placeholder="YYYY-MM-DD or MM-DD"
          className="font-english h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          value={form.defaultGreeting}
          onChange={(e) =>
            setForm((f) => ({ ...f, defaultGreeting: e.target.value }))
          }
          placeholder="Default greeting"
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)]"
        />
        <input
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Description"
          className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--foreground)] sm:col-span-2"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)] sm:col-span-2"
        >
          Add occasion
        </button>
      </form>

      <div className="space-y-2">
        {occasions.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-10 text-center text-sm text-[var(--muted)]">
            No occasions yet.
          </p>
        ) : (
          occasions.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {o.title}{" "}
                  <span className="font-english text-xs text-[var(--muted)]">
                    ({o.date})
                  </span>
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {CATEGORY_LABELS[o.category]} ·{" "}
                  {o.isActive ? "active" : "inactive"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void toggleActive(o.id, o.isActive)}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--secondary)]"
              >
                {o.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
