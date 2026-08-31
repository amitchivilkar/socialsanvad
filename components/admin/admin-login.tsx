"use client";

import Link from "next/link";
import { useAdmin } from "./admin-provider";

export function AdminLogin({ subtitle }: { subtitle?: string }) {
  const { login, loginError, loggingIn } = useAdmin();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-12">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm">
        <div className="mb-6 h-1.5 w-12 rounded-full bg-[var(--primary)]" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Admin
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {subtitle || "Social Sanvad — password required"}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            void login(String(fd.get("password") || ""));
          }}
          className="mt-8 space-y-4"
        >
          <label className="block text-sm font-medium" htmlFor="admin-pass">
            Password
          </label>
          <input
            id="admin-pass"
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Admin password"
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
          />
          {loginError ? (
            <p className="text-sm text-red-600" role="alert">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loggingIn}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loggingIn ? "Signing in…" : "Login"}
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
