"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
        aria-label="थीम बदला"
      >
        <Sun className="h-5 w-5" strokeWidth={1.75} />
      </button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
      aria-label={isDark ? "लाईट मोड" : "डार्क मोड"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={1.75} />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={1.75} />
      )}
    </button>
  );
}
