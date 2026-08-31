"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RefreshCw,
} from "lucide-react";
import { useAdmin } from "./admin-provider";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package, exact: false },
  {
    href: "/admin/messaging",
    label: "Messaging",
    icon: MessageSquare,
    exact: false,
  },
  {
    href: "/admin/karyakarta",
    label: "Calendar",
    icon: Calendar,
    exact: false,
  },
] as const;

type AdminShellProps = {
  title: string;
  description?: string;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  onRefresh,
  refreshing,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const { logout, loggingOut } = useAdmin();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-5 sm:py-8 lg:flex-row lg:gap-8">
      <aside className="lg:w-52 lg:shrink-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Social Sanvad
        </p>
        <p className="font-heading mt-0.5 text-lg font-semibold">Admin</p>

        <nav
          className="mt-6 hidden flex-col gap-1 lg:flex"
          aria-label="Admin navigation"
        >
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "inline-flex items-center gap-2 rounded-xl bg-[var(--background)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--background)]/80 hover:text-[var(--foreground)]"
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <nav
          className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:hidden"
          aria-label="Admin navigation"
        >
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3.5 py-2 text-xs font-medium text-[var(--background)]"
                    : "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs font-medium text-[var(--muted)]"
                }
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {onRefresh ? (
              <button
                type="button"
                onClick={() => void onRefresh()}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  strokeWidth={1.75}
                />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </header>

        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}
