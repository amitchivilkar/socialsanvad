"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { RefreshCw } from "lucide-react";
import { AdminLogin } from "./admin-login";

type AdminContextValue = {
  authed: boolean;
  booting: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginError: string;
  loggingIn: boolean;
  loggingOut: boolean;
  checkSession: () => Promise<boolean>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/admin/session", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const ok = res.ok;
    setAuthed(ok);
    return ok;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBooting(true);
      await checkSession();
      if (!cancelled) setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  async function login(password: string) {
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(
          (data as { error?: string }).error || "Wrong password"
        );
        setAuthed(false);
        return false;
      }
      setAuthed(true);
      return true;
    } catch {
      setLoginError("Login failed — try again.");
      return false;
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/login", {
        method: "DELETE",
        credentials: "same-origin",
      });
      setAuthed(false);
    } finally {
      setLoggingOut(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          Loading admin…
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <AdminContext.Provider
        value={{
          authed,
          booting,
          login,
          logout,
          loginError,
          loggingIn,
          loggingOut,
          checkSession,
        }}
      >
        <AdminLogin />
      </AdminContext.Provider>
    );
  }

  return (
    <AdminContext.Provider
      value={{
        authed,
        booting,
        login,
        logout,
        loginError,
        loggingIn,
        loggingOut,
        checkSession,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
